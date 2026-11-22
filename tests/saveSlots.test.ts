import { describe, expect, it } from 'vitest'
import { createIdleState } from '@/core/idle'
import { SAVE_VERSION, checksum } from '@/core/save'
import {
  SaveSlotStore,
  saveSlotKey,
  type SaveLoadResult,
  type SaveLoadSuccess,
} from '@/core/saveSlots'
import { createMemorySaveStorage } from '@/core/saveStorage'
import { createClock } from '@/core/time'

const sample = {
  schemaVersion: 2,
  player: { name: '玄一' },
  settings: {
    speed: 1,
    pauseMode: 'story',
    offlineCapHours: 8,
    offlineEfficiency: 0.5,
  },
}

function expectSuccess(result: SaveLoadResult): SaveLoadSuccess {
  if (!result.ok) throw new Error(result.message)
  return result
}

function createStore() {
  const storage = createMemorySaveStorage()
  return { storage, store: new SaveSlotStore(storage) }
}

async function corruptSlot(
  storage: ReturnType<typeof createMemorySaveStorage>,
  slot: 'slot1' | 'slot2' | 'slot3',
) {
  const key = saveSlotKey(slot)
  const raw = await storage.read(key)
  if (!raw) throw new Error('测试存档不存在')
  const envelope = JSON.parse(raw) as { data: { player: { name: string } } }
  envelope.data.player.name = '篡改者'
  await storage.write(key, JSON.stringify(envelope))
}

describe('save slots', () => {
  it('round-trips a save with timestamps', async () => {
    const { store } = createStore()
    const now = new Date('2026-11-21T08:00:00.000Z')
    const saved = await store.save('slot1', sample, now)

    expect(saved.version).toBe(SAVE_VERSION)
    expect(saved.createdAt).toBe(now.toISOString())
    expect(saved.updatedAt).toBe(now.toISOString())

    const loaded = expectSuccess(await store.load('slot1'))
    expect(loaded.slot).toBe('slot1')
    expect(loaded.migrated).toBe(false)
    expect(loaded.envelope.data).toMatchObject(sample)
    expect(loaded.envelope.checksum).toBe(checksum(loaded.envelope.data))
  })

  it('lists all four slots and marks corruption', async () => {
    const { storage, store } = createStore()
    await store.save('slot1', sample)
    await store.save('slot2', { ...sample, player: { name: '第二档' } })
    await store.saveAuto(sample)
    await storage.write(saveSlotKey('slot3'), '{broken')

    const summaries = await store.list()
    const bySlot = Object.fromEntries(summaries.map((entry) => [entry.slot, entry]))

    expect(summaries).toHaveLength(4)
    expect(bySlot.slot1).toMatchObject({ present: true, valid: true, version: SAVE_VERSION })
    expect(bySlot.auto).toMatchObject({ present: true, valid: true })
    expect(bySlot.slot3).toMatchObject({
      present: true,
      valid: false,
      error: 'invalid-json',
    })
  })

  it('rejects checksum corruption and preserves the original bytes', async () => {
    const { storage, store } = createStore()
    await store.save('slot1', sample)
    await corruptSlot(storage, 'slot1')
    const raw = await store.exportSlot('slot1')

    const loaded = await store.load('slot1')
    expect(loaded.ok).toBe(false)
    if (!loaded.ok) expect(loaded.reason).toBe('checksum')
    expect(await store.exportSlot('slot1')).toBe(raw)
  })

  it('falls back to the auto slot only for corrupted manual saves', async () => {
    const { storage, store } = createStore()
    await store.saveAuto({ ...sample, player: { name: '自动档' } })
    await store.save('slot1', sample)
    await corruptSlot(storage, 'slot1')

    const direct = await store.load('slot1')
    expect(direct.ok).toBe(false)

    const recovered = expectSuccess(
      await store.load('slot1', { recoverFromAuto: true }),
    )
    expect(recovered.recoveredFrom).toBe('auto')
    expect(recovered.slot).toBe('slot1')
    expect(recovered.envelope.data).toMatchObject({
      ...sample,
      player: { name: '自动档' },
    })

    const missing = await store.load('slot2', { recoverFromAuto: true })
    expect(missing.ok).toBe(false)
    if (!missing.ok) expect(missing.reason).toBe('missing')
  })

  it('does not hide an unsupported future save behind auto recovery', async () => {
    const { storage, store } = createStore()
    await store.saveAuto(sample)
    const future = {
      version: SAVE_VERSION + 1,
      createdAt: '2026-11-21T00:00:00.000Z',
      updatedAt: '2026-11-21T00:00:00.000Z',
      checksum: checksum(sample),
      data: sample,
    }
    await storage.write(saveSlotKey('slot1'), JSON.stringify(future))

    const loaded = await store.load('slot1', { recoverFromAuto: true })
    expect(loaded.ok).toBe(false)
    if (!loaded.ok) expect(loaded.reason).toBe('unsupported-version')
  })

  it('migrates v1 saves and fills new clock, idle and settings fields', async () => {
    const { storage, store } = createStore()
    const v1Data = {
      schemaVersion: 1,
      player: { name: '旧人' },
      settings: {
        speed: 4,
        pauseMode: 'story',
        offlineCapHours: 12,
        offlineEfficiency: 0.5,
      },
      rng: { seed: 7, state: 7, draws: 0 },
      lastSavedAt: '2026-01-01T00:00:00.000Z',
    }
    const v1Envelope = {
      version: 1,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      checksum: checksum(v1Data),
      data: v1Data,
    }
    await storage.write(saveSlotKey('slot1'), JSON.stringify(v1Envelope))

    const loaded = expectSuccess(await store.load('slot1'))
    const data = loaded.envelope.data as {
      schemaVersion: number
      clock: unknown
      idle: unknown
      settings: { speed: number }
    }

    expect(loaded.migrated).toBe(true)
    expect(loaded.envelope.version).toBe(SAVE_VERSION)
    expect(data.schemaVersion).toBe(SAVE_VERSION)
    expect(data.clock).toEqual(createClock())
    expect(data.idle).toEqual(createIdleState())
    expect(data.settings.speed).toBe(4)
    expect(loaded.envelope.checksum).toBe(checksum(loaded.envelope.data))
  })

  it('normalizes broken v1 settings during migration', async () => {
    const { storage, store } = createStore()
    const v1Data = {
      schemaVersion: 1,
      settings: {
        speed: 99,
        pauseMode: 'sometimes',
        offlineCapHours: -3,
        offlineEfficiency: 4,
      },
    }
    const v1Envelope = {
      version: 1,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      checksum: checksum(v1Data),
      data: v1Data,
    }
    await storage.write(saveSlotKey('slot1'), JSON.stringify(v1Envelope))

    const loaded = expectSuccess(await store.load('slot1'))
    const data = loaded.envelope.data as {
      settings: {
        speed: number
        pauseMode: string
        offlineCapHours: number
        offlineEfficiency: number
      }
    }

    expect(data.settings).toEqual({
      speed: 1,
      pauseMode: 'story',
      offlineCapHours: 8,
      offlineEfficiency: 1,
    })
  })

  it('exports and imports a save into another slot', async () => {
    const { store } = createStore()
    await store.save('slot1', sample)
    const json = await store.exportSlot('slot1')
    expect(json).not.toBeNull()

    const imported = expectSuccess(await store.importSlot('slot2', json ?? ''))
    expect(imported.migrated).toBe(false)

    const loaded = expectSuccess(await store.load('slot2'))
    expect(loaded.envelope.data).toMatchObject(sample)
    expect(await store.exportSlot('slot3')).toBeNull()
  })

  it('never overwrites a slot with an invalid import', async () => {
    const { store } = createStore()
    await store.save('slot2', { ...sample, player: { name: '保留档' } })
    const before = await store.exportSlot('slot2')

    const result = await store.importSlot('slot2', '{not json')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toBe('invalid-json')
    expect(await store.exportSlot('slot2')).toBe(before)
  })

  it('rejects tampered imports without writing them', async () => {
    const { store } = createStore()
    const envelope = JSON.parse(JSON.stringify(sample)) as Record<string, unknown>
    const imported = {
      version: SAVE_VERSION,
      createdAt: '2026-11-21T00:00:00.000Z',
      updatedAt: '2026-11-21T00:00:00.000Z',
      checksum: checksum(envelope),
      data: envelope,
    }
    const tampered = {
      ...imported,
      data: { ...envelope, player: { name: '篡改者' } },
    }

    const result = await store.importSlot('slot3', JSON.stringify(tampered))
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toBe('checksum')
    expect(await store.exportSlot('slot3')).toBeNull()
  })

  it('removes slots', async () => {
    const { store } = createStore()
    await store.save('slot1', sample)
    await store.remove('slot1')

    const loaded = await store.load('slot1')
    expect(loaded.ok).toBe(false)
    if (!loaded.ok) expect(loaded.reason).toBe('missing')
  })
})

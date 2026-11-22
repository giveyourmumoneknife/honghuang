import { describe, expect, it } from 'vitest'
import {
  SAVE_VERSION,
  checksum,
  createSaveEnvelope,
  decodeSaveEnvelope,
  decodeSaveJson,
  isSaveEnvelope,
  verifySaveEnvelope,
} from '@/core/save'

describe('save envelope', () => {
  it('creates a verifiable envelope', () => {
    const envelope = createSaveEnvelope(
      { name: '龙女', realm: 12 },
      new Date('2026-11-21T00:00:00.000Z'),
    )

    expect(envelope.version).toBe(SAVE_VERSION)
    expect(envelope.createdAt).toBe('2026-11-21T00:00:00.000Z')
    expect(envelope.updatedAt).toBe('2026-11-21T00:00:00.000Z')
    expect(isSaveEnvelope(envelope)).toBe(true)
    expect(verifySaveEnvelope(envelope)).toBe(true)
  })

  it('detects tampering', () => {
    const envelope = createSaveEnvelope({ name: '龙女' })
    envelope.data = { name: '凤女' }

    expect(verifySaveEnvelope(envelope)).toBe(false)
  })

  it('is independent of object key order', () => {
    expect(checksum({ a: 1, b: 2 })).toBe(checksum({ b: 2, a: 1 }))
  })

  it('survives JSON serialization when optional fields are undefined', () => {
    const envelope = createSaveEnvelope({
      name: '龙女',
      cave: undefined,
      eventRuntime: {
        scheduled: [],
        history: {
          'event.longhan.dragon_gate': {
            eventId: 'event.longhan.dragon_gate',
            count: 1,
            lastTriggeredMonths: 4,
            lastResolvedMonths: undefined,
            lastChoiceId: undefined,
          },
        },
      },
    })

    const decoded = decodeSaveJson(JSON.stringify(envelope))
    expect(decoded.ok).toBe(true)
    expect(verifySaveEnvelope(JSON.parse(JSON.stringify(envelope)))).toBe(true)
  })

  it('rejects malformed envelopes', () => {
    expect(isSaveEnvelope(null)).toBe(false)
    expect(isSaveEnvelope({ version: 1 })).toBe(false)
  })

  it('migrates v2 saves to the event runtime state', () => {
    const v2Data = {
      schemaVersion: 2,
      player: { id: 'player.old', name: '旧人' },
      campaign: {
        currentEra: 'era.longhan',
        legacy: {
          memories: [
            '第一次看见潮退。',
            {
              id: 'memory.longhan.kept',
              text: '没有忘记。',
              createdAtMonths: 9,
              sourceEventId: 'event.longhan.dragon_gate',
            },
          ],
        },
      },
      inbox: [
        {
          id: 'inbox:event.longhan.dragon_gate',
          eventId: 'event.longhan.dragon_gate',
          kind: 'story',
          createdAt: '2026-01-01T00:00:00.000Z',
          read: false,
        },
      ],
    }
    const envelope = {
      version: 2,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      checksum: checksum(v2Data),
      data: v2Data,
    }

    const result = decodeSaveEnvelope(envelope)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.migrated).toBe(true)
    expect(result.envelope.version).toBe(SAVE_VERSION)

    const data = result.envelope.data as {
      schemaVersion: number
      player: { inventory: unknown; partnerFavor: unknown }
      campaign: { legacy: { memories: unknown[] } }
      inbox: Array<{ createdMonths: number }>
      eventRuntime: {
        scheduled: unknown[]
        history: unknown
        rumors: unknown[]
        favorLog: unknown[]
        pendingEncounters: unknown[]
        nextSequence: number
      }
    }
    expect(data.schemaVersion).toBe(SAVE_VERSION)
    expect(data.player.inventory).toEqual({})
    expect(data.player.partnerFavor).toEqual({})
    expect(data.campaign.legacy.memories).toEqual([
      {
        id: 'memory.legacy.1',
        text: '第一次看见潮退。',
        createdAtMonths: 0,
      },
      {
        id: 'memory.longhan.kept',
        text: '没有忘记。',
        createdAtMonths: 9,
        sourceEventId: 'event.longhan.dragon_gate',
      },
    ])
    expect(data.inbox[0]?.createdMonths).toBe(0)
    expect(data.eventRuntime).toEqual({
      scheduled: [],
      history: {},
      rumors: [],
      favorLog: [],
      pendingEncounters: [],
      nextSequence: 1,
    })
    expect(result.envelope.checksum).toBe(checksum(result.envelope.data))
  })
})

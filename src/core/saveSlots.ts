import {
  createSaveEnvelope,
  decodeSaveJson,
  type SaveDecodeFailureReason,
  type SaveEnvelope,
} from './save'
import type { SaveStorage } from './saveStorage'

export const MANUAL_SAVE_SLOTS = ['slot1', 'slot2', 'slot3'] as const
export type ManualSaveSlot = (typeof MANUAL_SAVE_SLOTS)[number]
export type SaveSlotId = ManualSaveSlot | 'auto'
export const SAVE_SLOT_IDS: readonly SaveSlotId[] = [...MANUAL_SAVE_SLOTS, 'auto']

export type SaveLoadFailureReason = SaveDecodeFailureReason | 'missing'

export interface SaveLoadSuccess {
  ok: true
  slot: SaveSlotId
  envelope: SaveEnvelope
  migrated: boolean
  recoveredFrom?: SaveSlotId
}

export interface SaveLoadFailure {
  ok: false
  slot: SaveSlotId
  reason: SaveLoadFailureReason
  message: string
}

export type SaveLoadResult = SaveLoadSuccess | SaveLoadFailure

export interface SaveSlotSummary {
  slot: SaveSlotId
  present: boolean
  valid: boolean
  version?: number
  createdAt?: string
  updatedAt?: string
  error?: SaveLoadFailureReason
}

export interface LoadSlotOptions {
  recoverFromAuto?: boolean
}

const SAVE_KEY_PREFIX = 'honghuang.save.'
const RECOVERABLE_FAILURES = new Set<SaveLoadFailureReason>([
  'invalid-json',
  'invalid-envelope',
  'checksum',
  'migration',
])

export function saveSlotKey(slot: SaveSlotId): string {
  return `${SAVE_KEY_PREFIX}${slot}`
}

export class SaveSlotStore {
  private readonly storage: SaveStorage

  constructor(storage: SaveStorage) {
    this.storage = storage
  }

  async save<T>(slot: SaveSlotId, data: T, now = new Date()): Promise<SaveEnvelope<T>> {
    const envelope = createSaveEnvelope(data, now)
    await this.storage.write(saveSlotKey(slot), JSON.stringify(envelope))
    return envelope
  }

  saveAuto<T>(data: T, now = new Date()): Promise<SaveEnvelope<T>> {
    return this.save('auto', data, now)
  }

  async readSlot(slot: SaveSlotId): Promise<SaveLoadResult> {
    const raw = await this.storage.read(saveSlotKey(slot))
    if (raw === null) {
      return {
        ok: false,
        slot,
        reason: 'missing',
        message: `${slot} 存档不存在`,
      }
    }

    const decoded = decodeSaveJson(raw)
    if (!decoded.ok) return { ...decoded, slot }
    return {
      ok: true,
      slot,
      envelope: decoded.envelope,
      migrated: decoded.migrated,
    }
  }

  async load(
    slot: SaveSlotId,
    options: LoadSlotOptions = {},
  ): Promise<SaveLoadResult> {
    const direct = await this.readSlot(slot)
    if (
      direct.ok ||
      slot === 'auto' ||
      !options.recoverFromAuto ||
      !RECOVERABLE_FAILURES.has(direct.reason)
    ) {
      return direct
    }

    const backup = await this.readSlot('auto')
    if (!backup.ok) return direct
    return { ...backup, slot, recoveredFrom: 'auto' }
  }

  async exportSlot(slot: SaveSlotId): Promise<string | null> {
    return this.storage.read(saveSlotKey(slot))
  }

  async importSlot(slot: SaveSlotId, json: string): Promise<SaveLoadResult> {
    const decoded = decodeSaveJson(json)
    if (!decoded.ok) return { ...decoded, slot }

    await this.storage.write(
      saveSlotKey(slot),
      JSON.stringify(decoded.envelope),
    )
    return {
      ok: true,
      slot,
      envelope: decoded.envelope,
      migrated: decoded.migrated,
    }
  }

  async remove(slot: SaveSlotId): Promise<void> {
    await this.storage.remove(saveSlotKey(slot))
  }

  async list(): Promise<SaveSlotSummary[]> {
    return Promise.all(
      SAVE_SLOT_IDS.map(async (slot): Promise<SaveSlotSummary> => {
        const raw = await this.storage.read(saveSlotKey(slot))
        if (raw === null) {
          return { slot, present: false, valid: false }
        }

        const decoded = decodeSaveJson(raw)
        if (!decoded.ok) {
          return {
            slot,
            present: true,
            valid: false,
            error: decoded.reason,
          }
        }

        return {
          slot,
          present: true,
          valid: true,
          version: decoded.envelope.version,
          createdAt: decoded.envelope.createdAt,
          updatedAt: decoded.envelope.updatedAt,
        }
      }),
    )
  }
}

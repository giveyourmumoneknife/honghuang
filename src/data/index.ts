import type { DataPack } from '@/types/content'
import {
  createContentRegistry,
  DuplicateContentIdError,
  getContentStats,
  type ContentRegistry,
  type ContentStats,
} from './registry'
import { prologuePack } from './eras/00_prologue'
import { longhanPack } from './eras/01_longhan'

export const DATA_VERSION = 1
export const DATA_PACK_IDS = ['prologue', 'longhan'] as const

export type DataPackId = (typeof DATA_PACK_IDS)[number]

export const DATA_PACKS: DataPack[] = [prologuePack, longhanPack]

let registryCache: ContentRegistry | undefined

export function getContentRegistry(): ContentRegistry {
  registryCache ??= createContentRegistry(DATA_PACKS)
  return registryCache
}

export function getDataStats(): ContentStats {
  return getContentStats(getContentRegistry())
}

export { createContentRegistry, DuplicateContentIdError, getContentStats }
export type { ContentRegistry, ContentStats }

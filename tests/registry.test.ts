import { describe, expect, it } from 'vitest'
import { DATA_PACKS, DuplicateContentIdError, createContentRegistry, getContentRegistry, getDataStats } from '@/data'

describe('content registry', () => {
  it('indexes the sample catalog by id', () => {
    const registry = createContentRegistry(DATA_PACKS)

    expect(registry.eras.size).toBe(2)
    expect(registry.factions.size).toBe(4)
    expect(registry.regions.size).toBe(8)
    expect(registry.events.size).toBe(101)
    expect(registry.allItems.size).toBe(61)
    expect(registry.siteOwners.size).toBe(16)
    expect(registry.partners.size).toBe(5)
    expect(registry.caves.size).toBe(1)
  })

  it('resolves catalog items and site ownership', () => {
    const registry = createContentRegistry(DATA_PACKS)
    const site = registry.resolveSite('site.longhan.east_sea_palace')
    const treasure = registry.getItem('item.longhan.cauldron_of_first_flame')

    expect(site?.region.id).toBe('region.longhan.four_seas')
    expect(site?.site.name).toBe('东海龙宫')
    expect(treasure?.category).toBe('treasure')
    expect(registry.getItem('item.longhan.missing')).toBeUndefined()
  })

  it('caches the runtime registry', () => {
    expect(getContentRegistry()).toBe(getContentRegistry())
    expect(getDataStats()).toMatchObject({
      eras: 2,
      factions: 4,
      regions: 8,
      sites: 16,
      events: 101,
      catalogItems: 61,
      partners: 5,
      caves: 1,
      physiques: 7,
      bloodlines: 6,
    })
  })

  it('rejects duplicate ids with a typed error', () => {
    const packs = structuredClone(DATA_PACKS)
    packs[1].events.push(structuredClone(packs[1].events[0]))

    expect(() => createContentRegistry(packs)).toThrow(DuplicateContentIdError)
  })
})

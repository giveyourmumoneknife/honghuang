import { describe, expect, it } from 'vitest'
import type {
  CaveDefinition,
  DataPack,
  EventDefinition,
  PartnerDefinition,
} from '@/types/content'
import type { Requirement } from '@/types/dsl'
import { longhanPack } from '@/data/eras/01_longhan'
import { prologuePack } from '@/data/eras/00_prologue'
import { validateContent } from '@/data/validate'

function makePack(): DataPack {
  return structuredClone(longhanPack)
}

function codesOf(pack: DataPack): string[] {
  return validateContent([prologuePack, pack]).errors.map((issue) => issue.code)
}

function addPartner(pack: DataPack): PartnerDefinition {
  const partner: PartnerDefinition = {
    id: 'partner.longhan.test',
    name: '试剑龙女',
    factionId: 'faction.longhan.dragon',
    eraFates: {
      'era.longhan': '守四海，等一个不会回来的人。',
    },
    description: '用于校验器测试的临时道侣。',
    role: 'companion',
    bond: {
      requirements: [
        {
          kind: 'flag',
          flag: 'test.bond_ready',
          value: true,
        },
      ],
      description: '在退潮时说出真名。',
    },
    postBondEventIds: ['event.longhan.dragon_gate'],
  }
  pack.partners.push(partner)
  return partner
}

function cloneEvent(pack: DataPack, eventId: string, title: string): EventDefinition {
  const event = structuredClone(pack.events[0])
  event.id = eventId
  event.title = title
  return event
}

function addEvent(pack: DataPack, event: EventDefinition, root = true): void {
  pack.events.push(event)
  if (root) pack.eras[0].eventIds.push(event.id)
}

function addCave(pack: DataPack): CaveDefinition {
  const cave: CaveDefinition = {
    id: 'cave.longhan.test',
    name: '试剑洞府',
    description: '用于校验器测试的临时洞府。',
    buildings: [
      {
        id: 'building.longhan.test',
        name: '聚灵阵',
        description: '测试建筑。',
        levels: [1, 2, 3].map((level) => ({
          level: level as 1 | 2 | 3,
          name: `第 ${level} 级`,
          description: `测试等级 ${level}。`,
          cost: {},
          verbs: level === 2 ? [] : [`测试动词 ${level}`],
          effects: [],
        })),
      },
    ],
    spiritVein: {
      name: '测试灵脉',
      attributes: ['水'],
      description: '一条安静的测试灵脉。',
      levels: [],
    },
    disciples: [],
    raids: [],
    visitors: [],
    chains: [],
  }
  pack.caves.push(cave)
  return cave
}

describe('content validator', () => {
  it('passes the sample pack', () => {
    const result = validateContent([prologuePack, makePack()])

    expect(result.ok).toBe(true)
    expect(result.errors).toEqual([])
    expect(result.stats).toMatchObject({
      eras: 2,
      factions: 4,
      regions: 8,
      sites: 16,
      events: 101,
      catalogItems: 61,
      partners: 5,
      caves: 1,
    })
  })

  it('catches missing required fields', () => {
    const pack = makePack()
    pack.events[0].title = ''

    expect(codesOf(pack)).toContain('MISSING_FIELD')
  })

  it('catches invalid ids', () => {
    const pack = makePack()
    pack.events[0].id = 'Event.Bad'

    expect(codesOf(pack)).toContain('INVALID_ID')
  })

  it('catches duplicate ids', () => {
    const pack = makePack()
    pack.events.push(structuredClone(pack.events[0]))

    expect(codesOf(pack)).toContain('DUPLICATE_ID')
  })

  it('catches missing references', () => {
    const pack = makePack()
    pack.events[0].regionId = 'region.longhan.missing'

    expect(codesOf(pack)).toContain('MISSING_REFERENCE')
  })

  it('requires a non-numeric consequence on every event', () => {
    const pack = makePack()
    const event = pack.events[0]
    const numeric = {
      kind: 'changeResource' as const,
      resource: 'spirit_stones' as const,
      amount: 1,
    }
    event.onEnter = []
    event.choices.forEach((choice) => {
      choice.effects = [numeric]
    })

    expect(codesOf(pack)).toContain('NON_NUMERIC_EFFECT_REQUIRED')
  })

  it('catches empty branches', () => {
    const pack = makePack()
    pack.events[0].choices[0].effects = []

    expect(codesOf(pack)).toContain('EMPTY_BRANCH')
  })

  it('catches joinable factions without join rules', () => {
    const pack = makePack()
    pack.factions[0].join = undefined

    expect(codesOf(pack)).toContain('FACTION_JOIN_MISSING')
  })

  it('catches joinable factions without exit rules', () => {
    const pack = makePack()
    pack.factions[0].exit = undefined

    expect(codesOf(pack)).toContain('FACTION_EXIT_MISSING')
  })

  it('catches joinable factions without promotion trials', () => {
    const pack = makePack()
    pack.factions[0].ranks = pack.factions[0].ranks.slice(0, 1)

    expect(codesOf(pack)).toContain('FACTION_PROMOTION_MISSING')
  })

  it('catches partners without bond conditions', () => {
    const pack = makePack()
    const partner = addPartner(pack)
    partner.bond.requirements = []

    expect(codesOf(pack)).toContain('PARTNER_BOND_MISSING')
  })

  it('catches partners without post-bond content', () => {
    const pack = makePack()
    const partner = addPartner(pack)
    partner.postBondEventIds = []

    expect(codesOf(pack)).toContain('PARTNER_POST_BOND_MISSING')
  })

  it('catches building upgrades without a verb', () => {
    const pack = makePack()
    addCave(pack)

    expect(codesOf(pack)).toContain('BUILDING_VERB_MISSING')
  })

  it('catches daily-task generation traces', () => {
    const pack = makePack()
    pack.events[0].tags = ['每日签到']

    expect(codesOf(pack)).toContain('DAILY_TASK_FORBIDDEN')
  })

  it('catches missing cross-era fates', () => {
    const pack = makePack()
    delete pack.factions[0].eraPresence['era.longhan']

    expect(codesOf(pack)).toContain('CROSS_ERA_FATE_MISSING')
  })

  it('catches placeholder text', () => {
    const pack = makePack()
    pack.events[0].title = 'TODO 三族会盟'

    expect(codesOf(pack)).toContain('PLACEHOLDER_TEXT')
  })

  it('catches unreachable events but follows schedule links', () => {
    const pack = makePack()
    addEvent(pack, cloneEvent(pack, 'event.longhan.orphan', '无入口事件'), false)
    expect(codesOf(pack)).toContain('EVENT_UNREACHABLE')

    const reachable = makePack()
    reachable.eras[0].eventIds = reachable.eras[0].eventIds.filter(
      (eventId) => eventId !== 'event.longhan.first_beast_tide',
    )
    expect(
      validateContent([prologuePack, reachable]).errors.some(
        (issue) => issue.code === 'EVENT_UNREACHABLE' && issue.path.includes('first_beast_tide'),
      ),
    ).toBe(false)
  })

  it('catches non-repeatable event cycles', () => {
    const pack = makePack()
    const eventA = cloneEvent(pack, 'event.longhan.cycle_a', '闭环甲')
    const eventB = cloneEvent(pack, 'event.longhan.cycle_b', '闭环乙')
    eventA.repeatable = false
    eventB.repeatable = false
    eventA.onEnter = [{ kind: 'scheduleEvent', eventId: eventB.id }]
    eventB.onEnter = [{ kind: 'scheduleEvent', eventId: eventA.id }]
    addEvent(pack, eventA)
    addEvent(pack, eventB)

    expect(codesOf(pack)).toContain('EVENT_CYCLE')
  })

  it('allows repeatable recurring cycles', () => {
    const pack = makePack()
    const recurring = cloneEvent(pack, 'event.longhan.recurring', '循环潮汐')
    recurring.repeatable = true
    recurring.cooldownMonths = 12
    recurring.onEnter = [{ kind: 'scheduleEvent', eventId: recurring.id, delayMonths: 12 }]
    addEvent(pack, recurring)

    expect(codesOf(pack)).not.toContain('EVENT_CYCLE')
  })

  it('catches events that can never be resolved', () => {
    const pack = makePack()
    const deadEnd = cloneEvent(pack, 'event.longhan.dead_end', '无选项事件')
    deadEnd.choices = []
    deadEnd.onEnter = [{ kind: 'setFlag', flag: 'longhan.dead_end_seen', value: true }]
    addEvent(pack, deadEnd)

    expect(codesOf(pack)).toContain('EVENT_DEAD_END')
  })

  it('catches malformed effect fields and duplicate choice ids', () => {
    const pack = makePack()
    pack.events[0].onEnter.push({
      kind: 'scheduleEvent',
      eventId: 'event.longhan.first_beast_tide',
      delayMonths: -1,
    })
    pack.events[0].choices[0].effects.push({
      kind: 'grantItem',
      itemId: 'item.longhan.dragon_scale',
      count: 0,
    })
    pack.events[0].choices.push(structuredClone(pack.events[0].choices[0]))

    const codes = codesOf(pack)
    expect(codes).toContain('INVALID_RANGE')
    expect(codes).toContain('DUPLICATE_ID')
  })

  it('catches malformed requirement fields', () => {
    const pack = makePack()
    pack.events[0].choices[0].requirements = [
      { kind: 'realm', minRealm: 'void' } as unknown as Requirement,
    ]
    pack.events[1].requirements = [
      { kind: 'all', of: [] },
    ]
    pack.events[2].onEnter.push({
      kind: 'setFlag',
      flag: 'longhan.invalid_value',
      value: { nested: true } as unknown as boolean,
    })

    const codes = codesOf(pack)
    expect(codes).toContain('INVALID_ENUM')
    expect(codes).toContain('INVALID_VALUE')
  })
})

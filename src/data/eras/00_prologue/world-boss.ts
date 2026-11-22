import type {
  EncounterDefinition,
  EnemyDefinition,
  WorldBossDefinition,
} from '@/types/content'

export const prologueBossEnemies: EnemyDefinition[] = [
  {
    id: 'enemy.worldboss.prologue.tide_eye',
    name: '潮眼旧影',
    title: '开天前最后一段退潮',
    description:
      '它从四海最低处浮起，形体像一头被海遗忘的鲸。旧鳞上排着不属于这一世的潮位，鲸尾每一次摆动，都让岸上的时间慢半拍。',
    element: 'water',
    stats: { health: 110, attack: 9, defense: 4, speed: 3, crit: 3 },
    traits: ['armored', 'regenerating'],
    skills: [
      {
        id: 'skill.worldboss.tide_eye_press',
        name: '旧潮压身',
        description: '一段比天地更早的退潮从鲸背落下，站在其中的人会先听见自己的骨响。',
        cooldown: 4,
        multiplier: 1.8,
        effect: 'stun',
        power: 4,
      },
    ],
  },
]

export const prologueBossEncounters: EncounterDefinition[] = [
  {
    id: 'encounter.worldboss.prologue.tide_eye',
    name: '潮眼旧影',
    summary: '四海同时退潮时，一头没有名字的鲸从潮眼深处浮起。',
    description:
      '它的背脊露出水面时，礁石上所有潮痕同时亮了一下。鲸不主动伤人，只把身体横在潮眼上，像在等一个还记得它名字的人。',
    enemyIds: ['enemy.worldboss.prologue.tide_eye'],
    regionId: 'region.longhan.four_seas',
    tier: 1,
    requirements: [],
    victoryEffects: [],
    defeatEffects: [],
    fleeAllowed: false,
    tags: ['worldboss', 'prologue', 'tide'],
  },
]

export const prologueWorldBosses: WorldBossDefinition[] = [
  {
    id: 'worldboss.prologue.tide_eye',
    eraId: 'era.prologue',
    name: '潮眼旧影',
    title: '四海潮眼 · 无名鲸落',
    originalName: '无名鲸落',
    summary:
      '开天之前就沉在混沌海底的一头鲸。天地分开后，它的身体成了潮眼，退潮时偶尔浮起一段旧影。',
    description:
      '它没有名字，也不曾被任何一族册封。四海第一次学会退潮时，鲸落翻了个身；从那以后，每逢潮眼最深的一夜，它就会浮起一次。',
    originalBody:
      '原身是一头在天地未分时便已沉落的鲸。它的骨架至今仍在归墟之下，撑着一片比四海更早的海。现世浮起的只是它遗落在潮眼里的一段旧影，带着原身最后一口呼吸与几片旧鳞。',
    regionId: 'region.longhan.four_seas',
    encounterId: 'encounter.worldboss.prologue.tide_eye',
    phaseOrder: 3,
    requirements: [
      {
        kind: 'flag',
        flag: 'prologue.three_lights',
        value: true,
      },
    ],
    respawnMonths: 24,
    killScale: 0.18,
    maxScale: 2.4,
    guaranteedDrops: [
      {
        kind: 'cultivation',
        cultivationMin: 50,
        cultivationMax: 80,
        weight: 1,
      },
      {
        kind: 'item',
        itemId: 'item.worldboss.tide_eye_scale',
        countMin: 1,
        countMax: 1,
        weight: 1,
        firstKillOnly: true,
      },
    ],
    dropPicks: [2, 3],
    drops: [
      {
        kind: 'resource',
        resource: 'spirit_stones',
        amountMin: 18,
        amountMax: 30,
        weight: 18,
      },
      {
        kind: 'item',
        itemId: 'item.longhan.tide_silver',
        countMin: 2,
        countMax: 4,
        weight: 16,
      },
      {
        kind: 'resource',
        resource: 'spirit_herbs',
        amountMin: 2,
        amountMax: 4,
        weight: 12,
      },
      {
        kind: 'item',
        itemId: 'item.longhan.tide_pearl',
        countMin: 1,
        countMax: 1,
        weight: 8,
      },
      {
        kind: 'item',
        itemId: 'item.longhan.driftwood_staff',
        countMin: 1,
        countMax: 1,
        weight: 10,
      },
      {
        kind: 'item',
        itemId: 'item.longhan.wave_treads',
        countMin: 1,
        countMax: 1,
        weight: 8,
      },
      {
        kind: 'item',
        itemId: 'item.longhan.reed_sandals',
        countMin: 1,
        countMax: 1,
        weight: 8,
      },
      {
        kind: 'gear',
        gearSlot: 'armor',
        gearTier: 2,
        qualityBonus: 0.6,
        weight: 12,
      },
      {
        kind: 'gear',
        gearSlot: 'boots',
        gearTier: 2,
        qualityBonus: 0.4,
        weight: 8,
      },
    ],
    onFirstKill: [
      {
        kind: 'setFlag',
        flag: 'worldboss.prologue.tide_eye.remembered',
        value: true,
      },
      {
        kind: 'addMemory',
        memoryId: 'memory.worldboss.prologue.tide_eye',
        text: '你在潮眼最深处打散了一头无名鲸落的旧影。它沉回去之前，用你的心跳模仿了一次退潮。',
      },
      {
        kind: 'addRumor',
        rumorId: 'rumor.worldboss.prologue.tide_eye',
        text: '四海同时退潮的那一夜，有人看见潮眼里浮起一头旧鲸，又看见一个散修从鲸背上走下来。',
      },
    ],
    onEveryKill: [
      {
        kind: 'changeRegionState',
        regionId: 'region.longhan.four_seas',
        key: 'tide_eye_last_calmed',
        value: 'calmed',
      },
    ],
    tags: ['worldboss', 'prologue', 'tide', 'whale'],
  },
]
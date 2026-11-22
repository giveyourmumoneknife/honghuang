import type { EncounterDefinition, EnemyDefinition } from '@/types/content'

/**
 * 龙汉补遗的历练遭遇：补上洪荒陆与不周山之间的强度台阶，
 * 让玩家在 foundation 前后都有新的对手可撞见。
 */
export const longhanSupplementEnemies: EnemyDefinition[] = [
  {
    id: 'enemy.longhan.road_asker',
    name: '拦路人',
    title: '在旧官道上替死人收过路钱的人',
    description:
      '他站在断桥中央，身后横着一根削尖的木杆。桥下没有水，只有一层被太阳晒白的骨头。“这条路以前有人修过。”他说，“修路的人死了。现在过路，得替他收一次。”',
    element: 'earth',
    stats: { health: 58, attack: 9, defense: 4, speed: 4, crit: 3 },
    traits: ['swift'],
    skills: [
      {
        id: 'skill.longhan.road_sweep',
        name: '扫尘',
        description: '木杆贴着地面扫过来，不快，却把落脚的地方全封了。',
        cooldown: 3,
        multiplier: 1.2,
        effect: 'stun',
        power: 2,
      },
    ],
    reward: { resources: { spirit_stones: 10 } },
  },
  {
    id: 'enemy.longhan.oathless_rider',
    name: '无誓骑手',
    title: '三族会盟后仍替旧主巡道的孤骑',
    description:
      '他的坐骑早已化成一副骨架，自己却还披着完整的甲。会盟之后，旧主没有来收他的缰绳。“誓已经废了，”他隔着面甲说，“路还没有。”',
    element: 'wind',
    stats: { health: 145, attack: 17, defense: 9, speed: 7, crit: 5 },
    traits: ['swift', 'berserk'],
    skills: [
      {
        id: 'skill.longhan.oathless_charge',
        name: '旧誓先至',
        description: '骨马不响，甲骑先到。等你看见影子时，人已经在面前了。',
        cooldown: 4,
        multiplier: 1.6,
        effect: 'execute',
        power: 4,
      },
    ],
    reward: { resources: { spirit_stones: 18, ore: 1 } },
  },
  {
    id: 'enemy.longhan.star_quarrier',
    name: '采星人',
    title: '在雷云里凿天柱残块的老匠',
    description:
      '他背着筐，筐里全是发亮的碎石。雷落在身边，他也不躲。“天柱断的时候，星屑都嵌在石头里。”他把你上下打量了一遍，“你身上有一块。还我。”',
    element: 'thunder',
    stats: { health: 300, attack: 27, defense: 16, speed: 5, crit: 5 },
    traits: ['armored', 'spirit_eater'],
    skills: [
      {
        id: 'skill.longhan.quarry_chisel',
        name: '凿星',
        description: '他把凿子往空中一敲，落下来的不是火星，是一小片会咬人的雷。',
        cooldown: 4,
        multiplier: 1.7,
        effect: 'burn',
        power: 5,
      },
    ],
    reward: {
      resources: { ore: 5, spirit_stones: 22 },
      items: [{ itemId: 'item.longhan.pillar_dust', count: 1 }],
    },
  },
  {
    id: 'enemy.longhan.lectern_shadow',
    name: '讲席影',
    title: '仍坐在空殿里替人讲经的影子',
    description:
      '殿里没有讲者，只有一道坐在最上首的影子。它开口时没有声音，你却听得懂每一个字；听到第三句，你发现自己已经站到了蒲团前。',
    element: 'thunder',
    stats: { health: 390, attack: 31, defense: 19, speed: 6, crit: 5 },
    traits: ['spirit_eater', 'regenerating'],
    skills: [
      {
        id: 'skill.longhan.lectern_question',
        name: '问心',
        description: '它问出一个你一直没答上来的问题。答不上来的人，会先乱了自己的气息。',
        cooldown: 4,
        multiplier: 1.6,
        effect: 'drain',
        power: 6,
      },
    ],
    reward: {
      resources: { spirit_stones: 26 },
      items: [{ itemId: 'item.longhan.pillar_dust', count: 1 }],
    },
  },
  {
    id: 'enemy.longhan.pillar_warden',
    name: '天柱守石',
    title: '山体自己长出来的守门人',
    description:
      '它没有脸，整块山岩里嵌着很多旧兵器。你走近时，石缝里同时亮起几道眼一样的微光，像山在用历代死在坡上的人看你。',
    element: 'earth',
    stats: { health: 720, attack: 45, defense: 40, speed: 3, crit: 4 },
    traits: ['armored', 'regenerating'],
    skills: [
      {
        id: 'skill.longhan.pillar_press',
        name: '山意压顶',
        description: '它抬起手，整片山道也跟着抬高半寸，然后一起落下来。',
        cooldown: 5,
        multiplier: 2,
        effect: 'stun',
        power: 8,
      },
    ],
    reward: {
      resources: { ore: 9, spirit_stones: 36 },
      items: [{ itemId: 'item.longhan.pillar_dust', count: 2 }],
    },
  },
]

export const longhanSupplementEncounters: EncounterDefinition[] = [
  {
    id: 'encounter.longhan.road_asker',
    name: '断桥过路钱',
    summary: '一个替死人收过路钱的人挡住了旧官道。',
    description:
      '桥断了一半，另一半被一块新木板接上。拦路人说这块板是他钉的，过桥得给他一个说法。你说不出修路人的名字，他也并不意外。',
    enemyIds: ['enemy.longhan.road_asker'],
    regionId: 'region.longhan.honghuang_land',
    tier: 1,
    requirements: [],
    victoryEffects: [
      {
        kind: 'changeRegionState',
        regionId: 'region.longhan.honghuang_land',
        key: 'road_asker',
        value: 'paid',
      },
      {
        kind: 'addRumor',
        rumorId: 'rumor.longhan.road_asker',
        text: '旧官道断桥上的拦路人不见了。桥面新钉的木板还在，板下压着一小串铜钱。',
      },
    ],
    defeatEffects: [
      {
        kind: 'changeResource',
        resource: 'spirit_stones',
        amount: -8,
      },
      {
        kind: 'applyStatus',
        statusId: 'status.longhan.raider_wound',
        months: 1,
        source: '拦路人',
      },
    ],
    reward: { cultivation: 14, resources: { spirit_stones: 9 } },
    fleeAllowed: true,
    tags: ['road', 'three_clans'],
  },
  {
    id: 'encounter.longhan.oathless_rider',
    name: '旧誓孤骑',
    summary: '一匹骨马从官道尽头跑来，甲骑还守着废掉的旧誓。',
    description:
      '他没有减速，只在最后一刻勒住骨马。缰绳是空的，马却停了。“会盟之前，这条道归我主。”他说，“会盟之后，没人来告诉我该归谁。你替他说。”',
    enemyIds: ['enemy.longhan.oathless_rider'],
    regionId: 'region.longhan.honghuang_land',
    tier: 2,
    requirements: [{ kind: 'realm', minRealm: 'qi_refining', minStage: 2 }],
    victoryEffects: [
      {
        kind: 'changeRegionState',
        regionId: 'region.longhan.honghuang_land',
        key: 'oathless_rider',
        value: 'unhorsed',
      },
      { kind: 'grantItem', itemId: 'item.longhan.old_bone_slip', count: 1 },
      {
        kind: 'addRumor',
        rumorId: 'rumor.longhan.oathless_rider',
        text: '会盟后仍在巡道的孤骑不见了。有人看见他的骨马自己沿旧路走了一圈，最后停在断桥边。',
      },
    ],
    defeatEffects: [
      {
        kind: 'changeResource',
        resource: 'ore',
        amount: -2,
      },
      {
        kind: 'applyStatus',
        statusId: 'status.longhan.raider_wound',
        months: 2,
        source: '无誓骑手',
      },
    ],
    reward: { cultivation: 26, resources: { spirit_stones: 16, ore: 2 } },
    fleeAllowed: true,
    tags: ['road', 'oath', 'three_clans'],
  },
  {
    id: 'encounter.longhan.star_quarry',
    name: '雷云采石场',
    summary: '雷云里有人一直在凿山，碎屑落下来像下了一场星雨。',
    description:
      '你循着凿声上了半山腰。采星人蹲在雷云边缘，把天柱残块一块块凿下来，按亮暗分进两个筐。他看见你，先看你的手，再看你的影子。',
    enemyIds: ['enemy.longhan.star_quarrier'],
    regionId: 'region.longhan.buzhou_mountain',
    tier: 3,
    requirements: [{ kind: 'realm', minRealm: 'foundation' }],
    victoryEffects: [
      {
        kind: 'changeRegionState',
        regionId: 'region.longhan.buzhou_mountain',
        key: 'star_quarry',
        value: 'quieted',
      },
      { kind: 'grantItem', itemId: 'item.longhan.pillar_dust', count: 2 },
      {
        kind: 'addRumor',
        rumorId: 'rumor.longhan.star_quarry',
        text: '雷云里的凿声停了一阵。山道上落了一层发亮的石屑，拾起来时还带着雷的余温。',
      },
    ],
    defeatEffects: [
      {
        kind: 'changeResource',
        resource: 'spirit_stones',
        amount: -18,
      },
      {
        kind: 'applyStatus',
        statusId: 'status.longhan.burn_scar',
        months: 2,
        source: '采星人',
      },
    ],
    reward: { cultivation: 52, resources: { ore: 4, spirit_stones: 24 } },
    fleeAllowed: true,
    tags: ['mountain', 'thunder', 'quarry'],
  },
  {
    id: 'encounter.longhan.lectern_shadow',
    name: '空殿问经',
    summary: '空殿里有一道仍在讲经的影子。它停下来，等你答。',
    description:
      '你走进偏殿时，讲席上的影子正讲到一半。它没有因为你来而停下，也没有因为你坐下而继续，只是把最后一句留在空中，等你接。殿外的云压得很低，雷声一直没有落下来。',
    enemyIds: ['enemy.longhan.lectern_shadow'],
    regionId: 'region.longhan.zi_xiao_palace',
    tier: 4,
    requirements: [{ kind: 'realm', minRealm: 'foundation', minStage: 2 }],
    victoryEffects: [
      {
        kind: 'changeRegionState',
        regionId: 'region.longhan.zi_xiao_palace',
        key: 'lectern_shadow',
        value: 'answered',
      },
      { kind: 'grantItem', itemId: 'item.longhan.pillar_dust', count: 1 },
      {
        kind: 'addRumor',
        rumorId: 'rumor.longhan.lectern_shadow',
        text: '紫霄宫偏殿里的讲经声停了一次。殿外压了很久的雷这才落下来，落在很远的地方。',
      },
    ],
    defeatEffects: [
      {
        kind: 'applyStatus',
        statusId: 'status.longhan.quiet_room',
        months: 2,
        source: '讲席影',
      },
    ],
    reward: { cultivation: 88, resources: { spirit_stones: 30, merit: 1 } },
    fleeAllowed: true,
    tags: ['palace', 'dao', 'shadow'],
  },
  {
    id: 'encounter.longhan.pillar_warden',
    name: '山不肯让路',
    summary: '整块山岩在路中央站起来，石缝里全是旧兵器。',
    description:
      '你走到天柱最窄处时，脚下的石阶忽然抬高。守石从山体里分出来，身上嵌着历代死在坡上的兵器。它没有拦你，只是让你无路可走。',
    enemyIds: ['enemy.longhan.pillar_warden'],
    regionId: 'region.longhan.buzhou_mountain',
    tier: 5,
    requirements: [{ kind: 'realm', minRealm: 'foundation', minStage: 3 }],
    victoryEffects: [
      {
        kind: 'changeRegionState',
        regionId: 'region.longhan.buzhou_mountain',
        key: 'pillar_warden',
        value: 'opened',
      },
      { kind: 'grantItem', itemId: 'item.longhan.pillar_dust', count: 3 },
      { kind: 'grantItem', itemId: 'item.longhan.vein_crystal', count: 1 },
    ],
    defeatEffects: [
      {
        kind: 'changeResource',
        resource: 'ore',
        amount: -4,
      },
      {
        kind: 'applyStatus',
        statusId: 'status.longhan.ridge_slowness',
        months: 3,
        source: '天柱守石',
      },
    ],
    reward: { cultivation: 112, resources: { ore: 10, spirit_stones: 40 } },
    fleeAllowed: true,
    tags: ['mountain', 'pillar', 'warden'],
  },
]
import type { FactionDefinition } from '@/types/content'

export const longhanFactions: FactionDefinition[] = [
  {
    id: 'faction.longhan.dragon',
    name: '龙族',
    archetype: 'race',
    joinable: true,
    description:
      '掌四海潮汐，以血脉与巡海秩序立族。龙庭重誓约，也重脸面；一条龙可以为你逆潮，也可以在潮退时假装从未认识你。',
    eraPresence: {
      'era.prologue': 'active',
      'era.longhan': 'active',
    },
    join: {
      requirements: [
        {
          kind: 'realm',
          minRealm: 'qi_refining',
          minStage: 1,
        },
      ],
      entryEventId: 'event.longhan.dragon_gate',
      entryCost: {
        spirit_stones: 20,
      },
      description: '受龙门潮印，承认四海律令；龙庭不问出身，只问你是否能在退潮时站住。',
    },
    exit: {
      allowed: true,
      requirements: [],
      consequence: '交还潮印，名字从巡海册上抹去；旧同僚不会追杀你，但也不会再为你作证。',
    },
    ranks: [
      {
        id: 'rank.longhan.dragon.child',
        title: '龙子',
        order: 1,
        requirements: [],
        trial: '在龙门下听完一整次潮汐，不退。',
      },
      {
        id: 'rank.longhan.dragon.general',
        title: '龙将',
        order: 2,
        requirements: [
          {
            kind: 'factionMembership',
            factionId: 'faction.longhan.dragon',
            rankAtLeast: 1,
          },
        ],
        trial: '独自巡海一季，带回一件不属于四海的失物。',
        trialEventId: 'event.longhan.dragon_trial_current',
      },
      {
        id: 'rank.longhan.dragon.elder',
        title: '长老',
        order: 3,
        requirements: [
          {
            kind: 'factionMembership',
            factionId: 'faction.longhan.dragon',
            rankAtLeast: 2,
          },
          {
            kind: 'flag',
            flag: 'longhan.dragon_inner_strife_quelled',
            value: true,
          },
        ],
        trial: '在龙庭内斗中保住一条不该死的性命，并让另一方记住这件事。',
        trialEventId: 'event.longhan.dragon_elder_scene',
      },
    ],
    treeId: 'tree.longhan.dragon',
    facilityId: 'facility.longhan.dragon_gate',
    techniqueIds: [
      'technique.longhan.tide_lull',
      'technique.longhan.mirror_tide',
      'technique.longhan.geng_metal',
    ],
    eventIds: [
      'event.longhan.dragon_gate',
      'event.longhan.dragon_tide_court',
      'event.longhan.dragon_trial_current',
      'event.longhan.dragon_elder_scene',
      'event.longhan.dragon_envoy_lead',
      'event.longhan.dragon_envoy_remains',
      'event.longhan.dragon_envoy_return',
    ],
    relations: [
      {
        factionId: 'faction.longhan.phoenix',
        standing: 'rival',
        note: '火与水在盟约上相邻，在潮汐与火季里互相试探。',
      },
      {
        factionId: 'faction.longhan.qilin',
        standing: 'neutral',
        note: '龙族需要麒麟族替地脉作证，麒麟族需要龙族替四海守约。',
      },
      {
        factionId: 'faction.longhan.rahu',
        standing: 'enemy',
        note: '龙庭不谈魔渊，只在巡海册上多留一页空白。',
      },
    ],
    tags: ['race', 'sea', 'order'],
  },
  {
    id: 'faction.longhan.phoenix',
    name: '凤族',
    archetype: 'race',
    joinable: true,
    description:
      '守不死火山与涅槃传承。凤族不惧死，却极怕被遗忘；每一根落羽都会写明主人曾如何活过。',
    eraPresence: {
      'era.prologue': 'active',
      'era.longhan': 'active',
    },
    join: {
      requirements: [
        {
          kind: 'realm',
          minRealm: 'qi_refining',
          minStage: 1,
        },
      ],
      entryEventId: 'event.longhan.nirvana_choice',
      entryCost: {
        spirit_herbs: 15,
      },
      description: '在涅槃池边留下旧羽，允诺不让火种落入不知代价的人手中。',
    },
    exit: {
      allowed: true,
      requirements: [],
      consequence: '旧羽被投入池中焚尽，凤族不再替你保存任何一段过去。',
    },
    ranks: [
      {
        id: 'rank.longhan.phoenix.child',
        title: '凤女',
        order: 1,
        requirements: [],
        trial: '在火山口守一夜，辨认三种不同的火焰。',
      },
      {
        id: 'rank.longhan.phoenix.general',
        title: '凤将',
        order: 2,
        requirements: [
          {
            kind: 'factionMembership',
            factionId: 'faction.longhan.phoenix',
            rankAtLeast: 1,
          },
        ],
        trial: '助一位同族完成涅槃，不许替她决定烧掉什么。',
        trialEventId: 'event.longhan.phoenix_trial_wind',
      },
      {
        id: 'rank.longhan.phoenix.elder',
        title: '长老',
        order: 3,
        requirements: [
          {
            kind: 'factionMembership',
            factionId: 'faction.longhan.phoenix',
            rankAtLeast: 2,
          },
          {
            kind: 'flag',
            flag: 'longhan.volcano_crisis_eased',
            value: true,
          },
        ],
        trial: '在不死火山将熄的那一季，带回一簇不属于涅槃池的火。',
        trialEventId: 'event.longhan.phoenix_elder_choice',
      },
    ],
    treeId: 'tree.longhan.phoenix',
    facilityId: 'facility.longhan.nirvana_pool',
    techniqueIds: [
      'technique.longhan.ember_sutra',
      'technique.longhan.four_seasons',
      'technique.longhan.vermilion_pact',
    ],
    eventIds: [
      'event.longhan.nirvana_choice',
      'event.longhan.phoenix_ash_garden',
      'event.longhan.phoenix_trial_wind',
      'event.longhan.phoenix_elder_choice',
    ],
    relations: [
      {
        factionId: 'faction.longhan.dragon',
        standing: 'rival',
        note: '火季与潮汐都宣称自己先于对方存在。',
      },
      {
        factionId: 'faction.longhan.qilin',
        standing: 'ally',
        note: '地脉中的旧火与不死火山同源；麒麟族是凤族少数愿意听其劝的邻人。',
      },
      {
        factionId: 'faction.longhan.rahu',
        standing: 'enemy',
        note: '罗睺的魔火不烧影子，只烧记忆；凤族视其为对涅槃的亵渎。',
      },
    ],
    tags: ['race', 'fire', 'rebirth'],
  },
  {
    id: 'faction.longhan.qilin',
    name: '麒麟族',
    archetype: 'race',
    joinable: true,
    description:
      '镇守大地灵脉，以祥瑞与地脉为证。麒麟族不轻易许诺，因为大地的记性比任何一族都长。',
    eraPresence: {
      'era.prologue': 'active',
      'era.longhan': 'active',
    },
    join: {
      requirements: [
        {
          kind: 'realm',
          minRealm: 'qi_refining',
          minStage: 1,
        },
      ],
      entryEventId: 'event.longhan.auspicious_terra',
      entryCost: {
        ore: 10,
      },
      description: '在祥瑞台上听完地脉的回响，并说出自己愿意为哪一条地脉负责。',
    },
    exit: {
      allowed: true,
      requirements: [],
      consequence: '祥瑞台会收回你的名字，但地脉仍记得你曾许下的那句话。',
    },
    ranks: [
      {
        id: 'rank.longhan.qilin.beast',
        title: '瑞兽',
        order: 1,
        requirements: [],
        trial: '在祥瑞台下守住一处地脉裂口，直到它自行合拢。',
      },
      {
        id: 'rank.longhan.qilin.warden',
        title: '镇守',
        order: 2,
        requirements: [
          {
            kind: 'factionMembership',
            factionId: 'faction.longhan.qilin',
            rankAtLeast: 1,
          },
        ],
        trial: '不带兵刃走过麒麟崖七道石纹，带回每一道石纹的回声。',
        trialEventId: 'event.longhan.qilin_trial_marks',
      },
      {
        id: 'rank.longhan.qilin.elder',
        title: '长老',
        order: 3,
        requirements: [
          {
            kind: 'factionMembership',
            factionId: 'faction.longhan.qilin',
            rankAtLeast: 2,
          },
          {
            kind: 'flag',
            flag: 'longhan.earth_vein_restored',
            value: true,
          },
        ],
        trial: '修复一条被魔气侵蚀的地脉，不向龙族或凤族借力。',
        trialEventId: 'event.longhan.qilin_elder_seat',
      },
    ],
    treeId: 'tree.longhan.qilin',
    facilityId: 'facility.longhan.auspicious_terrace',
    techniqueIds: [
      'technique.longhan.mountain_stillness',
      'technique.longhan.seven_marks',
      'technique.longhan.autumn_harvest',
    ],
    eventIds: [
      'event.longhan.auspicious_terra',
      'event.longhan.qilin_vein_watch',
      'event.longhan.qilin_trial_marks',
      'event.longhan.qilin_elder_seat',
    ],
    relations: [
      {
        factionId: 'faction.longhan.dragon',
        standing: 'neutral',
        note: '水系亦养地脉，但龙庭的潮汐从不问地下的事。',
      },
      {
        factionId: 'faction.longhan.phoenix',
        standing: 'ally',
        note: '凤族记得旧火，麒麟族记得旧土；两者都不愿让火与土同时失去。',
      },
      {
        factionId: 'faction.longhan.rahu',
        standing: 'enemy',
        note: '魔渊侵蚀地脉，麒麟族把每一道魔痕都记在崖上。',
      },
    ],
    tags: ['race', 'earth', 'order'],
  },
  {
    id: 'faction.longhan.rahu',
    name: '罗睺魔道',
    archetype: 'teaching',
    joinable: true,
    description:
      '藏于魔渊的教门，信徒相信开天尚未完成，万物都该被重新命名。罗睺不问出身，只问你愿不愿意为一次重新命名付出代价。',
    eraPresence: {
      'era.prologue': 'hidden',
      'era.longhan': 'hidden',
    },
    join: {
      requirements: [
        {
          kind: 'realm',
          minRealm: 'qi_refining',
          minStage: 1,
        },
        {
          kind: 'flag',
          flag: 'longhan.rahu_whisper',
          value: true,
        },
      ],
      entryEventId: 'event.longhan.abyss_initiation',
      description: '在无光海边听见自己的名字被另一种声音念出，并回答它。',
    },
    exit: {
      allowed: true,
      requirements: [
        {
          kind: 'realm',
          minRealm: 'foundation',
          minStage: 1,
        },
      ],
      consequence: '罗睺不追叛徒，只收回赐予的名字。失去名字的人仍可活着，但旧日同门再也认不出你。',
    },
    ranks: [
      {
        id: 'rank.longhan.rahu.disciple',
        title: '魔徒',
        order: 1,
        requirements: [],
        trial: '在魔火窟中看着自己的影子燃烧，不伸手去救它。',
      },
      {
        id: 'rank.longhan.rahu.general',
        title: '魔将',
        order: 2,
        requirements: [
          {
            kind: 'factionMembership',
            factionId: 'faction.longhan.rahu',
            rankAtLeast: 1,
          },
        ],
        trial: '替一位同门完成一次不愿被记起的献祭，并保守秘密。',
        trialEventId: 'event.longhan.rahu_trial_shadow',
      },
      {
        id: 'rank.longhan.rahu.sovereign',
        title: '魔尊',
        order: 3,
        requirements: [
          {
            kind: 'factionMembership',
            factionId: 'faction.longhan.rahu',
            rankAtLeast: 2,
          },
          {
            kind: 'flag',
            flag: 'longhan.rahu_price_paid',
            value: true,
          },
        ],
        trial: '替罗睺完成一次开天旧梦，让至少一个旧名从洪荒消失。',
        trialEventId: 'event.longhan.rahu_elder_name',
      },
    ],
    treeId: 'tree.longhan.rahu',
    facilityId: 'facility.longhan.demon_fire_cave',
    techniqueIds: [
      'technique.longhan.nameless_edge',
      'technique.longhan.primordial_fragment',
    ],
    eventIds: [
      'event.longhan.abyss_initiation',
      'event.longhan.rahu_trial_shadow',
      'event.longhan.rahu_elder_name',
    ],
    relations: [
      {
        factionId: 'faction.longhan.dragon',
        standing: 'enemy',
        note: '龙庭守着四海的名，魔渊想让海水忘掉自己的名字。',
      },
      {
        factionId: 'faction.longhan.phoenix',
        standing: 'enemy',
        note: '涅槃是记住后的重生；罗睺要的是重生前的遗忘。',
      },
      {
        factionId: 'faction.longhan.qilin',
        standing: 'enemy',
        note: '地脉记录一切，而魔渊以抹去记录为道。',
      },
    ],
    tags: ['teaching', 'abyss', 'hidden'],
  },
]

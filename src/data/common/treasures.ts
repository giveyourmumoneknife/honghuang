import type { TreasureDefinition } from '@/types/content'

export const commonTreasures: TreasureDefinition[] = [
  {
    id: 'item.longhan.cauldron_of_first_flame',
    name: '初火鼎',
    category: 'treasure',
    grade: 3,
    rarity: 'legendary',
    description:
      '鼎腹刻着开天后的第一缕火纹。温养时能听见极轻的爆裂声，像有人在鼎中重新点燃一片天地。',
    flavor: '凤族说它是不死火的源头，麒麟族说它只是第一场大火的余烬。鼎不答。',
    active: {
      id: 'ability.longhan.first_flame',
      name: '引初火',
      description: '点燃一段旧因果，逼出面前之敌最不愿面对的记忆。',
      effects: [
        {
          kind: 'setFlag',
          flag: 'longhan.first_flame_awakened',
          value: true,
        },
        {
          kind: 'applyStatus',
          statusId: 'status.longhan.first_flame_mark',
          months: 1,
          source: '初火鼎',
        },
      ],
    },
    cost: {
      description: '以自身灵机作薪；引火后三日，水行功法运转迟滞。',
      effects: [
        {
          kind: 'changeResource',
          resource: 'spirit_stones',
          amount: -30,
        },
        {
          kind: 'applyStatus',
          statusId: 'status.longhan.spirit_dryness',
          months: 3,
          source: '初火鼎',
        },
      ],
    },
    spirit: {
      name: '燧',
      traits: ['沉默', '记仇', '嗜旧事'],
      description: '器灵只在火光明灭时说话。它记得每个曾用鼎的人，也记得谁没有回来。',
    },
    passiveStats: { attack: 3, spirit: 2 },
    tempering: [
      {
        stage: 1,
        name: '记火',
        description:
          '把鼎腹的火纹描一遍，每描一笔，鼎中就有一小段旧火醒来。燧开始愿意在你添柴时多说半句。',
        requirements: [{ kind: 'realm', minRealm: 'foundation' }],
        cultivation: 180,
        cost: { spirit_stones: 30, ore: 6 },
        stats: { attack: 3, spirit: 2 },
        cooldownReduction: 1,
      },
      {
        stage: 2,
        name: '引火入脉',
        description:
          '让一缕初火沿着经脉走完一周天。它不会烧坏什么，只会把那些早已冷透的地方重新点亮。',
        requirements: [{ kind: 'realm', minRealm: 'golden_core' }],
        cultivation: 420,
        cost: { spirit_stones: 70, ore: 15, beast_cores: 2 },
        stats: { attack: 6, spirit: 4 },
        cooldownReduction: 1,
      },
    ],
    value: 900,
    tags: ['treasure', 'fire', 'origin'],
  },
  {
    id: 'item.longhan.tide_mirror',
    name: '潮生镜',
    category: 'treasure',
    grade: 2,
    rarity: 'rare',
    description:
      '一面背面刻满潮位的古镜。镜中映出的不是当下，而是某个地方最后一次涨潮时的样子。',
    flavor: '龙宫用它记录海域变迁。后来镜面裂了一道，反而能照见更远的地方。',
    active: {
      id: 'ability.longhan.tide_sight',
      name: '照潮',
      description: '借镜中旧潮辨认四方水脉，也看见一些本不该被惊动的存在。',
      effects: [
        {
          kind: 'addRumor',
          rumorId: 'rumor.longhan.mirror_tide',
          text: '潮生镜照出一道不属于今日的潮线，尽头似乎有人在等你。',
        },
        {
          kind: 'setFlag',
          flag: 'longhan.tide_mirror_used',
          value: true,
        },
      ],
    },
    cost: {
      description: '每次照镜都会耗去一段水行灵机，且镜中旧潮会在三日内反复入梦。',
      effects: [
        {
          kind: 'changeResource',
          resource: 'spirit_stones',
          amount: -12,
        },
        {
          kind: 'applyStatus',
          statusId: 'status.longhan.old_tide_dream',
          months: 3,
          source: '潮生镜',
        },
      ],
    },
    spirit: {
      name: '汐',
      traits: ['寡言', '念旧', '不辨今昔'],
      description: '器灵只在镜面起雾时出现。她从不回答“现在是什么时候”。',
    },
    passiveStats: { spirit: 5, speed: 1 },
    tempering: [
      {
        stage: 1,
        name: '拭镜',
        description:
          '以潮气慢慢洗过镜面。裂纹没有合拢，镜中旧潮却比从前更清楚了一分，连退潮时留下的暗痕都能看见。',
        requirements: [{ kind: 'realm', minRealm: 'qi_refining', minStage: 3 }],
        cultivation: 100,
        cost: { spirit_stones: 18 },
        stats: { spirit: 3 },
        cooldownReduction: 1,
      },
      {
        stage: 2,
        name: '照旧潮',
        description:
          '在镜前守到两次涨潮之间。汐终于肯回答一句“这里曾经是什么时候”，虽然仍不肯说“现在”。',
        requirements: [{ kind: 'realm', minRealm: 'foundation' }],
        cultivation: 240,
        cost: { spirit_stones: 36, spirit_herbs: 6 },
        stats: { spirit: 5, speed: 2 },
        cooldownReduction: 1,
      },
    ],
    value: 520,
    tags: ['treasure', 'water', 'divination'],
  },
  {
    id: 'item.longhan.ridge_tablet',
    name: '镇脉碑',
    category: 'treasure',
    grade: 2,
    rarity: 'uncommon',
    description:
      '一块只有巴掌高的石碑，碑上刻着麒麟崖下最深那条灵脉的走向。碑不离地，地不离碑。',
    flavor: '守脉人把命押在碑上，碑把脉押在守脉人身上。',
    active: {
      id: 'ability.longhan.ridge_hold',
      name: '镇脉',
      description: '把碑按入脚下，借地脉之力稳住心神与气血。',
      effects: [
        {
          kind: 'applyStatus',
          statusId: 'status.longhan.ridge_hold',
          months: 2,
          source: '镇脉碑',
        },
      ],
    },
    cost: {
      description: '镇脉期间身法会变慢；拔起碑时，会有一段短暂的空落。',
      effects: [
        {
          kind: 'applyStatus',
          statusId: 'status.longhan.ridge_slowness',
          months: 2,
          source: '镇脉碑',
        },
      ],
    },
    spirit: {
      name: '岳',
      traits: ['固执', '守诺', '不喜言语'],
      description: '器灵平时只是一道很淡的山影。它只在你准备退让时开口。',
    },
    passiveStats: { health: 30, defense: 4 },
    tempering: [
      {
        stage: 1,
        name: '认脉',
        description:
          '把碑按在洞府门槛上，让它先认这处地脉。岳没有说话，但从此你站定时，脚下的回声比从前短了一截。',
        requirements: [{ kind: 'realm', minRealm: 'qi_refining', minStage: 3 }],
        cultivation: 90,
        cost: { spirit_stones: 15, ore: 8 },
        stats: { health: 18, defense: 2 },
        cooldownReduction: 1,
      },
      {
        stage: 2,
        name: '镇一方',
        description:
          '沿碑上那条画了一半的旧路走完一圈。走到尽头时，你终于知道它缺的那一段该接向哪里。',
        requirements: [{ kind: 'realm', minRealm: 'foundation' }],
        cultivation: 220,
        cost: { spirit_stones: 30, ore: 16 },
        stats: { health: 30, defense: 4 },
        cooldownReduction: 1,
      },
    ],
    value: 430,
    tags: ['treasure', 'earth', 'guard'],
  },
  {
    id: 'item.longhan.nirvana_lamp',
    name: '涅槃灯',
    category: 'treasure',
    grade: 2,
    rarity: 'rare',
    description:
      '一盏没有灯油的铜灯，灯芯由一缕涅槃灰编成。点燃后不照亮四周，只照见一个人身上“曾经死去又活过来”的地方。',
    flavor: '丹羽说这盏灯原本有三盏，另外两盏在等不到主人之后自行熄灭了。',
    active: {
      id: 'ability.longhan.nirvana_light',
      name: '照旧火',
      description: '照见旧伤与旧火，把一段几乎烧尽的灵机重新引燃。',
      effects: [
        {
          kind: 'applyStatus',
          statusId: 'status.longhan.rekindled',
          months: 2,
          source: '涅槃灯',
        },
        {
          kind: 'addRumor',
          rumorId: 'rumor.longhan.nirvana_lamp',
          text: '有人看见一盏不照路的灯在火山背面亮了一夜。第二天，那里的灰烬里长出了一点绿。',
        },
      ],
    },
    cost: {
      description: '每次点灯都要从自己的旧伤里取一段记忆作灯油；点灯后一段时日内会忘记某个细节。',
      effects: [
        {
          kind: 'changeResource',
          resource: 'spirit_herbs',
          amount: -6,
        },
        {
          kind: 'applyStatus',
          statusId: 'status.longhan.ember_forgetting',
          months: 3,
          source: '涅槃灯',
        },
      ],
    },
    spirit: {
      name: '烬',
      traits: ['温柔', '健忘', '怕风'],
      description: '器灵喜欢靠近受伤的人，却总记不清自己昨天照过谁。',
    },
    passiveStats: { health: 18, spirit: 3 },
    tempering: [
      {
        stage: 1,
        name: '护烬',
        description:
          '替灯芯挡一夜穿堂风。烬第一次记住了你的名字，第二天又忘了，但灯芯比从前稳。',
        requirements: [{ kind: 'realm', minRealm: 'qi_refining', minStage: 3 }],
        cultivation: 110,
        cost: { spirit_stones: 16, spirit_herbs: 8 },
        stats: { health: 12, spirit: 2 },
        cooldownReduction: 1,
      },
      {
        stage: 2,
        name: '续火',
        description:
          '从自己一段旧伤里分出一点火，补进灯芯。烬整夜没有熄灭，也整夜没有问那是哪一段旧伤。',
        requirements: [{ kind: 'realm', minRealm: 'foundation' }],
        cultivation: 260,
        cost: { spirit_stones: 34, spirit_herbs: 14 },
        stats: { health: 22, spirit: 4 },
        cooldownReduction: 1,
      },
    ],
    value: 480,
    tags: ['treasure', 'fire', 'healing'],
  },
  {
    id: 'item.longhan.vein_needle',
    name: '定脉针',
    category: 'treasure',
    grade: 3,
    rarity: 'legendary',
    description:
      '七枚长短不一的石针，针身没有锋刃，只有极细的纹路。按入地面后，会替持针者记住一方土地的脉动。',
    flavor: '青璃说，大地从不喊疼；它只是慢慢改变走向。',
    active: {
      id: 'ability.longhan.vein_pin',
      name: '定一方',
      description: '把七枚针按入脚下，让一方地脉在短时间内只听你的呼吸。',
      effects: [
        {
          kind: 'applyStatus',
          statusId: 'status.longhan.vein_anchor',
          months: 3,
          source: '定脉针',
        },
        {
          kind: 'changeRegionState',
          regionId: 'region.longhan.qilin_cliff',
          key: 'needle_seven',
          value: 'anchored',
        },
      ],
    },
    cost: {
      description: '拔针之后，地脉会有一段时间不再回应你；下一次按针需要更深的地脉共鸣。',
      effects: [
        {
          kind: 'applyStatus',
          statusId: 'status.longhan.vein_silence',
          months: 4,
          source: '定脉针',
        },
      ],
    },
    spirit: {
      name: '七',
      traits: ['沉默', '固执', '守时'],
      description: '器灵只在七针同时入地时醒来。它说的第一句话总是：“还差一寸。”',
    },
    passiveStats: { defense: 6, health: 25 },
    tempering: [
      {
        stage: 1,
        name: '定针',
        description:
          '先只用一枚针，按进自己最常站的位置。七没有说话，但那一枚针入地时，四周的尘土同时停了半息。',
        requirements: [{ kind: 'realm', minRealm: 'foundation' }],
        cultivation: 160,
        cost: { spirit_stones: 26, ore: 10 },
        stats: { defense: 3, health: 12 },
        cooldownReduction: 1,
      },
      {
        stage: 2,
        name: '七针归位',
        description:
          '七枚针同时入地。地脉在针下换了一次呼吸，你听见七说：“还差一寸。”然后它把那一寸交给了你。',
        requirements: [{ kind: 'realm', minRealm: 'golden_core' }],
        cultivation: 380,
        cost: { spirit_stones: 60, ore: 20, beast_cores: 1 },
        stats: { defense: 6, health: 25 },
        cooldownReduction: 1,
      },
    ],
    value: 820,
    tags: ['treasure', 'earth', 'vein'],
  },
  {
    id: 'item.longhan.nameless_mirror',
    name: '无字镜',
    category: 'treasure',
    grade: 2,
    rarity: 'rare',
    description:
      '一面没有纹饰的旧镜。镜面不映人影，只映出一个人的名字；若那人已不记得自己的名字，镜面便空着。',
    flavor: '白泽把它翻过来又翻过去，说镜子不是问题，问题是谁把它磨成了这样。',
    active: {
      id: 'ability.longhan.name_mirror',
      name: '照名',
      description: '照见自身名字的重量，也照见最近被遗忘的那一件事。',
      effects: [
        {
          kind: 'setFlag',
          flag: 'longhan.nameless_mirror_used',
          value: true,
        },
        {
          kind: 'addRumor',
          rumorId: 'rumor.longhan.nameless_mirror',
          text: '有人在荒原上对着一面旧镜看了很久。镜子没有映出他的脸，只映出一行正在褪色的字。',
        },
      ],
    },
    cost: {
      description: '照名之后，一段旧记忆会被镜子短暂借走；在它归还前，相关因缘更难被你辨认。',
      effects: [
        {
          kind: 'applyStatus',
          statusId: 'status.longhan.name_borrowed',
          months: 3,
          source: '无字镜',
        },
        {
          kind: 'changeResource',
          resource: 'karma',
          amount: 1,
        },
      ],
    },
    spirit: {
      name: '镜',
      traits: ['好学', '多问', '从不照自己'],
      description: '器灵对每个人的名字都很感兴趣，却从不解释自己为什么没有名字。',
    },
    passiveStats: { spirit: 6, crit: 2 },
    tempering: [
      {
        stage: 1,
        name: '拂尘',
        description:
          '用无字的布擦一面无字的镜。镜没有映出你的名字，只映出一层被擦掉的旧灰。',
        requirements: [{ kind: 'realm', minRealm: 'qi_refining', minStage: 3 }],
        cultivation: 120,
        cost: { spirit_stones: 20, spirit_herbs: 5 },
        stats: { spirit: 2, crit: 1 },
        cooldownReduction: 1,
      },
      {
        stage: 2,
        name: '照名',
        description:
          '在镜前把自己的名字读出声，再读第二遍。第二遍读到一半时，镜面终于浮出一行很淡的字，却不是你的笔迹。',
        requirements: [{ kind: 'realm', minRealm: 'foundation' }],
        cultivation: 280,
        cost: { spirit_stones: 40, beast_cores: 1 },
        stats: { spirit: 4, crit: 2 },
        cooldownReduction: 1,
      },
    ],
    value: 560,
    tags: ['treasure', 'name', 'hidden'],
  },
  {
    id: 'item.longhan.envoy_bell',
    name: '归期铃',
    category: 'treasure',
    grade: 3,
    rarity: 'legendary',
    description:
      '龙庭巡海使随身的小铜铃。铃身没有纹，铃舌却一直是湿的。它不替人指路，只在退潮时响一声，像替某个没有回来的人报一次归期。',
    flavor: '旧宫后的石室里，它响了很久才被听见。',
    active: {
      id: 'ability.longhan.envoy_ask',
      name: '问归',
      description: '摇一下铃，问潮水有没有见过一个没有补上归期的人。',
      effects: [
        {
          kind: 'applyStatus',
          statusId: 'status.longhan.old_tide_dream',
          months: 2,
          source: '归期铃',
        },
        {
          kind: 'addRumor',
          rumorId: 'rumor.longhan.envoy_bell',
          text: '有人在退潮时听见一声很轻的铜铃。铃响之后，潮眼里多出一道不属于今日的潮线。',
        },
        {
          kind: 'setFlag',
          flag: 'longhan.envoy_bell_rung',
          value: true,
        },
      ],
    },
    cost: {
      description: '每次摇铃都要耗去一段潮息；铃响之后，骨缝里会冷上一阵。',
      effects: [
        {
          kind: 'changeResource',
          resource: 'spirit_stones',
          amount: -15,
        },
        {
          kind: 'applyStatus',
          statusId: 'status.longhan.bone_chill',
          months: 1,
          source: '归期铃',
        },
      ],
    },
    spirit: {
      name: '潮奴',
      traits: ['沉默', '怕干', '认潮不认人'],
      description: '器灵从不出声，只在摇铃时轻轻拽一下你的袖子，像在提醒你还有一页没有合上。',
    },
    passiveStats: { spirit: 4, speed: 1 },
    tempering: [
      {
        stage: 1,
        name: '拭铃',
        description:
          '用退潮后的湿布擦一遍铃身。布上没有水，铃上却慢慢浮出一层潮气。',
        requirements: [{ kind: 'realm', minRealm: 'foundation' }],
        cultivation: 150,
        cost: { spirit_stones: 30, ore: 3 },
        stats: { spirit: 2, speed: 1 },
        cooldownReduction: 1,
      },
      {
        stage: 2,
        name: '补期',
        description:
          '在铃内刻上自己的生辰，再把它挂在潮眼里吹一夜。第二天取回时，铃舌上的锈少了一层。',
        requirements: [{ kind: 'realm', minRealm: 'foundation', minStage: 2 }],
        cultivation: 300,
        cost: { spirit_stones: 45, ore: 4, beast_cores: 1 },
        stats: { spirit: 4, speed: 2, health: 8 },
        cooldownReduction: 1,
      },
    ],
    value: 580,
    tags: ['treasure', 'tide', 'envoy', 'name'],
  },
]

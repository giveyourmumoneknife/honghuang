import type { EventDefinition } from '@/types/content'

export const longhanEvents: EventDefinition[] = [
  {
    id: 'event.longhan.three_clans_covenant',
    eraId: 'era.longhan',
    kind: 'main',
    title: '潮汐、火山与地脉',
    summary: '三族代表第一次同席。盟约写在石上，代价却要各自带回族中。',
    body:
      '会盟台没有座次。龙族代表先到，往迎潮那侧一站，回头说了句：“先说好，站哪边不按岁数排。”凤族来的时候火气还没散，听完只哼了一声：“谁跟你排岁数。”麒麟族最后踏上台，脚下石纹亮了一瞬，她低头看了看，说：“路上耽搁了。地脉这两天不太安稳。”\n\n三个人谈四海与火季，谈地脉与巡海，谈谁该为上回凶兽潮认账。没有人提魔渊，但每个人都在等别人先提。\n\n风从原野尽头吹来。石上的盟约还空着最后一行，等一个在场的人先开口。',
    pause: 'story',
    repeatable: false,
    regionId: 'region.longhan.honghuang_land',
    requirements: [],
    onEnter: [
      {
        kind: 'gainStarMark',
        amount: 1,
      },
      {
        kind: 'setFlag',
        flag: 'longhan.three_clans_covenant',
        value: true,
      },
      {
        kind: 'changeRegionState',
        regionId: 'region.longhan.honghuang_land',
        key: 'covenant',
        value: 'gathered',
      },
      {
        kind: 'scheduleEvent',
        eventId: 'event.longhan.rahu_whisper',
        delayMonths: 18,
      },
    ],
    choices: [
      {
        id: 'choice.longhan.covenant.dragon',
        text: '先听龙族的潮汐之约，替巡海秩序作证。',
        requirements: [],
        effects: [
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.dragon',
            reputationDelta: 10,
            flags: {
              'longhan.covenant_role': 'tide_guard',
            },
          },
          {
            kind: 'grantItem',
            itemId: 'item.longhan.dragon_scale',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.dragon_favored',
            value: true,
          },
        ],
        outcome:
          '龙族代表把一枚旧鳞推到你面前。鳞上潮声很轻，像一句只在退潮时算数的话。凤族没有反对，只把视线移向火山的方向。',
      },
      {
        id: 'choice.longhan.covenant.phoenix',
        text: '请凤族先说涅槃与火季，替不死火山留下证词。',
        requirements: [],
        effects: [
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.phoenix',
            reputationDelta: 10,
            flags: {
              'longhan.covenant_role': 'fire_witness',
            },
          },
          {
            kind: 'grantItem',
            itemId: 'item.longhan.phoenix_feather',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.phoenix_favored',
            value: true,
          },
        ],
        outcome:
          '凤族代表落下一支赤羽。羽根还带着火山深处的温度；你听见台上某位麒麟轻轻叹了口气，像在替大地记住这一刻。',
      },
      {
        id: 'choice.longhan.covenant.qilin',
        text: '请麒麟族以地脉为证，把盟约刻进石纹。',
        requirements: [],
        effects: [
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.qilin',
            reputationDelta: 10,
            flags: {
              'longhan.covenant_role': 'earth_witness',
            },
          },
          {
            kind: 'changeRegionState',
            regionId: 'region.longhan.honghuang_land',
            key: 'covenant',
            value: 'carved',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.qilin_favored',
            value: true,
          },
        ],
        outcome:
          '麒麟族的代表俯身触石。石纹从她掌下缓缓蔓延，盟约成了大地的一部分；从今往后，毁约的人要先问过脚下这片土。',
      },
      {
        id: 'choice.longhan.covenant.watch',
        text: '不替任何一族作证，只看他们把盟约写成什么。',
        requirements: [],
        effects: [
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.first_beast_tide',
            delayMonths: 6,
          },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.silent_witness',
            text: '会盟台上有人始终没有开口。三族后来都记得那张沉默的脸。',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.covenant_role',
            value: 'silent_witness',
          },
        ],
        outcome:
          '你没有落名，也没有接过任何一族的信物。盟约仍被刻上石面，末尾空出一行；风从那一行穿过，像替未来留了一个位置。',
      },
    ],
    tags: ['main', 'three_clans', 'covenant'],
  },
  {
    id: 'event.longhan.dragon_gate',
    eraId: 'era.longhan',
    kind: 'faction',
    title: '龙门下的潮印',
    summary: '龙庭在巡海前打开龙门。受印的人要先听完一次完整的退潮。',
    body:
      '龙门不是门，是一道立在海底的潮墙。潮水从上方压下来，声音却从背后退走。引路的龙将一路都在念叨：“别跟潮水较劲。它退你就退，它回来你也别拦。记住自己来干什么就行。”\n\n龙庭的旧册摊在一旁，册上已有许多名字。有些名字被潮气浸得发白，有些被新墨草草盖过去。\n\n潮声开始减弱。你只有一次开口的机会。',
    pause: 'story',
    repeatable: false,
    factionId: 'faction.longhan.dragon',
    regionId: 'region.longhan.four_seas',
    requirements: [
      {
        kind: 'regionUnlocked',
        regionId: 'region.longhan.four_seas',
      },
    ],
    onEnter: [
      {
        kind: 'gainStarMark',
        amount: 1,
      },
      {
        kind: 'setFlag',
        flag: 'longhan.dragon_gate_seen',
        value: true,
      },
    ],
    choices: [
      {
        id: 'choice.longhan.dragon_gate.accept',
        text: '受潮印，承认四海律令。',
        requirements: [],
        effects: [
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.dragon',
            membership: true,
            rank: 1,
            flags: {
              'longhan.dragon_gate_answered': true,
            },
          },
          {
            kind: 'setFlag',
            flag: 'longhan.dragon_gate_answered',
            value: true,
          },
          {
            kind: 'grantItem',
            itemId: 'item.longhan.tide_breaker_spear',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.dragon_gate',
            text: '潮退尽时，你在巡海册上留下了自己的名字。',
          },
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.ao_guang',
            delta: 1,
            reason: '在龙门退潮时没有收回自己的名字',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.ao_guang_bond',
            delayMonths: 3,
          },
        ],
        outcome:
          '潮墙在你面前裂开一道缝。龙将把断潮枪横放在你掌心，没有道贺，只说：“从今往后，你听见的每一次退潮，都可能是别人的归期。”',
      },
      {
        id: 'choice.longhan.dragon_gate.decline',
        text: '不受印，只替龙庭传一句话。',
        requirements: [],
        effects: [
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.dragon_gate_declined',
            text: '有人在龙门下听完退潮，却没有受印。龙庭没有追究，只把这件事写进了旧册的边角。',
          },
          {
            kind: 'changeRegionState',
            regionId: 'region.longhan.four_seas',
            key: 'gate',
            value: 'declined',
          },
        ],
        outcome:
          '龙将合上册子，没有挽留。你转身时，潮水恰好退到最低处；海底的旧宫露出一角，像一句没被说出口的邀请。',
      },
    ],
    tags: ['faction', 'dragon', 'join'],
  },
  {
    id: 'event.longhan.first_beast_tide',
    eraId: 'era.longhan',
    kind: 'world',
    title: '荒原第一次兽潮',
    summary: '凶兽荒原的骨山开始移动。三族都还没有决定是否出手。',
    body:
      '先是骨原上的风停了，接着整片荒原像被什么从地下顶了一下。白骨彼此挤压，发出连续不断的低鸣；远处的凶兽群没有奔向某处，它们只是同时开始移动。\n\n消息传到三族时，龙庭正在重排巡海，凤族在等火山下一轮活跃，麒麟族忙着修补地脉的轻颤。荒原没有一个主人，也就没有一支现成的军。\n\n你可以赶在兽潮成形前做点什么，也可以先看清它们究竟在躲避什么。',
    pause: 'ambient',
    repeatable: true,
    weight: 10,
    cooldownMonths: 24,
    regionId: 'region.longhan.beast_waste',
    requirements: [
      {
        kind: 'regionUnlocked',
        regionId: 'region.longhan.beast_waste',
      },
    ],
    onEnter: [
      {
        kind: 'changeRegionState',
        regionId: 'region.longhan.beast_waste',
        key: 'threat',
        value: 'rising',
      },
      {
        kind: 'addRumor',
        rumorId: 'rumor.longhan.beast_tide',
        text: '荒原的骨山在移动。有人说兽群不是在觅食，而是在逃离更深处的某种东西。',
      },
    ],
    choices: [
      {
        id: 'choice.longhan.beast_tide.defend',
        text: '在兽潮进入洪荒大地前截住它们。',
        requirements: [],
        effects: [
          {
            kind: 'startCombat',
            encounterId: 'encounter.longhan.bone_herd',
            fleeAllowed: true,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.beast_tide_answered',
            value: true,
          },
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.qilin',
            reputationDelta: 5,
          },
        ],
        outcome:
          '你迎上第一头撞出骨原的凶兽。它没有停下，也没有咆哮；擦身而过时，你看见它的眼睛一直盯着荒原深处。',
      },
      {
        id: 'choice.longhan.beast_tide.observe',
        text: '先追踪兽群，看它们在躲避什么。',
        requirements: [],
        effects: [
          {
            kind: 'changeRegionState',
            regionId: 'region.longhan.beast_waste',
            key: 'threat',
            value: 'unchecked',
          },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.chaos_breath',
            text: '有人在混沌裂隙附近听见不属于此界的呼吸。兽潮只是先走出来的那一部分。',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.chaos_breath_heard',
            value: true,
          },
        ],
        outcome:
          '你让兽群从视野里过去，循着它们留下的空道走向荒原深处。骨山之后，混沌裂隙的边缘正在极缓慢地张开。',
      },
    ],
    tags: ['world', 'beast', 'ambient'],
  },
  {
    id: 'event.longhan.tide_wake',
    eraId: 'era.longhan',
    kind: 'main',
    title: '四海退潮时',
    summary: '你在四海边醒来。潮水退得很远，远处有一口旧钟在无人敲击时自行发响。',
    body:
      '你醒来时，半个海滩都露在潮线之外。礁石上挂着不属于此地的旧网，网眼里卡着几枚发白的潮印。\n\n钟声从更远的地方传来。那里没有寺，没有观，只有一座半沉在海底的旧宫；宫门此刻露出水面，门环上缠着一段断掉的巡海绳。\n\n潮水正在最低处停住，像在等一个人先迈步。',
    pause: 'story',
    repeatable: false,
    regionId: 'region.longhan.four_seas',
    requirements: [
      {
        kind: 'regionUnlocked',
        regionId: 'region.longhan.four_seas',
      },
    ],
    onEnter: [
      {
        kind: 'setFlag',
        flag: 'longhan.tide_wake_seen',
        value: true,
      },
      {
        kind: 'unlockSite',
        regionId: 'region.longhan.four_seas',
        siteId: 'site.longhan.east_sea_palace',
      },
      {
        kind: 'changeRegionState',
        regionId: 'region.longhan.four_seas',
        key: 'wake',
        value: 'heard_bell',
      },
      {
        kind: 'scheduleEvent',
        eventId: 'event.longhan.three_clans_covenant',
        delayMonths: 5,
      },
    ],
    choices: [
      {
        id: 'choice.longhan.tide_wake.bell',
        text: '循钟声走向旧宫，在潮水回来前敲响那口钟。',
        requirements: [],
        effects: [
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.ao_guang',
            delta: 1,
            reason: '在退潮时替潮市敲了三下旧钟',
          },
          {
            kind: 'changeRegionState',
            regionId: 'region.longhan.four_seas',
            key: 'tide_bell',
            value: 'answered',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.tide_bell',
            text: '你在四海退潮时敲响旧钟。第三声落下时，海面有人回头。',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.tide_market',
            delayMonths: 1,
          },
        ],
        outcome:
          '钟声没有传出很远，只贴着海面滚了一圈。旧宫门里亮起一盏灯，一个披着巡海蓑衣的人影站在潮线内侧，朝你抬了抬下巴。',
      },
      {
        id: 'choice.longhan.tide_wake.salvage',
        text: '先翻检搁浅的旧网，把还能用的东西收拢起来。',
        requirements: [],
        effects: [
          {
            kind: 'grantItem',
            itemId: 'item.longhan.dragon_scale',
          },
          {
            kind: 'changeResource',
            resource: 'spirit_stones',
            amount: 12,
          },
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.ao_guang',
            delta: 1,
            reason: '把捞到的巡海潮印还给了失主',
          },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.tide_market',
            text: '四海退潮处有一场旧市，只在潮水回到旧宫门前时开张。',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.tide_market',
            delayMonths: 2,
          },
        ],
        outcome:
          '旧网里有一枚未褪色的潮印。你把潮印搁在礁石上，转身时它已经不见了；礁石背面多出一行小字，写着潮市开张的时辰。',
      },
    ],
    tags: ['main', 'dragon', 'tide', 'opening'],
  },
  {
    id: 'event.longhan.tide_market',
    eraId: 'era.longhan',
    kind: 'partner',
    title: '潮市上的巡海使',
    summary: '退潮后的旧宫门前聚起一场没有招牌的市。敖光在人群尽头清点失物。',
    body:
      '潮市没有叫卖声。摊主把东西摆在水痕以内，买家伸手前先让潮水看一眼。旧宫的宫门半开，门内黑得像另一片海。\n\n敖光站在市尾，把失物一件件放回原处：一枚缺角的潮印、一段断掉的巡海绳、一片还带着活气的龙鳞。她抬头时，先看见了你腰间或袖口那件不该在这里出现的东西。\n\n“退潮时捡到的，都算四海的。”她说，“你可以还，也可以换。但别假装没看见。”',
    pause: 'story',
    repeatable: false,
    partnerId: 'partner.longhan.ao_guang',
    regionId: 'region.longhan.four_seas',
    requirements: [
      {
        kind: 'regionUnlocked',
        regionId: 'region.longhan.four_seas',
      },
      {
        kind: 'flag',
        flag: 'longhan.tide_wake_seen',
        value: true,
      },
    ],
    onEnter: [
      {
        kind: 'setFlag',
        flag: 'longhan.tide_market_seen',
        value: true,
      },
      {
        kind: 'addRumor',
        rumorId: 'rumor.longhan.ao_guang',
        text: '龙庭的巡海使敖光常出现在退潮后的旧市。她记得每一件失物的来处。',
      },
    ],
    choices: [
      {
        id: 'choice.longhan.tide_market.help',
        text: '替她守住潮市，直到最后一件失物归位。',
        requirements: [],
        effects: [
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.ao_guang',
            delta: 1,
            reason: '在潮市散尽前替巡海使看住了失物',
          },
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.dragon',
            reputationDelta: 5,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.tide_market_helped',
            value: true,
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.tide_market',
            text: '潮水回涨时，你和敖光把最后一件失物放回旧宫门前。她没有道谢，只把归途让给了你。',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.dragon_gate',
            delayMonths: 2,
          },
        ],
        outcome:
          '最后一件失物是一枚没有名字的潮印。敖光把它递给你，说龙门下正好缺一个能记住退潮的人。',
      },
      {
        id: 'choice.longhan.tide_market.ask',
        text: '问她旧宫里还留着什么，为什么潮市只在退潮时开。',
        requirements: [],
        effects: [
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.ao_guang',
            delta: 1,
            reason: '没有把旧宫的传闻当成可以随便说的闲话',
          },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.tide_market_old_palace',
            text: '旧宫最深处有一间不上锁的屋子，里面摆着历代巡海使没能带回来的名字。',
          },
          {
            kind: 'changeRegionState',
            regionId: 'region.longhan.four_seas',
            key: 'tide_market',
            value: 'old_palace_asked',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.dragon_gate',
            delayMonths: 3,
          },
        ],
        outcome:
          '敖光看了你很久，才说旧宫不藏宝，只藏没回来的人。她让你去龙门下等一次完整的退潮；有些答案，龙庭只肯在那里说。',
      },
    ],
    tags: ['partner', 'dragon', 'tide_market'],
  },
  {
    id: 'event.longhan.ao_guang_bond',
    eraId: 'era.longhan',
    kind: 'partner',
    title: '把归期交给潮水',
    summary: '龙门之后的第三次退潮，敖光在旧宫门前等你。她没有带巡海册。',
    body:
      '她没有穿巡海使的蓑衣，也没有带清点失物的册子。旧宫门前只停着一叶小船，船头放着一盏未点的灯。\n\n“龙族结缘不写誓词。”敖光说，“誓词是给岸上的人看的。我们只问一件事：下一次潮退，你还会不会回来。”\n\n潮水开始退。她的影子被拉得很长，几乎碰到你的脚边。远处龙庭的潮鼓响了一声，又归于安静。',
    pause: 'story',
    repeatable: true,
    cooldownMonths: 6,
    partnerId: 'partner.longhan.ao_guang',
    regionId: 'region.longhan.four_seas',
    requirements: [
      {
        kind: 'flag',
        flag: 'longhan.dragon_gate_answered',
        value: true,
      },
      {
        kind: 'partnerFavor',
        partnerId: 'partner.longhan.ao_guang',
        minTier: 2,
      },
    ],
    onEnter: [
      {
        kind: 'setFlag',
        flag: 'longhan.ao_guang_bond_offer',
        value: true,
      },
    ],
    choices: [
      {
        id: 'choice.longhan.ao_guang_bond.accept',
        text: '把归期交给她。下一次潮退，你会回来。',
        requirements: [],
        effects: [
          {
            kind: 'bondPartner',
            partnerId: 'partner.longhan.ao_guang',
          },
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.ao_guang',
            delta: 1,
            reason: '在旧宫门前把归期交给了彼此',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.ao_guang_bonded',
            value: true,
          },
          {
            kind: 'grantItem',
            itemId: 'item.longhan.dragon_scale',
            count: 2,
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.ao_guang_bond',
            text: '你没有对敖光发誓，只告诉她下一次潮退会在哪里等。她把船头的灯点着了。',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.cave_discovery',
            delayMonths: 2,
          },
        ],
        outcome:
          '敖光点亮船头的灯，把灯推到你面前。灯芯里没有火，只有一线缓慢起伏的潮光。她说：“从今往后，我的归期与你同潮。”',
      },
      {
        id: 'choice.longhan.ao_guang_bond.wait',
        text: '请她再等一次退潮。你还有没弄清的事。',
        requirements: [],
        effects: [
          {
            kind: 'setFlag',
            flag: 'longhan.ao_guang_waiting',
            value: true,
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.ao_guang_wait',
            text: '你没有立刻回答敖光。她收起灯，说下一次退潮还会在这里。',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.ao_guang_bond',
            delayMonths: 6,
          },
        ],
        outcome:
          '敖光没有失望，也没有追问。她把船推回潮线内，只留下一句：“潮水会等，但不会一直等在同一个人面前。”',
      },
    ],
    tags: ['partner', 'dragon', 'bond'],
  },
  {
    id: 'event.longhan.cave_discovery',
    eraId: 'era.longhan',
    kind: 'cave',
    title: '退潮后露出的礁腹',
    summary: '敖光带你穿过旧宫后方的暗水道，去看一处只在退潮时存在的洞穴。',
    body:
      '暗水道比旧宫的宫门更窄。敖光走在前面，潮水贴着礁壁后退，像是被谁从另一头抽走。\n\n尽头是一处礁腹。洞口只容一人侧身，洞内却有一汪清水，水面平得看不见来处。水边留着几道很旧的刻痕，不像字，更像有人反复确认过潮水会不会回来。\n\n“四海换气的地方。”敖光说，“我守了它很久，一直没想好让谁来点第一盏灯。”',
    pause: 'story',
    repeatable: false,
    partnerId: 'partner.longhan.ao_guang',
    regionId: 'region.longhan.four_seas',
    requirements: [
      {
        kind: 'flag',
        flag: 'longhan.ao_guang_bonded',
        value: true,
      },
    ],
    onEnter: [
      {
        kind: 'unlockCave',
        caveId: 'cave.longhan.tide_grotto',
      },
      {
        kind: 'setFlag',
        flag: 'longhan.cave.opened',
        value: true,
      },
      {
        kind: 'changeRegionState',
        regionId: 'region.longhan.four_seas',
        key: 'cave',
        value: 'tide_grotto',
      },
      {
        kind: 'addRumor',
        rumorId: 'rumor.longhan.tide_grotto',
        text: '四海退潮时，旧宫后方会露出一处礁腹。有人说那里能听见四海同时呼吸。',
      },
    ],
    choices: [
      {
        id: 'choice.longhan.cave_discovery.name_tide',
        text: '以潮声为名，把这里叫作听潮洞。',
        requirements: [],
        effects: [
          {
            kind: 'setFlag',
            flag: 'longhan.cave.name',
            value: 'tide_grotto',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.cave_named',
            text: '你给礁腹取名听潮洞。敖光说名字不错，至少比你本人更懂得退让。',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.cave_spirit_array',
            delayMonths: 1,
          },
        ],
        outcome:
          '你报出名字时，洞中清水轻轻晃了一下。敖光把一枚旧潮印按在洞口，像给这处礁腹落了籍。',
      },
      {
        id: 'choice.longhan.cave_discovery.name_bone',
        text: '把旧刻痕拓下来，先弄清上一任主人是谁。',
        requirements: [],
        effects: [
          {
            kind: 'setFlag',
            flag: 'longhan.cave.name',
            value: 'old_marks',
          },
          {
            kind: 'changeResource',
            resource: 'ore',
            amount: 6,
          },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.tide_grotto_marks',
            text: '听潮洞的旧刻痕不是字，而是一遍遍重复的潮位。刻下它们的人，似乎在等一个从未回来的潮头。',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.cave_spirit_array',
            delayMonths: 2,
          },
        ],
        outcome:
          '拓片上的刻痕围成一个没有出口的圈。敖光看了很久，说这不是阵法，是记录；有人在这里等过很多次退潮。',
      },
    ],
    tags: ['cave', 'dragon', 'discovery'],
  },
  {
    id: 'event.longhan.cave_spirit_array',
    eraId: 'era.longhan',
    kind: 'cave',
    title: '第一道潮纹',
    summary: '听潮洞需要一座阵，把四海来回的灵机引到洞中。敖光只负责看，不替你落第一笔。',
    body:
      '阵纹要顺着礁腹原有的水脉刻。敖光把三种石粉摊在地上，说引海息最容易，也最容易把洞外的潮盗一起引来。\n\n你可以借四海涨落布一座顺势的阵，也可以把阵眼埋在洞底，等潮水退尽才显出威力。前者快，后者慢；前者借的是四海的力，后者借的是时间的力。\n\n“阵成之后，这里就不再只是躲雨的地方了。”敖光说，“你想清楚要让谁找到它。”',
    pause: 'story',
    repeatable: false,
    partnerId: 'partner.longhan.ao_guang',
    regionId: 'region.longhan.four_seas',
    requirements: [
      {
        kind: 'flag',
        flag: 'longhan.cave.opened',
        value: true,
      },
    ],
    onEnter: [],
    choices: [
      {
        id: 'choice.longhan.cave_spirit_array.sea',
        text: '顺四海潮势布阵，让洞中灵气随潮涨落。',
        requirements: [],
        effects: [
          {
            kind: 'unlockBuilding',
            caveBuildingId: 'building.longhan.tide_array',
            level: 1,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.cave.tide_array_built',
            value: true,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.cave.tide_array_alignment',
            value: 'with_tide',
          },
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.dragon',
            reputationDelta: 3,
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.cave_array',
            text: '听潮洞的聚潮阵顺着四海布成。阵成那刻，洞外潮水正好涨到最高处。',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.cave_tide_loft',
            delayMonths: 2,
          },
        ],
        outcome:
          '阵纹亮起时，洞中清水开始缓慢上涨。敖光伸手试了试水汽，说这座阵会把巡海队引来，也会把潮盗引来。',
      },
      {
        id: 'choice.longhan.cave_spirit_array.deep',
        text: '把阵眼埋在洞底，等退潮时才引灵入洞。',
        requirements: [],
        effects: [
          {
            kind: 'unlockBuilding',
            caveBuildingId: 'building.longhan.tide_array',
            level: 1,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.cave.tide_array_built',
            value: true,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.cave.tide_array_alignment',
            value: 'against_tide',
          },
          {
            kind: 'applyStatus',
            statusId: 'status.longhan.cave_damp',
            months: 2,
            source: '听潮洞阵眼',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.cave_tide_loft',
            delayMonths: 3,
          },
        ],
        outcome:
          '阵眼沉入水底，洞中忽然安静下来。退潮时灵气才会渗出，这让你在等潮的时候多了一层湿冷的代价，也让洞外的人更难察觉。',
      },
    ],
    tags: ['cave', 'building', 'tide_array'],
  },
  {
    id: 'event.longhan.cave_tide_loft',
    eraId: 'era.longhan',
    kind: 'cave',
    title: '听潮阁的第一根梁',
    summary: '阵有了，敖光从旧宫拖来一根沉船梁。她说洞需要一只耳朵。',
    body:
      '沉船梁上还留着旧漆，漆下刻着一行模糊的船名。敖光把梁架在洞口内侧，说潮声在这里会分成两层：一层是海面上的风，一层是海底的巡队。\n\n“你可以把窗开向四海，听广一点；也可以把耳朵留在洞内，听清每一道来路。”她敲了敲梁，“别指望两样都占到。潮水最讨厌贪心的人。”',
    pause: 'story',
    repeatable: false,
    partnerId: 'partner.longhan.ao_guang',
    regionId: 'region.longhan.four_seas',
    requirements: [
      {
        kind: 'flag',
        flag: 'longhan.cave.tide_array_built',
        value: true,
      },
    ],
    onEnter: [],
    choices: [
      {
        id: 'choice.longhan.cave_tide_loft.window',
        text: '把窗开向四海，听潮汐也听远处的风。',
        requirements: [],
        effects: [
          {
            kind: 'unlockBuilding',
            caveBuildingId: 'building.longhan.tide_loft',
            level: 1,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.cave.tide_loft_built',
            value: true,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.cave.tide_loft_ear',
            value: 'seaward',
          },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.tide_loft_far',
            text: '有人在四海旧宫后方修起一座小楼，楼窗整夜朝着归墟的方向。',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.cave_herb_garden',
            delayMonths: 2,
          },
        ],
        outcome:
          '窗开好的第一夜，你听见了三层潮声：最近的、旧宫的，以及一个更远的地方传来的、像有人在敲空壳的回响。',
      },
      {
        id: 'choice.longhan.cave_tide_loft.inward',
        text: '把窗留在内侧，只听洞中与水脉的动静。',
        requirements: [],
        effects: [
          {
            kind: 'unlockBuilding',
            caveBuildingId: 'building.longhan.tide_loft',
            level: 1,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.cave.tide_loft_built',
            value: true,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.cave.tide_loft_ear',
            value: 'inward',
          },
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.dragon',
            reputationDelta: 2,
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.cave_herb_garden',
            delayMonths: 3,
          },
        ],
        outcome:
          '楼里安静得能听见水脉在礁石里换气。敖光说这样很好，至少潮盗摸到洞口时，你会先听见他们的脚步，而不是他们的刀。',
      },
    ],
    tags: ['cave', 'building', 'tide_loft'],
  },
  {
    id: 'event.longhan.cave_herb_garden',
    eraId: 'era.longhan',
    kind: 'cave',
    title: '潮土里的第一茬',
    summary: '洞腹最深处有一片盐分很重的潮土。敖光把几株旧宫种子放在你掌心。',
    body:
      '种子外壳发白，像在海里泡了很多年。敖光说它们不是灵药，只是活得比大多数灵药更久；在听潮洞这样的地方，活得久比长得快更要紧。\n\n潮土只有薄薄一层，种盐药可以很快收一茬，种旧宫灵植却要先花时间把土养温。你把种子埋下去时，洞外的潮水正在退。\n\n“第一茬收成之后，这里就算真正有人住了。”敖光说，“你打算让它先长出什么？”',
    pause: 'story',
    repeatable: false,
    partnerId: 'partner.longhan.ao_guang',
    regionId: 'region.longhan.four_seas',
    requirements: [
      {
        kind: 'flag',
        flag: 'longhan.cave.tide_loft_built',
        value: true,
      },
    ],
    onEnter: [],
    choices: [
      {
        id: 'choice.longhan.cave_herb_garden.salt',
        text: '先种盐药。洞中需要能立刻用上的东西。',
        requirements: [],
        effects: [
          {
            kind: 'unlockBuilding',
            caveBuildingId: 'building.longhan.herb_garden',
            level: 1,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.cave.herb_garden_built',
            value: true,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.cave.garden',
            value: 'salt_herbs',
          },
          {
            kind: 'changeResource',
            resource: 'spirit_herbs',
            amount: 8,
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.cave_complete',
            text: '听潮洞有了聚潮阵、听潮阁和一畦盐药。敖光把第一茬收成的一半留在了洞口。',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.cave.complete',
            value: true,
          },
        ],
        outcome:
          '盐药在退潮时自行闭合，涨潮时又慢慢张开。敖光把第一茬收成摊在石上，说这些够你撑过下一次不该出门的雨季。',
      },
      {
        id: 'choice.longhan.cave_herb_garden.spirit',
        text: '先养旧宫灵植。慢一些，但根会扎得更深。',
        requirements: [],
        effects: [
          {
            kind: 'unlockBuilding',
            caveBuildingId: 'building.longhan.herb_garden',
            level: 1,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.cave.herb_garden_built',
            value: true,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.cave.garden',
            value: 'old_palace_spirit_herbs',
          },
          {
            kind: 'changeResource',
            resource: 'spirit_herbs',
            amount: 4,
          },
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.ao_guang',
            delta: 1,
            reason: '把旧宫的种子种进了听潮洞',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.cave_complete',
            text: '听潮洞有了聚潮阵、听潮阁和一畦旧宫灵植。它们长得慢，但根系已经抓住了礁腹最深处的潮土。',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.cave.complete',
            value: true,
          },
        ],
        outcome:
          '灵植没有立刻发芽。敖光蹲在畦边看了很久，说旧宫的东西都这样，先学会在黑暗里扎根，才肯把叶子交给潮水。',
      },
    ],
    tags: ['cave', 'building', 'herb_garden', 'complete'],
  },
  {
    id: 'event.longhan.rahu_whisper',
    eraId: 'era.longhan',
    kind: 'main',
    title: '魔渊念出你的名字',
    summary: '三族会盟之后，荒原深处传来一段不属于任何一族的低语。它念的是你的名字。',
    body:
      '低语最初混在风里，像兽群踩过枯骨时的摩擦声。你停下脚步，那声音便也停下；你再走，它便贴着你的影子继续念，一字不差地念出你的名字。\n\n会盟台上没有被提起的那个名字，此刻从更远的地方传来。龙族的巡海绳、凤族的落羽、麒麟族刻进石纹的誓约，都在同一瞬间轻轻动了一下。\n\n低语没有催你靠近，只在你影子边上慢慢说：“开天还没完呢。那个旧名字，再被人念错一回，你受不受得了？”',
    pause: 'story',
    repeatable: false,
    regionId: 'region.longhan.beast_waste',
    requirements: [
      {
        kind: 'flag',
        flag: 'longhan.three_clans_covenant',
        value: true,
      },
    ],
    onEnter: [
      {
        kind: 'setFlag',
        flag: 'longhan.rahu_whisper',
        value: true,
      },
      {
        kind: 'changeRegionState',
        regionId: 'region.longhan.beast_waste',
        key: 'whisper',
        value: 'heard',
      },
      {
        kind: 'addRumor',
        rumorId: 'rumor.longhan.rahu_whisper',
        text: '荒原夜里有人在低声念名字。被念到的人，会在第二天想起一段并不属于自己的记忆。',
      },
      {
        kind: 'scheduleEvent',
        eventId: 'event.longhan.calamity_breaks',
        delayMonths: 12,
      },
    ],
    choices: [
      {
        id: 'choice.longhan.rahu_whisper.answer',
        text: '回答它，把自己的名字再报一遍。',
        requirements: [],
        effects: [
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.rahu',
            reputationDelta: 10,
          },
          {
            kind: 'changeResource',
            resource: 'karma',
            amount: 2,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.rahu_whisper_answered',
            value: true,
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.rahu_whisper_answered',
            text: '你在荒原上回答了一次不属于三族的低语。它记住你的名字，比你更早。',
          },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.rahu_whisper_answer',
            text: '有人对着荒原低语报出了自己的名字。从那天起，他的影子在无光处会多停一瞬。',
          },
        ],
        outcome:
          '你报出名字。低语没有重复，只像确认了什么一样退去。风重新吹过骨原时，你听见极远处有一扇门向内开了一线。',
      },
      {
        id: 'choice.longhan.rahu_whisper.report',
        text: '把低语原样转告麒麟族，请地脉作证。',
        requirements: [],
        effects: [
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.qilin',
            reputationDelta: 8,
          },
          {
            kind: 'changeRegionState',
            regionId: 'region.longhan.qilin_cliff',
            key: 'whisper',
            value: 'reported',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.rahu_whisper_reported',
            value: true,
          },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.rahu_whisper_reported',
            text: '麒麟崖连夜添了一道新石纹。据说那不是阵法，而是一句用来压住名字的旧话。',
          },
        ],
        outcome:
          '麒麟族没有人质疑你，只让你把手按在石纹上。地脉替你记下了低语的音调；从今往后，魔渊再念你的名字时，大地会先听见。',
      },
      {
        id: 'choice.longhan.rahu_whisper.follow',
        text: '不回答，也不转告，循着声音走进荒原深处。',
        requirements: [],
        effects: [
          {
            kind: 'changeRegionState',
            regionId: 'region.longhan.beast_waste',
            key: 'whisper',
            value: 'followed',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.chaos_breath_heard',
            value: true,
          },
          {
            kind: 'changeResource',
            resource: 'beast_cores',
            amount: 3,
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.rahu_whisper_followed',
            text: '你循着低语走到荒原深处。声音的尽头不是人，而是一道仍在缓慢张开的裂口。',
          },
        ],
        outcome:
          '低语把你领到骨山之后。那里没有罗睺，也没有祭坛，只有一道裂口在呼吸；你带回几枚被裂隙烧黑的兽核，像带回了几粒不属于此世的火。',
      },
    ],
    tags: ['main', 'rahu', 'whisper'],
  },
  {
    id: 'event.longhan.calamity_breaks',
    eraId: 'era.longhan',
    kind: 'main',
    title: '三处火同时亮起',
    summary: '魔渊的耳语落到明处。四海、火山与麒麟崖在同一夜出现异动，大劫不再只是传闻。',
    body:
      '先是四海退潮后没有回涨。接着不死火山的赤光越过了山头，把半边夜空照得像白昼。麒麟崖的七道石纹同时裂开一线，地脉的低鸣传到了所有仍在路上的人耳中。\n\n三族的信使前后脚到了，说的话也差不多。龙庭的人说：“潮眼一乱，四海今晚都别想睡。”凤族连信都没写，只让人捎了句话：“火不等你们商量。”麒麟族的老守脉人最后到，鞋上全是土：“地脉已经裂了，我先去补。你们来不来，自己看着办。”\n\n可这三处谁也没先动。魔渊的名字已经不再只是低语，他们还在等别人先出手。你只能去一处。被留下的两处，会用它们自己的方式记住这个选择。',
    pause: 'story',
    repeatable: false,
    requirements: [
      {
        kind: 'flag',
        flag: 'longhan.rahu_whisper',
        value: true,
      },
    ],
    onEnter: [
      {
        kind: 'gainStarMark',
        amount: 1,
      },
      {
        kind: 'addRumor',
        rumorId: 'rumor.longhan.calamity_breaks',
        text: '三处火同时亮起的那一夜，洪荒所有潮位都停在同一处。有人说大劫已经开始了，也有人说它只是终于被看见。',
      },
      {
        kind: 'changeRegionState',
        regionId: 'region.longhan.honghuang_land',
        key: 'calamity',
        value: 'broken_out',
      },
    ],
    choices: [
      {
        id: 'choice.longhan.calamity_breaks.dragon',
        text: '守四海潮眼，替龙庭止住内斗。',
        requirements: [],
        effects: [
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.dragon',
            reputationDelta: 18,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.dragon_inner_strife_quelled',
            value: true,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.calamity_choice',
            value: 'tide_eye',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.calamity_resolved',
            value: true,
          },
          {
            kind: 'changeRegionState',
            regionId: 'region.longhan.four_seas',
            key: 'calamity',
            value: 'strife_quelled',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.calamity_tide',
            text: '你在潮眼守到退潮结束。龙庭的内斗没有赢家，但至少没有人被潮水带走。',
          },
        ],
        outcome:
          '潮眼深处有两拨龙族在等对方先退。你把断潮枪插在中间，让退潮替他们数完最后一段路。龙庭记住了这件事；另外两处火，也在同夜记住了你的缺席。',
      },
      {
        id: 'choice.longhan.calamity_breaks.phoenix',
        text: '入不死火山，助凤族稳住涅槃池。',
        requirements: [],
        effects: [
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.phoenix',
            reputationDelta: 18,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.volcano_crisis_eased',
            value: true,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.calamity_choice',
            value: 'nirvana_pool',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.calamity_resolved',
            value: true,
          },
          {
            kind: 'changeRegionState',
            regionId: 'region.longhan.undying_volcano',
            key: 'calamity',
            value: 'crisis_eased',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.calamity_fire',
            text: '你替凤族守住涅槃池的一夜。有人烧掉了旧羽，也有人第一次没有在火里醒来。',
          },
        ],
        outcome:
          '涅槃池的水面开始下降。你和其他凤族一起把旧羽投入火中，让火焰先记住该烧什么、不该烧什么。天亮时，火山仍在燃烧，但没有再向山林蔓延。',
      },
      {
        id: 'choice.longhan.calamity_breaks.qilin',
        text: '赴麒麟崖，以地脉封住裂口。',
        requirements: [],
        effects: [
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.qilin',
            reputationDelta: 18,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.earth_vein_restored',
            value: true,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.calamity_choice',
            value: 'earth_vein',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.calamity_resolved',
            value: true,
          },
          {
            kind: 'changeRegionState',
            regionId: 'region.longhan.qilin_cliff',
            key: 'calamity',
            value: 'vein_restored',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.calamity_earth',
            text: '你陪麒麟族守到地脉裂口自行合拢。崖上的石纹多了一道，没人说明它是为谁添的。',
          },
        ],
        outcome:
          '麒麟族以七道石纹为引，把魔气一寸寸逼回地底。裂口合拢时，崖上所有人都听见大地呼出一口气。另两处火没有停，但至少没有烧穿这一夜。',
      },
      {
        id: 'choice.longhan.calamity_breaks.rahu',
        text: '循魔渊旧路，为罗睺付一次代价。',
        requirements: [
          {
            kind: 'flag',
            flag: 'longhan.rahu_whisper_answered',
            value: true,
          },
        ],
        effects: [
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.rahu',
            reputationDelta: 18,
          },
          {
            kind: 'changeResource',
            resource: 'karma',
            amount: 5,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.rahu_price_paid',
            value: true,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.calamity_choice',
            value: 'rahu_price',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.calamity_resolved',
            value: true,
          },
          {
            kind: 'changeRegionState',
            regionId: 'region.longhan.rahu_abyss',
            key: 'calamity',
            value: 'price_paid',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.calamity_rahu',
            text: '你把名字的一部分留在魔渊，换三族在同一夜活下来。没有人知道这笔交易，除了念出你名字的声音。',
          },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.calamity_rahu',
            text: '大劫退去后，无光海边多了一个不记得自己姓氏的人。魔渊说他付过账了。',
          },
        ],
        outcome:
          '你没有去三处火中的任何一处。魔渊在你报出的名字上划下一道，像从一册旧账里扣去一笔。天亮时，三族各自守住了自己的缺口；没有人知道那晚还发生过一场更安静的交换。',
      },
    ],
    tags: ['main', 'calamity', 'rahu', 'three_clans'],
  },
]

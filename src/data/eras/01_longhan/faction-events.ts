import type { EventDefinition } from '@/types/content'

export const longhanFactionEvents: EventDefinition[] = [
  {
    id: 'event.longhan.nirvana_choice',
    eraId: 'era.longhan',
    kind: 'faction',
    title: '涅槃池边留旧羽',
    summary: '凤族的入族礼没有誓词。你只需从身上取下一件旧物，看它烧成什么颜色。',
    body:
      '涅槃池不大，池水像一汪被压住的火。丹羽坐在池边的灰里，膝上摊着几支烧到一半的旧羽。她让你先别急着开口，听池底那一声很轻的爆裂。\n\n“凤族不问你能打几个。”她说，“只问你把什么东西看得比命还重。因为涅槃时，你多半得先烧掉它。”\n\n池边排着三种位置：一种是留给愿意留下旧羽的人，一种是给只来观礼的人，还有一种离池水最近，近到能舀起一捧未熄的火。',
    pause: 'story',
    repeatable: false,
    factionId: 'faction.longhan.phoenix',
    regionId: 'region.longhan.undying_volcano',
    requirements: [
      {
        kind: 'regionUnlocked',
        regionId: 'region.longhan.undying_volcano',
      },
    ],
    onEnter: [
      {
        kind: 'setFlag',
        flag: 'longhan.nirvana_seen',
        value: true,
      },
      {
        kind: 'addRumor',
        rumorId: 'rumor.longhan.nirvana_pool',
        text: '不死火山的涅槃池没有誓词。凤族只让入族的人取下一件旧物，看它在火里留下什么颜色。',
      },
    ],
    choices: [
      {
        id: 'choice.longhan.nirvana_choice.feather',
        text: '留下旧羽，在池边听完一次完整的复燃。',
        requirements: [],
        effects: [
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.phoenix',
            membership: true,
            rank: 1,
            contributionDelta: 5,
            flags: {
              'longhan.phoenix_join_answered': true,
            },
          },
          {
            kind: 'setFlag',
            flag: 'longhan.phoenix_join_answered',
            value: true,
          },
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.dan_yu',
            delta: 1,
            reason: '在涅槃池边留下了旧羽，没有先问能换到什么',
          },
          {
            kind: 'grantItem',
            itemId: 'item.longhan.phoenix_charm',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.nirvana_feather',
            text: '旧羽在池中烧成灰，又浮起一点很淡的光。丹羽说，那表示你还愿意回来。',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.dan_yu_ember',
            delayMonths: 2,
          },
        ],
        outcome:
          '旧羽没有烧尽，边缘留下了一圈温热的灰。丹羽把它递还给你，说这不是信物，是提醒：下次烧掉的东西未必还在你身上。',
      },
      {
        id: 'choice.longhan.nirvana_choice.witness',
        text: '只观礼，把这次复燃记在心里，不留下任何东西。',
        requirements: [],
        effects: [
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.phoenix',
            membership: true,
            rank: 1,
            reputationDelta: 3,
            flags: {
              'longhan.phoenix_join_answered': true,
            },
          },
          {
            kind: 'setFlag',
            flag: 'longhan.phoenix_join_answered',
            value: true,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.phoenix_witness',
            value: true,
          },
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.dan_yu',
            delta: 1,
            reason: '没有把凤族的复燃当成一场可以取火的仪式',
          },
          {
            kind: 'grantItem',
            itemId: 'item.longhan.nirvana_ash',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.phoenix_ash_garden',
            delayMonths: 3,
          },
        ],
        outcome:
          '你从头到尾没有伸手。复燃结束时，丹羽把池边的一捧灰推给你，说观礼的人也得带点什么走，否则火会以为你从未来过。',
      },
      {
        id: 'choice.longhan.nirvana_choice.take_flame',
        text: '走到池水最近处，舀起一捧未熄的火。',
        requirements: [],
        effects: [
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.phoenix',
            membership: true,
            rank: 1,
            reputationDelta: -2,
            flags: {
              'longhan.phoenix_flame_taken': true,
            },
          },
          {
            kind: 'setFlag',
            flag: 'longhan.phoenix_flame_taken',
            value: true,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.phoenix_join_answered',
            value: true,
          },
          {
            kind: 'grantItem',
            itemId: 'item.longhan.nirvana_ash',
            count: 2,
          },
          {
            kind: 'applyStatus',
            statusId: 'status.longhan.ember_guard',
            months: 2,
            source: '涅槃池未熄之火',
          },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.flame_taken',
            text: '有人在凤族入族礼上取走了一捧未熄的火。丹羽没有阻拦，只把池边的灰扫得更干净了一些。',
          },
        ],
        outcome:
          '火在掌心没有烫伤你，只留下一个很浅的印。丹羽看了很久，说这不是贪心，是急；急的人往往活得更久，也更容易忘记自己为何要活。',
      },
    ],
    tags: ['faction', 'phoenix', 'join'],
  },
  {
    id: 'event.longhan.phoenix_ash_garden',
    eraId: 'era.longhan',
    kind: 'faction',
    title: '灰园里的三种火',
    summary: '不死火山背阴处有一片用涅槃灰养出的园子。丹羽让你辨认哪一株已经烧过。',
    body:
      '园子里没有一朵花。灰土上立着许多烧黑的枝，枝头却各自挂着不同颜色的火：有的是金色，有的是很淡的青，还有一团几乎看不见，只在风吹过时才会亮一下。\n\n“这不是花。”丹羽说，“是还没决定要不要重新长出来的东西。你看着像什么，就会用哪种方式对它。”\n\n她把一支旧剪放在你手边，自己退到园篱外，像在等你替这座园子做一次选择。',
    pause: 'story',
    repeatable: false,
    factionId: 'faction.longhan.phoenix',
    regionId: 'region.longhan.undying_volcano',
    requirements: [
      {
        kind: 'flag',
        flag: 'longhan.phoenix_join_answered',
        value: true,
      },
    ],
    onEnter: [
      {
        kind: 'setFlag',
        flag: 'longhan.volcano_ash_seen',
        value: true,
      },
    ],
    choices: [
      {
        id: 'choice.longhan.phoenix_ash_garden.keep_gold',
        text: '剪下金色火枝，把最旺盛的那一簇留在园里。',
        requirements: [],
        effects: [
          {
            kind: 'grantItem',
            itemId: 'item.longhan.nirvana_ash',
            count: 2,
          },
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.phoenix',
            contributionDelta: 4,
          },
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.dan_yu',
            delta: 1,
            reason: '在灰园里留下了最旺盛的一簇火',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.ash_garden_choice',
            value: 'gold',
          },
        ],
        outcome:
          '金色火枝落到剪下时没有发出声音。丹羽说这簇火不会记得你，但它会让园子在下一季还有东西可烧。',
      },
      {
        id: 'choice.longhan.phoenix_ash_garden.keep_blue',
        text: '把青色火枝移栽到池边，让复燃的人先看见它。',
        requirements: [],
        effects: [
          {
            kind: 'grantItem',
            itemId: 'item.longhan.phoenix_feather',
          },
          {
            kind: 'changeRegionState',
            regionId: 'region.longhan.undying_volcano',
            key: 'ash_garden',
            value: 'blue_at_pool',
          },
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.dan_yu',
            delta: 1,
            reason: '把最安静的一簇火移到了涅槃池边',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.ash_garden_choice',
            value: 'blue',
          },
        ],
        outcome:
          '青火在池边扎下根时，池水没有起雾。丹羽说这就是好兆头：复燃的人最怕看见太亮的火，那会让他们误以为自己已经活过来了。',
      },
      {
        id: 'choice.longhan.phoenix_ash_garden.douse',
        text: '把第三簇几乎看不见的火掐灭，不让它继续耗灰。',
        requirements: [],
        effects: [
          {
            kind: 'applyStatus',
            statusId: 'status.longhan.ember_forgetting',
            months: 2,
            source: '灰园中掐灭的火',
          },
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.phoenix',
            reputationDelta: 4,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.ash_garden_choice',
            value: 'doused',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.ash_garden_douse',
            text: '你掐灭了一簇不肯长出来的火。灰里留下一小段很轻的焦味，像有人终于松了一口气。',
          },
        ],
        outcome:
          '火灭得很安静。丹羽没有责怪，只把那一小撮灰收进袖中，说有些火等得太久，掐灭它也是一种回答。',
      },
    ],
    tags: ['faction', 'phoenix', 'garden'],
  },
  {
    id: 'event.longhan.phoenix_trial_wind',
    eraId: 'era.longhan',
    kind: 'faction',
    title: '替一场涅槃守风',
    summary: '凤将的试炼不是战胜谁，而是在同族复燃时决定哪一簇火不能灭。',
    body:
      '复燃台上的风很大。一位年长的凤族已经烧到只剩心口一点光，台下的同族各自捧着一簇备用火，等守风的人发话。\n\n丹羽站在风的上首，没有替你决定。她只说：“复燃时不能什么都留。你要替她选一样烧掉，再替她守一样留下。选错不会立刻死人，但会让她醒来后少记得一件事。”\n\n台上的火又暗了一分。所有人都在等你开口。',
    pause: 'story',
    repeatable: false,
    factionId: 'faction.longhan.phoenix',
    regionId: 'region.longhan.undying_volcano',
    requirements: [
      {
        kind: 'factionMembership',
        factionId: 'faction.longhan.phoenix',
        rankAtLeast: 1,
      },
    ],
    onEnter: [
      {
        kind: 'changeFactionState',
        factionId: 'faction.longhan.phoenix',
        contributionDelta: 8,
      },
    ],
    choices: [
      {
        id: 'choice.longhan.phoenix_trial_wind.keep_name',
        text: '让她留下自己的名字，烧掉那一段最痛的旧事。',
        requirements: [],
        effects: [
          {
            kind: 'setFlag',
            flag: 'longhan.phoenix_trial_passed',
            value: true,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.phoenix_trial_choice',
            value: 'kept_name',
          },
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.phoenix',
            reputationDelta: 6,
          },
          {
            kind: 'grantItem',
            itemId: 'item.longhan.ash_crown',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.phoenix_trial',
            text: '你替一位凤族守住了名字，也替她烧掉了一段不愿再记起的旧事。',
          },
        ],
        outcome:
          '复燃结束时，她没有立刻睁眼，只先伸手摸了摸自己的胸口。丹羽说，记得名字的人不会迷路，哪怕醒来时少了一段来处。',
      },
      {
        id: 'choice.longhan.phoenix_trial_wind.keep_memory',
        text: '让她留下那段旧事，烧掉名字里的一个旧字。',
        requirements: [],
        effects: [
          {
            kind: 'setFlag',
            flag: 'longhan.phoenix_trial_passed',
            value: true,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.phoenix_trial_choice',
            value: 'kept_memory',
          },
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.phoenix',
            contributionDelta: 6,
          },
          {
            kind: 'grantTreasure',
            treasureId: 'item.longhan.nirvana_lamp',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.phoenix_trial_memory',
            text: '你替一位凤族留下了最痛的旧事，只烧掉名字里的一个旧字。她醒来后先哭了，然后笑了。',
          },
        ],
        outcome:
          '她醒来后先哭，再笑。丹羽把一盏没有油的旧灯放到你手里，说能替人留住痛的人，也得替自己留一盏灯。',
      },
      {
        id: 'choice.longhan.phoenix_trial_wind.refuse',
        text: '不替她选，把决定交回她手里。',
        requirements: [],
        effects: [
          {
            kind: 'setFlag',
            flag: 'longhan.phoenix_trial_passed',
            value: true,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.phoenix_trial_choice',
            value: 'refused',
          },
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.phoenix',
            reputationDelta: 8,
          },
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.dan_yu',
            delta: 1,
            reason: '在复燃台前把选择还给了正在复燃的人',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.phoenix_trial_refused',
            text: '你没有替她选。台上的火自己烧掉了一段旧羽，也自己留下了一点光。',
          },
        ],
        outcome:
          '你把备用火放回台边。台上的火停了很久，最后自己烧掉一段旧羽，留下一点很稳的光。丹羽没有看你，只说：“有时候不替人决定，比替她选对更难。”',
      },
    ],
    tags: ['faction', 'phoenix', 'trial'],
  },
  {
    id: 'event.longhan.phoenix_elder_choice',
    eraId: 'era.longhan',
    kind: 'faction',
    title: '长老的火',
    summary: '凤族长老的位置不靠年岁。你要在火山将熄的一季，带回一簇不属于涅槃池的火。',
    body:
      '火山将熄，涅槃池却比往常更亮。丹羽说，这是因为火在退走之前会把最后一点力气都留给池子；长老要做的，是在这时候从外面带回一簇不属于这里的火，让池子知道洪荒还有别处在烧。\n\n旧火道上已经有人在等。焚羽卫守着道口，灰烬蛟伏在更深处。你还可以绕路去灰园，那里有一簇从未离开过园子的青火。',
    pause: 'story',
    repeatable: false,
    factionId: 'faction.longhan.phoenix',
    regionId: 'region.longhan.undying_volcano',
    requirements: [
      {
        kind: 'flag',
        flag: 'longhan.volcano_crisis_eased',
        value: true,
      },
      {
        kind: 'factionMembership',
        factionId: 'faction.longhan.phoenix',
        rankAtLeast: 2,
      },
    ],
    onEnter: [
      {
        kind: 'setFlag',
        flag: 'longhan.phoenix_elder_trial_seen',
        value: true,
      },
    ],
    choices: [
      {
        id: 'choice.longhan.phoenix_elder_choice.old_fire',
        text: '走旧火道，从焚羽卫手中接过那簇不属于涅槃池的火。',
        requirements: [],
        effects: [
          {
            kind: 'startCombat',
            encounterId: 'encounter.longhan.phoenix_zealot',
            fleeAllowed: false,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.phoenix_elder_named',
            value: true,
          },
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.phoenix',
            contributionDelta: 20,
            reputationDelta: 10,
          },
          {
            kind: 'grantItem',
            itemId: 'item.longhan.nirvana_ash',
            count: 3,
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.phoenix_elder',
            text: '你从旧火道带回一簇不属于涅槃池的火。丹羽说，从今往后，池子里也有你的一份。',
          },
        ],
        outcome:
          '焚羽卫最终让开了道。他没有认输，只把那簇旧火放进你手里，说火道尽头的东西终于有外人看过了。',
      },
      {
        id: 'choice.longhan.phoenix_elder_choice.garden_fire',
        text: '绕去灰园，带走那簇从未离开园子的青火。',
        requirements: [],
        effects: [
          {
            kind: 'setFlag',
            flag: 'longhan.phoenix_elder_named',
            value: true,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.phoenix_elder_choice',
            value: 'garden_fire',
          },
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.phoenix',
            contributionDelta: 14,
          },
          {
            kind: 'grantTreasure',
            treasureId: 'item.longhan.nirvana_lamp',
          },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.phoenix_garden_fire',
            text: '灰园少了一簇青火。丹羽说那不是偷，是园子终于同意让一株火去别处看看。',
          },
        ],
        outcome:
          '青火离开园子时没有挣扎，只把根从灰里慢慢收起来。丹羽看着空出来的那一小片灰土，说长老要带走的第一簇火，最好是自己养过的。',
      },
      {
        id: 'choice.longhan.phoenix_elder_choice.stay',
        text: '不去了。把池边剩下的火守住，让火山先熄一次。',
        requirements: [],
        effects: [
          {
            kind: 'setFlag',
            flag: 'longhan.phoenix_elder_named',
            value: true,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.phoenix_elder_choice',
            value: 'stayed',
          },
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.phoenix',
            reputationDelta: 12,
          },
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.dan_yu',
            delta: 1,
            reason: '在火山将熄时没有为了长老之位离开涅槃池',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.phoenix_stay',
            text: '你没有去带外火，只守着涅槃池，看火山第一次在你面前安静下来。',
          },
        ],
        outcome:
          '火山在你的守夜里慢慢熄了。丹羽说，长老的火不必从外面带回来；有时候，能守住一次熄灭，比守住一次燃烧更难。',
      },
    ],
    tags: ['faction', 'phoenix', 'elder'],
  },
  {
    id: 'event.longhan.auspicious_terra',
    eraId: 'era.longhan',
    kind: 'faction',
    title: '祥瑞台上的回响',
    summary: '麒麟族的入族礼只问一件事：你愿意为哪一条地脉负责。',
    body:
      '祥瑞台是一整块没有接缝的青石。站上去时，脚下会依次传来不同深浅的回响：有的像很远的水声，有的像有人在石里翻身，还有一处几乎没有声音。\n\n青璃跪在台边，掌心贴着第七道石纹。她说入族的人不必立誓，只要选一条地脉，把名字留在它听得见的地方。\n\n“有的地脉很热闹。”她说，“有的已经安静太久。你选哪条，麒麟族都不会替你改。”',
    pause: 'story',
    repeatable: false,
    factionId: 'faction.longhan.qilin',
    regionId: 'region.longhan.qilin_cliff',
    requirements: [
      {
        kind: 'regionUnlocked',
        regionId: 'region.longhan.qilin_cliff',
      },
    ],
    onEnter: [
      {
        kind: 'setFlag',
        flag: 'longhan.auspicious_seen',
        value: true,
      },
    ],
    choices: [
      {
        id: 'choice.longhan.auspicious_terra.deep',
        text: '选那条几乎听不见声音的地脉，把名字留在最安静处。',
        requirements: [],
        effects: [
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.qilin',
            membership: true,
            rank: 1,
            contributionDelta: 5,
            flags: {
              'longhan.qilin_join_answered': true,
            },
          },
          {
            kind: 'setFlag',
            flag: 'longhan.qilin_join_answered',
            value: true,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.qilin_vein_choice',
            value: 'deep_silence',
          },
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.qing_li',
            delta: 1,
            reason: '在祥瑞台上选了最安静的一条地脉',
          },
          {
            kind: 'grantItem',
            itemId: 'item.longhan.vein_crystal',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.qing_li_marks',
            delayMonths: 2,
          },
        ],
        outcome:
          '你报出名字时，那处安静的地脉轻轻回了一下。青璃抬起头，像第一次认真看你。她说：“它很久没有回应过人了。”',
      },
      {
        id: 'choice.longhan.auspicious_terra.busy',
        text: '选那条仍在低声轰鸣的地脉，替它分担一份热闹。',
        requirements: [],
        effects: [
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.qilin',
            membership: true,
            rank: 1,
            reputationDelta: 4,
            flags: {
              'longhan.qilin_join_answered': true,
            },
          },
          {
            kind: 'setFlag',
            flag: 'longhan.qilin_join_answered',
            value: true,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.qilin_vein_choice',
            value: 'loud_vein',
          },
          {
            kind: 'grantItem',
            itemId: 'item.longhan.qilin_seal',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.qilin_vein_watch',
            delayMonths: 2,
          },
        ],
        outcome:
          '脚下传来一声很长的回响，像整条地脉在确认你的重量。青璃把一枚土印放进你掌心，说热闹的地方最先出问题，也最先需要人。',
      },
      {
        id: 'choice.longhan.auspicious_terra.listen',
        text: '先不选。把台上每一道回响听完，记下最浅的那一处裂口。',
        requirements: [],
        effects: [
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.qilin',
            membership: true,
            rank: 1,
            flags: {
              'longhan.qilin_join_answered': true,
            },
          },
          {
            kind: 'setFlag',
            flag: 'longhan.qilin_join_answered',
            value: true,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.qilin_vein_choice',
            value: 'all_heard',
          },
          {
            kind: 'changeRegionState',
            regionId: 'region.longhan.qilin_cliff',
            key: 'crack_note',
            value: 'heard',
          },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.auspicious_crack',
            text: '有人听完了祥瑞台上所有回响，并在第七道石纹下找到一处最浅的裂口。',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.qing_li_vein',
            delayMonths: 3,
          },
        ],
        outcome:
          '你在台上站了很久，直到石纹的回响一一退去。青璃没有催你，只把第七道纹的位置让出来，让你把裂口记进自己的脚印里。',
      },
    ],
    tags: ['faction', 'qilin', 'join'],
  },
  {
    id: 'event.longhan.qilin_vein_watch',
    eraId: 'era.longhan',
    kind: 'faction',
    title: '地脉夜巡',
    summary: '麒麟族的夜巡不走地面。你沿着地脉的回声，去听哪一段开始变空。',
    body:
      '夜巡没有灯。守脉人把耳朵贴在石上，用一段很低的调子询问地脉的走向；回答从脚下传来，有的清楚，有的像被什么东西捂住了。\n\n青璃走在你前面，每隔七步停一次。她说地脉变空之前会先变冷；冷不是温度，是回响里少了一层东西。\n\n走到第三段时，她停下了。脚下的石纹在极轻地颤动，像有人在很深的地方反复翻身。',
    pause: 'story',
    repeatable: false,
    factionId: 'faction.longhan.qilin',
    regionId: 'region.longhan.qilin_cliff',
    requirements: [
      {
        kind: 'flag',
        flag: 'longhan.qilin_join_answered',
        value: true,
      },
    ],
    onEnter: [],
    choices: [
      {
        id: 'choice.longhan.qilin_vein_watch.listen',
        text: '跟着她听完整段回响，把变空的位置记在石上。',
        requirements: [],
        effects: [
          {
            kind: 'grantItem',
            itemId: 'item.longhan.vein_crystal',
            count: 1,
          },
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.qilin',
            contributionDelta: 5,
          },
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.qing_li',
            delta: 1,
            reason: '在地脉夜巡中听完了整段变空的回响',
          },
          {
            kind: 'changeRegionState',
            regionId: 'region.longhan.qilin_cliff',
            key: 'night_watch',
            value: 'recorded',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.vein_watch_kept',
            value: true,
          },
        ],
        outcome:
          '你和青璃把变空的位置一笔笔刻在石上。最后一笔落下时，脚下的颤动已经停了；地脉暂时还记得自己原来的走向。',
      },
      {
        id: 'choice.longhan.qilin_vein_watch.dig',
        text: '不等回响结束，直接掘开颤动最明显的那块石面。',
        requirements: [],
        effects: [
          {
            kind: 'startCombat',
            encounterId: 'encounter.longhan.vein_worm_nest',
            fleeAllowed: true,
          },
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.qilin',
            reputationDelta: -3,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.vein_watch_dug',
            value: true,
          },
          {
            kind: 'changeRegionState',
            regionId: 'region.longhan.qilin_cliff',
            key: 'night_watch',
            value: 'dug_open',
          },
        ],
        outcome:
          '石面下不是空的，而是一条被养得过大的地脉蠕虫。青璃没有责怪你，只在事后重新把那段石纹一遍遍抚平。',
      },
      {
        id: 'choice.longhan.qilin_vein_watch.seal',
        text: '不惊动它，用一段合脉调子把变空的位置暂时封住。',
        requirements: [],
        effects: [
          {
            kind: 'applyStatus',
            statusId: 'status.longhan.vein_silence',
            months: 2,
            source: '地脉夜巡',
          },
          {
            kind: 'changeRegionState',
            regionId: 'region.longhan.qilin_cliff',
            key: 'night_watch',
            value: 'sealed_temporarily',
          },
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.qilin',
            contributionDelta: 8,
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.vein_seal',
            text: '你用一段合脉调子封住了变空的地脉。青璃说，封印不是治好，只是让大地多睡一会儿。',
          },
        ],
        outcome:
          '调子落下后，地脉的颤动慢慢停止。青璃把手按在石面上，说这不是治好了，只是让大地暂时不去想那处空洞。',
      },
    ],
    tags: ['faction', 'qilin', 'vein'],
  },
  {
    id: 'event.longhan.qilin_trial_marks',
    eraId: 'era.longhan',
    kind: 'faction',
    title: '七道石纹的回声',
    summary: '镇守的试炼要你不带兵刃走过七道石纹，并把每一道回声带回来。',
    body:
      '七道石纹从祥瑞台一直延伸到崖下。第一道很宽，第二道开始变窄，到最后一道时只剩一脚的宽度。青璃站在台边，说兵刃要留在她这里，回声不能借纸记。\n\n“每道纹都会问你一句。”她说，“你不必答得好听，只要别假装没听见。”\n\n你踏上第一道纹时，整座崖忽然安静下来，像所有石头都在等你先开口。',
    pause: 'story',
    repeatable: false,
    factionId: 'faction.longhan.qilin',
    regionId: 'region.longhan.qilin_cliff',
    requirements: [
      {
        kind: 'factionMembership',
        factionId: 'faction.longhan.qilin',
        rankAtLeast: 1,
      },
    ],
    onEnter: [
      {
        kind: 'changeFactionState',
        factionId: 'faction.longhan.qilin',
        contributionDelta: 8,
      },
    ],
    choices: [
      {
        id: 'choice.longhan.qilin_trial_marks.answer',
        text: '在每一道石纹上留下回答，包括那道最窄的。',
        requirements: [],
        effects: [
          {
            kind: 'setFlag',
            flag: 'longhan.qilin_trial_passed',
            value: true,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.qilin_trial_choice',
            value: 'answered_all',
          },
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.qilin',
            reputationDelta: 8,
          },
          {
            kind: 'grantItem',
            itemId: 'item.longhan.stone_walkers',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.qilin_trial',
            text: '你走过七道石纹，回答到第七道时，崖下传来一声很像叹息的回响。',
          },
        ],
        outcome:
          '第七道纹没有问你名字，只问你愿不愿意在无人记得时也来走一遍。你说愿意；崖下传来一声很轻的回响，像地脉替你把这句话记住了。',
      },
      {
        id: 'choice.longhan.qilin_trial_marks.silent',
        text: '不回答，只把每一道回声原样带回。',
        requirements: [],
        effects: [
          {
            kind: 'setFlag',
            flag: 'longhan.qilin_trial_passed',
            value: true,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.qilin_trial_choice',
            value: 'silent',
          },
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.qilin',
            contributionDelta: 10,
          },
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.qing_li',
            delta: 1,
            reason: '走完七道石纹却没有替地脉编一句好听的回答',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.qilin_trial_silent',
            text: '你没有回答七道石纹，只把每一道回声原样带回。青璃说，有些问题本来就不该被回答得太快。',
          },
        ],
        outcome:
          '你把七道回声一道不差地带回祥瑞台。青璃听完，点了点头：“地脉问的不是答案，是你有没有听见。”',
      },
      {
        id: 'choice.longhan.qilin_trial_marks.leave_mark',
        text: '在最后一道纹上留下自己的脚印，代替一句回答。',
        requirements: [],
        effects: [
          {
            kind: 'setFlag',
            flag: 'longhan.qilin_trial_passed',
            value: true,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.qilin_trial_choice',
            value: 'footprint',
          },
          {
            kind: 'changeRegionState',
            regionId: 'region.longhan.qilin_cliff',
            key: 'seventh_mark',
            value: 'footprint_added',
          },
          {
            kind: 'grantItem',
            itemId: 'item.longhan.qilin_seal',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.qilin_trial_mark',
            text: '你在第七道石纹上留下脚印。从那以后，每个走到的守脉人都会看见它。',
          },
        ],
        outcome:
          '脚印没有消失。青璃蹲下看了很久，说第七道纹从此多了一个不属于麒麟族的回答；地脉没有反对。',
      },
    ],
    tags: ['faction', 'qilin', 'trial'],
  },
  {
    id: 'event.longhan.qilin_elder_seat',
    eraId: 'era.longhan',
    kind: 'faction',
    title: '地脉长老',
    summary: '长老的座位在崖下，不在地面。你要在魔气侵蚀过的地脉里，单独守到它重新有回声。',
    body:
      '崖下最深处的守脉室没有门。青璃把你送到石阶尽头，说长老不是被选出来的，是在一条地脉重新有回声之后，别人才知道该叫你什么。\n\n被魔气侵蚀的那段地脉已经安静很久。石壁上还留着上一次修补的痕迹，像一道反复缝过的旧伤。\n\n你可以按麒麟族的旧法慢慢合脉，也可以借魔渊留下的痕迹去听它为何不肯回声。',
    pause: 'story',
    repeatable: false,
    factionId: 'faction.longhan.qilin',
    regionId: 'region.longhan.qilin_cliff',
    requirements: [
      {
        kind: 'flag',
        flag: 'longhan.earth_vein_restored',
        value: true,
      },
      {
        kind: 'factionMembership',
        factionId: 'faction.longhan.qilin',
        rankAtLeast: 2,
      },
    ],
    onEnter: [
      {
        kind: 'setFlag',
        flag: 'longhan.qilin_elder_seat_seen',
        value: true,
      },
    ],
    choices: [
      {
        id: 'choice.longhan.qilin_elder_seat.old_way',
        text: '按旧法合脉，不与魔气争辩，只等它自己退。',
        requirements: [],
        effects: [
          {
            kind: 'setFlag',
            flag: 'longhan.qilin_elder_named',
            value: true,
          },
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.qilin',
            contributionDelta: 20,
            reputationDelta: 10,
          },
          {
            kind: 'grantTreasure',
            treasureId: 'item.longhan.vein_needle',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.qilin_elder',
            text: '你在崖下守到地脉重新有回声。青璃说，从今往后，麒麟族会先问过你的耳朵。',
          },
        ],
        outcome:
          '地脉的回声回来得很慢，像一段被水泡过的旧话重新晾干。你从守脉室出来时，青璃已经改口叫你长老。',
      },
      {
        id: 'choice.longhan.qilin_elder_seat.listen_magic',
        text: '先听魔气留下的痕迹，弄清它为什么不肯退。',
        requirements: [],
        effects: [
          {
            kind: 'setFlag',
            flag: 'longhan.qilin_elder_named',
            value: true,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.qilin_elder_choice',
            value: 'listened_magic',
          },
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.qilin',
            contributionDelta: 14,
          },
          {
            kind: 'grantItem',
            itemId: 'item.longhan.vein_crystal',
            count: 3,
          },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.qilin_magic_echo',
            text: '有人在地脉深处听见魔气说：它也不想待在这里，只是忘记回去的路。',
          },
        ],
        outcome:
          '魔气没有退，却在你听清它的话之后让开了一线。你把这件事转告青璃；她沉默很久，说长老也许该由更愿意听的人来当。',
      },
      {
        id: 'choice.longhan.qilin_elder_seat.name_to_vein',
        text: '把自己的名字留在守脉室，让地脉记住新的守夜人。',
        requirements: [],
        effects: [
          {
            kind: 'setFlag',
            flag: 'longhan.qilin_elder_named',
            value: true,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.qilin_elder_choice',
            value: 'name_left',
          },
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.qilin',
            reputationDelta: 14,
          },
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.qing_li',
            delta: 1,
            reason: '把名字留在了崖下的守脉室',
          },
          {
            kind: 'applyStatus',
            statusId: 'status.longhan.name_borrowed',
            months: 2,
            source: '守脉室',
          },
        ],
        outcome:
          '名字被石壁慢慢吸进去，像墨渗进旧纸。你没有立刻感到少了什么，只在走出崖下时发现，自己一时想不起母亲的姓氏。',
      },
    ],
    tags: ['faction', 'qilin', 'elder'],
  },
  {
    id: 'event.longhan.abyss_initiation',
    eraId: 'era.longhan',
    kind: 'faction',
    title: '无光海边报名字',
    summary: '罗睺入门的第一个问题不是“你愿不愿意”，而是“你愿意让哪一个名字先消失”。',
    body:
      '无光海没有潮声。墨姬站在一盏不亮的灯旁，灯下摆着三样东西：一片空白竹简、一支旧笔、一小撮渊墨。\n\n“魔道没有誓词。”她说，“誓词是写给还记得自己的人看的。你只要选一个名字，让它从今天起不再被人念对。”\n\n她把笔递过来。笔杆很凉，像刚从很深的水里捞起。远处魔渊的方向传来一声很轻的笑，不知道是不是罗睺。',
    pause: 'story',
    repeatable: false,
    factionId: 'faction.longhan.rahu',
    requirements: [
      {
        kind: 'flag',
        flag: 'longhan.rahu_whisper',
        value: true,
      },
    ],
    onEnter: [
      {
        kind: 'setFlag',
        flag: 'longhan.rahu_initiation_seen',
        value: true,
      },
      {
        kind: 'addRumor',
        rumorId: 'rumor.longhan.abyss_initiation',
        text: '无光海边的灯不照亮东西，只照亮名字。有人在灯下改去了自己的旧名。',
      },
    ],
    choices: [
      {
        id: 'choice.longhan.abyss_initiation.real_name',
        text: '写下自己的真名，让魔渊先从它开始忘记。',
        requirements: [],
        effects: [
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.rahu',
            membership: true,
            rank: 1,
            contributionDelta: 5,
            flags: {
              'longhan.rahu_initiated': true,
            },
          },
          {
            kind: 'setFlag',
            flag: 'longhan.rahu_initiated',
            value: true,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.rahu_initiation_choice',
            value: 'real_name',
          },
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.mo_ji',
            delta: 1,
            reason: '在无光海边先写下了自己的真名',
          },
          {
            kind: 'changeResource',
            resource: 'karma',
            amount: 2,
          },
          {
            kind: 'applyStatus',
            statusId: 'status.longhan.name_borrowed',
            months: 2,
            source: '无光海入门礼',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.mo_ji_lantern',
            delayMonths: 2,
          },
        ],
        outcome:
          '墨姬看着你的真名在竹简上慢慢变淡，第一次露出很浅的笑。她说罗睺会喜欢这笔字，因为它连写的人自己都快认不出了。',
      },
      {
        id: 'choice.longhan.abyss_initiation.false_name',
        text: '给魔渊一个假名，把真名留在自己手里。',
        requirements: [],
        effects: [
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.rahu',
            membership: true,
            rank: 1,
            reputationDelta: -1,
            flags: {
              'longhan.rahu_initiated': true,
              'longhan.rahu_false_name': true,
            },
          },
          {
            kind: 'setFlag',
            flag: 'longhan.rahu_initiated',
            value: true,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.rahu_initiation_choice',
            value: 'false_name',
          },
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.mo_ji',
            delta: 1,
            reason: '在无光海边留了个假名，却没有被当场拆穿',
          },
          {
            kind: 'grantItem',
            itemId: 'item.longhan.abyss_ink',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.mo_ji_name',
            delayMonths: 3,
          },
        ],
        outcome:
          '假名在竹简上停了一瞬，才慢慢渗进纸里。墨姬没有拆穿，只把笔收了回去：“罗睺不急着知道你真叫什么。他有很多时间。”',
      },
      {
        id: 'choice.longhan.abyss_initiation.remember_road',
        text: '什么都不写，只把无光海的路记在心里。',
        requirements: [],
        effects: [
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.rahu',
            membership: true,
            rank: 1,
            reputationDelta: 3,
            flags: {
              'longhan.rahu_initiated': true,
            },
          },
          {
            kind: 'setFlag',
            flag: 'longhan.rahu_initiated',
            value: true,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.rahu_initiation_choice',
            value: 'remember_road',
          },
          {
            kind: 'changeRegionState',
            regionId: 'region.longhan.rahu_abyss',
            key: 'initiation',
            value: 'road_remembered',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.abyss_road',
            text: '你没有在无光海边留下任何字，只把来路记在心里。墨姬说，这比真名更难被抹掉。',
          },
        ],
        outcome:
          '你把笔放回灯下。墨姬看了你一会儿，说魔道里最稀有的不是肯交名字的人，而是走进来之后还记得怎么出去的人。',
      },
    ],
    tags: ['faction', 'rahu', 'join'],
  },
  {
    id: 'event.longhan.rahu_trial_shadow',
    eraId: 'era.longhan',
    kind: 'faction',
    title: '看影子烧完',
    summary: '魔将的试炼要你看着自己的影子在魔火里烧尽，不伸手去救它。',
    body:
      '魔火窟里没有火，只有一段很长的黑影。墨姬说那是你的影子，只不过被魔渊借走了一段时间，现在要还给你。\n\n影子在窟壁上来回走，做出你熟悉又陌生的动作。它先摸了摸自己的脸，又把手伸向一处你从未去过的地方。\n\n“烧掉它，你就能走出去。”墨姬说，“但它烧的时候会叫你。叫得可能很像你自己。”',
    pause: 'story',
    repeatable: false,
    factionId: 'faction.longhan.rahu',
    regionId: 'region.longhan.rahu_abyss',
    requirements: [
      {
        kind: 'factionMembership',
        factionId: 'faction.longhan.rahu',
        rankAtLeast: 1,
      },
    ],
    onEnter: [
      {
        kind: 'changeFactionState',
        factionId: 'faction.longhan.rahu',
        contributionDelta: 8,
      },
    ],
    choices: [
      {
        id: 'choice.longhan.rahu_trial_shadow.watch',
        text: '站在原地看着它烧完，不伸手。',
        requirements: [],
        effects: [
          {
            kind: 'setFlag',
            flag: 'longhan.rahu_shadow_burned',
            value: true,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.rahu_trial_choice',
            value: 'watched',
          },
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.rahu',
            reputationDelta: 8,
          },
          {
            kind: 'grantItem',
            itemId: 'item.longhan.abyss_needle',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.rahu_trial',
            text: '你看着自己的影子在魔火里烧完。它最后没有叫你，只做了一个你很久以前常做的动作。',
          },
        ],
        outcome:
          '影子烧完时，窟里反而亮了一瞬。墨姬把一根看不见的细针放进你手里，说从今往后，你走路会轻一些，因为少了一个总跟着你的东西。',
      },
      {
        id: 'choice.longhan.rahu_trial_shadow.save',
        text: '在最后一刻把影子从火里拽出来。',
        requirements: [],
        effects: [
          {
            kind: 'setFlag',
            flag: 'longhan.rahu_shadow_burned',
            value: false,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.rahu_trial_choice',
            value: 'saved',
          },
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.rahu',
            reputationDelta: -5,
          },
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.mo_ji',
            delta: 1,
            reason: '在魔火窟里把影子从火中拽了出来',
          },
          {
            kind: 'applyStatus',
            statusId: 'status.longhan.mirror_mind',
            months: 3,
            source: '魔火窟',
          },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.shadow_saved',
            text: '有人在魔火里救回了自己的影子。从此他走过无光处时，地上会有两个影子。',
          },
        ],
        outcome:
          '影子被你拽出来时已经焦了一半。它没有道谢，只重新贴回你脚下。墨姬看着地上多出来的那半截影子，说这笔账她替你记着。',
      },
      {
        id: 'choice.longhan.rahu_trial_shadow.trade',
        text: '不救也不看，用影子向魔火换一个旧名。',
        requirements: [],
        effects: [
          {
            kind: 'setFlag',
            flag: 'longhan.rahu_shadow_burned',
            value: true,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.rahu_trial_choice',
            value: 'traded',
          },
          {
            kind: 'changeResource',
            resource: 'karma',
            amount: 3,
          },
          {
            kind: 'grantItem',
            itemId: 'item.longhan.abyss_ink',
            count: 2,
          },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.shadow_trade',
            text: '有人用影子向魔火换回一个旧名。那个名字重新出现的第一天，喊它的人全都做了同一个梦。',
          },
        ],
        outcome:
          '魔火收下影子，吐出一个你不认识的旧名。墨姬把它写在渊墨里递给你，说名字是真的，只是它原来的主人已经很久不在了。',
      },
    ],
    tags: ['faction', 'rahu', 'trial'],
  },
  {
    id: 'event.longhan.rahu_elder_name',
    eraId: 'era.longhan',
    kind: 'faction',
    title: '魔尊的代价',
    summary: '魔尊的试炼要你替罗睺完成一次开天旧梦，让至少一个旧名从洪荒消失。',
    body:
      '魔渊最深处没有灯，也没有影。墨姬带你走到一处像海又像墙的地方，说罗睺的旧梦还剩最后一页没有写完。\n\n“不是杀谁。”她说，“是让一个旧名从所有还活着的人嘴里消失。你可以选自己的，也可以选一个已经快被忘记的。”\n\n墙后传来很轻的翻页声。每翻一页，你都会想起一个不属于自己的名字。',
    pause: 'story',
    repeatable: false,
    factionId: 'faction.longhan.rahu',
    regionId: 'region.longhan.rahu_abyss',
    requirements: [
      {
        kind: 'flag',
        flag: 'longhan.rahu_price_paid',
        value: true,
      },
      {
        kind: 'factionMembership',
        factionId: 'faction.longhan.rahu',
        rankAtLeast: 2,
      },
    ],
    onEnter: [
      {
        kind: 'setFlag',
        flag: 'longhan.rahu_elder_trial_seen',
        value: true,
      },
    ],
    choices: [
      {
        id: 'choice.longhan.rahu_elder_name.give_self',
        text: '把自己名字的一半写进旧梦，让洪荒从此念不全它。',
        requirements: [],
        effects: [
          {
            kind: 'setFlag',
            flag: 'longhan.rahu_elder_named',
            value: true,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.rahu_elder_choice',
            value: 'half_self',
          },
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.rahu',
            contributionDelta: 20,
            reputationDelta: 12,
          },
          {
            kind: 'changeDaoguo',
            amount: 2,
          },
          {
            kind: 'grantItem',
            itemId: 'item.longhan.void_talisman',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.rahu_elder',
            text: '你把名字的一半留在魔渊。罗睺第一次没有用回声回答，而是亲手替你把旧梦合上。',
          },
        ],
        outcome:
          '旧梦合上时，你听见洪荒某处有几个人同时停住了话头。墨姬说他们不是忘了你，只是再也念不对你的名字。',
      },
      {
        id: 'choice.longhan.rahu_elder_name.give_other',
        text: '从旧梦里挑一个快被忘记的名字，替魔渊完成这一页。',
        requirements: [],
        effects: [
          {
            kind: 'setFlag',
            flag: 'longhan.rahu_elder_named',
            value: true,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.rahu_elder_choice',
            value: 'other_name',
          },
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.rahu',
            reputationDelta: 10,
          },
          {
            kind: 'changeResource',
            resource: 'karma',
            amount: 4,
          },
          {
            kind: 'grantTreasure',
            treasureId: 'item.longhan.nameless_mirror',
          },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.rahu_other_name',
            text: '魔渊里有一个名字被翻过去了。第二天，荒原上少了一处刻着旧名的石堆。',
          },
        ],
        outcome:
          '名字消失得很安静。你甚至不确定它原本属于谁。罗睺的翻页声停了一瞬，像在确认这一页是否符合他的旧梦。',
      },
      {
        id: 'choice.longhan.rahu_elder_name.keep_both',
        text: '把旧梦合上，不写任何名字，替魔渊留一页空白。',
        requirements: [],
        effects: [
          {
            kind: 'setFlag',
            flag: 'longhan.rahu_elder_named',
            value: true,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.rahu_elder_choice',
            value: 'blank_page',
          },
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.rahu',
            reputationDelta: -6,
          },
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.mo_ji',
            delta: 1,
            reason: '在魔尊试炼里替魔渊留了一页空白',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.rahu_blank',
            text: '你没有让任何名字消失，只把罗睺的旧梦合上，留了一页空白。墨姬说，这是她见过最像魔道的一件事。',
          },
        ],
        outcome:
          '翻页声停了很久。罗睺没有发怒，只在你转身时让墙后传来一句很轻的话：“空白也是名字的一种。”',
      },
    ],
    tags: ['faction', 'rahu', 'elder'],
  },
  {
    id: 'event.longhan.dragon_tide_court',
    eraId: 'era.longhan',
    kind: 'faction',
    title: '巡海册上的一页空白',
    summary: '龙庭的旧册里多出一页空白，没有人承认是自己撕掉的。',
    body:
      '巡海册摊在潮眼旁的礁台上。册子很旧，每一页都写满名字与归期；只有中间一页是空的，边缘留着被潮气浸开的墨痕。\n\n敖光没有来。引路的龙将说，这一页原本写着一位巡海使的名字，后来那位巡海使在退潮时没有回来，名字便自己淡了。\n\n“册子空着不好。”龙将说，“你可以补一页，也可以让它继续空着。龙庭不会催你，但会记住你选了哪一种。”',
    pause: 'story',
    repeatable: false,
    dispatch: true,
    weight: 7,
    factionId: 'faction.longhan.dragon',
    regionId: 'region.longhan.four_seas',
    requirements: [
      {
        kind: 'factionMembership',
        factionId: 'faction.longhan.dragon',
        rankAtLeast: 1,
      },
    ],
    onEnter: [
      {
        kind: 'setFlag',
        flag: 'longhan.dragon_court_seen',
        value: true,
      },
    ],
    choices: [
      {
        id: 'choice.longhan.dragon_tide_court.fill',
        text: '补上一页无名巡海使的归期，让册子不再空着。',
        requirements: [],
        effects: [
          {
            kind: 'grantItem',
            itemId: 'item.longhan.tide_silver',
            count: 2,
          },
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.dragon',
            contributionDelta: 6,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.tide_court_choice',
            value: 'filled',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.tide_court',
            text: '你替一位没有回来的巡海使补上了归期。龙将没有问那个名字，只把册子合上了。',
          },
        ],
        outcome:
          '你写下“归期未定”。龙将看了很久，说这大概是龙庭能接受的最诚实的一页。',
      },
      {
        id: 'choice.longhan.dragon_tide_court.ask',
        text: '追问那位巡海使的名字，去查他最后出现在哪一段潮路。',
        requirements: [],
        effects: [
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.missing_tide_envoy',
            text: '巡海册上被潮气抹去的名字，最后出现在旧宫后方的暗水道。那里只有退潮时才能进去。',
          },
          {
            kind: 'changeRegionState',
            regionId: 'region.longhan.four_seas',
            key: 'tide_court',
            value: 'inquired',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.missing_tide_envoy',
            value: true,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.tide_court_choice',
            value: 'asked',
          },
        ],
        outcome:
          '龙将没有回答，只把册子翻回前一页。那一页的边角有一行很小的批注：旧宫后方，退潮可入。',
      },
      {
        id: 'choice.longhan.dragon_tide_court.leave',
        text: '让那页继续空着，只在册尾留下自己的潮印。',
        requirements: [],
        effects: [
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.dragon',
            reputationDelta: 4,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.tide_court_choice',
            value: 'left_blank',
          },
          {
            kind: 'applyStatus',
            statusId: 'status.longhan.old_tide_dream',
            months: 2,
            source: '巡海册空白页',
          },
          {
            kind: 'grantItem',
            itemId: 'item.longhan.tide_pearl',
          },
        ],
        outcome:
          '潮印在册尾干透时，空白页上浮出一行极淡的潮位。龙将说那不是字，是那位巡海使最后一次退潮时留下的。',
      },
    ],
    tags: ['faction', 'dragon', 'tide_court'],
  },
]

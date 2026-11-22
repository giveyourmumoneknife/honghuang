import type { EventDefinition } from '@/types/content'

/**
 * Ambient wandering-world events. These queue in the inbox without pausing
 * time, so the world can keep moving while the player cultivates.
 */
export const longhanWorldEvents: EventDefinition[] = [
  {
    id: 'event.longhan.nameless_traveler',
    eraId: 'era.longhan',
    kind: 'world',
    title: '荒原来的无名人',
    summary: '一个没有行李的旅人向你借火，说自己正在找一封没有署名的信。',
    body:
      '他在荒原的路口等你，身上没有行囊，脚边只有一小堆被风吹散的灰。他问你借火，不是为了取暖，而是想把灰里一片烧剩的纸角烤干。\n\n“我在找一封信。”他说，“没有署名，也没有收信人。写它的人可能已经不在了，但如果我把它送到，就算是有个结尾。”\n\n纸角上只剩半个字，像“忘”，也像“望”。',
    pause: 'ambient',
    repeatable: false,
    dispatch: true,
    weight: 10,
    regionId: 'region.longhan.beast_waste',
    requirements: [
      {
        kind: 'regionVisited',
        regionId: 'region.longhan.beast_waste',
      },
    ],
    onEnter: [
      {
        kind: 'setFlag',
        flag: 'longhan.nameless_traveler_seen',
        value: true,
      },
    ],
    choices: [
      {
        id: 'choice.longhan.nameless_traveler.read',
        text: '替他把纸角上的半个字认完，再把信收进怀里。',
        requirements: [],
        effects: [
          {
            kind: 'grantItem',
            itemId: 'item.longhan.nameless_letter',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.nameless_letter_read',
            value: true,
          },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.nameless_letter',
            text: '荒原上流传着一封没有署名的信。读过的人说，信里写的不是话，是一个还没被取走的名字。',
          },
        ],
        outcome:
          '你认出那半个字是“忘”。旅人把信交给你时说，能认完这个字的人大概也能把信送到。他走的时候没有回头，灰里也没有留下脚印。',
      },
      {
        id: 'choice.longhan.nameless_traveler.fire',
        text: '替他把纸角烤干，但不收信。',
        requirements: [],
        effects: [
          {
            kind: 'changeResource',
            resource: 'spirit_stones',
            amount: 8,
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.nameless_traveler',
            text: '你替一个无名的旅人烤干了一片烧剩的纸角。他说这样足够了，至少那个字不会再被风吹走。',
          },
        ],
        outcome:
          '纸角烤干后，那半个字清楚了一些。旅人把它折好收进袖中，向你道谢，说只要字还在，信就还有被送到的可能。',
      },
    ],
    tags: ['world', 'wanderer', 'bai_ze'],
  },
  {
    id: 'event.longhan.tide_road_ambush',
    eraId: 'era.longhan',
    kind: 'world',
    title: '潮路上的伏击',
    summary: '退潮后的礁路上有人等你。对方没有报家门，只请你把身上的潮气留下。',
    body:
      '潮水退得太快，礁路露出大半。你走到一半时，两侧的礁石后同时有人起身。他们身上没有族徽，手里却拿着龙宫制式的短戟。\n\n为首的人说，这条潮路最近不太平，凡是过路的人都要留下一点东西：灵石、消息，或者一段潮气。你没有立刻回答，礁路尽头的潮声正在慢慢合拢。',
    pause: 'ambient',
    repeatable: true,
    cooldownMonths: 4,
    dispatch: true,
    weight: 12,
    regionId: 'region.longhan.four_seas',
    requirements: [
      {
        kind: 'regionVisited',
        regionId: 'region.longhan.four_seas',
      },
      {
        kind: 'realm',
        minRealm: 'qi_refining',
      },
    ],
    onEnter: [],
    choices: [
      {
        id: 'choice.longhan.tide_road_ambush.fight',
        text: '不退，让潮水先退完。',
        requirements: [{ kind: 'realm', minRealm: 'foundation', minStage: 2 }],
        effects: [
          {
            kind: 'startCombat',
            encounterId: 'encounter.longhan.dragon_exile',
            fleeAllowed: true,
          },
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.dragon',
            reputationDelta: 2,
          },
        ],
        outcome:
          '对方先动的手。礁路上潮声很响，直到最后一个人退进水里，你才发现他们用的短戟上都没有龙宫的正式烙印。',
      },
      {
        id: 'choice.longhan.tide_road_ambush.pay',
        text: '留下灵石，换一条不被打扰的路。',
        requirements: [],
        effects: [
          {
            kind: 'changeResource',
            resource: 'spirit_stones',
            amount: -10,
          },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.tide_road_toll',
            text: '四海的潮路上有人私收过路钱，所用短戟仿的是龙宫旧制。龙宫说那不是他们的人。',
          },
        ],
        outcome:
          '为首的人收了灵石，却没有让路。他说规矩改了，现在还要一段消息。你没有给，他也没有再拦，只在你背后说下次潮水会更浅。',
      },
      {
        id: 'choice.longhan.tide_road_ambush.talk',
        text: '问他们：这样的伏击，龙宫知不知道。',
        requirements: [],
        effects: [
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.dragon',
            reputationDelta: 1,
            flags: {
              'longhan.dragon_toll_reported': true,
            },
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.tide_road_ambush',
            text: '你没有动手，只问了一句龙宫知不知道。为首的人沉默了一会儿，收起短戟让开了路。',
          },
        ],
        outcome:
          '为首的人听到“龙宫”两个字，握戟的手松了一下。他最后让开路，说这条潮路明天就会换人守。你后来再经过时，果然换了。',
      },
    ],
    tags: ['world', 'combat', 'four_seas'],
  },
  {
    id: 'event.longhan.ash_fall',
    eraId: 'era.longhan',
    kind: 'world',
    title: '火山灰落了三天',
    summary: '不死火山的灰飘到了山外。灰里有尚未烧尽的字，也有人正在灰里找东西。',
    body:
      '灰落在屋脊、井沿和人的肩上，三天没有停。有人说这是火山在换气，也有人说灰里带着旧日烧掉的名字，落下来是它们在找归处。\n\n灰最厚的地方，一个老妇正用筛子慢慢滤。她不抬头，只问你是来找东西，还是来送东西的。',
    pause: 'ambient',
    repeatable: true,
    cooldownMonths: 5,
    dispatch: true,
    weight: 10,
    regionId: 'region.longhan.undying_volcano',
    requirements: [
      {
        kind: 'regionVisited',
        regionId: 'region.longhan.undying_volcano',
      },
    ],
    onEnter: [],
    choices: [
      {
        id: 'choice.longhan.ash_fall.sift',
        text: '帮她筛灰，把能认的字挑出来。',
        requirements: [],
        effects: [
          {
            kind: 'grantItem',
            itemId: 'item.longhan.nirvana_ash',
          },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.ash_fall',
            text: '火山灰里偶尔能筛出半个烧不化的字。凤族说那只是旧灰，捡不得；捡过的人都说那些字会自己拼在一起。',
          },
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.phoenix',
            reputationDelta: 1,
          },
        ],
        outcome:
          '筛到最后，你挑出三个半残的字，拼在一起不像一句话，倒像一个人的姓、一个地名和一句没写完的告别。老妇把它们收进布袋，说等灰停了再慢慢想。',
      },
      {
        id: 'choice.longhan.ash_fall.ask',
        text: '问她灰里到底有什么。',
        requirements: [],
        effects: [
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.ash_fall',
            text: '老妇说火山灰里最重的不是灰，是没烧完的话。她把筛子递给你，让你自己看那些字是怎么落在灰上的。',
          },
          {
            kind: 'changeResource',
            resource: 'spirit_herbs',
            amount: 3,
          },
        ],
        outcome:
          '老妇说，火能烧掉纸，却烧不掉写过字的地方。她筛了半辈子灰，只学会一件事：能落下来的字都还想被读。',
      },
      {
        id: 'choice.longhan.ash_fall.leave',
        text: '不打扰她，绕开最厚的灰离开。',
        requirements: [],
        effects: [
          {
            kind: 'changeRegionState',
            regionId: 'region.longhan.undying_volcano',
            key: 'ash_fall_seen',
            value: true,
          },
        ],
        outcome:
          '你绕开灰堆时，老妇在身后说了句谢谢。你回头时她已经低下头，筛子里落出一层很细的白灰。',
      },
    ],
    tags: ['world', 'ambient', 'volcano'],
  },
  {
    id: 'event.longhan.vein_tremor',
    eraId: 'era.longhan',
    kind: 'world',
    title: '地脉轻轻震了一下',
    summary: '麒麟崖的碎石同时跳起半寸。青璃不在附近，石纹正在自己变浅。',
    body:
      '震动很短，短到像是大地翻了个身。崖上的碎石子同时跳起半寸，然后落回原处，连尘土都没有扬起。\n\n一棵老松下的石纹比平时亮了一点。你蹲下去看时，纹路正在缓慢往回收，像一条被拉紧太久的地脉终于松了手。远处有守脉人的铜铃在响，但铃没有风。',
    pause: 'ambient',
    repeatable: true,
    cooldownMonths: 5,
    dispatch: true,
    weight: 10,
    regionId: 'region.longhan.qilin_cliff',
    requirements: [
      {
        kind: 'regionVisited',
        regionId: 'region.longhan.qilin_cliff',
      },
    ],
    onEnter: [],
    choices: [
      {
        id: 'choice.longhan.vein_tremor.listen',
        text: '把手按在石纹上，听它收回时的声音。',
        requirements: [],
        effects: [
          {
            kind: 'applyStatus',
            statusId: 'status.longhan.vein_anchor',
            months: 2,
            source: '地脉轻震',
          },
          {
            kind: 'grantItem',
            itemId: 'item.longhan.vein_crystal',
          },
        ],
        outcome:
          '石纹收回时没有声音，掌心却传来一阵很慢的凉。你起身时，铜铃停了；崖下某个很远的地方，有人把一块新石放进了缺口。',
      },
      {
        id: 'choice.longhan.vein_tremor.mark',
        text: '记下震动的方位，回头告诉守脉人。',
        requirements: [],
        effects: [
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.qilin',
            reputationDelta: 1,
          },
          {
            kind: 'changeRegionState',
            regionId: 'region.longhan.qilin_cliff',
            key: 'tremor_marked',
            value: true,
          },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.vein_tremor',
            text: '麒麟崖下有人记下了地脉轻震的方位。守脉人说那一段脉最近总在夜里自己收紧。',
          },
        ],
        outcome:
          '守脉人听完你比划的方位，沉默了一会儿，说那一段地脉最近一直在收紧，像是在替什么东西挡着。',
      },
      {
        id: 'choice.longhan.vein_tremor.dig',
        text: '顺着石纹变浅的方向挖一小段，看看下面有没有裂口。',
        requirements: [{ kind: 'realm', minRealm: 'foundation' }],
        effects: [
          {
            kind: 'changeResource',
            resource: 'ore',
            amount: 5,
          },
          {
            kind: 'startCombat',
            encounterId: 'encounter.longhan.auspicious_shade',
            fleeAllowed: true,
          },
        ],
        outcome:
          '土层下没有裂口，只有一团被灵脉养得发亮的旧影。它没有敌意，却缠着你的手不放，像是把你当成了来换岗的人。',
      },
    ],
    tags: ['world', 'ambient', 'qilin'],
  },
  {
    id: 'event.longhan.abyss_toll',
    eraId: 'era.longhan',
    kind: 'world',
    title: '魔渊的收账人',
    summary: '一个没有影子的收账人站在路口，说路过魔渊的人都要留下一样东西。',
    body:
      '他不拦路，只站在路边翻一本很厚的册子。册子上记着很多名字，每个名字后面都跟着一行字：欠什么，欠多久。\n\n“不是我要收。”他说，“是这条路要。你走过去了，路就记住了你；路记住了你，就得有东西还。”\n\n他翻到空白的一页，把册子递过来。笔是干的，墨水在很远的地方。',
    pause: 'ambient',
    repeatable: true,
    cooldownMonths: 4,
    dispatch: true,
    weight: 10,
    regionId: 'region.longhan.rahu_abyss',
    requirements: [
      {
        kind: 'regionVisited',
        regionId: 'region.longhan.rahu_abyss',
      },
    ],
    onEnter: [],
    choices: [
      {
        id: 'choice.longhan.abyss_toll.pay',
        text: '在册子上留下灵石，换一个不被记住的路过。',
        requirements: [],
        effects: [
          {
            kind: 'changeResource',
            resource: 'spirit_stones',
            amount: -15,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.abyss_toll_paid',
            value: true,
          },
        ],
        outcome:
          '收账人在空白页上写了两个字，墨是干的，字却留了下来。他合上册子让你过去，说你这段路现在不欠魔渊。',
      },
      {
        id: 'choice.longhan.abyss_toll.debt',
        text: '不还，请他记下这笔账。',
        requirements: [],
        effects: [
          {
            kind: 'changeResource',
            resource: 'karma',
            amount: 2,
          },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.abyss_toll',
            text: '魔渊的收账人记下过许多名字。有人欠了一点灵石，有人欠了一段记忆；最久的账已经没人记得是谁欠的。',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.abyss_debt',
            value: true,
          },
        ],
        outcome:
          '收账人没有为难你。他在册子上画了一道很细的记，说账会跟着路走，等到有一天你走得够远，路会自己来找你收。',
      },
      {
        id: 'choice.longhan.abyss_toll.ask',
        text: '问他册子第一页写的是谁的名字。',
        requirements: [],
        effects: [
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.abyss_toll',
            text: '收账人翻开第一页。上面的名字已经被涂掉了，只剩一行小字：欠一个可以不被记住的地方。',
          },
          {
            kind: 'changeResource',
            resource: 'karma',
            amount: 1,
          },
        ],
        outcome:
          '他翻开第一页。名字被涂得很厚，只在边上剩一句：欠一个可以不被记住的地方。收账人说这笔账已经很久没人来还了。',
      },
    ],
    tags: ['world', 'ambient', 'rahu'],
  },
  {
    id: 'event.longhan.beast_migration',
    eraId: 'era.longhan',
    kind: 'world',
    title: '兽群改道',
    summary: '荒原上的兽群忽然全部掉头。老猎人说，它们不是在逃，是在给什么东西让路。',
    body:
      '先是角兽，后来是成群的灰狼和地行鸟。它们从同一个方向退下来，不叫，也不互相踩踏，像有一条看不见的线正在往荒原深处推。\n\n老猎人蹲在坡上数了一夜，说这不是兽潮。兽潮是往外冲的，这次是往里让。他问你要不要跟过去看看，线的那一头到底是什么。',
    pause: 'ambient',
    repeatable: true,
    cooldownMonths: 4,
    dispatch: true,
    weight: 12,
    regionId: 'region.longhan.beast_waste',
    requirements: [
      {
        kind: 'regionVisited',
        regionId: 'region.longhan.beast_waste',
      },
    ],
    onEnter: [],
    choices: [
      {
        id: 'choice.longhan.beast_migration.follow',
        text: '跟着兽群让开的方向走到线的那一头。',
        requirements: [
          { kind: 'flag', flag: 'longhan.beast_tide_answered', value: true },
          { kind: 'realm', minRealm: 'foundation', minStage: 3 },
        ],
        effects: [
          {
            kind: 'startCombat',
            encounterId: 'encounter.longhan.bone_sovereign',
            fleeAllowed: true,
          },
          {
            kind: 'grantItem',
            itemId: 'item.longhan.beast_sinew',
          },
        ],
        outcome:
          '线的那一头是一具正在自己站起来的旧骨。兽群让的不是路，是它。老猎人在坡上敲了三下烟杆，算是替你壮胆。',
      },
      {
        id: 'choice.longhan.beast_migration.hunt',
        text: '趁兽群改道，捡一些落单的旧角与筋。',
        requirements: [],
        effects: [
          {
            kind: 'grantItem',
            itemId: 'item.longhan.beast_sinew',
            count: 2,
          },
          {
            kind: 'changeResource',
            resource: 'beast_cores',
            amount: 3,
          },
        ],
        outcome:
          '你捡到的旧角上都有一道相同的裂纹，像是被同一件重物压过。老猎人说这代表那只东西已经醒了，只是还没决定往哪走。',
      },
      {
        id: 'choice.longhan.beast_migration.warn',
        text: '不追也不捡，先回荒原边上的村落报信。',
        requirements: [],
        effects: [
          {
            kind: 'changeRegionState',
            regionId: 'region.longhan.beast_waste',
            key: 'migration_warned',
            value: true,
          },
          {
            kind: 'changeResource',
            resource: 'merit',
            amount: 1,
          },
        ],
        outcome:
          '村落提前收了牲畜，兽群经过时没有踩坏一间屋。老猎人后来托人带话，说你那天没跟着走，是荒原的运气。',
      },
    ],
    tags: ['world', 'ambient', 'wilds'],
  },
  {
    id: 'event.longhan.stray_immortal',
    eraId: 'era.longhan',
    kind: 'world',
    title: '路边的散修',
    summary: '一个散修坐在倒下的树旁，说自己只是走累了，不是打不过那棵树。',
    body:
      '树是被人从中间拍断的，断口很整齐。散修坐在树墩上，袖口沾着血，膝头放着一枚裂开的玉简。\n\n“别看了。”他说，“不是树先动的手。”\n\n他朝荒原深处抬了抬下巴。那边什么也没有，但风里有一股很淡的魔气，正顺着草根往这边爬。',
    pause: 'ambient',
    repeatable: true,
    cooldownMonths: 4,
    dispatch: true,
    weight: 10,
    regionId: 'region.longhan.honghuang_land',
    requirements: [
      {
        kind: 'regionVisited',
        regionId: 'region.longhan.honghuang_land',
      },
    ],
    onEnter: [],
    choices: [
      {
        id: 'choice.longhan.stray_immortal.help',
        text: '替他看一下膝头那枚裂开的玉简。',
        requirements: [],
        effects: [
          {
            kind: 'grantItem',
            itemId: 'item.longhan.tide_elixir',
          },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.stray_immortal',
            text: '有散修在荒原深处遇见了一股会自己找路的魔气。那魔气没有形体，只顺着草根往有人的地方爬。',
          },
          {
            kind: 'changeResource',
            resource: 'spirit_herbs',
            amount: 3,
          },
        ],
        outcome:
          '玉简里只有半段功法，后半段被魔气啃掉了。散修说自己就是照着这半段练的，所以才会被树打断。他把剩下的一小瓶药塞给你，说算是诊金。',
      },
      {
        id: 'choice.longhan.stray_immortal.fight',
        text: '顺着草根追过去，把那股魔气赶出荒原。',
        requirements: [
          { kind: 'flag', flag: 'longhan.rahu_whisper', value: true },
          { kind: 'realm', minRealm: 'foundation' },
        ],
        effects: [
          {
            kind: 'startCombat',
            encounterId: 'encounter.longhan.abyss_scribe',
            fleeAllowed: true,
          },
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.dragon',
            reputationDelta: 1,
          },
        ],
        outcome:
          '魔气钻进一具旧书匣里，长出一只握笔的手。散修在后面喊你小心，说那东西写下的每一个字都会变成真的。',
      },
      {
        id: 'choice.longhan.stray_immortal.listen',
        text: '坐下来，先听他把话说完。',
        requirements: [],
        effects: [
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.stray_immortal',
            text: '散修说，他年轻时以为修行就是往上走；走到荒原才知道，有些路是往下沉的，而且沉得比走得快。',
          },
          {
            kind: 'changeResource',
            resource: 'contribution',
            amount: 1,
          },
        ],
        outcome:
          '散修讲了很久，从功法讲到荒原的草，又讲到他死掉的同门。天色暗下来时，他起身说该走了，那棵树就当是替他挡了一劫。',
      },
    ],
    tags: ['world', 'ambient', 'wanderer'],
  },
  {
    id: 'event.longhan.broken_stele',
    eraId: 'era.longhan',
    kind: 'world',
    title: '断碑上的旧誓',
    summary: '荒原上有一块断成两截的石碑，碑文讲的是三族共守一条灵脉的旧誓。',
    body:
      '碑断得很整齐，像被什么利器一次劈开。上半截倒在草丛里，下半截还立着，字迹已经被风磨得只剩下轮廓。\n\n你勉强认出几行：共守此脉，不先举兵，不私断潮路。落款处有三个族徽，其中一个被人凿掉了。\n\n断口很新，凿痕却旧。你可以把碑拼回去，也可以拓下残字。',
    pause: 'ambient',
    repeatable: false,
    dispatch: true,
    weight: 8,
    regionId: 'region.longhan.honghuang_land',
    requirements: [
      {
        kind: 'regionVisited',
        regionId: 'region.longhan.honghuang_land',
      },
      {
        kind: 'flag',
        flag: 'longhan.three_clans_covenant',
        value: true,
      },
    ],
    onEnter: [],
    choices: [
      {
        id: 'choice.longhan.broken_stele.restore',
        text: '把上半截碑立回去，让旧誓重新读完。',
        requirements: [],
        effects: [
          {
            kind: 'changeRegionState',
            regionId: 'region.longhan.honghuang_land',
            key: 'broken_stele',
            value: 'restored',
          },
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.dragon',
            reputationDelta: 1,
          },
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.phoenix',
            reputationDelta: 1,
          },
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.qilin',
            reputationDelta: 1,
          },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.broken_stele',
            text: '荒原上断掉的三族旧誓碑被人重新拼好。碑上被凿掉的那个族徽，至今没有人补上。',
          },
        ],
        outcome:
          '碑立回去时没有声音。旧誓重新连成一句完整的话，只是凿掉族徽的地方空着，像缺了一个故意不补的字。',
      },
      {
        id: 'choice.longhan.broken_stele.rub',
        text: '拓下残字，带回去慢慢辨认。',
        requirements: [],
        effects: [
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.broken_stele',
            text: '你拓下断碑上的旧誓。回程路上，拓纸上的字慢慢显出第四行：若有背誓者，共讨之。',
          },
          {
            kind: 'grantItem',
            itemId: 'item.longhan.old_bone_slip',
          },
        ],
        outcome:
          '拓纸带回住处后，边缘慢慢显出一行原本看不见的字：若有背誓者，共讨之。你不记得碑上刻过这一行。',
      },
      {
        id: 'choice.longhan.broken_stele.ignore',
        text: '不动断碑，只把凿痕记在心里。',
        requirements: [],
        effects: [
          {
            kind: 'changeResource',
            resource: 'karma',
            amount: 1,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.broken_stele_seen',
            value: true,
          },
        ],
        outcome:
          '凿痕很深，不像临时起意。你记住那个被凿掉的族徽轮廓，觉得它像某样东西的背面。',
      },
    ],
    tags: ['world', 'ambient', 'covenant'],
  },
  {
    id: 'event.longhan.drowned_bell',
    eraId: 'era.longhan',
    kind: 'world',
    title: '沉在潮下的一口钟',
    summary: '退潮后，四海的滩涂上露出一截青铜钟钮。潮水正在回来。',
    body:
      '钟钮只露出半截，钟身全埋在淤泥里。退潮还有一段时间，但潮线已经在往回爬。\n\n你靠近时，钟内传来极轻的一声响，像有人在里面敲了一下，又立刻按住。钟钮上的纹是旧龙纹，样式比龙宫如今用的还要早。',
    pause: 'ambient',
    repeatable: true,
    cooldownMonths: 5,
    dispatch: true,
    weight: 10,
    regionId: 'region.longhan.four_seas',
    requirements: [
      {
        kind: 'regionVisited',
        regionId: 'region.longhan.four_seas',
      },
    ],
    onEnter: [],
    choices: [
      {
        id: 'choice.longhan.drowned_bell.dig',
        text: '抢在潮水回来前，把钟周围的泥挖开。',
        requirements: [{ kind: 'realm', minRealm: 'foundation', minStage: 2 }],
        effects: [
          {
            kind: 'grantItem',
            itemId: 'item.longhan.tide_silver',
          },
          {
            kind: 'changeResource',
            resource: 'ore',
            amount: 6,
          },
          {
            kind: 'startCombat',
            encounterId: 'encounter.longhan.dragon_exile',
            fleeAllowed: true,
          },
        ],
        outcome:
          '泥下不只有钟，还有一副被钟声镇住的旧甲。潮水回来时，甲里钻出一个守钟的残影，它不让你走，也不让你把钟带走。',
      },
      {
        id: 'choice.longhan.drowned_bell.listen',
        text: '不挖，把耳朵贴在钟壁上听。',
        requirements: [],
        effects: [
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.drowned_bell',
            text: '钟里没有风，也没有水。你听见一个很老的龙族声音在数潮历，从一数到九，再从一开始。',
          },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.drowned_bell',
            text: '四海退潮时偶尔会露出一口旧钟。有人说钟里有人在数潮历，数到第九次时，四海会重新认一次主人。',
          },
        ],
        outcome:
          '你听见里面有人在数潮历，从一数到九，再从一开始。潮水回来时，那声音没有停，只是被水压得更低了。',
      },
      {
        id: 'choice.longhan.drowned_bell.mark',
        text: '记下位置，先去告诉龙宫。',
        requirements: [],
        effects: [
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.dragon',
            reputationDelta: 2,
          },
          {
            kind: 'changeRegionState',
            regionId: 'region.longhan.four_seas',
            key: 'drowned_bell_marked',
            value: true,
          },
        ],
        outcome:
          '龙宫的人来得很快。他们看见钟钮后没有立刻打捞，只把整片滩涂围了起来。领头的人问你听见什么没有，你说听见有人在数数。他沉默了很久。',
      },
    ],
    tags: ['world', 'ambient', 'dragon'],
  },
  {
    id: 'event.longhan.ember_bargain',
    eraId: 'era.longhan',
    kind: 'world',
    title: '灰市上的交易',
    summary: '火山脚下的灰市只在落灰时开。摊主不收灵石，只收一段不愿再留着的事。',
    body:
      '灰市的摊子都摆在灰里，货物盖着灰布。摊主是个看不清年纪的人，面前一字排开三样东西：一枚温热的灰丹、一片没有字的羽、一截烧黑的木牌。\n\n“不收灵石。”他说，“收一段你不想再留着的事。不必说出口，放在灰里就行。”\n\n灰布下面，隐约有东西在轻轻动。',
    pause: 'ambient',
    repeatable: true,
    cooldownMonths: 6,
    dispatch: true,
    weight: 9,
    regionId: 'region.longhan.undying_volcano',
    requirements: [
      {
        kind: 'regionVisited',
        regionId: 'region.longhan.undying_volcano',
      },
    ],
    onEnter: [],
    choices: [
      {
        id: 'choice.longhan.ember_bargain.pill',
        text: '用一段旧事换那枚灰丹。',
        requirements: [],
        effects: [
          {
            kind: 'grantItem',
            itemId: 'item.longhan.ember_pill',
            count: 2,
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.ember_bargain',
            text: '你把一段旧事放进了灰里。摊主没有看，只把灰丹推过来，说这丹能把一段冷掉的火重新温起来，但温起来的不是你的火。',
          },
        ],
        outcome:
          '灰丹入手时是温的。摊主说这丹能把一段冷掉的火重新温起来，只是温起来的未必是你的火。你走出灰市时，忽然想不起自己刚才放下的是哪一段事。',
      },
      {
        id: 'choice.longhan.ember_bargain.feather',
        text: '用一段旧事换那片没有字的羽。',
        requirements: [],
        effects: [
          {
            kind: 'grantItem',
            itemId: 'item.longhan.nirvana_ash',
            count: 2,
          },
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.dan_yu',
            delta: 1,
            reason: '在灰市换走了一片没有字的羽',
          },
        ],
        outcome:
          '羽很轻，落在掌心时自己贴住皮肤。后来丹羽看见它，说这是凤族换羽时故意留下来的空白，用来记还没发生的事。',
      },
      {
        id: 'choice.longhan.ember_bargain.refuse',
        text: '不换，问他灰布里动的是什么。',
        requirements: [],
        effects: [
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.ember_bargain',
            text: '灰市的灰布下面压着许多没有被换走的事。摊主说那些事太旧了，连灰都不肯收。',
          },
          {
            kind: 'changeResource',
            resource: 'karma',
            amount: 1,
          },
        ],
        outcome:
          '摊主掀开一角灰布。下面没有货，只有一层层叠着的灰，偶尔鼓起又落下。他说这些是被退回来的事，太旧了，连灰都不肯收。',
      },
    ],
    tags: ['world', 'ambient', 'phoenix'],
  },
  {
    id: 'event.longhan.name_written_in_water',
    eraId: 'era.longhan',
    kind: 'world',
    title: '水面上多了一个名字',
    summary: '无光海的水面今日没有倒影。你低头时，水上写着别人的名字。',
    body:
      '无光海本来就没有倒影，今日却不一样。水面平静得能映出天光，天光里没有你，只有一行慢慢浮出来的字。\n\n那是一个你不认识的名字，笔画很细，写完就散。散开的地方，水面又自己聚拢，像还想再写一遍。\n\n远处传来墨姬的铃铛声，但看不见她的人。',
    pause: 'ambient',
    repeatable: true,
    cooldownMonths: 6,
    dispatch: true,
    weight: 8,
    regionId: 'region.longhan.rahu_abyss',
    requirements: [
      {
        kind: 'regionVisited',
        regionId: 'region.longhan.rahu_abyss',
      },
    ],
    onEnter: [],
    choices: [
      {
        id: 'choice.longhan.name_written_in_water.remember',
        text: '把那个名字记下来，等着有一天遇见它。',
        requirements: [],
        effects: [
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.water_name',
            text: '你记住了一个写在无光海面上的名字。它散开前最后一个笔画，像一只没有落下的手。',
          },
          {
            kind: 'changeResource',
            resource: 'karma',
            amount: 1,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.water_name_seen',
            value: true,
          },
        ],
        outcome:
          '名字散开后没有再出现。你把这个名字记住，像记住一个还没来的人。铃铛声远了，海面重新变黑。',
      },
      {
        id: 'choice.longhan.name_written_in_water.write',
        text: '把你的名字也写在水上，看它会不会留下来。',
        requirements: [],
        effects: [
          {
            kind: 'applyStatus',
            statusId: 'status.longhan.name_borrowed',
            months: 2,
            source: '无光海上的名字',
          },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.name_written_in_water',
            text: '有人在无光海面写下自己的名字。名字没有散，海却整整三日没有起风。',
          },
        ],
        outcome:
          '你的名字写下去后没有立刻散。海面安静了三日，第三日夜里，名字少了一个笔画。墨姬说那一笔被海借走了。',
      },
      {
        id: 'choice.longhan.name_written_in_water.listen',
        text: '不动水面，只循着铃铛声找墨姬。',
        requirements: [],
        effects: [
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.mo_ji',
            delta: 1,
            reason: '在无光海听见铃铛声时先去找了墨姬',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.water_name_lantern',
            text: '你循着铃铛声找到墨姬。她正把一盏灯压在海面上，灯下的水里不断浮出同一个名字。',
          },
        ],
        outcome:
          '墨姬站在海边，用一盏灯压着水面。灯下的水里不断浮出同一个名字。她看见你，只说：“别念。念了它就以为有人来接了。”',
      },
    ],
    tags: ['world', 'ambient', 'rahu'],
  },
]

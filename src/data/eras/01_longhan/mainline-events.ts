import type { EventDefinition } from '@/types/content'

/**
 * The closing movement of the Longhan campaign. These fire only after the
 * calamity is resolved, and quietly decide what this life carries forward.
 */
export const longhanMainlineEvents: EventDefinition[] = [
  {
    id: 'event.longhan.aftermath_summons',
    eraId: 'era.longhan',
    kind: 'main',
    title: '劫后第一封会盟书',
    summary: '劫火熄后，三族第一次重新坐到会盟台前。送信的人说，这次没有旧誓可以照着念。',
    body:
      '会盟台烧掉了半边，剩下的石阶还能走。送信的是一位年轻散修，他说三族都把话带到了，却没有一族愿意先上台阶。\n\n“他们让我问你。”散修说，“你打过这一劫，也在三族之间走过。你觉得，会盟还开得成吗？”\n\n台上风很大。旧誓碑的位置空着，三个人影分别站在三处残阶下，谁也没有抬头。',
    pause: 'story',
    repeatable: false,
    dispatch: true,
    weight: 8,
    regionId: 'region.longhan.honghuang_land',
    requirements: [
      {
        kind: 'flag',
        flag: 'longhan.calamity_resolved',
        value: true,
      },
    ],
    onEnter: [
      {
        kind: 'setFlag',
        flag: 'longhan.aftermath_summons_seen',
        value: true,
      },
      {
        kind: 'addRumor',
        rumorId: 'rumor.longhan.aftermath_summons',
        text: '劫后三族重新登上会盟台，却没有一族愿意先迈步。有人说那一日台上还留着一个不属于三族的脚印。',
      },
    ],
    choices: [
      {
        id: 'choice.longhan.aftermath_summons.ascend',
        text: '先上台阶，替三族把话头接住。',
        requirements: [],
        effects: [
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.dragon',
            reputationDelta: 2,
          },
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.phoenix',
            reputationDelta: 2,
          },
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.qilin',
            reputationDelta: 2,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.aftermath_summons_choice',
            value: 'ascended_first',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.aftermath_verdict',
            delayMonths: 1,
          },
        ],
        outcome:
          '你先踏上残阶。三族的人终于抬头，那一刻没有人说话，风把旧誓碑的碎灰吹上了台面。你把碎灰扫到一边，说旧誓不能照念，但可以重新写。',
      },
      {
        id: 'choice.longhan.aftermath_summons.wait',
        text: '不上台，等三族自己决定谁先迈步。',
        requirements: [],
        effects: [
          {
            kind: 'changeRegionState',
            regionId: 'region.longhan.honghuang_land',
            key: 'aftermath_assembly',
            value: 'awaited',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.aftermath_summons_choice',
            value: 'waited_below',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.aftermath_verdict',
            delayMonths: 2,
          },
        ],
        outcome:
          '你在阶下等到日偏西。最后是麒麟族的一位老守脉人先迈了步，他说再等下去，旧誓碑的碎灰就要把台阶重新埋上了。其余两族跟着上了台。',
      },
      {
        id: 'choice.longhan.aftermath_summons.ask',
        text: '先问送信的散修：他为什么会替三族跑这一趟。',
        requirements: [],
        effects: [
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.aftermath_summons',
            text: '送信的散修说，他师父死在劫火里，临终前让他把会盟书送到。他说自己想看看，三族重新坐在一起会是什么样子。',
          },
          {
            kind: 'changeResource',
            resource: 'merit',
            amount: 2,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.aftermath_summons_choice',
            value: 'asked_messenger',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.aftermath_verdict',
            delayMonths: 1,
          },
        ],
        outcome:
          '散修说师父死在劫火里，临终前只留下这一封会盟书。他没有说想让谁赢，只想看看三族重新坐在一起的样子。你上台时，他站在阶下没有走。',
      },
    ],
    tags: ['main', 'aftermath', 'covenant'],
  },
  {
    id: 'event.longhan.aftermath_verdict',
    eraId: 'era.longhan',
    kind: 'main',
    title: '新誓写在哪一页',
    summary: '三族各自带来一页新誓。纸是新的，字是旧的；没有人愿意先读出自己那一页。',
    body:
      '三页新誓摊在石台上。龙族写潮路，凤族写火域，麒麟族写地脉；每一页都承认劫难由三族共同招来，又都在末尾留了一句没有写明的话。\n\n“旧誓碑上写的是不先举兵。”麒麟族的老守脉人说，“可这次先动手的，不是兵。”\n\n风把三页纸吹得微微翻起。你可以替他们把三页并成一页，也可以只挑一页先读。',
    pause: 'story',
    repeatable: false,
    dispatch: true,
    weight: 8,
    regionId: 'region.longhan.honghuang_land',
    requirements: [
      {
        kind: 'flag',
        flag: 'longhan.aftermath_summons_seen',
        value: true,
      },
    ],
    onEnter: [
      {
        kind: 'setFlag',
        flag: 'longhan.aftermath_verdict_seen',
        value: true,
      },
    ],
    choices: [
      {
        id: 'choice.longhan.aftermath_verdict.merge',
        text: '把三页并成一页，让三种字迹落在同一段话里。',
        requirements: [],
        effects: [
          {
            kind: 'changeRegionState',
            regionId: 'region.longhan.honghuang_land',
            key: 'aftermath_oath',
            value: 'merged',
          },
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.dragon',
            reputationDelta: 2,
          },
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.phoenix',
            reputationDelta: 2,
          },
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.qilin',
            reputationDelta: 2,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.aftermath_verdict_choice',
            value: 'merged',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.aftermath_name',
            delayMonths: 2,
          },
        ],
        outcome:
          '三页纸叠在一起时，字迹没有互相覆盖，反而各退半寸，留出一段谁都能读的话：潮不私断，火不私纵，脉不私移。末尾仍空着一句，等后来的人写。',
      },
      {
        id: 'choice.longhan.aftermath_verdict.tide',
        text: '先读龙族那一页，让潮路先有律法。',
        requirements: [],
        effects: [
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.dragon',
            reputationDelta: 4,
          },
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.phoenix',
            reputationDelta: -1,
          },
          {
            kind: 'changeRegionState',
            regionId: 'region.longhan.four_seas',
            key: 'aftermath_oath',
            value: 'tide_first',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.aftermath_verdict_choice',
            value: 'tide_first',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.aftermath_name',
            delayMonths: 2,
          },
        ],
        outcome:
          '龙族那页先被读完。潮路的律法写得很细，细到凤族的人中途起身走到台边。凤族最终没有离席，只是把自己那页压在了最下面。',
      },
      {
        id: 'choice.longhan.aftermath_verdict.fire',
        text: '先读凤族那一页，让火域先有约束。',
        requirements: [],
        effects: [
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.phoenix',
            reputationDelta: 4,
          },
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.qilin',
            reputationDelta: -1,
          },
          {
            kind: 'changeRegionState',
            regionId: 'region.longhan.undying_volcano',
            key: 'aftermath_oath',
            value: 'fire_first',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.aftermath_verdict_choice',
            value: 'fire_first',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.aftermath_name',
            delayMonths: 2,
          },
        ],
        outcome:
          '凤族那页先被读完。火域的约束写得极严，连涅槃池的启闭都列了进去。丹羽在台下听着，没有说好，也没有说不好。',
      },
      {
        id: 'choice.longhan.aftermath_verdict.vein',
        text: '先读麒麟族那一页，让地脉先被重新记住。',
        requirements: [],
        effects: [
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.qilin',
            reputationDelta: 4,
          },
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.dragon',
            reputationDelta: -1,
          },
          {
            kind: 'changeRegionState',
            regionId: 'region.longhan.qilin_cliff',
            key: 'aftermath_oath',
            value: 'vein_first',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.aftermath_verdict_choice',
            value: 'vein_first',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.aftermath_name',
            delayMonths: 3,
          },
        ],
        outcome:
          '麒麟族那页先被读完。老守脉人读到地脉名录时，声音低得几乎听不见。他说这一劫之后，有些脉已经记不住自己原本的名字了。',
      },
    ],
    tags: ['main', 'aftermath', 'oath'],
  },
  {
    id: 'event.longhan.aftermath_name',
    eraId: 'era.longhan',
    kind: 'main',
    title: '带一个名字进下一劫',
    summary: '会盟末尾，三族允许你从这一劫里带走一个名字。只能一个。',
    body:
      '新誓写到末尾时，麒麟族的老守脉人合上纸，说还有一件旧例：劫末会盟，参与者可以从这一劫里带走一个名字，放进下一劫的开篇。\n\n“只能一个。”他说，“名字带走之后，此劫里所有关于它的事都会慢慢变轻。留下的人会先忘记它的声音。”\n\n潮声、火声和地脉的轻响同时静了一瞬。你可以带一个名字走，也可以什么都不带。',
    pause: 'story',
    repeatable: false,
    dispatch: true,
    weight: 8,
    regionId: 'region.longhan.honghuang_land',
    requirements: [
      {
        kind: 'flag',
        flag: 'longhan.aftermath_verdict_seen',
        value: true,
      },
    ],
    onEnter: [
      {
        kind: 'setFlag',
        flag: 'longhan.aftermath_name_seen',
        value: true,
      },
    ],
    choices: [
      {
        id: 'choice.longhan.aftermath_name.tide',
        text: '带走“潮”。让下一劫的人还记得海会退，也会回。',
        requirements: [
          {
            kind: 'factionMembership',
            factionId: 'faction.longhan.dragon',
          },
        ],
        effects: [
          {
            kind: 'changeDaoguo',
            amount: 2,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.era_name_choice',
            value: 'tide',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.aftermath_name_chosen',
            value: true,
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.era_name_tide',
            text: '你从龙汉劫里带走了一个“潮”字。它会在下一劫的某个退潮夜里先被想起，然后你才会想起自己为什么记得它。',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.aftermath_departure',
            delayMonths: 2,
          },
        ],
        outcome:
          '你把“潮”写在会盟纸的空白处。墨迹干得很慢，像海在纸上又退了一次，才终于留下印子。',
      },
      {
        id: 'choice.longhan.aftermath_name.fire',
        text: '带走“烬”。让下一劫的人知道火灭之后还有温度。',
        requirements: [
          {
            kind: 'factionMembership',
            factionId: 'faction.longhan.phoenix',
          },
        ],
        effects: [
          {
            kind: 'changeDaoguo',
            amount: 2,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.era_name_choice',
            value: 'ember',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.aftermath_name_chosen',
            value: true,
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.era_name_ember',
            text: '你从龙汉劫里带走了一个“烬”字。它会在下一劫的某簇火熄灭之后先亮一下，提醒你火曾经烧过。',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.aftermath_departure',
            delayMonths: 2,
          },
        ],
        outcome:
          '你把“烬”写在会盟纸的空白处。字很轻，却怎么翻页都不会掉，像一层粘在纸上的灰。',
      },
      {
        id: 'choice.longhan.aftermath_name.stone',
        text: '带走“脉”。让下一劫的人一落地就知道自己站在什么上面。',
        requirements: [
          {
            kind: 'factionMembership',
            factionId: 'faction.longhan.qilin',
          },
        ],
        effects: [
          {
            kind: 'changeDaoguo',
            amount: 2,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.era_name_choice',
            value: 'vein',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.aftermath_name_chosen',
            value: true,
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.era_name_vein',
            text: '你从龙汉劫里带走了一个“脉”字。它会在下一劫的某一次地动里先被想起，然后你才会想起自己从哪里来。',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.aftermath_departure',
            delayMonths: 2,
          },
        ],
        outcome:
          '你把“脉”写在会盟纸的空白处。笔画落下时石台轻轻一震，像整座山在纸上认了一次方向。',
      },
      {
        id: 'choice.longhan.aftermath_name.none',
        text: '什么都不带。让下一劫从真正的空白开始。',
        requirements: [],
        effects: [
          {
            kind: 'changeDaoguo',
            amount: 1,
          },
          {
            kind: 'changeResource',
            resource: 'karma',
            amount: 1,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.era_name_choice',
            value: 'none',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.aftermath_name_chosen',
            value: true,
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.era_name_none',
            text: '你没有从龙汉劫里带走任何名字。会盟纸上留下一块空白，老守脉人说那也是一种写法。',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.aftermath_departure',
            delayMonths: 3,
          },
        ],
        outcome:
          '你摇头说都不带。三族的人各有反应，只有老守脉人点了点头。他说空白最难写，因为下一劫的人得自己决定要填什么。',
      },
      {
        id: 'choice.longhan.aftermath_name.own',
        text: '带走一个不在三族名录上的名字。',
        requirements: [],
        effects: [
          {
            kind: 'changeDaoguo',
            amount: 2,
          },
          {
            kind: 'changeResource',
            resource: 'karma',
            amount: 2,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.era_name_choice',
            value: 'outsider',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.aftermath_name_chosen',
            value: true,
          },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.aftermath_name',
            text: '劫末会盟上，有人从龙汉劫里带走了一个不在三族名录上的名字。老守脉人没有问那名字是谁。',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.aftermath_departure',
            delayMonths: 2,
          },
        ],
        outcome:
          '你报了一个不在名录上的名字。三族的人都没有追问。老守脉人把它写进纸缝里，说名字若真值得带走，下一劫会自己把它找出来。',
      },
    ],
    tags: ['main', 'aftermath', 'name'],
  },
  {
    id: 'event.longhan.aftermath_departure',
    eraId: 'era.longhan',
    kind: 'main',
    title: '劫末的潮声',
    summary: '会盟散场，你最后一个离开会盟台。潮声从很远的地方传来，像有人在替这一劫收尾。',
    body:
      '台下的人已经散尽。新誓纸压在一块新石下，纸角还露在外面，被风一下一下翻着。\n\n你走下残阶时，潮声从四海方向传来，越过山岭，一直漫到会盟台脚下。那不是涨潮，也不像退潮，更像海在很远的地方替这一劫翻了一页。\n\n你可以回头看一眼会盟台，也可以直接走下去。',
    pause: 'story',
    repeatable: false,
    dispatch: true,
    weight: 8,
    regionId: 'region.longhan.honghuang_land',
    requirements: [
      {
        kind: 'flag',
        flag: 'longhan.aftermath_name_chosen',
        value: true,
      },
    ],
    onEnter: [
      {
        kind: 'setFlag',
        flag: 'longhan.longhan_closed',
        value: true,
      },
      {
        kind: 'changeDaoguo',
        amount: 2,
      },
      {
        kind: 'addMemory',
        memoryId: 'memory.longhan.departure',
        text: '你最后一个离开会盟台。潮声漫到台脚时停了一瞬，像在等你走完最后一级台阶。',
      },
      {
        kind: 'scheduleEvent',
        eventId: 'event.longhan.kalpa_boss_heard',
        delayMonths: 1,
      },
    ],
    choices: [
      {
        id: 'choice.longhan.aftermath_departure.look_back',
        text: '回头看一眼空着的会盟台。',
        requirements: [],
        effects: [
          {
            kind: 'changeRegionState',
            regionId: 'region.longhan.honghuang_land',
            key: 'longhan_closed',
            value: true,
          },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.closed',
            text: '龙汉劫末，最后一个离开会盟台的人回头看了一眼。据说那一夜台上没有人，旧誓碑的影子却立了很久。',
          },
        ],
        outcome:
          '台上没有人，旧誓碑原本的位置却有一道影子立着，直到潮声退去才慢慢散开。你转过身时，残阶上的碎石已经不再滚动了。',
      },
      {
        id: 'choice.longhan.aftermath_departure.descend',
        text: '不回头，直接走下残阶。',
        requirements: [],
        effects: [
          {
            kind: 'changeRegionState',
            regionId: 'region.longhan.honghuang_land',
            key: 'longhan_closed',
            value: true,
          },
          {
            kind: 'grantItem',
            itemId: 'item.longhan.tide_silver',
            count: 2,
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.departure_descend',
            text: '你没有回头。走到最后一级台阶时，潮声刚好盖过身后的风。',
          },
        ],
        outcome:
          '走到最后一级时，潮声正好盖过身后的风。阶下有一小块被潮水打磨得很圆的石头，你捡起来，觉得它像这一劫留下的句号。',
      },
    ],
    tags: ['main', 'aftermath', 'closing'],
  },
  {
    id: 'event.longhan.kalpa_boss_heard',
    eraId: 'era.longhan',
    kind: 'main',
    title: '四道未散的影子',
    summary: '会盟散去后的第一个月，四方的旧潮同时传来消息：有些影子没有随劫退去。',
    body:
      '最先传来消息的是四海。巡海的人说，退潮退到一半时，水里立起过一个穿旧龙袍的影子，朝会盟台的方向低了半寸头。\n\n随后是不死火山。守火人看见一截翅羽从灰里浮起，绕着涅槃池飞了一圈，像在检查火是否还值得交给人。麒麟崖的石纹在同一个夜里朝崖下聚拢，拼出一头负着整片山脊的影。最后是无光海，有人说半张面具从魔渊边缘漂上来，又沉回去，像在数洪荒还剩下多少东西。\n\n老守脉人把四道消息并排放在会盟台上，说：“它们不是来赴会盟的。它们是来问，这一劫到底算不算结束。”\n\n旧誓碑原本的位置空着，风吹过时，碎石在地上轻轻响了一下。',
    pause: 'story',
    repeatable: false,
    dispatch: true,
    weight: 9,
    regionId: 'region.longhan.honghuang_land',
    requirements: [
      {
        kind: 'flag',
        flag: 'longhan.longhan_closed',
        value: true,
      },
    ],
    onEnter: [],
    choices: [
      {
        id: 'choice.longhan.kalpa_boss_heard.seek',
        text: '按四道消息的来处逐一去找，把它们的信物带回来。',
        requirements: [],
        effects: [
          {
            kind: 'setFlag',
            flag: 'longhan.kalpa_boss_heard',
            value: true,
          },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.kalpa_shadows',
            text: '会盟散去之后，四海、火山、麒麟崖与魔渊各有一道旧影现世。见过的人说，那四道影子都在等同一个回答。',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.kalpa_shadows',
            text: '你听见四道消息，决定去把那些没有随劫退去的影子逐一找出来。老守脉人没有拦你，只把四块空白木牌放在台上。',
          },
        ],
        outcome:
          '你把四块空白木牌收进袖中。老守脉人说，每见到一道影子，就在一块牌上刻下它的名字；四块都刻满时，旧誓碑会自己把路让开。',
      },
      {
        id: 'choice.longhan.kalpa_boss_heard.wait',
        text: '先不动身，等潮水自己把路让开。',
        requirements: [],
        effects: [
          {
            kind: 'setFlag',
            flag: 'longhan.kalpa_boss_heard',
            value: true,
          },
          {
            kind: 'changeResource',
            resource: 'karma',
            amount: 1,
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.kalpa_shadows_wait',
            text: '你没有立刻动身。那几个月里，四方的旧潮一轮轮涌到门口，又一轮轮退去，像四道不肯先开口的问候。',
          },
        ],
        outcome:
          '你没有动身。潮水却没有因此停下：四道影子轮流在夜里靠近你的住处，又在天亮前退走。它们不急，仿佛早就知道你会先耗不过这份沉默。',
      },
    ],
    tags: ['main', 'aftermath', 'worldboss', 'kalpa'],
  },
  {
    id: 'event.longhan.kalpa_epilogue',
    eraId: 'era.longhan',
    kind: 'main',
    title: '旧誓碑上的新裂纹',
    summary: '劫主法身散去的第一个月，旧誓碑原本的位置上多出了一道新的裂纹。',
    body:
      '那一道裂纹不是从外面裂开的。它从碑心最深处慢慢向上走，走到一半时停住，像一句写到一半的话在等人补上。\n\n三族都派人来看过。龙族说裂纹像潮路，凤族说像火痕，麒麟族说像地脉断开的地方。老守脉人没有说话，只把一瓶墨放在碑前，又把一支笔搁在墨上。\n\n“你已经回答过它了。”他说，“现在要决定的是，这个回答要不要让别人也看见。”\n\n风从会盟台旧址上吹过，墨面起了一圈很细的波纹。远处四海正在退潮，火山口的灰也终于不再向上翻。',
    pause: 'story',
    repeatable: false,
    dispatch: false,
    weight: 1,
    regionId: 'region.longhan.honghuang_land',
    requirements: [
      {
        kind: 'flag',
        flag: 'longhan.kalpa_answered',
        value: true,
      },
    ],
    onEnter: [],
    choices: [
      {
        id: 'choice.longhan.kalpa_epilogue.inscribe',
        text: '提笔，把回答写进那道裂纹。',
        requirements: [],
        effects: [
          {
            kind: 'setFlag',
            flag: 'longhan.kalpa_epilogue_done',
            value: true,
          },
          {
            kind: 'changeDaoguo',
            amount: 2,
          },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.kalpa_inscribed',
            text: '旧誓碑的新裂纹里多了一行字。看过的人说法不一，有人说写的是“劫已尽”，有人说写的是“人未尽”。',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.kalpa_inscribed',
            text: '你把回答写进旧誓碑的裂纹。落笔时潮声正好退到最低处，四个方向同时安静了一瞬。',
          },
        ],
        outcome:
          '墨落进裂纹，没有向外散开。最后一笔收住时，四海、火山、麒麟崖与魔渊同时传来一声极轻的回响，像四道影子在远处一同低了头。旧誓碑只剩半截，却第一次看起来是完整的。',
      },
      {
        id: 'choice.longhan.kalpa_epilogue.silent',
        text: '不写答案，让裂纹自己留着。',
        requirements: [],
        effects: [
          {
            kind: 'setFlag',
            flag: 'longhan.kalpa_epilogue_done',
            value: true,
          },
          {
            kind: 'changeResource',
            resource: 'karma',
            amount: 2,
          },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.kalpa_blank',
            text: '旧誓碑的新裂纹一直空着。三族后来都去看过，谁也没有把自己的答案写进去。',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.kalpa_blank',
            text: '你没有在旧誓碑上落笔。那道裂纹空在那里，像给后来者留的一行位置。',
          },
        ],
        outcome:
          '你把笔放回墨边。裂纹空着，风却能从中穿过，发出一种很轻、很长的声音。老守脉人看了很久，说：“不写，也是一种回答。后来的人会知道，这里本来可以写点什么。”',
      },
    ],
    tags: ['main', 'aftermath', 'worldboss', 'kalpa', 'closing'],
  },
]

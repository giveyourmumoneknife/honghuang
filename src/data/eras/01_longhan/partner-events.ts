import type { EventDefinition } from '@/types/content'

export const longhanPartnerEvents: EventDefinition[] = [
  {
    id: 'event.longhan.dan_yu_ember',
    eraId: 'era.longhan',
    kind: 'partner',
    title: '丹羽的数火课',
    summary: '火山灰落了一夜。丹羽坐在最厚的灰里，教你分辨哪一簇火已经烧完。',
    body:
      '丹羽把一把灰摊在膝头，又从袖中取出三根焦黑的细枝。她不点火，只让你看灰的颜色：有的灰发白，烧得很干净；有的灰发青，里面还压着一缕不该留的火；还有一种灰，颜色几乎和火山灰一样，只有用手指捻过才知道它比周围更冷。\n\n“数火不是为了灭火。”她说，“是为了知道哪一簇火还愿意等人。你以后会替别人做很多决定，先学会别把还想活的当成已经死的。”\n\n风把灰吹散了一点。她按住你的手腕，让你重新数一遍。',
    pause: 'story',
    repeatable: false,
    dispatch: true,
    weight: 8,
    partnerId: 'partner.longhan.dan_yu',
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
        flag: 'longhan.dan_yu_ember_seen',
        value: true,
      },
      {
        kind: 'addRumor',
        rumorId: 'rumor.longhan.dan_yu',
        text: '凤族的丹羽能靠灰的颜色分辨一簇火还愿不愿意等。她很少替人点火，只替人判断该不该灭。',
      },
    ],
    choices: [
      {
        id: 'choice.longhan.dan_yu_ember.white',
        text: '先数发白的灰，把烧尽的那一部分移出火道。',
        requirements: [],
        effects: [
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.dan_yu',
            delta: 1,
            reason: '在数火课上先分清了已经烧尽的那一部分',
          },
          {
            kind: 'grantItem',
            itemId: 'item.longhan.nirvana_ash',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.dan_yu_ember_choice',
            value: 'white',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.dan_yu_lesson',
            delayMonths: 2,
          },
        ],
        outcome:
          '丹羽点头，说先认清死掉的东西，才不会被它拖住。她把那一捧白灰收进袖中，像收起一段已经说完的话。',
      },
      {
        id: 'choice.longhan.dan_yu_ember.blue',
        text: '按住发青的灰，把还压着的那缕火引出来。',
        requirements: [],
        effects: [
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.dan_yu',
            delta: 1,
            reason: '没有把还压着火的青灰当成死灰',
          },
          {
            kind: 'changeResource',
            resource: 'spirit_herbs',
            amount: 4,
          },
          {
            kind: 'applyStatus',
            statusId: 'status.longhan.ember_guard',
            months: 2,
            source: '青灰中的残火',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.dan_yu_ember_choice',
            value: 'blue',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.dan_yu_lesson',
            delayMonths: 2,
          },
        ],
        outcome:
          '青灰里的火很温顺，像一直在等人来取。丹羽看着它被引出来，说这簇火记得自己该烧哪里，只是忘了该怎么开始。',
      },
      {
        id: 'choice.longhan.dan_yu_ember.cold',
        text: '捻开最冷的那种灰，听它为什么不肯变暖。',
        requirements: [],
        effects: [
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.dan_yu',
            delta: 1,
            reason: '在数火课上先问了最冷的那捧灰',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.dan_yu_cold_ash',
            text: '你捻开一捧发冷的灰。灰里没有火，只有一小段被烧得很干净的旧名。',
          },
          {
            kind: 'changeResource',
            resource: 'karma',
            amount: 1,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.dan_yu_ember_choice',
            value: 'cold',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.dan_yu_lesson',
            delayMonths: 2,
          },
        ],
        outcome:
          '冷灰在你指间散开，露出一小段几乎看不清的旧名。丹羽替你把它吹散，说有些人烧完之后，最舍不得的不是火，是名字。',
      },
    ],
    tags: ['partner', 'phoenix', 'dan_yu'],
  },
  {
    id: 'event.longhan.dan_yu_lesson',
    eraId: 'era.longhan',
    kind: 'partner',
    title: '三种火，三种代价',
    summary: '丹羽带你去看火山口的三处火：一处烧得最亮，一处烧得最久，一处几乎不烧。',
    body:
      '第一处火在风口，烧得极亮，靠近时连影子都被照薄。第二处在石缝里，火舌很小，却已经烧了很多年。第三处只有一层暗红，不仔细看会以为是石头。\n\n“凤族把火分三种。”丹羽说，“第一种用来赢，第二种用来守，第三种用来等。三种都能要人命，只是代价付在不同的地方。”\n\n她让你选一处站到入夜。其余两处，会在你离开后继续烧。',
    pause: 'story',
    repeatable: false,
    dispatch: true,
    weight: 8,
    partnerId: 'partner.longhan.dan_yu',
    regionId: 'region.longhan.undying_volcano',
    requirements: [
      {
        kind: 'flag',
        flag: 'longhan.dan_yu_ember_seen',
        value: true,
      },
    ],
    onEnter: [
      {
        kind: 'setFlag',
        flag: 'longhan.dan_yu_lesson_seen',
        value: true,
      },
    ],
    choices: [
      {
        id: 'choice.longhan.dan_yu_lesson.bright',
        text: '去风口那处最亮的火旁站到入夜。',
        requirements: [],
        effects: [
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.dan_yu',
            delta: 1,
            reason: '在风口最亮的火旁站到入夜',
          },
          {
            kind: 'grantItem',
            itemId: 'item.longhan.ember_blade',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.dan_yu_lesson_choice',
            value: 'bright',
          },
          {
            kind: 'applyStatus',
            statusId: 'status.longhan.burn_scar',
            months: 1,
            source: '风口亮火',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.dan_yu_scar',
            delayMonths: 3,
          },
        ],
        outcome:
          '亮火照了你一夜。天亮时你才发现袖口烧穿了一小块，人却没有觉得疼。丹羽说第一种火的代价总是晚一点才到。',
      },
      {
        id: 'choice.longhan.dan_yu_lesson.small',
        text: '守石缝里那处烧了很多年的小火。',
        requirements: [],
        effects: [
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.dan_yu',
            delta: 1,
            reason: '在石缝小火旁守了一夜，没有让它灭',
          },
          {
            kind: 'grantTreasure',
            treasureId: 'item.longhan.nirvana_lamp',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.dan_yu_lesson_choice',
            value: 'small',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.dan_yu_small_fire',
            text: '你守着一簇很小的火过夜。它没有变亮，也没有灭；天亮时，石缝里的温度刚好够你把手捂暖。',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.dan_yu_scar',
            delayMonths: 2,
          },
        ],
        outcome:
          '小火一夜没有长大。丹羽来接你时说，第二种火最难守，因为它不会给你任何“快赢了”的错觉。',
      },
      {
        id: 'choice.longhan.dan_yu_lesson.cold',
        text: '坐在那处暗红的石面前，等它自己决定要不要亮。',
        requirements: [],
        effects: [
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.dan_yu',
            delta: 1,
            reason: '对那处几乎不烧的火保持了耐心',
          },
          {
            kind: 'changeResource',
            resource: 'karma',
            amount: 1,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.dan_yu_lesson_choice',
            value: 'waiting',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.dan_yu_waiting_fire',
            value: true,
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.dan_yu_scar',
            delayMonths: 4,
          },
        ],
        outcome:
          '石面整夜没有亮。天快亮时，暗红里极轻地动了一下，像有人隔着很厚的灰翻了个身。丹羽说，第三种火最怕被催。',
      },
    ],
    tags: ['partner', 'phoenix', 'dan_yu'],
  },
  {
    id: 'event.longhan.dan_yu_scar',
    eraId: 'era.longhan',
    kind: 'partner',
    title: '她手背上那道旧痕',
    summary: '丹羽替你换药时，你看见她手背上有一道很旧的烧伤，形状像一支断掉的羽。',
    body:
      '药是涅槃灰调的，敷上去很凉。丹羽的手很稳，只有手背上那道旧痕在灯下显出来：像一支烧断的羽，尾端一直延伸到腕骨。\n\n“很久以前留下的。”她说，“那时候我以为替人决定烧掉什么，是最快救人的办法。”\n\n她没有继续说。洞里只有药膏被火气烘开的轻响。你可以问她当年烧掉了谁，也可以先把药换完。',
    pause: 'story',
    repeatable: false,
    dispatch: true,
    weight: 8,
    partnerId: 'partner.longhan.dan_yu',
    regionId: 'region.longhan.undying_volcano',
    requirements: [
      {
        kind: 'flag',
        flag: 'longhan.dan_yu_lesson_seen',
        value: true,
      },
    ],
    onEnter: [],
    choices: [
      {
        id: 'choice.longhan.dan_yu_scar.ask',
        text: '问她当年替谁做了决定，后来有没有后悔。',
        requirements: [],
        effects: [
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.dan_yu',
            delta: 1,
            reason: '没有把她手背上的旧痕当作一件可以跳过的事',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.dan_yu_scar',
            text: '丹羽说，她曾替一位同族烧掉全部旧羽，让对方活下来，却再也记不起自己为何要活。',
          },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.dan_yu_scar',
            text: '丹羽手背上的旧痕不是战伤，是替人做决定时被反噬留下的。',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.dan_yu_bond',
            delayMonths: 2,
          },
        ],
        outcome:
          '丹羽沉默了很久，才说那个人后来活了很久，却每年都会问她同一个问题：我原来是个什么样的人。她说她每次都答不上来。',
      },
      {
        id: 'choice.longhan.dan_yu_scar.silence',
        text: '不追问，只把药换完，替她把袖口拉好。',
        requirements: [],
        effects: [
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.dan_yu',
            delta: 1,
            reason: '在她不想说的时候没有继续追问旧痕',
          },
          {
            kind: 'grantItem',
            itemId: 'item.longhan.nirvana_ash',
          },
          {
            kind: 'changeResource',
            resource: 'spirit_herbs',
            amount: 3,
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.dan_yu_bond',
            delayMonths: 3,
          },
        ],
        outcome:
          '你把袖口替她拉好。丹羽低声说了句谢谢，声音很轻，像怕惊动洞里那一点火。',
      },
      {
        id: 'choice.longhan.dan_yu_scar.own',
        text: '把手伸过去，请她也在自己身上留一道能记住的痕。',
        requirements: [],
        effects: [
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.dan_yu',
            delta: 1,
            reason: '愿意让丹羽替自己留一道能被记住的痕',
          },
          {
            kind: 'applyStatus',
            statusId: 'status.longhan.burn_scar',
            months: 2,
            source: '丹羽的记痕',
          },
          {
            kind: 'grantItem',
            itemId: 'item.longhan.ash_crown',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.dan_yu_mark',
            text: '丹羽在你手背上留下一点很浅的温痕。她说这不是契约，只是提醒：别忘了自己也曾被谁记住。',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.dan_yu_bond',
            delayMonths: 2,
          },
        ],
        outcome:
          '她没有用火，只把指尖按在你手背上。温痕很久才退，形状不像羽，倒像一小段还没写完的字。',
      },
    ],
    tags: ['partner', 'phoenix', 'dan_yu'],
  },
  {
    id: 'event.longhan.dan_yu_bond',
    eraId: 'era.longhan',
    kind: 'partner',
    title: '替彼此记住最后一次火',
    summary: '涅槃池边只剩你们两人。丹羽没有带旧羽，只带了一盏空灯。',
    body:
      '池水今夜很安静。丹羽把空灯放在你们之间，说凤族结缘不写誓词，也不交换信物；只互相保管一样东西——对方若有一天烧到只剩最后一簇火，另一个人要记得那簇火原本是什么颜色。\n\n“我做惯了替人决定烧掉什么。”她说，“但这一次，我想先问你。你愿意让我记住你的火吗？”\n\n池底传来极轻的爆裂声。灯还没有点。',
    pause: 'story',
    repeatable: true,
    cooldownMonths: 6,
    weight: 6,
    partnerId: 'partner.longhan.dan_yu',
    regionId: 'region.longhan.undying_volcano',
    requirements: [
      {
        kind: 'flag',
        flag: 'longhan.phoenix_join_answered',
        value: true,
      },
      {
        kind: 'partnerFavor',
        partnerId: 'partner.longhan.dan_yu',
        minTier: 2,
      },
      {
        kind: 'not',
        of: {
          kind: 'flag',
          flag: 'longhan.dan_yu_bonded',
          value: true,
        },
      },
    ],
    onEnter: [
      {
        kind: 'setFlag',
        flag: 'longhan.dan_yu_bond_offer',
        value: true,
      },
    ],
    choices: [
      {
        id: 'choice.longhan.dan_yu_bond.accept',
        text: '请她记住你的火。你也记住她的。',
        requirements: [],
        effects: [
          {
            kind: 'bondPartner',
            partnerId: 'partner.longhan.dan_yu',
          },
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.dan_yu',
            delta: 1,
            reason: '在涅槃池边把最后一簇火的颜色交给了对方',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.dan_yu_bonded',
            value: true,
          },
          {
            kind: 'grantTreasure',
            treasureId: 'item.longhan.nirvana_lamp',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.dan_yu_bond',
            text: '丹羽点亮空灯，灯芯里没有火，只有一小段温热的灰。你们互相记住对方最后一簇火的颜色。',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.dan_yu_rebirth',
            delayMonths: 3,
          },
        ],
        outcome:
          '灯亮起来时没有光，只在你心口照出一小团颜色。丹羽说那是她记住的，你的火。她也让你看她自己的：很淡的青，烧得很慢。',
      },
      {
        id: 'choice.longhan.dan_yu_bond.wait',
        text: '请她再等一季。你还没想好要把哪一簇火交出去。',
        requirements: [],
        effects: [
          {
            kind: 'setFlag',
            flag: 'longhan.dan_yu_waiting',
            value: true,
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.dan_yu_wait',
            text: '你没有立刻回答丹羽。她把空灯留在池边，说灯会等到你想清楚。',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.dan_yu_bond',
            delayMonths: 6,
          },
        ],
        outcome:
          '丹羽把灯吹熄，放回池边。她说凤族的火不怕等，只怕等到最后，对方交出来的是一簇自己都不认识的火。',
      },
    ],
    tags: ['partner', 'phoenix', 'dan_yu', 'bond'],
  },
  {
    id: 'event.longhan.dan_yu_rebirth',
    eraId: 'era.longhan',
    kind: 'partner',
    title: '复燃之后她还记得',
    summary: '丹羽完成了一次小涅槃。醒来后她先叫了你的名字。',
    body:
      '她烧得比预想中久。池水一轮轮退去又涨回，你替她守着灯，直到最后一点青火重新稳下来。\n\n丹羽睁眼时没有先看自己的手，也没有问烧掉了什么。她先叫了你的名字，然后才低声问：“我还记得你，是不是说明这次烧掉的不是最要紧的东西？”\n\n涅槃灰在她肩头薄薄落了一层。你想起她说过，复燃的人最怕看见太亮的火。',
    pause: 'story',
    repeatable: false,
    dispatch: true,
    weight: 6,
    partnerId: 'partner.longhan.dan_yu',
    regionId: 'region.longhan.undying_volcano',
    requirements: [
      {
        kind: 'flag',
        flag: 'longhan.dan_yu_bonded',
        value: true,
      },
    ],
    onEnter: [
      {
        kind: 'setFlag',
        flag: 'longhan.dan_yu_rebirth_seen',
        value: true,
      },
    ],
    choices: [
      {
        id: 'choice.longhan.dan_yu_rebirth.stay',
        text: '告诉她：你记得我，因为这次烧掉的是怕被忘记的那部分。',
        requirements: [],
        effects: [
          {
            kind: 'learnTechnique',
            techniqueId: 'technique.longhan.ash_rebirth',
          },
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.dan_yu',
            delta: 1,
            reason: '在丹羽复燃后先回答了她最想问的那句话',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.dan_yu_rebirth_stayed',
            value: true,
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.dan_yu_rebirth',
            text: '丹羽复燃后先叫了你的名字。你说她烧掉的是怕被忘记的那部分；她笑了，说那正好。',
          },
        ],
        outcome:
          '丹羽听完，靠在池边笑了很久。她说这大概是她第一次烧掉之后还觉得划算。后来她教你把自己的火分出一小簇，藏在不烧的地方。',
      },
      {
        id: 'choice.longhan.dan_yu_rebirth.ask',
        text: '不回答，先问她这次烧掉了什么。',
        requirements: [],
        effects: [
          {
            kind: 'grantItem',
            itemId: 'item.longhan.nirvana_ash',
            count: 3,
          },
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.dan_yu',
            delta: 1,
            reason: '没有急着替丹羽解释她失去了什么',
          },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.dan_yu_rebirth',
            text: '丹羽在一次小涅槃后忘记了一首旧歌。她说不打紧，那首歌本来就只有她一个人会唱。',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.dan_yu_rebirth_asked',
            value: true,
          },
        ],
        outcome:
          '她想了很久，说好像忘了一首小时候唱过的歌，只记得调子的一半。她试着哼了两句，又停下来，说算了，反正也没有别人会唱。',
      },
    ],
    tags: ['partner', 'phoenix', 'dan_yu', 'after'],
  },
  {
    id: 'event.longhan.qing_li_marks',
    eraId: 'era.longhan',
    kind: 'partner',
    title: '石纹下的小姑娘',
    summary: '麒麟崖下，一个年轻守脉人正趴在地上听石头。她让你别踩到第七道纹。',
    body:
      '青璃趴在一块青石上，耳朵贴着石面，示意你绕开脚边那道最窄的石纹。她听了很久才起身，掌心沾满细灰。\n\n“第七道纹今天比昨天浅。”她说，“不是坏了，是有人在很远的地方把地脉改了一点方向。这种事只有趴下来才听得见。”\n\n她看了看你的鞋，又看了看你来的方向，像在判断你值不值得听下一句。',
    pause: 'story',
    repeatable: false,
    dispatch: true,
    weight: 8,
    partnerId: 'partner.longhan.qing_li',
    regionId: 'region.longhan.qilin_cliff',
    requirements: [
      {
        kind: 'flag',
        flag: 'longhan.qilin_join_answered',
        value: true,
      },
    ],
    onEnter: [
      {
        kind: 'setFlag',
        flag: 'longhan.qing_li_marks_seen',
        value: true,
      },
      {
        kind: 'addRumor',
        rumorId: 'rumor.longhan.qing_li',
        text: '麒麟崖最年轻的守脉人青璃，能趴在地上听出第七道石纹变浅。她说大地的话都很轻。',
      },
    ],
    choices: [
      {
        id: 'choice.longhan.qing_li_marks.listen',
        text: '也趴下来，按她说的位置听一遍第七道纹。',
        requirements: [],
        effects: [
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.qing_li',
            delta: 1,
            reason: '跟着青璃趴下来听了一遍第七道石纹',
          },
          {
            kind: 'grantItem',
            itemId: 'item.longhan.vein_crystal',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.qing_li_marks_choice',
            value: 'listened',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.qing_li_vein',
            delayMonths: 2,
          },
        ],
        outcome:
          '石面很凉，声音从骨头里传来，像很远的地方有人在慢慢搬动一座山。青璃等你听完才说：“对，就是这个。你以后会听见更多。”',
      },
      {
        id: 'choice.longhan.qing_li_marks.step',
        text: '小心跨过第七道纹，不踩到它。',
        requirements: [],
        effects: [
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.qing_li',
            delta: 1,
            reason: '没有踩到青璃正在听的第七道石纹',
          },
          {
            kind: 'changeResource',
            resource: 'ore',
            amount: 4,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.qing_li_marks_choice',
            value: 'stepped_over',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.qing_li_vein',
            delayMonths: 3,
          },
        ],
        outcome:
          '你跨过去时，青璃明显松了口气。她说很多人以为石纹踩一下不要紧，其实要紧的是它会被踩得以为自己不重要。',
      },
      {
        id: 'choice.longhan.qing_li_marks.ask',
        text: '问她：如果第七道纹真的浅了，会怎么样。',
        requirements: [],
        effects: [
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.qing_li',
            delta: 1,
            reason: '先问了第七道石纹变浅的后果',
          },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.seventh_mark',
            text: '第七道石纹若真的消失，麒麟崖下的地脉会先忘记自己该往哪里流。',
          },
          {
            kind: 'changeResource',
            resource: 'karma',
            amount: 1,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.qing_li_marks_choice',
            value: 'asked',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.qing_li_vein',
            delayMonths: 2,
          },
        ],
        outcome:
          '青璃没有立刻回答。她把手掌贴在第七道纹上，过了很久才说：“它会先忘记该往哪里流，然后整座崖开始以为自己不属于大地。”',
      },
    ],
    tags: ['partner', 'qilin', 'qing_li'],
  },
  {
    id: 'event.longhan.qing_li_vein',
    eraId: 'era.longhan',
    kind: 'partner',
    title: '地脉听诊',
    summary: '青璃要去听一段正在改道的地脉。她需要一个替她记回声的人。',
    body:
      '改道的地脉在崖腹深处，声音传不上来。青璃把一段旧绳系在两人腰间，说这样即使听不见彼此说话，也能知道对方还在。\n\n“我听完之后会暂时记不清回声的顺序。”她说，“你得替我记。不用记全部，只记哪一段最冷。”\n\n绳结收紧。崖腹里的风没有方向，只带着土腥味。',
    pause: 'story',
    repeatable: false,
    dispatch: true,
    weight: 8,
    partnerId: 'partner.longhan.qing_li',
    regionId: 'region.longhan.qilin_cliff',
    requirements: [
      {
        kind: 'flag',
        flag: 'longhan.qing_li_marks_seen',
        value: true,
      },
    ],
    onEnter: [
      {
        kind: 'setFlag',
        flag: 'longhan.qing_li_vein_seen',
        value: true,
      },
    ],
    choices: [
      {
        id: 'choice.longhan.qing_li_vein.remember',
        text: '替她记下每一段最冷的回声，回去一一复述。',
        requirements: [],
        effects: [
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.qing_li',
            delta: 1,
            reason: '在崖腹里替青璃记住了每一段最冷的回声',
          },
          {
            kind: 'grantItem',
            itemId: 'item.longhan.vein_crystal',
            count: 2,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.qing_li_vein_choice',
            value: 'remembered',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.qing_li_weight',
            delayMonths: 3,
          },
        ],
        outcome:
          '你复述到最后一段时，青璃的脸色变了。她说那一段不是改道，是有人在很深的地方把地脉往魔渊的方向拽。',
      },
      {
        id: 'choice.longhan.qing_li_vein.support',
        text: '不记回声，先替她稳住腰间的旧绳。',
        requirements: [],
        effects: [
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.qing_li',
            delta: 1,
            reason: '在崖腹里先稳住了青璃腰间的旧绳',
          },
          {
            kind: 'changeResource',
            resource: 'ore',
            amount: 5,
          },
          {
            kind: 'applyStatus',
            statusId: 'status.longhan.vein_anchor',
            months: 2,
            source: '地脉听诊',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.qing_li_vein_choice',
            value: 'steady_rope',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.qing_li_weight',
            delayMonths: 2,
          },
        ],
        outcome:
          '青璃听完后差点跪下，是旧绳把她拉住的。她喘了很久，说谢谢，又说这段地脉的事不能只有她一个人知道。',
      },
      {
        id: 'choice.longhan.qing_li_vein.dig',
        text: '沿着最冷的一段回声往下挖，看看拽动地脉的是什么。',
        requirements: [],
        effects: [
          {
            kind: 'startCombat',
            encounterId: 'encounter.longhan.vein_worm_nest',
            fleeAllowed: true,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.qing_li_vein_choice',
            value: 'dug',
          },
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.qilin',
            reputationDelta: -2,
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.qing_li_weight',
            delayMonths: 3,
          },
        ],
        outcome:
          '土层下是一条被灵脉养得过大的蠕虫，浊息正顺着它掘出的空隙往地脉里渗。青璃没有拦你，只在事后把那段洞一点点填回去。',
      },
    ],
    tags: ['partner', 'qilin', 'qing_li'],
  },
  {
    id: 'event.longhan.qing_li_weight',
    eraId: 'era.longhan',
    kind: 'partner',
    title: '替她背一次碑',
    summary: '青璃要背一块新刻的石碑去崖下。她说碑不重，重的是碑上那些还没被回答的问题。',
    body:
      '石碑比她高，刻着麒麟崖近年所有没能合拢的地脉裂口。青璃试了两次都没能把碑背稳，第三次时，她让你搭一把手。\n\n“守脉人不能让别人替自己背碑。”她说，“但可以让人扶一下。这两件事不一样。”\n\n崖路很长。碑上的名字随着步伐轻轻碰响，像很多人在很远的地方小声说话。',
    pause: 'story',
    repeatable: false,
    dispatch: true,
    weight: 8,
    partnerId: 'partner.longhan.qing_li',
    regionId: 'region.longhan.qilin_cliff',
    requirements: [
      {
        kind: 'flag',
        flag: 'longhan.qing_li_vein_seen',
        value: true,
      },
    ],
    onEnter: [],
    choices: [
      {
        id: 'choice.longhan.qing_li_weight.help',
        text: '只扶住碑的一角，不替她背。',
        requirements: [],
        effects: [
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.qing_li',
            delta: 1,
            reason: '在崖路上只扶了碑的一角，把重量留给青璃',
          },
          {
            kind: 'grantItem',
            itemId: 'item.longhan.vein_guardian_armor',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.qing_li_weight_choice',
            value: 'helped',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.qing_li_bond',
            delayMonths: 2,
          },
        ],
        outcome:
          '到崖下时，青璃的肩已经压红了一片。她把碑放下，先朝你点了点头，说扶碑的人也得记住碑上的名字，不能只出力气。',
      },
      {
        id: 'choice.longhan.qing_li_weight.carry',
        text: '把碑接过来，替她背完剩下的路。',
        requirements: [],
        effects: [
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.qing_li',
            delta: 1,
            reason: '替青璃把石碑背到了崖下',
          },
          {
            kind: 'applyStatus',
            statusId: 'status.longhan.vein_silence',
            months: 2,
            source: '替守脉人背碑',
          },
          {
            kind: 'changeResource',
            resource: 'ore',
            amount: 8,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.qing_li_weight_choice',
            value: 'carried',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.qing_li_bond',
            delayMonths: 2,
          },
        ],
        outcome:
          '碑比看上去更沉。你走到崖下时，青璃一直跟在半步之后，几次想伸手又收回去。她说：“下次别替守脉人背碑。你可以扶，但不能替。”',
      },
      {
        id: 'choice.longhan.qing_li_weight.read',
        text: '一边走一边读完碑上的名字，记下每个还没合拢的裂口。',
        requirements: [],
        effects: [
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.qing_li',
            delta: 1,
            reason: '把碑上的名字与裂口一路读完了',
          },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.qing_li_weight',
            text: '麒麟崖新增的石碑上，有一个名字被刻了两遍。青璃说那不是笔误，是那个人还没有回来。',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.qing_li_weight_choice',
            value: 'read',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.qing_li_weight_read',
            value: true,
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.qing_li_bond',
            delayMonths: 3,
          },
        ],
        outcome:
          '你在碑上读到一处被刻了两遍的名字。青璃说那是她刻的：第一遍是记下，第二遍是等人回来之后好划掉一道。',
      },
    ],
    tags: ['partner', 'qilin', 'qing_li'],
  },
  {
    id: 'event.longhan.qing_li_bond',
    eraId: 'era.longhan',
    kind: 'partner',
    title: '把名字刻进石纹',
    summary: '青璃在第七道石纹旁留了一小块空白。她说麒麟族的结缘不在嘴上，在石头上。',
    body:
      '第七道石纹旁多了一小块没有刻字的青石。青璃把刻刀放在你们之间，说守脉人结缘要两个人都留下名字，但不必刻在一起。\n\n“大地记得一切。”她说，“所以我不问你会不会变，只问你把名字刻在哪一道纹旁边。刻得近，就一起听同一条地脉；刻得远，也能在别处互相听见。”\n\n崖下的风很轻。刻刀在月光里有一点冷。',
    pause: 'story',
    repeatable: true,
    cooldownMonths: 6,
    weight: 6,
    partnerId: 'partner.longhan.qing_li',
    regionId: 'region.longhan.qilin_cliff',
    requirements: [
      {
        kind: 'flag',
        flag: 'longhan.qilin_join_answered',
        value: true,
      },
      {
        kind: 'partnerFavor',
        partnerId: 'partner.longhan.qing_li',
        minTier: 2,
      },
      {
        kind: 'not',
        of: {
          kind: 'flag',
          flag: 'longhan.qing_li_bonded',
          value: true,
        },
      },
    ],
    onEnter: [
      {
        kind: 'setFlag',
        flag: 'longhan.qing_li_bond_offer',
        value: true,
      },
    ],
    choices: [
      {
        id: 'choice.longhan.qing_li_bond.accept',
        text: '把名字刻在第七道纹旁边，与她一起听同一条地脉。',
        requirements: [],
        effects: [
          {
            kind: 'bondPartner',
            partnerId: 'partner.longhan.qing_li',
          },
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.qing_li',
            delta: 1,
            reason: '把名字刻在了青璃守的那道石纹旁边',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.qing_li_bonded',
            value: true,
          },
          {
            kind: 'grantTreasure',
            treasureId: 'item.longhan.vein_needle',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.qing_li_bond',
            text: '你在第七道石纹旁刻下名字。青璃把刻刀收好，说从今往后，大地会同时记得你们两个人。',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.qing_li_watch',
            delayMonths: 3,
          },
        ],
        outcome:
          '刻刀落下时，青石里传来一声很轻的回响。青璃把自己的名字刻在旁边，又特意留出一指宽的距离。她说那不是生分，是给以后留一点可以继续靠近的地方。',
      },
      {
        id: 'choice.longhan.qing_li_bond.far',
        text: '把名字刻在更远的一道石纹上，与她隔着一段地脉相望。',
        requirements: [],
        effects: [
          {
            kind: 'bondPartner',
            partnerId: 'partner.longhan.qing_li',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.qing_li_bonded',
            value: true,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.qing_li_bond_far',
            value: true,
          },
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.qing_li',
            delta: 1,
            reason: '把名字刻在远处，却答应会循地脉回来',
          },
          {
            kind: 'grantItem',
            itemId: 'item.longhan.stone_walkers',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.qing_li_watch',
            delayMonths: 4,
          },
        ],
        outcome:
          '青璃看着你把名字刻远，过了很久才说这样也好。她俯身把耳朵贴在石上，说以后你那边有动静，她这边也能先听见。',
      },
      {
        id: 'choice.longhan.qing_li_bond.wait',
        text: '把刻刀还给她，说再等一段地脉听清之前。',
        requirements: [],
        effects: [
          {
            kind: 'setFlag',
            flag: 'longhan.qing_li_waiting',
            value: true,
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.qing_li_wait',
            text: '你没有立刻刻下名字。青璃把青石留在原处，说石纹会等，只要人还记得回来。',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.qing_li_bond',
            delayMonths: 6,
          },
        ],
        outcome:
          '青璃接过刻刀，没有失望。她把青石翻了个面，说空着的一面也许更好，至少还能再想一段时间。',
      },
    ],
    tags: ['partner', 'qilin', 'qing_li', 'bond'],
  },
  {
    id: 'event.longhan.qing_li_watch',
    eraId: 'era.longhan',
    kind: 'partner',
    title: '共守一条地脉',
    summary: '你和青璃分守一条地脉的两端。中间隔着整座麒麟崖，只有回声能过去。',
    body:
      '地脉很长，守脉人却只有两个。青璃守崖北，你去崖南。说好每七日用一段合脉调子报一次平安；听不见回声的那一端，就要动身去找。\n\n前六日都很平静。第七日，崖北没有回声。\n\n崖下的风照常吹着，石纹照常亮着。你可以立刻动身，也可以再等一段调子的时间。',
    pause: 'story',
    repeatable: false,
    dispatch: true,
    weight: 6,
    partnerId: 'partner.longhan.qing_li',
    regionId: 'region.longhan.qilin_cliff',
    requirements: [
      {
        kind: 'flag',
        flag: 'longhan.qing_li_bonded',
        value: true,
      },
    ],
    onEnter: [
      {
        kind: 'setFlag',
        flag: 'longhan.qing_li_watch_seen',
        value: true,
      },
    ],
    choices: [
      {
        id: 'choice.longhan.qing_li_watch.go',
        text: '立刻沿地脉赶去崖北，不等到下一次调子。',
        requirements: [],
        effects: [
          {
            kind: 'startCombat',
            encounterId: 'encounter.longhan.auspicious_shade',
            fleeAllowed: false,
          },
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.qing_li',
            delta: 1,
            reason: '在崖北没有回声时立刻动身去找青璃',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.qing_li_watch_choice',
            value: 'went',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.qing_li_watch',
            text: '你赶到崖北时，青璃正被一道瑞影困在石纹之间。她看见你，第一句话是：我就知道你会来。',
          },
        ],
        outcome:
          '瑞影散开后，青璃靠在石上缓了很久。她说自己不是打不过，只是在听地脉时被旧日的祥瑞迷住了。她把你的手按在石纹上，让你替她听完最后一段回声。',
      },
      {
        id: 'choice.longhan.qing_li_watch.wait',
        text: '再等一段调子的时间，相信她能自己解决。',
        requirements: [],
        effects: [
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.qing_li',
            delta: 1,
            reason: '在崖北没有回声时仍相信青璃能自己解决',
          },
          {
            kind: 'grantItem',
            itemId: 'item.longhan.vein_crystal',
            count: 2,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.qing_li_watch_choice',
            value: 'waited',
          },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.qing_li_watch',
            text: '麒麟崖北端的第七道石纹在某一夜亮了很久。守脉人青璃说那只是地脉在换气。',
          },
        ],
        outcome:
          '下一次调子响起时，崖北回了三声。青璃后来承认那晚确实出了事，但她说：“你先等我，说明你信我。信我的人不多。”',
      },
      {
        id: 'choice.longhan.qing_li_watch.listen',
        text: '不赶路，也再等，只把耳朵贴在地脉上听完崖北的回声。',
        requirements: [],
        effects: [
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.qing_li',
            delta: 1,
            reason: '隔着整座崖听完了青璃那端的回声',
          },
          {
            kind: 'learnTechnique',
            techniqueId: 'technique.longhan.vein_song',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.qing_li_watch_choice',
            value: 'listened',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.qing_li_watch_listen',
            text: '你隔着整座崖听见青璃的回声：很乱，却没有断。你说不清自己听了多久，直到崖北重新传来合脉调子。',
          },
        ],
        outcome:
          '回声很乱，却没有断。你听见她在里面反复敲同一个位置，像在替自己确定方向。后来崖北重新响起调子，你才知道那晚她学会了独自把瑞影按回石纹里。',
      },
    ],
    tags: ['partner', 'qilin', 'qing_li', 'after'],
  },
  {
    id: 'event.longhan.mo_ji_lantern',
    eraId: 'era.longhan',
    kind: 'partner',
    title: '无光海边的灯',
    summary: '墨姬守着一盏不亮的灯。她说灯下每多一个人，魔渊就多记得一个名字。',
    body:
      '灯在无光海边立了很多年，灯罩上没有灰，也没有光。墨姬把灯芯拨了拨，火没有动，远处魔渊的方向却传来很轻的回声。\n\n“这盏灯不照路。”她说，“只照名字。谁在灯下站得久，魔渊就记得谁。你可以站一会儿，也可以替一个已经走了的人站。”\n\n海面黑得很平。灯下只有你和她的影子。',
    pause: 'story',
    repeatable: false,
    dispatch: true,
    weight: 8,
    partnerId: 'partner.longhan.mo_ji',
    regionId: 'region.longhan.rahu_abyss',
    requirements: [
      {
        kind: 'flag',
        flag: 'longhan.rahu_initiated',
        value: true,
      },
    ],
    onEnter: [
      {
        kind: 'setFlag',
        flag: 'longhan.mo_ji_lantern_seen',
        value: true,
      },
      {
        kind: 'addRumor',
        rumorId: 'rumor.longhan.mo_ji',
        text: '无光海边有一盏不亮的灯，灯下站过的人会被魔渊多记住一个名字。墨姬替很多人守过这盏灯。',
      },
    ],
    choices: [
      {
        id: 'choice.longhan.mo_ji_lantern.stand',
        text: '在灯下站到魔渊念出你的名字。',
        requirements: [],
        effects: [
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.mo_ji',
            delta: 1,
            reason: '在无光海的灯下站到魔渊念出自己的名字',
          },
          {
            kind: 'changeResource',
            resource: 'karma',
            amount: 2,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.mo_ji_lantern_choice',
            value: 'stood',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.mo_ji_name',
            delayMonths: 2,
          },
        ],
        outcome:
          '魔渊念出你名字时，灯芯极轻地亮了一下。墨姬说那表示名字是真的；她见过很多人站在这里，灯一次都没有动。',
      },
      {
        id: 'choice.longhan.mo_ji_lantern.other',
        text: '替一个已经离开的人站着，让魔渊先记住他。',
        requirements: [],
        effects: [
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.mo_ji',
            delta: 1,
            reason: '在无光海的灯下替一个不在的人站了一会儿',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.mo_ji_other',
            text: '你替一个不认识的人在灯下站了很久。魔渊没有念出名字，只让灯芯亮了一瞬。',
          },
          {
            kind: 'grantItem',
            itemId: 'item.longhan.abyss_ink',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.mo_ji_lantern_choice',
            value: 'stood_for_other',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.mo_ji_debt',
            delayMonths: 3,
          },
        ],
        outcome:
          '灯芯亮了一下，又暗下去。墨姬看着你，像第一次想说什么却没说出口。最后她只道：“他如果还在，会自己来站。你不必替。”',
      },
      {
        id: 'choice.longhan.mo_ji_lantern.ask',
        text: '问她替谁守过这盏灯，守了多久。',
        requirements: [],
        effects: [
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.mo_ji',
            delta: 1,
            reason: '问过墨姬在这盏灯下替谁站过',
          },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.mo_ji_lantern_other',
            text: '墨姬在无光海边替一个没有名字的人守过灯。她说那人走的时候，灯亮得比谁都久。',
          },
          {
            kind: 'changeResource',
            resource: 'karma',
            amount: 1,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.mo_ji_lantern_choice',
            value: 'asked',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.mo_ji_name',
            delayMonths: 2,
          },
        ],
        outcome:
          '墨姬没有回答。她把灯芯拨得更低，说灯下的事不该在灯下说。远处的魔渊安静了很久，像也在等她说下去。',
      },
    ],
    tags: ['partner', 'rahu', 'mo_ji'],
  },
  {
    id: 'event.longhan.mo_ji_name',
    eraId: 'era.longhan',
    kind: 'partner',
    title: '替你记住一个假名',
    summary: '墨姬递来一枚写着假名的竹牌，说魔渊里总得有一个名字可以被人叫。',
    body:
      '竹牌很旧，上面那个名字不是你，也不像任何一个你认识的人。墨姬说这是她替你选的：一个不会让魔渊起疑，也不会让三族追查的名字。\n\n“在魔渊里，真名是债，假名是门。”她说，“但门用久了也会变成债。你要先想好，让哪一个名字替你走进更深处。”\n\n她把竹牌翻过来。背面是空白的，留给你自己写。',
    pause: 'story',
    repeatable: false,
    dispatch: true,
    weight: 8,
    partnerId: 'partner.longhan.mo_ji',
    regionId: 'region.longhan.rahu_abyss',
    requirements: [
      {
        kind: 'flag',
        flag: 'longhan.mo_ji_lantern_seen',
        value: true,
      },
    ],
    onEnter: [
      {
        kind: 'setFlag',
        flag: 'longhan.mo_ji_name_seen',
        value: true,
      },
    ],
    choices: [
      {
        id: 'choice.longhan.mo_ji_name.use',
        text: '接受这个假名，把真名留在竹牌背面之外。',
        requirements: [],
        effects: [
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.mo_ji',
            delta: 1,
            reason: '接受了墨姬替你选的假名',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.mo_ji_name_choice',
            value: 'accepted',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.rahu_false_name',
            value: true,
          },
          {
            kind: 'grantItem',
            itemId: 'item.longhan.abyss_ink',
            count: 2,
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.mo_ji_debt',
            delayMonths: 3,
          },
        ],
        outcome:
          '你把竹牌收进袖中。墨姬看了你一会儿，说这个假名是她替自己留过的，后来没用上。她让你别问为什么。',
      },
      {
        id: 'choice.longhan.mo_ji_name.write',
        text: '在背面写上她的名字，让你替她走一次魔渊。',
        requirements: [],
        effects: [
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.mo_ji',
            delta: 1,
            reason: '在假名竹牌背面写下了墨姬的名字',
          },
          {
            kind: 'changeResource',
            resource: 'karma',
            amount: 2,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.mo_ji_name_choice',
            value: 'her_name',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.mo_ji_name',
            text: '你在竹牌背面写下墨姬的名字。她看了很久，说从没有人替她走过这条路。',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.mo_ji_debt',
            delayMonths: 2,
          },
        ],
        outcome:
          '墨姬把竹牌收回去时，指尖停了很久。她说名字写反了，应该写在正面；但她没有改。',
      },
      {
        id: 'choice.longhan.mo_ji_name.refuse',
        text: '不收假名，只把竹牌留在灯下。',
        requirements: [],
        effects: [
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.mo_ji',
            delta: 1,
            reason: '把假名竹牌留在了无光海的灯下',
          },
          {
            kind: 'changeRegionState',
            regionId: 'region.longhan.rahu_abyss',
            key: 'name_token',
            value: 'left_at_lantern',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.mo_ji_name_choice',
            value: 'left',
          },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.name_token',
            text: '无光海的灯下多了一枚空白竹牌。墨姬说那不是没人要，是还没决定要叫什么。',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.mo_ji_debt',
            delayMonths: 3,
          },
        ],
        outcome:
          '墨姬没有把竹牌收走。她说留着也好，灯下总得有点东西，才显得这里真的有人来过。',
      },
    ],
    tags: ['partner', 'rahu', 'mo_ji'],
  },
  {
    id: 'event.longhan.mo_ji_debt',
    eraId: 'era.longhan',
    kind: 'partner',
    title: '替她还一笔旧账',
    summary: '墨姬的旧账找到了门口。她说不必管，但也没有走开。',
    body:
      '无光海边来了一个不属于魔渊的债主。他没有脸，只拿着一张旧契，契上写着墨姬的名字与一笔很久以前的债。\n\n“不是我欠的。”墨姬说，“是上一个用这个名字的人欠的。魔渊的规矩是名字还在，账就还在。”\n\n债主不说话，只把旧契摊在灯下。你可以替她把这笔账清掉，也可以问她为什么一直不换名字。',
    pause: 'story',
    repeatable: false,
    dispatch: true,
    weight: 8,
    partnerId: 'partner.longhan.mo_ji',
    regionId: 'region.longhan.rahu_abyss',
    requirements: [
      {
        kind: 'flag',
        flag: 'longhan.mo_ji_name_seen',
        value: true,
      },
    ],
    onEnter: [],
    choices: [
      {
        id: 'choice.longhan.mo_ji_debt.pay',
        text: '替她把旧账清掉，不问这笔债原本属于谁。',
        requirements: [],
        effects: [
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.mo_ji',
            delta: 1,
            reason: '在无光海边替墨姬清掉了一笔不属于她的旧账',
          },
          {
            kind: 'changeResource',
            resource: 'spirit_stones',
            amount: -20,
          },
          {
            kind: 'changeResource',
            resource: 'karma',
            amount: 1,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.mo_ji_debt_choice',
            value: 'paid',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.mo_ji_bond',
            delayMonths: 2,
          },
        ],
        outcome:
          '旧契在灯下慢慢烧尽。墨姬看着灰落进海里，说这笔账其实早该有人来收；她只是没想好，该不该让来收的人空手回去。',
      },
      {
        id: 'choice.longhan.mo_ji_debt.ask',
        text: '先问清楚这笔债的来处，再决定要不要还。',
        requirements: [],
        effects: [
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.mo_ji',
            delta: 1,
            reason: '没有急着替墨姬还债，而是先问清了来处',
          },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.mo_ji_debt',
            text: '墨姬的名字曾经属于另一个人。那个人欠下的债，至今还在无光海边等着被还。',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.mo_ji_debt_choice',
            value: 'asked',
          },
          {
            kind: 'grantItem',
            itemId: 'item.longhan.nameless_letter',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.mo_ji_bond',
            delayMonths: 3,
          },
        ],
        outcome:
          '债主最后只留下一张没有署名的信纸。墨姬说那是上一个名字留下的，里面的话她已经能背下来，只是一直没找到该寄给谁。',
      },
      {
        id: 'choice.longhan.mo_ji_debt.refuse',
        text: '不替她还，也不让她还；把债主留在灯下等到天亮。',
        requirements: [],
        effects: [
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.mo_ji',
            delta: 1,
            reason: '在无光海边陪墨姬把债主耗到了天亮',
          },
          {
            kind: 'changeResource',
            resource: 'karma',
            amount: 2,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.mo_ji_debt_choice',
            value: 'outlasted',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.mo_ji_debt',
            text: '你和墨姬在无光海边守到天亮。债主没有脸，也没有走；最后是魔渊先收回了那盏灯的光。',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.mo_ji_bond',
            delayMonths: 3,
          },
        ],
        outcome:
          '天亮时债主不见了，旧契还摊在灯下，上面的名字已经淡得看不清。墨姬把它折好收进袖中，只说了句：“下次不用陪我耗。”',
      },
    ],
    tags: ['partner', 'rahu', 'mo_ji'],
  },
  {
    id: 'event.longhan.mo_ji_bond',
    eraId: 'era.longhan',
    kind: 'partner',
    title: '两个不被记住的人',
    summary: '无光海边没有别人。墨姬说魔道结缘，只问一件事：你愿不愿意让我记住你的真名。',
    body:
      '灯已经灭了。墨姬坐在灯柱旁，手里没有竹牌，也没有笔。她说魔道里的结缘不能写在纸上，也不能让第三个人听见；只能一个人念，一个人记。\n\n“我可以替你记住真名。”她说，“这样即使整个洪荒都忘了你，至少还有一个地方能把你叫回来。代价是，我也会被你的名字绑住。”\n\n无光海很静。你可以先念，也可以让她先。',
    pause: 'story',
    repeatable: true,
    cooldownMonths: 6,
    weight: 6,
    partnerId: 'partner.longhan.mo_ji',
    regionId: 'region.longhan.rahu_abyss',
    requirements: [
      {
        kind: 'flag',
        flag: 'longhan.rahu_initiated',
        value: true,
      },
      {
        kind: 'partnerFavor',
        partnerId: 'partner.longhan.mo_ji',
        minTier: 2,
      },
      {
        kind: 'not',
        of: {
          kind: 'flag',
          flag: 'longhan.mo_ji_bonded',
          value: true,
        },
      },
    ],
    onEnter: [
      {
        kind: 'setFlag',
        flag: 'longhan.mo_ji_bond_offer',
        value: true,
      },
    ],
    choices: [
      {
        id: 'choice.longhan.mo_ji_bond.self_first',
        text: '先念自己的真名，让她替你记住。',
        requirements: [],
        effects: [
          {
            kind: 'bondPartner',
            partnerId: 'partner.longhan.mo_ji',
          },
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.mo_ji',
            delta: 1,
            reason: '在无光海边先把自己的真名交给了墨姬',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.mo_ji_bonded',
            value: true,
          },
          {
            kind: 'grantItem',
            itemId: 'item.longhan.abyss_needle',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.mo_ji_bond',
            text: '你在无光海边把真名念给墨姬听。她没有重复，只点了点头，说记住了。',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.mo_ji_dawn',
            delayMonths: 3,
          },
        ],
        outcome:
          '你念完很久，墨姬才开口复述了一遍，一字不差。她说从今往后，这个名字在魔渊里也有一个不会被抹掉的回处。',
      },
      {
        id: 'choice.longhan.mo_ji_bond.her_first',
        text: '请她先念真名。你想先记住她的。',
        requirements: [],
        effects: [
          {
            kind: 'bondPartner',
            partnerId: 'partner.longhan.mo_ji',
          },
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.mo_ji',
            delta: 1,
            reason: '在无光海边请墨姬先念出了她的真名',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.mo_ji_bonded',
            value: true,
          },
          {
            kind: 'grantItem',
            itemId: 'item.longhan.rahu_mask',
          },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.mo_ji_true_name',
            text: '没有人知道墨姬的真名。无光海边那一夜之后，魔渊里多了一个不能被随便念的名字。',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.mo_ji_dawn',
            delayMonths: 4,
          },
        ],
        outcome:
          '墨姬迟疑了很久才开口。那个名字很短，短到像只说了一半。你替她记住之后，她才轻轻松了一口气。',
      },
      {
        id: 'choice.longhan.mo_ji_bond.wait',
        text: '没有念，也没有让她念。你说再等等。',
        requirements: [],
        effects: [
          {
            kind: 'setFlag',
            flag: 'longhan.mo_ji_waiting',
            value: true,
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.mo_ji_wait',
            text: '你没有在无光海边念出名字。墨姬把熄灭的灯重新立好，说灯会等，她也会。',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.mo_ji_bond',
            delayMonths: 6,
          },
        ],
        outcome:
          '墨姬没有追问。她把灯柱上的灰擦了擦，说名字这种事急不得，念早了容易变成债。',
      },
    ],
    tags: ['partner', 'rahu', 'mo_ji', 'bond'],
  },
  {
    id: 'event.longhan.mo_ji_dawn',
    eraId: 'era.longhan',
    kind: 'partner',
    title: '无光海第一次天亮',
    summary: '无光海不会天亮。可这一夜，海面尽头出现了一线很淡的白。',
    body:
      '墨姬先看见的。她把你叫醒时，语气比平时快了一点，说无光海尽头不对。\n\n海面尽头有一线很淡的白，不像日出，更像某个被抹掉的地方重新露出边角。魔渊方向没有回声，连惯例的风都停了。\n\n“我在这里很久，从没见过。”墨姬说，“你觉得那是什么？”',
    pause: 'story',
    repeatable: false,
    dispatch: true,
    weight: 6,
    partnerId: 'partner.longhan.mo_ji',
    regionId: 'region.longhan.rahu_abyss',
    requirements: [
      {
        kind: 'flag',
        flag: 'longhan.mo_ji_bonded',
        value: true,
      },
    ],
    onEnter: [
      {
        kind: 'setFlag',
        flag: 'longhan.mo_ji_dawn_seen',
        value: true,
      },
    ],
    choices: [
      {
        id: 'choice.longhan.mo_ji_dawn.walk',
        text: '和她一起朝那线白光走，看看无光海尽头有什么。',
        requirements: [],
        effects: [
          {
            kind: 'learnTechnique',
            techniqueId: 'technique.longhan.empty_name',
          },
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.mo_ji',
            delta: 1,
            reason: '和无光海尽头的一线白光一起走到了天亮',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.mo_ji_dawn_choice',
            value: 'walked',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.mo_ji_dawn',
            text: '你和墨姬走到白光尽头。那里没有海，也没有岸，只有一小片正在重新想出名字的空白。',
          },
        ],
        outcome:
          '白光尽头是一小块还不属于任何地方的空白。墨姬伸手碰了碰，指尖没有消失。她说这地方也许可以留一个名字；你把自己刚学会的空名真解写在了那里。',
      },
      {
        id: 'choice.longhan.mo_ji_dawn.stay',
        text: '不走。和她留在灯下，看无光海自己决定要不要亮。',
        requirements: [],
        effects: [
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.mo_ji',
            delta: 1,
            reason: '和无光海一起等到了那线白光自行退去',
          },
          {
            kind: 'grantTreasure',
            treasureId: 'item.longhan.nameless_mirror',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.mo_ji_dawn_choice',
            value: 'stayed',
          },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.mo_ji_dawn',
            text: '无光海尽头曾出现过一线白光，又自己退去。墨姬说那不是天亮，是某个名字终于被想起来了。',
          },
        ],
        outcome:
          '白光亮了很久，最后自己退去。墨姬始终没有起身。她说有些东西不必追过去，能在这里看着它出现，已经比记住更难。',
      },
    ],
    tags: ['partner', 'rahu', 'mo_ji', 'after'],
  },
  {
    id: 'event.longhan.bai_ze_riddle',
    eraId: 'era.longhan',
    kind: 'partner',
    title: '荒原上的问答',
    summary: '一个自称白泽的旅人坐在枯骨上，问你：什么东西被所有人忘记之后，仍然存在。',
    body:
      '他坐在一根很高的枯骨上，脚边摊着一张画了一半的地图。地图上没有山，也没有水，只有许多彼此不相连的点。\n\n“先别问我是谁。”他说，“先回答：什么东西被所有人忘记之后，仍然存在？”\n\n风把地图的一角吹起来。你看见背面写着很多名字，最上面一个是空的。',
    pause: 'story',
    repeatable: false,
    dispatch: true,
    weight: 7,
    partnerId: 'partner.longhan.bai_ze',
    regionId: 'region.longhan.beast_waste',
    requirements: [
      {
        kind: 'flag',
        flag: 'longhan.nameless_letter_read',
        value: true,
      },
    ],
    onEnter: [
      {
        kind: 'setFlag',
        flag: 'longhan.bai_ze_riddle_seen',
        value: true,
      },
      {
        kind: 'addRumor',
        rumorId: 'rumor.longhan.bai_ze',
        text: '荒原上有一个自称白泽的旅人，逢人便问：被所有人忘记之后仍然存在的东西是什么。',
      },
    ],
    choices: [
      {
        id: 'choice.longhan.bai_ze_riddle.name',
        text: '回答“名字”。',
        requirements: [],
        effects: [
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.bai_ze',
            delta: 1,
            reason: '在荒原问答里回答了“名字”',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.bai_ze_riddle_choice',
            value: 'name',
          },
          {
            kind: 'grantItem',
            itemId: 'item.longhan.nameless_letter',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.bai_ze_map',
            delayMonths: 2,
          },
        ],
        outcome:
          '白泽笑了笑，说这是最常见的答案，也是最容易被推翻的。他把地图翻过来，在最上面的空白处替你写了一个很小的字。',
      },
      {
        id: 'choice.longhan.bai_ze_riddle.debt',
        text: '回答“欠下的东西”。',
        requirements: [],
        effects: [
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.bai_ze',
            delta: 1,
            reason: '在荒原问答里回答了“欠下的东西”',
          },
          {
            kind: 'changeResource',
            resource: 'karma',
            amount: 1,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.bai_ze_riddle_choice',
            value: 'debt',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.bai_ze_map',
            delayMonths: 3,
          },
        ],
        outcome:
          '白泽点头，说债比名字活得久，因为债不需要人记得也能自己长。他把地图上的一处点连向另一个点，说这两处之间有笔旧账。',
      },
      {
        id: 'choice.longhan.bai_ze_riddle.nothing',
        text: '回答“什么也不会留下”。',
        requirements: [],
        effects: [
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.bai_ze',
            delta: 1,
            reason: '在荒原问答里回答了“什么也不会留下”',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.bai_ze_nothing',
            text: '你告诉白泽，被忘记之后什么也不会留下。他看了你很久，说这答案比前两个都诚实，也更难被证明。',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.bai_ze_riddle_choice',
            value: 'nothing',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.bai_ze_map',
            delayMonths: 2,
          },
        ],
        outcome:
          '白泽没有笑，也没有反驳。他把地图收起来，说如果什么都不会留下，那这张图画给谁看就不重要了；可他还是画了一半。',
      },
    ],
    tags: ['partner', 'wanderer', 'bai_ze'],
  },
  {
    id: 'event.longhan.bai_ze_map',
    eraId: 'era.longhan',
    kind: 'partner',
    title: '一张不存在的路',
    summary: '白泽把那张点与点相连的地图铺开，说其中有一条路还不存在。',
    body:
      '地图上没有山河，只有几十个点。白泽用指尖把其中三个点连起来，说这条路目前不存在，但如果有人从这头走到那头，它就会开始存在。\n\n“地图不是用来找路的。”他说，“是用来替路先留一个位置。你愿意替哪一段先走一遍？”\n\n他指着三个方向：一处通向无光海，一处通向荒原深处，还有一处没有标点，只画了一个很小的圈。',
    pause: 'story',
    repeatable: false,
    dispatch: true,
    weight: 7,
    partnerId: 'partner.longhan.bai_ze',
    regionId: 'region.longhan.beast_waste',
    requirements: [
      {
        kind: 'flag',
        flag: 'longhan.bai_ze_riddle_seen',
        value: true,
      },
    ],
    onEnter: [
      {
        kind: 'setFlag',
        flag: 'longhan.bai_ze_map_seen',
        value: true,
      },
    ],
    choices: [
      {
        id: 'choice.longhan.bai_ze_map.abyss',
        text: '走通往无光海的那一段，把路画到魔渊门口为止。',
        requirements: [],
        effects: [
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.bai_ze',
            delta: 1,
            reason: '替白泽把地图上的路走到了无光海',
          },
          {
            kind: 'grantItem',
            itemId: 'item.longhan.abyss_ink',
          },
          {
            kind: 'changeRegionState',
            regionId: 'region.longhan.rahu_abyss',
            key: 'bai_ze_map',
            value: 'road_marked',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.bai_ze_map_choice',
            value: 'abyss',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.bai_ze_memory',
            delayMonths: 3,
          },
        ],
        outcome:
          '你把路画到无光海边就停了。白泽说停得对，再往前画，地图就会开始反过来记你。',
      },
      {
        id: 'choice.longhan.bai_ze_map.wilds',
        text: '走荒原深处那一段，把兽群迁徙的旧道补全。',
        requirements: [],
        effects: [
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.bai_ze',
            delta: 1,
            reason: '替白泽补全了荒原深处的旧道',
          },
          {
            kind: 'grantItem',
            itemId: 'item.longhan.beast_sinew',
            count: 2,
          },
          {
            kind: 'changeRegionState',
            regionId: 'region.longhan.beast_waste',
            key: 'bai_ze_map',
            value: 'old_road_marked',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.bai_ze_map_choice',
            value: 'wilds',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.bai_ze_memory',
            delayMonths: 2,
          },
        ],
        outcome:
          '旧道比地图上画的更绕。你走完回来时，白泽已经在地图上添了几处你路上没注意到的水点；他说那是兽群替你留下的。',
      },
      {
        id: 'choice.longhan.bai_ze_map.unknown',
        text: '走那个没有标点的小圈，看看它通向哪里。',
        requirements: [],
        effects: [
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.bai_ze',
            delta: 1,
            reason: '替白泽走进了地图上没有标点的那处小圈',
          },
          {
            kind: 'changeResource',
            resource: 'karma',
            amount: 2,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.bai_ze_map_choice',
            value: 'unknown',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.bai_ze_unknown_visited',
            value: true,
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.bai_ze_unknown',
            text: '你走进地图上没有标点的小圈。那里什么也没有，只有一张更旧的地图，上面画着同一处小圈。',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.bai_ze_memory',
            delayMonths: 3,
          },
        ],
        outcome:
          '小圈里没有路，只有一张被风沙埋了半截的旧地图，上面画着同一个位置。白泽在圈外等你，说这是地图唯一一次替自己画了路。',
      },
    ],
    tags: ['partner', 'wanderer', 'bai_ze'],
  },
  {
    id: 'event.longhan.bai_ze_memory',
    eraId: 'era.longhan',
    kind: 'partner',
    title: '白泽忘了自己的名字',
    summary: '白泽坐在路边，认真地问我叫什么。他记得天下所有异兽，却记不得自己。',
    body:
      '你找到他时，他正把地图铺在膝头，一遍遍念上面的名字。念到某一处时，他抬起头，很认真地问：“我是不是也该在这张图上？”\n\n他记得洪荒所有异兽的来处，记得哪条河改过道，甚至记得你腰间那件东西的旧主。唯独说到自己的名字时，他停了很久，然后笑了，说这问题今天问过很多人。\n\n“你记得我叫什么吗？”他问。',
    pause: 'story',
    repeatable: false,
    dispatch: true,
    weight: 7,
    partnerId: 'partner.longhan.bai_ze',
    regionId: 'region.longhan.honghuang_land',
    requirements: [
      {
        kind: 'flag',
        flag: 'longhan.bai_ze_map_seen',
        value: true,
      },
    ],
    onEnter: [
      {
        kind: 'setFlag',
        flag: 'longhan.bai_ze_memory_seen',
        value: true,
      },
    ],
    choices: [
      {
        id: 'choice.longhan.bai_ze_memory.tell',
        text: '告诉他：你叫白泽。',
        requirements: [],
        effects: [
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.bai_ze',
            delta: 1,
            reason: '在白泽忘记名字时替他回答了',
          },
          {
            kind: 'grantItem',
            itemId: 'item.longhan.old_bone_slip',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.bai_ze_memory_choice',
            value: 'told_name',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.bai_ze_bond',
            delayMonths: 2,
          },
        ],
        outcome:
          '白泽重复了一遍自己的名字，像在试一件很久没穿的衣服。然后他说谢谢，把地图上一处空白的点填成了“白泽”，又在旁边留了半个位置给你。',
      },
      {
        id: 'choice.longhan.bai_ze_memory.ask',
        text: '不急着回答，先问他记得的最后一个名字是谁。',
        requirements: [],
        effects: [
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.bai_ze',
            delta: 1,
            reason: '在白泽忘记自己时先问了他记得的最后一个名字',
          },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.bai_ze_last_name',
            text: '白泽记得的最后一个名字不属于任何异兽，而属于一个早已从洪荒消失的守灯人。',
          },
          {
            kind: 'changeResource',
            resource: 'karma',
            amount: 1,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.bai_ze_memory_choice',
            value: 'asked_last',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.bai_ze_bond',
            delayMonths: 3,
          },
        ],
        outcome:
          '白泽想了很久，说了一个不属于异兽的名字。他说那人曾替无光海守过一盏灯，后来灯灭了，名字也就没人再提。',
      },
      {
        id: 'choice.longhan.bai_ze_memory.write',
        text: '把他的名字写在他的地图背面。',
        requirements: [],
        effects: [
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.bai_ze',
            delta: 1,
            reason: '把白泽的名字写在了他自己地图的背面',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.bai_ze_memory_choice',
            value: 'wrote_name',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.nameless_letter_read',
            value: true,
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.bai_ze_name',
            text: '你把白泽的名字写在地图背面。他看了很久，说这样一来，地图就不只是画路了。',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.bai_ze_bond',
            delayMonths: 2,
          },
        ],
        outcome:
          '白泽把地图翻来覆去看了两遍，说背面写字容易透到正面。但他没有擦掉，只把地图折得更小心了。',
      },
    ],
    tags: ['partner', 'wanderer', 'bai_ze'],
  },
  {
    id: 'event.longhan.bai_ze_bond',
    eraId: 'era.longhan',
    kind: 'partner',
    title: '与知者同行',
    summary: '白泽说他要走一段没有目的地的路。他问你是否愿意同行，并在必要时替他记住名字。',
    body:
      '白泽把地图留在路边，只带了一支旧笔。他说这张图已经画得够满，再画下去会开始替路做主。\n\n“我记性不好。”他说，“不是忘东西，是忘自己。走得越远，越容易在某个岔口把自己弄丢。你愿意与我同行一段吗？不必到尽头，走到你该回去的地方就停。”\n\n他没有问你的名字，也没有提条件。风把地上的地图吹得翻了页。',
    pause: 'story',
    repeatable: true,
    cooldownMonths: 6,
    weight: 6,
    partnerId: 'partner.longhan.bai_ze',
    regionId: 'region.longhan.honghuang_land',
    requirements: [
      {
        kind: 'flag',
        flag: 'longhan.nameless_letter_read',
        value: true,
      },
      {
        kind: 'partnerFavor',
        partnerId: 'partner.longhan.bai_ze',
        minTier: 2,
      },
      {
        kind: 'not',
        of: {
          kind: 'flag',
          flag: 'longhan.bai_ze_bonded',
          value: true,
        },
      },
    ],
    onEnter: [
      {
        kind: 'setFlag',
        flag: 'longhan.bai_ze_bond_offer',
        value: true,
      },
    ],
    choices: [
      {
        id: 'choice.longhan.bai_ze_bond.accept',
        text: '与他同行，并答应在他忘记自己时替他回答。',
        requirements: [],
        effects: [
          {
            kind: 'bondPartner',
            partnerId: 'partner.longhan.bai_ze',
          },
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.bai_ze',
            delta: 1,
            reason: '答应与白泽同行，并替他保管名字',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.bai_ze_bonded',
            value: true,
          },
          {
            kind: 'grantTreasure',
            treasureId: 'item.longhan.nameless_mirror',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.bai_ze_bond',
            text: '你与白泽同行了一段没有目的地的路。他忘记自己名字时，你替他回答；你忘记来路时，他替你画了一张只有两个点的地图。',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.bai_ze_answer',
            delayMonths: 3,
          },
        ],
        outcome:
          '出发时白泽没有说去哪里。走到第一个岔口，他停下让你选；你说随便，他便笑着往左走，说这一路大概会走得很慢，但不会丢。',
      },
      {
        id: 'choice.longhan.bai_ze_bond.stay',
        text: '不同行，但替他把名字留在这张地图上。',
        requirements: [],
        effects: [
          {
            kind: 'bondPartner',
            partnerId: 'partner.longhan.bai_ze',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.bai_ze_bonded',
            value: true,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.bai_ze_bond_stayed',
            value: true,
          },
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.bai_ze',
            delta: 1,
            reason: '没有与白泽同行，却把他的名字留在了地图上',
          },
          {
            kind: 'grantItem',
            itemId: 'item.longhan.void_talisman',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.bai_ze_answer',
            delayMonths: 4,
          },
        ],
        outcome:
          '白泽把地图留给了你。他说不同行也好，地图需要有人守着；否则它画着画着，会忘记自己本来只是替路留位置。',
      },
      {
        id: 'choice.longhan.bai_ze_bond.wait',
        text: '请他再等一段路。你还有些地方必须先去。',
        requirements: [],
        effects: [
          {
            kind: 'setFlag',
            flag: 'longhan.bai_ze_waiting',
            value: true,
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.bai_ze_wait',
            text: '你没有立刻答应白泽。他把地图折好，说路会等，反正它现在还没有自己的方向。',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.bai_ze_bond',
            delayMonths: 6,
          },
        ],
        outcome:
          '白泽把旧笔收进袖中，说那就再等等。他走之前在地图角落添了一个点，说那是你该回来的地方。',
      },
    ],
    tags: ['partner', 'wanderer', 'bai_ze', 'bond'],
  },
  {
    id: 'event.longhan.bai_ze_answer',
    eraId: 'era.longhan',
    kind: 'partner',
    title: '他知道下一劫的名字',
    summary: '白泽在地图角落写下四个字，又立刻涂掉。他说下一劫的名字还不能被念。',
    body:
      '白泽在一处没有名字的岔口停下，用旧笔在地图角落写了四个字。你只来得及看清第一个，他就把那一角折了起来。\n\n“下一劫的名字还不能被念。”他说，“念早了，路会提前开始。”\n\n他把地图递给你，让你摸一摸折角。纸背很薄，能摸到那四个字凸起的痕迹，却认不出笔画。',
    pause: 'story',
    repeatable: false,
    dispatch: true,
    weight: 6,
    partnerId: 'partner.longhan.bai_ze',
    regionId: 'region.longhan.honghuang_land',
    requirements: [
      {
        kind: 'flag',
        flag: 'longhan.bai_ze_bonded',
        value: true,
      },
    ],
    onEnter: [
      {
        kind: 'setFlag',
        flag: 'longhan.bai_ze_answer_seen',
        value: true,
      },
    ],
    choices: [
      {
        id: 'choice.longhan.bai_ze_answer.listen',
        text: '不拆折角，只把纸背的凹痕记在心里。',
        requirements: [],
        effects: [
          {
            kind: 'changeDaoguo',
            amount: 2,
          },
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.bai_ze',
            delta: 1,
            reason: '没有拆开白泽折起的下一劫之名',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.bai_ze_answer_choice',
            value: 'kept_folded',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.bai_ze_answer',
            text: '你没有拆开地图折角，只记住了纸背四个凸起的痕迹。白泽说，等下一劫到来时，你会先想起其中一个字。',
          },
        ],
        outcome:
          '白泽看着你把地图收好，说这样最好。折角里的名字会在该出现的时候自己变清楚；提前知道的人，往往活不到那一天。',
      },
      {
        id: 'choice.longhan.bai_ze_answer.peek',
        text: '趁他不注意，把折角掀开一线。',
        requirements: [],
        effects: [
          {
            kind: 'changeResource',
            resource: 'karma',
            amount: 2,
          },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.next_era_name',
            text: '有人偷看过白泽地图上的下一劫之名，只看见一个字，此后每逢退潮都会听见有人在很远的地方念它。',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.bai_ze_answer_choice',
            value: 'peeked',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.next_era_omen_seen',
            value: true,
          },
          {
            kind: 'applyStatus',
            statusId: 'status.longhan.name_borrowed',
            months: 3,
            source: '下一劫之名',
          },
        ],
        outcome:
          '你只看见一个字。白泽没有回头，只把地图从你手里抽走，说看见一个字也够路开始长了。那天之后，你偶尔会在退潮时听见有人在很远的地方念它。',
      },
    ],
    tags: ['partner', 'wanderer', 'bai_ze', 'after'],
  },
]

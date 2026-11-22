import type { EventDefinition } from '@/types/content'

export const longhanHiddenEvents: EventDefinition[] = [
  {
    id: 'event.longhan.hidden_first_crack',
    eraId: 'era.longhan',
    kind: 'hidden',
    title: '不周山下的第一道裂纹',
    summary: '不周山脚的旧祭坛裂开一线。裂缝里没有风，只有一段被人反复念过的名字。',
    body:
      '祭坛很旧，旧到没有人记得它原本供奉什么。裂缝从坛心开始，一直延伸到山脚的阴影里，缝隙边缘光滑得像被什么反复摩挲过。\n\n你俯身时，听见裂缝里有声音在念一个名字，念得很慢，每念一遍就停一会儿，像在等有人应。\n\n山风绕开了这块地方。你可以应一声，也可以把裂缝记下来。',
    pause: 'story',
    repeatable: false,
    dispatch: true,
    weight: 4,
    regionId: 'region.longhan.buzhou_mountain',
    requirements: [
      {
        kind: 'flag',
        flag: 'longhan.rahu_whisper',
        value: true,
      },
      {
        kind: 'regionVisited',
        regionId: 'region.longhan.buzhou_mountain',
      },
    ],
    onEnter: [
      {
        kind: 'setFlag',
        flag: 'longhan.hidden_first_crack',
        value: true,
      },
      {
        kind: 'addRumor',
        rumorId: 'rumor.longhan.first_crack',
        text: '不周山脚的旧祭坛裂开了一线。靠近的人说，裂缝里有人在念一个还没有人应的名字。',
      },
    ],
    choices: [
      {
        id: 'choice.longhan.hidden_first_crack.answer',
        text: '应一声，看它会念出什么。',
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
            kind: 'addMemory',
            memoryId: 'memory.longhan.first_crack',
            text: '你在不周山脚的裂缝前应了一声。那声音停了很久，然后改念了另一个名字：你的。',
          },
          {
            kind: 'applyStatus',
            statusId: 'status.longhan.name_borrowed',
            months: 3,
            source: '不周山下的回应',
          },
        ],
        outcome:
          '你应声之后，裂缝里的声音停了。很久之后，它开始念另一个名字，念得很准确——你的名字。山风在这时第一次吹进祭坛。',
      },
      {
        id: 'choice.longhan.hidden_first_crack.seal',
        text: '用一块新石压住裂缝，不回应那个名字。',
        requirements: [],
        effects: [
          {
            kind: 'changeRegionState',
            regionId: 'region.longhan.buzhou_mountain',
            key: 'first_crack',
            value: 'sealed',
          },
          {
            kind: 'changeResource',
            resource: 'merit',
            amount: 2,
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.first_crack_sealed',
            text: '你用新石压住了不周山脚的裂缝。石头落下时，里面的声音没有停，只是变得很远。',
          },
        ],
        outcome:
          '新石压住裂缝后，声音并没有消失，只是远了一点，像从山腹深处继续往下念。你离开时，祭坛的影子比来时长了一截。',
      },
      {
        id: 'choice.longhan.hidden_first_crack.listen',
        text: '不应，也不封，只把念名的节奏记下来。',
        requirements: [],
        effects: [
          {
            kind: 'learnTechnique',
            techniqueId: 'technique.longhan.empty_name',
          },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.first_crack_rhythm',
            text: '有人记下了不周山脚裂缝里念名的节奏。那节奏和魔渊的潮声同一个拍子。',
          },
        ],
        outcome:
          '那个节奏很短，像一句被截断的口诀。你记下来后才发觉，它和魔渊的潮声是同一个拍子；念到第三遍时，裂缝里的声音停了。',
      },
    ],
    tags: ['hidden', 'buzhou', 'rahu'],
  },
  {
    id: 'event.longhan.hidden_zi_xiao_echo',
    eraId: 'era.longhan',
    kind: 'hidden',
    title: '紫霄宫外的回声',
    summary: '紫霄宫的门从未为谁开过。今日门外多了一串脚印，进去和出来的是同一双。',
    body:
      '宫门很高，门前没有阶，只有一层薄薄的云。云上有一串脚印，从远处来，走到门前，然后原路返回，没有第二步是朝里的。\n\n你走到脚印消失的地方时，宫里传来一声钟响，很轻，像在提醒你这里不该来。\n\n但门缝里确实有光，而且那光正在慢慢变暗。',
    pause: 'story',
    repeatable: false,
    dispatch: true,
    weight: 3,
    regionId: 'region.longhan.zi_xiao_palace',
    requirements: [
      {
        kind: 'regionVisited',
        regionId: 'region.longhan.zi_xiao_palace',
      },
      {
        kind: 'realm',
        minRealm: 'foundation',
      },
    ],
    onEnter: [
      {
        kind: 'setFlag',
        flag: 'longhan.hidden_zi_xiao_echo',
        value: true,
      },
    ],
    choices: [
      {
        id: 'choice.longhan.hidden_zi_xiao_echo.wait',
        text: '在门外等到宫里的光重新亮起。',
        requirements: [],
        effects: [
          {
            kind: 'changeDaoguo',
            amount: 3,
          },
          {
            kind: 'learnTechnique',
            techniqueId: 'technique.longhan.drift_script',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.zi_xiao_echo',
            text: '你在紫霄宫门外等到光重新亮起。门没有开，但有一段不属于你的记忆从门缝里飘出来，落在你手心里。',
          },
        ],
        outcome:
          '光重新亮起时，门缝里飘出一段很薄的、不属于你的记忆。它没有落入你识海，只在你掌心留下一道可以临摹的笔意。你后来照着它练成了一门字法。',
      },
      {
        id: 'choice.longhan.hidden_zi_xiao_echo.leave',
        text: '不叩门，沿那串脚印原路退回去。',
        requirements: [],
        effects: [
          {
            kind: 'changeResource',
            resource: 'merit',
            amount: 2,
          },
          {
            kind: 'changeResource',
            resource: 'karma',
            amount: -1,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.zi_xiao_retreated',
            value: true,
          },
        ],
        outcome:
          '你退到脚印消失的地方时，宫门里的钟又响了一声，比刚才近些。云上的脚印在你身后一个接一个淡去，最后连你来时的路也一起平了。',
      },
    ],
    tags: ['hidden', 'zi_xiao', 'immortal'],
  },
  {
    id: 'event.longhan.hidden_tide_below',
    eraId: 'era.longhan',
    kind: 'hidden',
    title: '潮底下的旧龙城',
    summary: '敖光带你潜入一处不在海图上的旧城。她说这里沉下去的时候，龙族还没有学会在岸上走路。',
    body:
      '旧城在海沟最深处，城墙上长满白色的珊瑚。敖光走在你前面，说这里沉下去的时候，龙族还没有学会在岸上走路。\n\n“城里的钟不响了。”她说，“但我每次来，都能听见有人在数潮历。”\n\n城门半开着。门内的水比外面冷，冷得像一直没有人走过。',
    pause: 'story',
    repeatable: false,
    dispatch: true,
    weight: 5,
    regionId: 'region.longhan.four_seas',
    requirements: [
      {
        kind: 'flag',
        flag: 'longhan.ao_guang_bonded',
        value: true,
      },
      {
        kind: 'realm',
        minRealm: 'foundation',
      },
    ],
    onEnter: [
      {
        kind: 'setFlag',
        flag: 'longhan.hidden_tide_below',
        value: true,
      },
      {
        kind: 'changeRegionState',
        regionId: 'region.longhan.four_seas',
        key: 'old_dragon_city',
        value: 'found',
      },
    ],
    choices: [
      {
        id: 'choice.longhan.hidden_tide_below.enter',
        text: '和她一起进城，找到那口还在数的钟。',
        requirements: [],
        effects: [
          {
            kind: 'grantItem',
            itemId: 'item.longhan.tidefan_blade',
            count: 1,
          },
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.ao_guang',
            delta: 1,
            reason: '在旧龙城里陪敖光找到了那口还在数数的钟',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.tide_below',
            text: '旧龙城的钟没有响，钟壁上却有新的水位线。敖光说那不是潮水留下的，是城里有什么东西还在按潮历过日子。',
          },
        ],
        outcome:
          '钟在城心，钟壁上有一圈很新的水位线，比城外高出半寸。敖光盯着它看了很久，说这不是潮水留下的。城里的东西还活在过去某一个潮历里。',
      },
      {
        id: 'choice.longhan.hidden_tide_below.seal',
        text: '不进城，帮她把半开的城门推回去。',
        requirements: [],
        effects: [
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.dragon',
            reputationDelta: 2,
          },
          {
            kind: 'grantItem',
            itemId: 'item.longhan.tide_silver',
            count: 2,
          },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.old_dragon_city',
            text: '四海海沟下有一座不在海图上的旧龙城。城门被人从外面推上了，门内仍有人按旧的潮历过日子。',
          },
        ],
        outcome:
          '城门很重，合上时几乎没有声音。敖光把手按在门上，说让它再沉一段时间也好，城里的人也许还没准备好看见外面的潮。',
      },
    ],
    tags: ['hidden', 'dragon', 'ao_guang'],
  },
  {
    id: 'event.longhan.hidden_last_ash',
    eraId: 'era.longhan',
    kind: 'hidden',
    title: '最后一捧不冷的灰',
    summary: '丹羽带你去看一捧烧了千年的灰。灰不冷，也不亮，只在有人靠近时轻轻动。',
    body:
      '灰在一个没有门的石室里，堆成很小的一堆。丹羽说这里原本是凤族最早的涅槃池，后来池干了，只剩这捧灰一直没有冷。\n\n“它不冷，是因为还有一件事没烧完。”她说，“我试过很多次，都没能让它烧尽。也许该由别人来试。”\n\n你靠近时，灰的表面轻轻凹陷了一下，像有人从里面抬起头。',
    pause: 'story',
    repeatable: false,
    dispatch: true,
    weight: 5,
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
        flag: 'longhan.hidden_last_ash',
        value: true,
      },
    ],
    choices: [
      {
        id: 'choice.longhan.hidden_last_ash.finish',
        text: '把手伸进灰里，替她把那件没烧完的事烧完。',
        requirements: [],
        effects: [
          {
            kind: 'grantTreasure',
            treasureId: 'item.longhan.nirvana_lamp',
          },
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.dan_yu',
            delta: 1,
            reason: '替丹羽烧完了石室里那件一直没烧尽的事',
          },
          {
            kind: 'changeResource',
            resource: 'karma',
            amount: 2,
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.last_ash',
            text: '你把手伸进灰里。灰没有烫伤你，只让你看见一个极短的画面：有人在这间石室里等着涅槃，却始终没有点火。',
          },
        ],
        outcome:
          '灰在你掌心烧尽时，石室里亮了一瞬。你看见一个极短的画面：有人在这里等着涅槃，却始终没能下定决心点火。丹羽低声说，那是她的师父。',
      },
      {
        id: 'choice.longhan.hidden_last_ash.keep',
        text: '不烧，把灰重新拢好，让丹羽自己决定。',
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
            reason: '没有替丹羽烧掉最后那捧灰',
          },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.last_ash',
            text: '不死火山深处有一捧千年不冷的灰。凤族的丹羽每年都会去看一次，却从不点火。',
          },
        ],
        outcome:
          '丹羽看着你把灰拢回原样，很久没有说话。离开石室前，她朝灰堆行了一个很轻的礼，像在向一个还没走的人告别。',
      },
    ],
    tags: ['hidden', 'phoenix', 'dan_yu'],
  },
]

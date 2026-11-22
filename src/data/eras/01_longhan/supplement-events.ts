import type { EventDefinition } from '@/types/content'

/**
 * 龙汉补遗：紫霄宫的道音入口、龙庭巡海使的旧案，以及两场此前缺失的
 * 晋升场景。它们都从既有伏笔长出来，不另起一条与正文无关的支线。
 */
export const longhanSupplementEvents: EventDefinition[] = [
  {
    id: 'event.longhan.dao_bell_under_pillar',
    eraId: 'era.longhan',
    kind: 'world',
    title: '山腹里的钟',
    summary: '不周山腹传来一声钟响。守山的老头说，这山没有钟。',
    body:
      '你在天柱残痕下歇脚，听见山腹里有一声钟响。那声音很沉，响到一半停住，像有人在里面按住钟沿。\n\n守山的老头还坐在那块大石头上编草鞋。他头也不抬：“别找了，山上没有钟。”\n\n“那这是什么？”\n\n“是宫里的钟漏了一声。”他把一根草绳咬断，“你要是真想听，就在山根下等着。它敲第三遍之前，别往上走。走早了，听见的就不是钟了。”',
    pause: 'ambient',
    repeatable: false,
    dispatch: true,
    weight: 6,
    regionId: 'region.longhan.buzhou_mountain',
    requirements: [
      {
        kind: 'regionVisited',
        regionId: 'region.longhan.buzhou_mountain',
      },
      {
        kind: 'realm',
        minRealm: 'foundation',
        minStage: 2,
      },
      {
        kind: 'flag',
        flag: 'longhan.rahu_whisper',
        value: true,
      },
    ],
    onEnter: [
      {
        kind: 'setFlag',
        flag: 'longhan.dao_bell_under_pillar_seen',
        value: true,
      },
      {
        kind: 'addRumor',
        rumorId: 'rumor.longhan.dao_bell_under_pillar',
        text: '不周山腹里有钟声，响到一半就停。守山的老头说，那不是山在响，是山上的宫漏了一声。',
      },
    ],
    choices: [
      {
        id: 'choice.longhan.dao_bell_under_pillar.wait',
        text: '在山根下坐到第三遍钟响。',
        requirements: [],
        effects: [
          {
            kind: 'setFlag',
            flag: 'longhan.dao_bell_heard',
            value: true,
          },
          {
            kind: 'gainCultivation',
            amount: 45,
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.dao_bell_heard',
            text: '你在不周山根下等到第三遍钟响。老头把一双新编的草鞋放在你旁边，说：“上去吧。走到没路的地方，别敲门，先听。”',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.dao_bell_climb',
            delayMonths: 3,
          },
        ],
        outcome:
          '第三遍钟响时，山道上的云忽然低了一截。老头把一双新编的草鞋放在你旁边，鞋底朝上：“穿着走。山上石头认鞋，不认人。”等你再抬头，他已经接着编下一双了。',
      },
      {
        id: 'choice.longhan.dao_bell_under_pillar.knock',
        text: '敲一敲山壁，问它为什么只响一半。',
        requirements: [],
        effects: [
          {
            kind: 'grantItem',
            itemId: 'item.longhan.pillar_dust',
            count: 2,
          },
          {
            kind: 'changeResource',
            resource: 'karma',
            amount: 1,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.dao_bell_knocked',
            value: true,
          },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.dao_bell_knocked',
            text: '有人在 不周山壁上敲了三下。石缝里落出一撮温热的石屑，山腹里的钟声从此多了一个空拍。',
          },
        ],
        outcome:
          '你敲了三下。山没有塌，只从石缝里落出一撮温热的石屑，落在掌心里像一捧很轻的雷声。老头看了一眼，说：“它记住你敲过了。下次钟响，你别答应。”',
      },
      {
        id: 'choice.longhan.dao_bell_under_pillar.tidy',
        text: '什么也不问，替老头把散开的草鞋一双双摆好。',
        requirements: [],
        effects: [
          {
            kind: 'changeResource',
            resource: 'merit',
            amount: 2,
          },
          {
            kind: 'applyStatus',
            statusId: 'status.longhan.clear_mind',
            months: 4,
            source: '不周山根下',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.dao_bell_tidy',
            text: '你把老头散开的草鞋一双双摆好，按鞋底朝向分了类。他没道谢，只在你走时说：“山上不缺人听，缺人记得把路收拾干净。”',
          },
        ],
        outcome:
          '你把草鞋按鞋底朝向摆了四排。老头看了一会儿，忽然说：“你比刚才那个听见钟声的人强。那个人只顾着听，没顾着看脚下。”山腹里的钟又响了半声，这次没有停。',
      },
    ],
    tags: ['world', 'buzhou', 'dao'],
  },
  {
    id: 'event.longhan.dao_bell_climb',
    eraId: 'era.longhan',
    kind: 'hidden',
    title: '第三遍钟声',
    summary: '钟声把你引到没有路的地方。石阶尽头，宫门并没有锁。',
    body:
      '你沿着山道往上走。走到云层里时，脚边的石阶忽然多出一级，又一级；再抬头，前面已经没有路了，只有一座很高的旧宫。\n\n宫门前没有阶，只有一层薄薄的云。云里立着九十九级看不见的石阶，每一级都比前一级更冷。\n\n门里有人问：“上山的人，带什么来换？”\n\n你想起草鞋老头的话：别敲门，先听。',
    pause: 'story',
    repeatable: false,
    regionId: 'region.longhan.buzhou_mountain',
    requirements: [
      {
        kind: 'flag',
        flag: 'longhan.dao_bell_heard',
        value: true,
      },
      {
        kind: 'realm',
        minRealm: 'foundation',
        minStage: 2,
      },
    ],
    onEnter: [
      {
        kind: 'setFlag',
        flag: 'longhan.dao_bell_climbed',
        value: true,
      },
    ],
    choices: [
      {
        id: 'choice.longhan.dao_bell_climb.tide',
        text: '把一路听见的潮声说给它听。',
        requirements: [],
        effects: [
          {
            kind: 'setFlag',
            flag: 'longhan.heard_dao',
            value: true,
          },
          {
            kind: 'unlockRegion',
            regionId: 'region.longhan.zi_xiao_palace',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.dao_bell_answered',
            value: 'tide',
          },
          {
            kind: 'gainCultivation',
            amount: 100,
          },
          {
            kind: 'changeDaoguo',
            amount: 1,
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.dao_bell_tide',
            text: '你在紫霄宫门前把一路听见的潮声说了一遍。门里安静了很久，然后钟自己响了第四遍，宫门开了一线。',
          },
        ],
        outcome:
          '你把四海退潮、火山灰落、地脉翻身的声音一样样说给它听。门里没有打断，也没有夸你。说到最后，钟自己响了第四遍。宫门开了一线，石阶上多出一双脚印，鞋底朝里。',
      },
      {
        id: 'choice.longhan.dao_bell_climb.earth',
        text: '什么也不说，把山根下带来的一捧土放在阶前。',
        requirements: [],
        effects: [
          {
            kind: 'setFlag',
            flag: 'longhan.heard_dao',
            value: true,
          },
          {
            kind: 'unlockRegion',
            regionId: 'region.longhan.zi_xiao_palace',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.dao_bell_answered',
            value: 'earth',
          },
          {
            kind: 'changeResource',
            resource: 'merit',
            amount: 3,
          },
          {
            kind: 'gainFoundation',
            stats: { spirit: 1 },
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.dao_bell_earth',
            text: '你在紫霄宫阶前放下一捧从山根带来的土。土没有散。门里有人说：“记得带土来的人，通常也记得回去。”',
          },
        ],
        outcome:
          '土落在阶上，没有散开，也没有陷进云里。门里有人说：“记得带土来的人，通常也记得回去。”宫门开时，你听见里面有很多人在很远的地方呼吸，像一座山睡熟了。',
      },
      {
        id: 'choice.longhan.dao_bell_climb.wait',
        text: '不答，坐在阶下等门自己开。',
        requirements: [],
        effects: [
          {
            kind: 'setFlag',
            flag: 'longhan.heard_dao',
            value: true,
          },
          {
            kind: 'unlockRegion',
            regionId: 'region.longhan.zi_xiao_palace',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.dao_bell_answered',
            value: 'waited',
          },
          {
            kind: 'applyStatus',
            statusId: 'status.longhan.quiet_room',
            months: 8,
            source: '紫霄宫门外',
          },
          {
            kind: 'changeResource',
            resource: 'merit',
            amount: 2,
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.dao_bell_waited',
            text: '你在紫霄宫阶下坐了很久，没有答门里那句话。门最后自己开了。走进去时，你发现自己的呼吸已经和钟声停在同一个拍子上。',
          },
        ],
        outcome:
          '你在阶下坐了很久。门里那句话一直没有再问，钟也没有再响。等到云从脚边漫过去时，宫门自己开了一条缝。你站起来，发现自己的呼吸已经和钟声停在同一个拍子上。',
      },
    ],
    tags: ['hidden', 'buzhou', 'zi_xiao', 'dao'],
  },
  {
    id: 'event.longhan.dao_bell_echo',
    eraId: 'era.longhan',
    kind: 'hidden',
    title: '钟声之后',
    summary: '紫霄宫里的钟又响了一次。这次没有回声。',
    body:
      '殿里没有钟。你抬头看了很久，才在梁上看见一根很细的绳，绳头垂着，下面什么也没有。\n\n钟声第二次响起时，殿里的灰同时浮了一下，又落回原处。最靠里的那只蒲团还是温的。\n\n有个声音问：“你从山下带来什么？”\n\n它没有问你是谁，也没有问你为什么来。',
    pause: 'ambient',
    repeatable: false,
    dispatch: true,
    weight: 7,
    regionId: 'region.longhan.zi_xiao_palace',
    requirements: [
      {
        kind: 'flag',
        flag: 'longhan.heard_dao',
        value: true,
      },
      {
        kind: 'regionVisited',
        regionId: 'region.longhan.zi_xiao_palace',
      },
    ],
    onEnter: [
      {
        kind: 'setFlag',
        flag: 'longhan.dao_bell_echo_seen',
        value: true,
      },
    ],
    choices: [
      {
        id: 'choice.longhan.dao_bell_echo.speak',
        text: '把一路听见的潮声、火声、地脉声，一样样说给它听。',
        requirements: [],
        effects: [
          {
            kind: 'learnTechnique',
            techniqueId: 'technique.longhan.palace_bell',
          },
          {
            kind: 'changeDaoguo',
            amount: 1,
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.dao_bell_speak',
            text: '你在紫霄宫里把一路听见的声音说了一遍。说完时，梁上那根空绳自己动了一下。你伸手接住一粒落下来的灰，发现它是一小段可以念出来的声音。',
          },
        ],
        outcome:
          '你说完最后一声地脉低鸣，梁上的空绳自己动了一下。没有钟舌，却有一粒灰从绳头落下来，正落在你掌心里。它很轻，念出来时却像有一口钟在肋骨里面响。',
      },
      {
        id: 'choice.longhan.dao_bell_echo.soil',
        text: '把从山下带来的那捧土放在空蒲团前。',
        requirements: [],
        effects: [
          {
            kind: 'changeResource',
            resource: 'merit',
            amount: 4,
          },
          {
            kind: 'gainFoundation',
            stats: { spirit: 2 },
          },
          {
            kind: 'applyStatus',
            statusId: 'status.longhan.quiet_room',
            months: 6,
            source: '紫霄宫空席',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.dao_bell_soil',
            text: '你在紫霄宫的空蒲团前放下一捧土。殿里所有的灰都往土上落，落成很小的一座山。那个声音说：“留在这儿吧。下次有人来，会知道这里曾经有人坐过。”',
          },
        ],
        outcome:
          '土落在蒲团前。殿里的灰没有散，反而一层层往土上落，最后堆成很小的一座山。那个声音没有再问什么。你走出殿门时，背后的蒲团终于凉了。',
      },
      {
        id: 'choice.longhan.dao_bell_echo.ask',
        text: '问它：下一劫来的时候，紫霄宫还开不开？',
        requirements: [],
        effects: [
          {
            kind: 'changeDaoguo',
            amount: 2,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.dao_next_era_asked',
            value: true,
          },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.dao_next_era',
            text: '有人在紫霄宫里问下一劫的事。宫里只回了一句：门一直开着，下一次来的人，未必还是你。',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.dao_next_era',
            text: '你问紫霄宫下一劫还开不开。钟响了一下，那个声音说：“门一直开着。下一次，来的人未必还是你。”',
          },
        ],
        outcome:
          '钟响了一下，比前两次都短。那个声音说：“门一直开着。下一次，来的人未必还是你。”你还想再问，殿里的灰已经重新落定，梁上的空绳也不再动了。',
      },
    ],
    tags: ['hidden', 'zi_xiao', 'dao', 'next_era'],
  },
  {
    id: 'event.longhan.dragon_trial_current',
    eraId: 'era.longhan',
    kind: 'faction',
    title: '巡海一季',
    summary: '龙将的试炼不看杀了几头凶兽，只看你带回来的失物有没有主。',
    body:
      '你独自巡了一季海。回龙庭时，甲板上摆着三样东西：一把断齿的木梳，一块刻着半个人名的旧石，还有一截被潮水泡软的海图。\n\n引路的龙将没有问你在海上遇到了什么，只问：“哪一样不属于四海？”\n\n三样东西都从海里捞上来。你看着他，他也看着你，没有催。',
    pause: 'story',
    repeatable: false,
    factionId: 'faction.longhan.dragon',
    regionId: 'region.longhan.four_seas',
    requirements: [
      {
        kind: 'factionMembership',
        factionId: 'faction.longhan.dragon',
        rankAtLeast: 2,
      },
    ],
    onEnter: [
      {
        kind: 'setFlag',
        flag: 'longhan.dragon_trial_current_seen',
        value: true,
      },
    ],
    choices: [
      {
        id: 'choice.longhan.dragon_trial_current.comb',
        text: '带回断梳，先找到它原来的主人。',
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
            contributionDelta: 8,
            reputationDelta: 2,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.dragon_trial_current_passed',
            value: 'owner_found',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.dragon_trial_current_comb',
            text: '你把断梳送回岸上一个老妇手里。她说那是她男人出海前落下的，已经三十年没有人替她带回来。',
          },
        ],
        outcome:
          '你花了两天找到断梳的主人。老妇接过梳子，没有哭，只把它插回发间，说：“他还知道回来。”龙将听完回报，把巡海册往前翻了一页。',
      },
      {
        id: 'choice.longhan.dragon_trial_current.stone',
        text: '带回刻名的旧石，把那个名字念给龙庭听。',
        requirements: [],
        effects: [
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.dragon',
            contributionDelta: 6,
            reputationDelta: 3,
          },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.dragon_trial_stone',
            text: '巡海试炼里有人带回一块刻着半个名字的旧石。龙庭查遍旧册，没有找到另外半个。',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.dragon_trial_current_passed',
            value: 'name_spoken',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.dragon_trial_current_stone',
            text: '你在龙庭上念出那块旧石上的半个名字。没有人应答，但巡海册里有一页自己翻了过去。',
          },
        ],
        outcome:
          '你念完那个名字，殿里没有人应答。引路的龙将沉默了一会儿，说：“记住了。龙庭不替人补名字，但会替人留一页。”',
      },
      {
        id: 'choice.longhan.dragon_trial_current.map',
        text: '什么也不带，只交回一季的潮位记录。',
        requirements: [],
        effects: [
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.dragon',
            contributionDelta: 10,
            reputationDelta: 1,
          },
          {
            kind: 'changeResource',
            resource: 'spirit_stones',
            amount: 20,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.dragon_trial_current_passed',
            value: 'tide_record',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.dragon_trial_current_map',
            text: '你交回一季的潮位记录。龙将翻到最后，说：“这次没有失物。很好，说明这一季的潮路是干净的。”',
          },
        ],
        outcome:
          '记录里没有失物，也没有遇袭。龙将一页页翻完，最后说：“巡海不是每次都要捡东西回来。潮路干净，也算一季。”他让人把记录抄进了巡海册最前面。',
      },
    ],
    tags: ['faction', 'dragon', 'trial'],
  },
  {
    id: 'event.longhan.dragon_elder_scene',
    eraId: 'era.longhan',
    kind: 'faction',
    title: '潮眼之后',
    summary: '内斗止住之后，龙庭要你替那一夜写一份不偏任何一方的记录。',
    body:
      '潮眼旁的石案上摊着巡海册。两位龙族将领的名字都在上面：一个活了下来，一个被潮水带走。\n\n“按规矩，只记活下来的那个。”引路的龙将说。\n\n他停了一下，又把笔推过来：“可你当时在场。你觉得该怎么写，就怎么写。写完了，这本册子以后归你看。”',
    pause: 'story',
    repeatable: false,
    factionId: 'faction.longhan.dragon',
    regionId: 'region.longhan.four_seas',
    requirements: [
      {
        kind: 'factionMembership',
        factionId: 'faction.longhan.dragon',
        rankAtLeast: 3,
      },
      {
        kind: 'flag',
        flag: 'longhan.dragon_inner_strife_quelled',
        value: true,
      },
    ],
    onEnter: [
      {
        kind: 'setFlag',
        flag: 'longhan.dragon_elder_scene_seen',
        value: true,
      },
    ],
    choices: [
      {
        id: 'choice.longhan.dragon_elder_scene.both',
        text: '把两个名字都写上去，不写谁先动手。',
        requirements: [],
        effects: [
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.dragon',
            contributionDelta: 12,
            reputationDelta: 4,
          },
          {
            kind: 'changeRegionState',
            regionId: 'region.longhan.four_seas',
            key: 'elder_record',
            value: 'both_names',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.dragon_elder_record',
            value: 'both',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.dragon_elder_both',
            text: '你在巡海册上写下两个名字，没有写谁先动手。龙将看完，把册子交给了你。',
          },
        ],
        outcome:
          '两个名字并排落在册上。龙将看了很久，说：“龙庭记仇，也记事。你两样都写了。”他把册子合上，推到你面前，没有再多说一句。',
      },
      {
        id: 'choice.longhan.dragon_elder_scene.living',
        text: '只写活下来的那个，让死者留在潮里。',
        requirements: [],
        effects: [
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.dragon',
            contributionDelta: 8,
            reputationDelta: 2,
          },
          {
            kind: 'changeResource',
            resource: 'karma',
            amount: 2,
          },
          {
            kind: 'changeRegionState',
            regionId: 'region.longhan.four_seas',
            key: 'elder_record',
            value: 'living_only',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.dragon_elder_record',
            value: 'living',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.dragon_elder_living',
            text: '巡海册上只留下了活下来那个人的名字。你合上册子时，潮眼里有一声很长的水响。',
          },
        ],
        outcome:
          '你只写了活下来的名字。龙将点头，说这最合规矩。你合上册子时，潮眼里传来一声很长的水响，像有人在水底翻了一页，又把它按了回去。',
      },
      {
        id: 'choice.longhan.dragon_elder_scene.blank',
        text: '空着那一页，把它交给下一任长老。',
        requirements: [],
        effects: [
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.dragon',
            contributionDelta: 6,
            reputationDelta: 3,
          },
          {
            kind: 'changeResource',
            resource: 'merit',
            amount: 3,
          },
          {
            kind: 'changeRegionState',
            regionId: 'region.longhan.four_seas',
            key: 'elder_record',
            value: 'blank',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.dragon_elder_record',
            value: 'blank',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.dragon_elder_blank',
            text: '你把那一页空着，只写下日期。龙将问为什么，你说：“下一任长老会知道该问谁。”',
          },
        ],
        outcome:
          '你在页角只写了那一夜的潮位，名字一个也没落。龙将问你为什么，你说：“下一任长老会知道该问谁。”他看了你一会儿，把笔收了回去。',
      },
    ],
    tags: ['faction', 'dragon', 'elder'],
  },
  {
    id: 'event.longhan.dragon_envoy_lead',
    eraId: 'era.longhan',
    kind: 'faction',
    title: '退潮后的暗水道',
    summary: '巡海册上被潮气抹去的名字，最后一次出现在旧宫后方。退潮时，那里多了一道门。',
    body:
      '旧宫后方的暗水道只在退潮最深处露出来。珊瑚台阶一直往下，尽头是一扇被新石封过的门。封石上潮纹还新，像是不久前才有人来过。\n\n守门的龙卒说，那位巡海使失踪后，龙庭从外面封了水道。“里面的东西，龙庭不查，也不许别人查。”\n\n他说完侧了侧身，没有拦你：“你要进，就趁现在。下一次退潮，未必还认得这扇门。”',
    pause: 'story',
    repeatable: false,
    dispatch: true,
    weight: 6,
    factionId: 'faction.longhan.dragon',
    regionId: 'region.longhan.four_seas',
    requirements: [
      {
        kind: 'factionMembership',
        factionId: 'faction.longhan.dragon',
        rankAtLeast: 1,
      },
      {
        kind: 'flag',
        flag: 'longhan.missing_tide_envoy',
        value: true,
      },
    ],
    onEnter: [
      {
        kind: 'setFlag',
        flag: 'longhan.envoy_lead_seen',
        value: true,
      },
      {
        kind: 'addRumor',
        rumorId: 'rumor.longhan.envoy_channel',
        text: '旧宫后方退潮时露出一条暗水道。守门的龙卒说，里面封着一位没有回来的巡海使。',
      },
    ],
    choices: [
      {
        id: 'choice.longhan.dragon_envoy_lead.enter',
        text: '现在进去。名字留在册上，总得有人去找。',
        requirements: [],
        effects: [
          {
            kind: 'setFlag',
            flag: 'longhan.envoy_channel_entered',
            value: true,
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.envoy_entered',
            text: '你在退潮最深处进了旧宫后的暗水道。封石从里面被推开时，你听见一声很轻的铜铃响。',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.dragon_envoy_remains',
            delayMonths: 1,
          },
        ],
        outcome:
          '封石比看上去轻。你从侧面一推，它就向里倒了，露出后面一段干燥的台阶。水道里没有水，只有很淡的盐味，和一声像铜铃又像水滴的响。',
      },
      {
        id: 'choice.longhan.dragon_envoy_lead.report',
        text: '先回龙庭报一声，再带两个人来。',
        requirements: [],
        effects: [
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.dragon',
            contributionDelta: 6,
            reputationDelta: 2,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.envoy_channel_reported',
            value: true,
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.envoy_reported',
            text: '你把暗水道的事报回龙庭。没有人愿意和你一起下去，但守门的龙卒替你多留了一盏灯。',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.dragon_envoy_remains',
            delayMonths: 2,
          },
        ],
        outcome:
          '龙庭里没有人愿意同去。引路的龙将听完，只批了一句“自往自还”，又让守门龙卒替你多备一盏灯。你再回到水道时，封石已经被人从里面推开了一线。',
      },
      {
        id: 'choice.longhan.dragon_envoy_lead.seal',
        text: '用新石把水道封回去。有些名字，不该再被潮水翻出来。',
        requirements: [],
        effects: [
          {
            kind: 'changeRegionState',
            regionId: 'region.longhan.four_seas',
            key: 'envoy_channel',
            value: 'sealed',
          },
          {
            kind: 'changeResource',
            resource: 'merit',
            amount: 3,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.envoy_channel_sealed',
            value: true,
          },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.envoy_sealed',
            text: '旧宫后方的暗水道被重新封上了。封石比原来厚了一层，谁也不知道下面还压着谁的名字。',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.envoy_sealed',
            text: '你没有进去，只把封石重新推回去，又在外面加了一层。石缝合上时，里面那声铜铃正好停了。',
          },
        ],
        outcome:
          '你把封石推回原处，又从旁边搬来一块更厚的。石缝合上时，里面那声铜铃正好停了。守门龙卒什么也没问，只在册子上把这一页又抹了一遍。',
      },
    ],
    tags: ['faction', 'dragon', 'envoy'],
  },
  {
    id: 'event.longhan.dragon_envoy_remains',
    eraId: 'era.longhan',
    kind: 'faction',
    title: '旧宫后的干室',
    summary: '暗水道尽头是一间没有水的石室。巡海使坐在里面，像还在等下一次退潮。',
    body:
      '石室很干，干得不像在海底。巡海使靠在墙上，甲片已经和石壁长在一起。他手里握着一枚很小的铜铃，膝上摊着巡海册的散页。\n\n你走过去时，铜铃自己响了一声。册页上有一个名字被整齐地割掉了，只剩下前后两个潮位。\n\n石室门内侧有新石封过的痕迹。有人从外面封过门，又从里面把它推开；推开之后，就再也没有出去。',
    pause: 'story',
    repeatable: false,
    factionId: 'faction.longhan.dragon',
    regionId: 'region.longhan.four_seas',
    requirements: [
      {
        kind: 'factionMembership',
        factionId: 'faction.longhan.dragon',
        rankAtLeast: 1,
      },
      {
        kind: 'any',
        of: [
          {
            kind: 'flag',
            flag: 'longhan.envoy_channel_entered',
            value: true,
          },
          {
            kind: 'flag',
            flag: 'longhan.envoy_channel_reported',
            value: true,
          },
        ],
      },
    ],
    onEnter: [
      {
        kind: 'setFlag',
        flag: 'longhan.envoy_remains_seen',
        value: true,
      },
    ],
    choices: [
      {
        id: 'choice.longhan.dragon_envoy_remains.name',
        text: '把被割掉的名字从册页背面抄下来，带回去。',
        requirements: [],
        effects: [
          {
            kind: 'setFlag',
            flag: 'longhan.envoy_name_returned',
            value: true,
          },
          {
            kind: 'changeResource',
            resource: 'karma',
            amount: 1,
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.envoy_name',
            text: '你从册页背面拓下了那个被割掉的名字。墨很淡，但足够认。铜铃在你起身时又响了一声。',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.dragon_envoy_return',
            delayMonths: 2,
          },
        ],
        outcome:
          '名字是从背面透过来的。你把册页举到灯下，一笔一划拓下来；每拓一笔，铜铃就轻响一次。拓完最后一个字，石室里忽然有了很轻的潮声，像外面正在涨潮。',
      },
      {
        id: 'choice.longhan.dragon_envoy_remains.bell',
        text: '只取走那枚潮铃，不碰名字。',
        requirements: [],
        effects: [
          {
            kind: 'grantTreasure',
            treasureId: 'item.longhan.envoy_bell',
          },
          {
            kind: 'changeResource',
            resource: 'karma',
            amount: 2,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.envoy_bell_taken',
            value: true,
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.envoy_bell',
            text: '你从巡海使手里取走铜铃，没有碰那页被割掉的名字。铃离手时，他的手指松开了一瞬，又慢慢合上。',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.dragon_envoy_return',
            delayMonths: 2,
          },
        ],
        outcome:
          '铜铃很凉，铃舌却没有锈。你把它收进袖中时，巡海使的手指松开了一瞬，又慢慢合上。册页上的名字你没有动，那个空缺留在原处，像一扇没有关严的门。',
      },
      {
        id: 'choice.longhan.dragon_envoy_remains.seal',
        text: '把册子和铃留在原处，从外面把门重新封好。',
        requirements: [],
        effects: [
          {
            kind: 'changeRegionState',
            regionId: 'region.longhan.four_seas',
            key: 'envoy_remains',
            value: 'sealed',
          },
          {
            kind: 'changeResource',
            resource: 'merit',
            amount: 4,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.envoy_channel_sealed',
            value: true,
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.envoy_remains_sealed',
            text: '你把巡海使的册页和铜铃都留在原处，从外面重新封了门。离开时，石室里没有声音，像他终于肯睡了。',
          },
        ],
        outcome:
          '你把册页按回他膝上，铜铃塞回他手里。门从外面合上时，里面没有响。你一路退到暗水道出口，才发现自己一直没有听见潮声。',
      },
    ],
    tags: ['faction', 'dragon', 'envoy'],
  },
  {
    id: 'event.longhan.dragon_envoy_return',
    eraId: 'era.longhan',
    kind: 'faction',
    title: '一个迟到的归期',
    summary: '你把巡海使的旧物带回龙庭。册子翻到那一页时，潮水停了。',
    body:
      '巡海册翻到那页空白时，殿里正好退潮。潮水停在殿门外，没有继续往下退。\n\n引路的龙将把手按在页边，很久没有说话。他身后站着几个年轻龙族，都是这百年才补进巡海册的。\n\n“你要补，就现在补。”他说，“潮水不会等太久。”',
    pause: 'story',
    repeatable: false,
    factionId: 'faction.longhan.dragon',
    regionId: 'region.longhan.four_seas',
    requirements: [
      {
        kind: 'factionMembership',
        factionId: 'faction.longhan.dragon',
        rankAtLeast: 1,
      },
      {
        kind: 'any',
        of: [
          {
            kind: 'flag',
            flag: 'longhan.envoy_name_returned',
            value: true,
          },
          {
            kind: 'flag',
            flag: 'longhan.envoy_bell_taken',
            value: true,
          },
        ],
      },
    ],
    onEnter: [
      {
        kind: 'setFlag',
        flag: 'longhan.envoy_return_seen',
        value: true,
      },
    ],
    choices: [
      {
        id: 'choice.longhan.dragon_envoy_return.write',
        text: '把名字写回巡海册，补上归期。',
        requirements: [
          {
            kind: 'flag',
            flag: 'longhan.envoy_name_returned',
            value: true,
          },
        ],
        effects: [
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.dragon',
            contributionDelta: 12,
            reputationDelta: 4,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.missing_tide_envoy_returned',
            value: true,
          },
          {
            kind: 'learnTechnique',
            techniqueId: 'technique.longhan.return_tide',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.envoy_return_write',
            text: '你把巡海使的名字写回册上，归期写的是“这一日”。落笔时，门外停住的潮水重新退了下去。',
          },
        ],
        outcome:
          '你落笔写完名字，归期只写了“这一日”。潮水重新退下去时，册页上浮出一行很淡的旧字，是那位巡海使自己的笔迹：归潮有路。龙将把手从页边收回去，第一次向你低头。',
      },
      {
        id: 'choice.longhan.dragon_envoy_return.hang',
        text: '把潮铃挂在潮眼边，让归期自己响。',
        requirements: [
          {
            kind: 'flag',
            flag: 'longhan.envoy_bell_taken',
            value: true,
          },
        ],
        effects: [
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.dragon',
            contributionDelta: 8,
            reputationDelta: 2,
          },
          {
            kind: 'changeRegionState',
            regionId: 'region.longhan.four_seas',
            key: 'envoy_bell',
            value: 'hung',
          },
          {
            kind: 'changeResource',
            resource: 'merit',
            amount: 2,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.envoy_bell_hung',
            value: true,
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.envoy_return_hang',
            text: '你把巡海使的潮铃挂在潮眼边。铃没有响，但退潮时，潮眼里传出一声很远的回应。',
          },
        ],
        outcome:
          '你把潮铃挂在潮眼边的旧钩上。铃没有响，龙将却抬头看了一眼。退潮退到一半时，潮眼里传出一声很远的回应，像有人在另一头也摇了一下铃。',
      },
      {
        id: 'choice.longhan.dragon_envoy_return.close',
        text: '什么也不补，只把那一页原样合上。',
        requirements: [],
        effects: [
          {
            kind: 'changeResource',
            resource: 'karma',
            amount: 2,
          },
          {
            kind: 'setFlag',
            flag: 'longhan.envoy_page_closed',
            value: true,
          },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.envoy_page_closed',
            text: '巡海册上那页空白被原样合上了。龙庭没有追问，只有几个年轻龙族在退潮时多看了潮眼一眼。',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.envoy_return_close',
            text: '你把巡海册合上，没有补名字，也没有补归期。龙将问你为什么，你说：“有些归期，不该由我们替他写。”',
          },
        ],
        outcome:
          '你把册子合上，推回石案。龙将问你为什么，你说：“有些归期，不该由我们替他写。”他没有反驳，只把册子收进潮眼旁的暗格。退潮重新开始，殿门外那道停住的水线终于移开了。',
      },
    ],
    tags: ['faction', 'dragon', 'envoy'],
  },
]
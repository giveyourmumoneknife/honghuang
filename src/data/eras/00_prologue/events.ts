import type { EncounterDefinition, EnemyDefinition, EventDefinition } from '@/types/content'

export const prologueEnemies: EnemyDefinition[] = [
  {
    id: 'enemy.prologue.first_shadow',
    name: '初影',
    title: '尚不知道该怕什么的东西',
    description:
      '一团贴着地面移动的影子。它没有脸，也没有声音，只在靠近活物时慢慢伸出手。开天未久，连凶兽都还没有学会如何杀死另一个人。',
    element: 'water',
    stats: { health: 26, attack: 4, defense: 1, speed: 2, crit: 1 },
    traits: [],
    skills: [
      {
        id: 'skill.prologue.shadow_touch',
        name: '沾影',
        description: '影子顺着脚踝往上爬，带走一点体温。',
        cooldown: 3,
        multiplier: 1.1,
        effect: 'drain',
        power: 1,
      },
    ],
    reward: {
      cultivation: 12,
      resources: { spirit_stones: 4 },
    },
  },
]

export const prologueEncounters: EncounterDefinition[] = [
  {
    id: 'encounter.prologue.first_shadow',
    name: '潮线下的初影',
    summary: '退潮后的浅滩上，有一团影子正在学着站起来。',
    description:
      '它原本只该是一段被潮水落下的暗。你走近时，暗里伸出一只手，五指还没有完全分开。',
    enemyIds: ['enemy.prologue.first_shadow'],
    regionId: 'region.longhan.four_seas',
    tier: 1,
    requirements: [],
    victoryEffects: [
      {
        kind: 'addMemory',
        memoryId: 'memory.prologue.first_shadow',
        text: '你第一次打散一团影子。潮水把剩下的暗带走了，没有留下尸体。',
      },
    ],
    defeatEffects: [
      {
        kind: 'applyStatus',
        statusId: 'status.prologue.cold_shadow',
        months: 3,
        source: '初影',
      },
    ],
    reward: {
      cultivation: 12,
      resources: { spirit_stones: 4 },
    },
    fleeAllowed: true,
    tags: ['prologue', 'shadow'],
  },
]

export const prologueEvents: EventDefinition[] = [
  {
    id: 'event.prologue.first_breath',
    eraId: 'era.prologue',
    kind: 'main',
    title: '第一口气',
    summary: '潮线退到了你身后。你躺在湿沙上，第一次听见自己的呼吸。',
    body:
      '天空很低，像一块还没有被谁挂稳的布。远处的海没有名字，也没有按时的涨落；它只是慢慢地退，露出许多从未见过光的礁石。\n\n你试着吸气，胸腔里像有一小片空洞被填满。再吐气时，风从口鼻间穿过去，带走了一点不属于你的声音。\n\n四周没有路，只有三个方向：更亮的地方，脚下微微震动的沙，以及那片刚刚退走的海。',
    pause: 'story',
    repeatable: false,
    regionId: 'region.longhan.four_seas',
    requirements: [],
    onEnter: [
      {
        kind: 'setFlag',
        flag: 'prologue.awake',
        value: true,
      },
      {
        kind: 'addMemory',
        memoryId: 'memory.prologue.first_breath',
        text: '你在开天未久的潮线上醒来。第一口气很冷，但没有谁把它从你手里拿走。',
      },
    ],
    choices: [
      {
        id: 'choice.prologue.first_breath.light',
        text: '朝更亮的地方走。先看清这片天地。',
        requirements: [],
        effects: [
          {
            kind: 'setFlag',
            flag: 'prologue.first_sight',
            value: 'light',
          },
          {
            kind: 'changeResource',
            resource: 'spirit_stones',
            amount: 4,
          },
          {
            kind: 'addRumor',
            rumorId: 'rumor.prologue.first_light',
            text: '有人说开天后的第一缕光落在四海，捡到它的人会先看见明天。',
          },
        ],
        outcome:
          '你朝亮处走。光并不刺眼，只是把每一块礁石都照得更清楚；走到第三块礁石时，你在石缝里拾到几粒仍在发凉的灵石。',
        nextEventId: 'event.prologue.first_light',
      },
      {
        id: 'choice.prologue.first_breath.earth',
        text: '俯身听脚下。沙在震动，像有东西正要长出来。',
        requirements: [],
        effects: [
          {
            kind: 'setFlag',
            flag: 'prologue.first_sight',
            value: 'earth',
          },
          {
            kind: 'changeResource',
            resource: 'ore',
            amount: 3,
          },
          {
            kind: 'setFlag',
            flag: 'prologue.heard_growth',
            value: true,
          },
        ],
        outcome:
          '你把耳朵贴在沙上。地下传来极缓慢的挤压声，像山川正在彼此让路。你顺手捡起几块被拱到地面的新石。',
        nextEventId: 'event.prologue.first_light',
      },
      {
        id: 'choice.prologue.first_breath.sea',
        text: '坐回潮线以内。海退得很远，也许会留下什么。',
        requirements: [],
        effects: [
          {
            kind: 'setFlag',
            flag: 'prologue.first_sight',
            value: 'sea',
          },
          {
            kind: 'applyStatus',
            statusId: 'status.prologue.first_stillness',
            months: 2,
            source: '初醒时的潮线',
          },
          {
            kind: 'setFlag',
            flag: 'prologue.sat_at_tideline',
            value: true,
          },
        ],
        outcome:
          '你在潮线内侧坐了很久。什么都没发生，这正是最不寻常的地方；海第一次退走之后，竟然记得没有立刻回来。',
        nextEventId: 'event.prologue.first_light',
      },
    ],
    tags: ['prologue', 'opening', 'origin'],
  },
  {
    id: 'event.prologue.first_light',
    eraId: 'era.prologue',
    kind: 'main',
    title: '第一缕天光',
    summary: '天光落下来时，远处的山脊才第一次有了轮廓。',
    body:
      '光从极高处落下，没有太阳，也看不出云。它只是把天和地分开，让原本连在一起的两片颜色各自退让。\n\n山脊因此出现，海面因此有了边。你第一次明白“远”是什么意思：你看见的东西，可能要走很久才能到。\n\n光里还站着几个很小的影子。太远了，看不清是兽、是人，还是另一种从未被命名的生灵。',
    pause: 'story',
    repeatable: false,
    regionId: 'region.longhan.four_seas',
    requirements: [
      {
        kind: 'flag',
        flag: 'prologue.awake',
        value: true,
      },
    ],
    onEnter: [
      {
        kind: 'setFlag',
        flag: 'prologue.light_seen',
        value: true,
      },
      {
        kind: 'changeRegionState',
        regionId: 'region.longhan.four_seas',
        key: 'prologue',
        value: 'first_light',
      },
    ],
    choices: [
      {
        id: 'choice.prologue.first_light.mountains',
        text: '记住山脊的方向。以后要走过去看看。',
        requirements: [],
        effects: [
          {
            kind: 'setFlag',
            flag: 'prologue.landmark',
            value: 'mountain_ridge',
          },
          {
            kind: 'changeRegionState',
            regionId: 'region.longhan.honghuang_land',
            key: 'prologue',
            value: 'seen_from_sea',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.prologue.mountain_ridge',
            text: '你在第一次天光里看见了陆地。它离你很远，却比海更像一个可以去的地方。',
          },
        ],
        outcome:
          '你把山脊的形状记在心里。后来你才知道，那道山脊会一直长到不周山下；而你此刻看见的，只是它最初的一线。',
        nextEventId: 'event.prologue.first_name',
      },
      {
        id: 'choice.prologue.first_light.shore',
        text: '走向光里最小的那个影子。先看看别的生灵怎么活。',
        requirements: [],
        effects: [
          {
            kind: 'setFlag',
            flag: 'prologue.landmark',
            value: 'shore_figures',
          },
          {
            kind: 'setFlag',
            flag: 'prologue.saw_shore_figures',
            value: true,
          },
          {
            kind: 'addRumor',
            rumorId: 'rumor.prologue.shore_figures',
            text: '第一缕天光下有影子在走。没有人说得清它们是先来的生灵，还是光本身留下的余像。',
          },
        ],
        outcome:
          '你走到近处时，影子已经不在了。沙上只留着一串深浅不一的足迹，其中一对比你的脚更窄，也比你的更老。',
        nextEventId: 'event.prologue.first_name',
      },
      {
        id: 'choice.prologue.first_light.wait',
        text: '留在潮线边。天地第一次分开，不该急着走。',
        requirements: [],
        effects: [
          {
            kind: 'setFlag',
            flag: 'prologue.landmark',
            value: 'tideline',
          },
          {
            kind: 'gainCultivation',
            amount: 18,
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.prologue.first_light',
            text: '你在第一缕天光下没有动。天地分开的声音很轻，像有人在你耳边把一页纸慢慢撕开。',
          },
        ],
        outcome:
          '你留到光变得平常。潮水在脚边试探着回来，又退下去；你第一次试着让呼吸跟着它，居然多留下了一点力气。',
        nextEventId: 'event.prologue.first_name',
      },
    ],
    tags: ['prologue', 'light', 'origin'],
  },
  {
    id: 'event.prologue.first_name',
    eraId: 'era.prologue',
    kind: 'main',
    title: '第一个名字',
    summary: '一个披着旧草衣的过路人问你：你叫什么？',
    body:
      '他是从山脊那边走来的，脚上裹着不成形的草，背着一只空陶罐。他在你面前停下，先看你的手，又看你的影子，像在确认你是不是某种他见过的东西。\n\n“总得有个称呼。”他说，“潮水不认没有名字的人。”\n\n他并不催你。陶罐里其实什么都没有，可他还是把罐口朝你倾了倾，像在请你先喝一口。',
    pause: 'story',
    repeatable: false,
    regionId: 'region.longhan.four_seas',
    requirements: [
      {
        kind: 'flag',
        flag: 'prologue.light_seen',
        value: true,
      },
    ],
    onEnter: [
      {
        kind: 'setFlag',
        flag: 'prologue.old_traveler',
        value: true,
      },
      {
        kind: 'addRumor',
        rumorId: 'rumor.prologue.name_giver',
        text: '开天未久，有人沿着潮线替无名者起名。他不收报酬，只讨一口水。',
      },
    ],
    choices: [
      {
        id: 'choice.prologue.first_name.tide',
        text: '“叫我潮生。潮水生的，也归潮水收。”',
        requirements: [],
        effects: [
          {
            kind: 'setFlag',
            flag: 'prologue.first_name',
            value: true,
          },
          {
            kind: 'setFlag',
            flag: 'prologue.name',
            value: 'chaosheng',
          },
          {
            kind: 'changeResource',
            resource: 'spirit_stones',
            amount: 6,
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.prologue.name',
            text: '你给自己取名潮生。过路人念了一遍，说这个名字以后会替你惹来一些水里的旧账。',
          },
        ],
        outcome:
          '他念了两遍，第二遍时潮水恰好涨到脚边。“好名字。”他说，“水会记得你，不过水记性太好，未必是好事。”',
        nextEventId: 'event.prologue.first_fire',
      },
      {
        id: 'choice.prologue.first_name.bone',
        text: '“叫我拾骨。荒原上总能捡到别人不要的东西。”',
        requirements: [],
        effects: [
          {
            kind: 'setFlag',
            flag: 'prologue.first_name',
            value: true,
          },
          {
            kind: 'setFlag',
            flag: 'prologue.name',
            value: 'shigu',
          },
          {
            kind: 'grantItem',
            itemId: 'item.longhan.dragon_scale',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.prologue.name',
            text: '你给自己取名拾骨。过路人从袖中摸出一枚旧鳞，说算是见面礼，也是提醒。',
          },
        ],
        outcome:
          '他笑起来，从袖中摸出一枚被磨得发白的鳞片。“拾骨的人总会捡到不该捡的。”他把鳞放进你掌心，“先从这一枚开始。”',
        nextEventId: 'event.prologue.first_fire',
      },
      {
        id: 'choice.prologue.first_name.less',
        text: '“先不取。等潮水替我想一个。”',
        requirements: [],
        effects: [
          {
            kind: 'setFlag',
            flag: 'prologue.first_name',
            value: true,
          },
          {
            kind: 'setFlag',
            flag: 'prologue.name',
            value: 'nameless',
          },
          {
            kind: 'changeDaoguo',
            amount: 1,
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.prologue.name',
            text: '你没有立刻给自己取名。过路人没有勉强，只说无名之人更容易听见别的名字。',
          },
        ],
        outcome:
          '他把陶罐收回背上。“也好。无名的人走在天地初开时，能听见更多东西。”他走出很远后，你才想起自己连他的称呼也忘了问。',
        nextEventId: 'event.prologue.first_fire',
      },
    ],
    tags: ['prologue', 'name', 'identity'],
  },
  {
    id: 'event.prologue.first_fire',
    eraId: 'era.prologue',
    kind: 'main',
    title: '第一堆火',
    summary: '过路人在礁石后生起一堆火。火光照见了比白天更多的东西。',
    body:
      '他不知道从哪里摸出两片干木，搓了很久，火星才落进草绒里。火焰起来时没有烟，像一小块被驯服的夕阳。\n\n“火要有人看着。”他说，“没人看的火，会自己长出脾气。”\n\n夜从海面漫过来。你听见远处有兽在叫，也听见更远处有翅膀掠过水面的声音。火光把你们围在一个很小的圈里。',
    pause: 'story',
    repeatable: false,
    regionId: 'region.longhan.four_seas',
    requirements: [
      {
        kind: 'flag',
        flag: 'prologue.first_name',
        value: true,
      },
    ],
    onEnter: [
      {
        kind: 'setFlag',
        flag: 'prologue.fire_lit',
        value: true,
      },
      {
        kind: 'changeRegionState',
        regionId: 'region.longhan.four_seas',
        key: 'prologue',
        value: 'first_fire',
      },
    ],
    choices: [
      {
        id: 'choice.prologue.first_fire.share',
        text: '守着火，也把过路人一起守到天亮。',
        requirements: [],
        effects: [
          {
            kind: 'setFlag',
            flag: 'prologue.fire_shared',
            value: true,
          },
          {
            kind: 'gainCultivation',
            amount: 20,
          },
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.ao_guang',
            delta: 1,
            reason: '在第一堆火旁没有让陌生人独自守夜',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.prologue.fire',
            text: '你守了一整夜的火。过路人睡着后，你听见海面有巡行的水声停了一瞬。',
          },
        ],
        outcome:
          '天快亮时，过路人醒来，看见火还在，也看见你没有睡。他什么也没说，只把剩下的火种分了一半给你。',
        nextEventId: 'event.prologue.first_wound',
      },
      {
        id: 'choice.prologue.first_fire.alone',
        text: '把火圈在自己这一侧。先学会不靠别人也能活。',
        requirements: [],
        effects: [
          {
            kind: 'setFlag',
            flag: 'prologue.fire_kept',
            value: true,
          },
          {
            kind: 'changeResource',
            resource: 'spirit_herbs',
            amount: 4,
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.prologue.fire',
            text: '你把火守在自己这一侧。过路人没有计较，只在半夜把陶罐挪到了你够不到的地方。',
          },
        ],
        outcome:
          '火没有灭，但你们之间的沙地被夜露打湿，像一条谁也没跨过去的界线。天亮后，他在界线那侧留下几株草药。',
        nextEventId: 'event.prologue.first_wound',
      },
      {
        id: 'choice.prologue.first_fire.smoke',
        text: '让烟升起来，看看这座荒岸还有没有别的活人。',
        requirements: [],
        effects: [
          {
            kind: 'setFlag',
            flag: 'prologue.fire_signal',
            value: true,
          },
          {
            kind: 'changeResource',
            resource: 'ore',
            amount: 2,
          },
          {
            kind: 'addRumor',
            rumorId: 'rumor.prologue.fire_seen',
            text: '四海荒岸的第一堆火升了烟。后来有三族的人承认，他们那夜都看见过。',
          },
        ],
        outcome:
          '烟升得很直。过路人看着烟，忽然说了一句你当时没听懂的话：“你这一把火，三族都会记得。”',
        nextEventId: 'event.prologue.first_wound',
      },
    ],
    tags: ['prologue', 'fire', 'first_night'],
  },
  {
    id: 'event.prologue.first_wound',
    eraId: 'era.prologue',
    kind: 'main',
    title: '第一道伤',
    summary: '火光照不到的浅滩上，有什么东西正学着站起来。',
    body:
      '声音先到：湿沙被拖动，像一整块布在海面上被慢慢拽走。你回头时，那团影子已经离开了水线，正用一只尚未分清五指的手撑住礁石。\n\n过路人把空陶罐挡在身前，压低声音：“它还没有恶意，也还没有分寸。此刻出手，它记你；此刻退开，它也会记你。”\n\n火在你们身后。影子在潮线以内。',
    pause: 'story',
    repeatable: false,
    regionId: 'region.longhan.four_seas',
    requirements: [
      {
        kind: 'flag',
        flag: 'prologue.fire_lit',
        value: true,
      },
    ],
    onEnter: [
      {
        kind: 'addRumor',
        rumorId: 'rumor.prologue.first_shadow',
        text: '开天未久的浅滩上出现过一团会走路的影子。它没有伤人，只是学着像人一样站起来。',
      },
    ],
    choices: [
      {
        id: 'choice.prologue.first_wound.strike',
        text: '趁它还没学会伤人，先把影子打散。',
        requirements: [],
        effects: [
          {
            kind: 'startCombat',
            encounterId: 'encounter.prologue.first_shadow',
            fleeAllowed: true,
          },
          {
            kind: 'setFlag',
            flag: 'prologue.first_wound',
            value: 'struck',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.prologue.first_wound',
            text: '你第一次与一团影子交手。它倒下去时没有声音，潮水把剩下的暗带走了。',
          },
        ],
        outcome:
          '你迎着影子出手。它像被打湿的纸一样裂开，又在潮声里慢慢塌回沙地；过路人在身后没有叫好，只把火拨旺了一些。',
        nextEventId: 'event.prologue.three_lights',
      },
      {
        id: 'choice.prologue.first_wound.retreat',
        text: '退回火圈里。让火替你们守住这一夜。',
        requirements: [],
        effects: [
          {
            kind: 'setFlag',
            flag: 'prologue.first_wound',
            value: 'retreated',
          },
          {
            kind: 'applyStatus',
            statusId: 'status.prologue.cold_shadow',
            months: 2,
            source: '潮线下的初影',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.prologue.first_wound',
            text: '你没有打散那团影子，只和过路人退到火边。它在火圈外站了一夜，天亮时自己走回海里。',
          },
        ],
        outcome:
          '影子在火圈外停下，整夜没有进来。你也整夜没有睡；天亮时它退回海里，沙上留下一道很浅的湿痕，像一条没有写完的路。',
        nextEventId: 'event.prologue.three_lights',
      },
      {
        id: 'choice.prologue.first_wound.watch',
        text: '不动，也不退。看它到底想做什么。',
        requirements: [],
        effects: [
          {
            kind: 'setFlag',
            flag: 'prologue.first_wound',
            value: 'watched',
          },
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.ao_guang',
            delta: 1,
            reason: '在初影面前没有先出手',
          },
          {
            kind: 'addRumor',
            rumorId: 'rumor.prologue.shadow_kindness',
            text: '有人曾在浅滩上对一团影子留手。多年后，四海边多了一个不伤人的哑影。',
          },
        ],
        outcome:
          '影子学着你的样子站了很久，然后弯下腰，把一只尚未成形的手贴在湿沙上。它没有靠近火，也没有离开；天亮前，它把自己重新铺回了潮水。',
        nextEventId: 'event.prologue.three_lights',
      },
    ],
    tags: ['prologue', 'shadow', 'first_choice'],
  },
  {
    id: 'event.prologue.three_lights',
    eraId: 'era.prologue',
    kind: 'main',
    title: '三道远影',
    summary: '天边同时掠过三种颜色。海面第一次被不属于天光的东西照亮。',
    body:
      '第一道影子从海里升起，鳞光在云下滚了一整圈；第二道从火山方向来，尾羽拖着一线不肯熄灭的红；第三道贴着大地走，四蹄落下处，草从石缝里长出来。\n\n它们没有靠近，也没有互相致意。可你能感到，三者在同一刻看见了彼此。\n\n过路人把陶罐放在地上，第一次坐了下来。“看见了就别装没看见。”他说，“你迟早要选一条路走。”',
    pause: 'story',
    repeatable: false,
    regionId: 'region.longhan.four_seas',
    requirements: [
      {
        kind: 'flag',
        flag: 'prologue.fire_lit',
        value: true,
      },
    ],
    onEnter: [
      {
        kind: 'setFlag',
        flag: 'prologue.three_lights',
        value: true,
      },
      {
        kind: 'changeRegionState',
        regionId: 'region.longhan.four_seas',
        key: 'prologue',
        value: 'three_lights',
      },
      {
        kind: 'addRumor',
        rumorId: 'rumor.prologue.three_lights',
        text: '有人看见龙、凤与麒麟的影子在同一夜越过四海。三种颜色第一次照在同一片水上。',
      },
    ],
    choices: [
      {
        id: 'choice.prologue.three_lights.dragon',
        text: '记住水中的鳞光。先学如何随潮而不被潮带走。',
        requirements: [],
        effects: [
          {
            kind: 'setFlag',
            flag: 'prologue.omen',
            value: 'dragon',
          },
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.dragon',
            reputationDelta: 3,
            flags: {
              'longhan.prologue_witness': true,
            },
          },
          {
            kind: 'grantMount',
            mountId: 'mount.longhan.wave_deer',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.prologue.omen',
            text: '你选择了水中的鳞光。天亮后，一头踏潮鹿在礁石边等你，像已经等了很久。',
          },
        ],
        outcome:
          '鳞光沉回海里时，一头年轻的水鹿从浅滩走出，蹄间还挂着未干的潮水。它不亲近你，只在你动身时先走半步。',
        nextEventId: 'event.prologue.first_mirror',
      },
      {
        id: 'choice.prologue.three_lights.phoenix',
        text: '记住那一线不肯熄灭的红。先学如何在痛里留下自己。',
        requirements: [],
        effects: [
          {
            kind: 'setFlag',
            flag: 'prologue.omen',
            value: 'phoenix',
          },
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.phoenix',
            reputationDelta: 3,
            flags: {
              'longhan.prologue_witness': true,
            },
          },
          {
            kind: 'grantItem',
            itemId: 'item.longhan.phoenix_feather',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.prologue.omen',
            text: '你选择了那一线不肯熄灭的红。天亮后，一支赤羽落在火堆余烬里，没有被烧掉。',
          },
        ],
        outcome:
          '红光掠过火堆时，火苗忽然直了一瞬。天亮后，你在灰里找到一支赤羽；羽根还是温的，像刚从某个人的心口拔下。',
        nextEventId: 'event.prologue.first_mirror',
      },
      {
        id: 'choice.prologue.three_lights.qilin',
        text: '记住四蹄落下处长出的草。先学如何让脚下这片土记得你。',
        requirements: [],
        effects: [
          {
            kind: 'setFlag',
            flag: 'prologue.omen',
            value: 'qilin',
          },
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.qilin',
            reputationDelta: 3,
            flags: {
              'longhan.prologue_witness': true,
            },
          },
          {
            kind: 'changeResource',
            resource: 'ore',
            amount: 5,
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.prologue.omen',
            text: '你选择了贴地而行的青影。天亮后，昨夜蹄印里长出的草已经结出细小的石籽。',
          },
        ],
        outcome:
          '青影过去后，沙地上留下一串蹄印。你等到天亮，蹄印里已经长出草，草根下结着几粒温润的石籽。',
        nextEventId: 'event.prologue.first_mirror',
      },
    ],
    tags: ['prologue', 'three_clans', 'omen'],
  },
  {
    id: 'event.prologue.first_mirror',
    eraId: 'era.prologue',
    kind: 'main',
    title: '潮退后的旧镜',
    summary: '退潮把一件不属于这个时代的东西留在了礁石间。',
    body:
      '它半埋在最深的一层湿沙里，镜面朝下，像有人故意把它按进潮线以下。你把镜翻过来时，里面没有你的脸，只有一片正在退去的海。\n\n过路人凑近看了一眼，立刻退开半步。“这东西比我们都老。”他说，“它记得的潮，未必是这一世的潮。”\n\n镜背刻着密密麻麻的潮位，最末一道还没有刻完。',
    pause: 'story',
    repeatable: false,
    regionId: 'region.longhan.four_seas',
    requirements: [
      {
        kind: 'flag',
        flag: 'prologue.three_lights',
        value: true,
      },
    ],
    onEnter: [
      {
        kind: 'setFlag',
        flag: 'prologue.mirror_found',
        value: true,
      },
      {
        kind: 'changeRegionState',
        regionId: 'region.longhan.four_seas',
        key: 'prologue',
        value: 'old_mirror',
      },
    ],
    choices: [
      {
        id: 'choice.prologue.first_mirror.take',
        text: '收下镜子。既然它留在这里，就说明有人在等它被捡走。',
        requirements: [],
        effects: [
          {
            kind: 'grantTreasure',
            treasureId: 'item.longhan.tide_mirror',
          },
          {
            kind: 'setFlag',
            flag: 'prologue.mirror',
            value: 'taken',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.prologue.mirror',
            text: '你收下了退潮后留下的旧镜。镜中没有你，只有一片比四海更早的海。',
          },
        ],
        outcome:
          '镜子贴身之后，你听见很轻的潮声一直跟着自己。过路人没有劝阻，只说：“以后照它的时候，记得先问问现在是什么时候。”',
        nextEventId: 'event.prologue.first_loss',
      },
      {
        id: 'choice.prologue.first_mirror.read',
        text: '先把镜背的潮位拓下来。知道它从哪来，再决定带不带它走。',
        requirements: [],
        effects: [
          {
            kind: 'grantItem',
            itemId: 'item.longhan.old_bone_slip',
          },
          {
            kind: 'setFlag',
            flag: 'prologue.mirror',
            value: 'copied',
          },
          {
            kind: 'changeRegionState',
            regionId: 'region.longhan.four_seas',
            key: 'tide_record',
            value: 'copied',
          },
          {
            kind: 'addRumor',
            rumorId: 'rumor.prologue.mirror_record',
            text: '有人拓下了退潮旧镜背面的潮位。拓片上最后一道潮线，比当今四海高出一大截。',
          },
        ],
        outcome:
          '你用骨片把潮位一道道拓下。刻到最后时，指尖被划开一道口子；血落在镜背，镜面里那片旧海无声地涨了一次潮。',
        nextEventId: 'event.prologue.first_loss',
      },
      {
        id: 'choice.prologue.first_mirror.leave',
        text: '把它重新埋回潮线以下。有些东西不该在第一世就带走。',
        requirements: [],
        effects: [
          {
            kind: 'setFlag',
            flag: 'prologue.mirror',
            value: 'left',
          },
          {
            kind: 'changeDaoguo',
            amount: 1,
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.prologue.mirror',
            text: '你把旧镜重新埋回潮线以下。海会替你保管它，直到你准备好知道那片旧潮。',
          },
        ],
        outcome:
          '你把镜子翻回原位，用湿沙重新盖住。过路人看着你做完，点了点头：“能放下比能拿走难。镜子里那片海，会记你这一手。”',
        nextEventId: 'event.prologue.first_loss',
      },
    ],
    tags: ['prologue', 'treasure', 'tide'],
  },
  {
    id: 'event.prologue.first_loss',
    eraId: 'era.prologue',
    kind: 'main',
    title: '第一次失去',
    summary: '过路人在天亮前独自走了，只在沙上留下陶罐和一句话。',
    body:
      '你醒来时火已经灭了，陶罐倒扣在潮线内，里面压着一片薄石。石上刻着很浅的字，像是用指甲一点点划出来的：\n\n“名字给了你，路得你自己走。别在潮退时回头找送你的人。”\n\n远处没有脚印。沙面平整得过分，像有人走后又替自己抹掉了来路。',
    pause: 'story',
    repeatable: false,
    regionId: 'region.longhan.four_seas',
    requirements: [
      {
        kind: 'flag',
        flag: 'prologue.mirror_found',
        value: true,
      },
    ],
    onEnter: [
      {
        kind: 'setFlag',
        flag: 'prologue.first_loss',
        value: true,
      },
      {
        kind: 'changeResource',
        resource: 'spirit_stones',
        amount: 8,
      },
      {
        kind: 'addRumor',
        rumorId: 'rumor.prologue.traveler_gone',
        text: '沿着潮线替无名者起名的人又上路了。没有人知道他去了哪里，也没有人再见过那只空陶罐。',
      },
    ],
    choices: [
      {
        id: 'choice.prologue.first_loss.keep',
        text: '收起薄石和陶罐。把这段路算作自己的开头。',
        requirements: [],
        effects: [
          {
            kind: 'setFlag',
            flag: 'prologue.loss',
            value: 'kept',
          },
          {
            kind: 'gainCultivation',
            amount: 24,
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.prologue.loss',
            text: '你收起了过路人留下的陶罐。它空着，却很沉；你决定把这份重量算进自己的路。',
          },
        ],
        outcome:
          '你把陶罐背到身上。它比看上去更重，走路时会轻轻撞着背脊；你很快习惯了这个声音，像习惯了身边少一个说话的人。',
        nextEventId: 'event.prologue.covenant_rumor',
      },
      {
        id: 'choice.prologue.first_loss.search',
        text: '沿着潮线追一程。至少要知道他往哪边走。',
        requirements: [],
        effects: [
          {
            kind: 'setFlag',
            flag: 'prologue.loss',
            value: 'searched',
          },
          {
            kind: 'changeRegionState',
            regionId: 'region.longhan.four_seas',
            key: 'prologue',
            value: 'traveler_trail',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.prologue.loss',
            text: '你沿着潮线追了半天，只找到一串被潮水反复抹平的脚印。它们既朝海里去，也朝山里去。',
          },
        ],
        outcome:
          '你追到潮线尽头，脚下的沙忽然同时朝两个方向塌陷：一半通向海，一半通向远处的山。你站了很久，最后把两只脚分别踩在两种方向上。',
        nextEventId: 'event.prologue.covenant_rumor',
      },
      {
        id: 'choice.prologue.first_loss.stay',
        text: '留在原地，把火重新生起来。等一个愿意来的人。',
        requirements: [],
        effects: [
          {
            kind: 'setFlag',
            flag: 'prologue.loss',
            value: 'stayed',
          },
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.ao_guang',
            delta: 1,
            reason: '在过路人离开后仍守着那堆火',
          },
          {
            kind: 'addRumor',
            rumorId: 'rumor.prologue.fire_kept',
            text: '四海荒岸有一堆火被人守了很多天。后来有人在火边放下一条旧绳，没有留名字。',
          },
        ],
        outcome:
          '你把火重新生起来，守着它又过了三日。没有人来，但第四日清晨，火边多了一段旧绳；绳结是龙族的手法，你还不认得。',
        nextEventId: 'event.prologue.covenant_rumor',
      },
    ],
    tags: ['prologue', 'loss', 'traveler'],
  },
  {
    id: 'event.prologue.covenant_rumor',
    eraId: 'era.prologue',
    kind: 'main',
    title: '三族要立约',
    summary: '从山那边传来消息：龙、凤、麒麟要同席，为潮汐、火山与地脉定一个说法。',
    body:
      '传话的是个赶路的散修，鞋上沾着三种不同的土。他说三族已经选定了会盟的日子，连石头都磨好了，只等各自把条件带上台。\n\n“没有请散修。”他说得并不避讳，“可也没有拦着谁去看。”\n\n它可能是这一世第一次真正的会盟，也可能是第一次真正的分赃。潮线在你脚边涨了一寸，又退回去。',
    pause: 'story',
    repeatable: false,
    regionId: 'region.longhan.honghuang_land',
    requirements: [
      {
        kind: 'flag',
        flag: 'prologue.first_loss',
        value: true,
      },
    ],
    onEnter: [
      {
        kind: 'setFlag',
        flag: 'prologue.covenant_heard',
        value: true,
      },
      {
        kind: 'changeRegionState',
        regionId: 'region.longhan.honghuang_land',
        key: 'prologue',
        value: 'covenant_heard',
      },
    ],
    choices: [
      {
        id: 'choice.prologue.covenant_rumor.witness',
        text: '去会盟台。哪怕没有席位，也要亲耳听见他们怎么分这天地。',
        requirements: [],
        effects: [
          {
            kind: 'setFlag',
            flag: 'prologue.path',
            value: 'witness',
          },
          {
            kind: 'changeRegionState',
            regionId: 'region.longhan.honghuang_land',
            key: 'prologue',
            value: 'road_to_covenant',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.prologue.path',
            text: '你决定去会盟台。不是为了被请，而是为了在别人替你做决定时在场。',
          },
        ],
        outcome:
          '你收拾好陶罐与旧镜，朝会盟台的方向走。散修在你身后说，看客也要带礼物；你想了想，把过路人留下的薄石放进了怀里。',
        nextEventId: 'event.prologue.tide_call',
      },
      {
        id: 'choice.prologue.covenant_rumor.train',
        text: '先练一程。没有本事的人去了，只会被当成别人立约的注脚。',
        requirements: [],
        effects: [
          {
            kind: 'setFlag',
            flag: 'prologue.path',
            value: 'training',
          },
          {
            kind: 'gainCultivation',
            amount: 42,
          },
          {
            kind: 'changeResource',
            resource: 'spirit_herbs',
            amount: 5,
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.prologue.path',
            text: '你没有立刻去会盟台，而是留在潮线边练了很久。潮水涨落成了你第一个师傅。',
          },
        ],
        outcome:
          '你在潮线边练到能听懂水声里的三种间隙。等你动身时，会盟的日子已经近了；你没有后悔，反而走得更稳。',
        nextEventId: 'event.prologue.tide_call',
      },
      {
        id: 'choice.prologue.covenant_rumor.ask',
        text: '先向这位散修打听：三族各自怕什么，又各自缺什么。',
        requirements: [],
        effects: [
          {
            kind: 'setFlag',
            flag: 'prologue.path',
            value: 'asked',
          },
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.phoenix',
            reputationDelta: 2,
          },
          {
            kind: 'addRumor',
            rumorId: 'rumor.prologue.three_fears',
            text: '三族立约前，各自最怕的事已经传开：龙怕潮退无归，凤怕火种无人记，麒麟怕地脉替人作伪证。',
          },
        ],
        outcome:
          '散修伸出三根手指：“龙怕潮退后没人回来，凤怕火种落到不知代价的人手里，麒麟怕大地替说谎的人作证。”他把手指收回去，“你问这个，是想去做什么？”',
        nextEventId: 'event.prologue.tide_call',
      },
    ],
    tags: ['prologue', 'covenant', 'three_clans'],
  },
  {
    id: 'event.prologue.tide_call',
    eraId: 'era.prologue',
    kind: 'main',
    title: '潮声将起',
    summary: '你站到了潮线尽头。海第一次按着某种约定退去，像在给谁让路。',
    body:
      '这一夜的潮退得极远，连旧镜里那片海都不曾退到这个位置。礁石一层层露出来，最后露出一条通向深处的旧道。\n\n潮声没有停，只是换了方向。它不再从海上来，而是从你胸腔里往外退。\n\n过路人的陶罐在背上轻轻响了一下，像有人隔着很远敲了敲罐壁。你忽然明白：序章到这里就该结束了。',
    pause: 'story',
    repeatable: true,
    cooldownMonths: 0,
    regionId: 'region.longhan.four_seas',
    requirements: [
      {
        kind: 'flag',
        flag: 'prologue.covenant_heard',
        value: true,
      },
    ],
    onEnter: [
      {
        kind: 'setFlag',
        flag: 'prologue.tide_call_seen',
        value: true,
      },
      {
        kind: 'changeRegionState',
        regionId: 'region.longhan.four_seas',
        key: 'prologue',
        value: 'tide_call',
      },
    ],
    choices: [
      {
        id: 'choice.prologue.tide_call.step',
        text: '踏进退潮后的旧道。带着你取过的名字与捡到的东西，走进龙汉。',
        requirements: [],
        effects: [
          {
            kind: 'changeEra',
            eraId: 'era.longhan',
          },
          {
            kind: 'setFlag',
            flag: 'prologue.complete',
            value: true,
          },
          {
            kind: 'unlockRegion',
            regionId: 'region.longhan.four_seas',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.tide_wake',
            delayMonths: 0,
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.prologue.enter_longhan',
            text: '你走进退潮后的旧道。身后的海开始按第一次立下的规矩涨潮，龙汉从此开始。',
          },
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.dragon',
            reputationDelta: 2,
          },
        ],
        outcome:
          '旧道比想象中短。你走出最后一块礁石时，天边已经有三种颜色在等；潮水在你身后合拢，把序章轻轻关上了。',
      },
      {
        id: 'choice.prologue.tide_call.marker',
        text: '在潮线尽头替过路人立一块薄石，再走进龙汉。',
        requirements: [],
        effects: [
          {
            kind: 'changeEra',
            eraId: 'era.longhan',
          },
          {
            kind: 'setFlag',
            flag: 'prologue.complete',
            value: true,
          },
          {
            kind: 'setFlag',
            flag: 'prologue.marker_left',
            value: true,
          },
          {
            kind: 'changeDaoguo',
            amount: 2,
          },
          {
            kind: 'unlockRegion',
            regionId: 'region.longhan.four_seas',
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.longhan.tide_wake',
            delayMonths: 0,
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.prologue.marker',
            text: '你在潮线尽头替过路人立了一块没有名字的薄石。潮水会每次都从它旁边退开。',
          },
        ],
        outcome:
          '你把薄石插在最高的一块礁石下。石头没有刻字，只朝着山与海各有一道浅痕；你转身走进旧道时，听见潮水在石头后面轻轻响了一下。',
      },
      {
        id: 'choice.prologue.tide_call.wait',
        text: '再等一次潮退。还有些事没想清。',
        requirements: [],
        effects: [
          {
            kind: 'setFlag',
            flag: 'prologue.waited',
            value: true,
          },
          {
            kind: 'scheduleEvent',
            eventId: 'event.prologue.tide_call',
            delayMonths: 3,
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.prologue.wait',
            text: '你在潮线尽头多留了一次潮退。海没有催你，过路人的陶罐也没有再响。',
          },
        ],
        outcome:
          '你在礁石上坐到潮水回来。旧道被重新盖住，海面恢复成看不出深浅的样子；你知道它下次退开时，还会把路让出来。',
      },
    ],
    tags: ['prologue', 'transition', 'tide'],
  },
]

import type { EventDefinition } from '@/types/content'

/**
 * 法体三途的引导事件：先在礁石上学着站住，再听见旧血，最后把
 * 骨、血、法三条路接成一条。事件只负责把门推开，怎么走由玩家在
 * 修士界面里自己选。
 */
export const longhanBodyEvents: EventDefinition[] = [
  {
    id: 'event.longhan.body_stone_pose',
    eraId: 'era.longhan',
    kind: 'world',
    title: '石上有一双脚印',
    summary: '退潮后的礁石上留着一双赤脚印，边缘被潮水磨得很浅，却还站得很稳。',
    body:
      '你沿着四海浅滩走，在一块半人高的礁石前停下。石面上有一双赤脚印，脚趾扣着石纹，像那个人站了很久，又像只站了一息。\n\n潮水从脚印里退出去，留下一层薄盐。你伸手去摸，石头是温的。\n\n旁边有个挑着鱼篓的老散修看见了，说：“别摸。那是人家站出来的坑，不是刻的。你要学，就脱鞋站上去；不学，就替他把盐扫了。”\n\n“站上去会怎样？”\n\n“腿会抖。”老头把鱼篓换了个肩，“抖完了，皮就不是原来那张皮了。”',
    pause: 'ambient',
    repeatable: false,
    dispatch: true,
    weight: 12,
    regionId: 'region.longhan.four_seas',
    requirements: [
      { kind: 'regionVisited', regionId: 'region.longhan.four_seas' },
      { kind: 'realm', minRealm: 'mortal' },
    ],
    onEnter: [
      {
        kind: 'addRumor',
        rumorId: 'rumor.longhan.body_stone_pose',
        text: '四海浅滩有块礁石，上面留着一双赤脚印。潮水磨了很多年，脚印没有变浅。',
      },
    ],
    choices: [
      {
        id: 'choice.longhan.body_stone_pose.stand',
        text: '脱鞋站上去，陪这双脚印站到潮退。',
        requirements: [],
        effects: [
          { kind: 'learnTechnique', techniqueId: 'technique.longhan.iron_skin' },
          { kind: 'gainBodyTemper', amount: 60 },
          {
            kind: 'setFlag',
            flag: 'longhan.body_stone_pose_done',
            value: true,
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.body_stone_pose',
            text: '你在礁石上站到潮水退尽。腿抖过，后来不抖了。老头收走你脚边那双鞋，说：“以后用不着了。”',
          },
        ],
        outcome:
          '你站到潮水退尽。腿先抖，骨头后响，最后连呼吸都沉进了脚底。老头把鱼篓里的盐撒在石面上，说：“行了。皮开了，往后挨打也算修行。”他把你的鞋收走了，说下一位还要用。',
      },
      {
        id: 'choice.longhan.body_stone_pose.breathe',
        text: '不全站，只学他脚趾扣石时怎么呼吸。',
        requirements: [],
        effects: [
          { kind: 'learnTechnique', techniqueId: 'technique.longhan.iron_skin' },
          { kind: 'gainBodyTemper', amount: 28 },
          { kind: 'gainCultivation', amount: 20 },
          {
            kind: 'setFlag',
            flag: 'longhan.body_stone_pose_done',
            value: true,
          },
        ],
        outcome:
          '你不硬站，只把脚趾扣住石缝，照着脚印的深浅换气。老头看了一会儿，说：“聪明。聪明人省力，也少走半步。”他没有纠正你，只把鱼篓放下，替你挡住了涨上来的浪。',
      },
      {
        id: 'choice.longhan.body_stone_pose.sweep',
        text: '不站，替他把脚印上的盐扫干净。',
        requirements: [],
        effects: [
          { kind: 'learnTechnique', techniqueId: 'technique.longhan.iron_skin' },
          { kind: 'gainBodyTemper', amount: 16 },
          { kind: 'changeResource', resource: 'merit', amount: 1 },
          {
            kind: 'setFlag',
            flag: 'longhan.body_stone_pose_done',
            value: true,
          },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.body_stone_pose_swept',
            text: '有人把四海礁石上的盐扫了。后来那老头逢人就说，那天海风在他背后站了一会儿。',
          },
        ],
        outcome:
          '你把脚印里的盐一点点扫出来。老头起初没说话，后来把鱼篓里最小的一条鱼扔回海里，说：“不站也能学。肯替人扫石头的人，学淬体往往比别人撑得久。”临走时，他教了你第一口沉息。',
      },
    ],
    tags: ['world', 'body', 'four_seas', 'intro'],
  },
  {
    id: 'event.longhan.blood_first_heat',
    eraId: 'era.longhan',
    kind: 'world',
    title: '第一次血热',
    summary: '淬皮之后，你第一次在夜里被自己的血烫醒。',
    body:
      '夜里你被热醒。不是发烧，是血在皮肤下面走得太快，像有一条不听话的河。\n\n你按住手腕，能摸到每一次心跳之间还夹着另一个很轻的拍子。它不属于你，却认识你。\n\n礁石上的老头不知什么时候坐在火边，正用一根树枝拨灰。“旧血醒了。”他说，“别急着高兴。血醒了不等于认你；它只是先看看，这具身子值不值得它留下。”\n\n“那我该怎么做？”\n\n“先想清楚，”他把树枝插进沙里，“你是想让血替你出力，还是只想把它供起来？”',
    pause: 'ambient',
    repeatable: false,
    dispatch: true,
    weight: 10,
    regionId: 'region.longhan.four_seas',
    requirements: [
      {
        kind: 'flag',
        flag: 'longhan.body_stone_pose_done',
        value: true,
      },
      { kind: 'bodyStage', minStage: 1 },
    ],
    onEnter: [
      {
        kind: 'addRumor',
        rumorId: 'rumor.longhan.blood_first_heat',
        text: '有人在四海夜里发了血热，脉搏里多出一个不属于自己的拍子。老散修说，那是旧血在挑人。',
      },
    ],
    choices: [
      {
        id: 'choice.longhan.blood_first_heat.bleed',
        text: '咬破指尖，让血滴进海水里，看它认不认。',
        requirements: [],
        effects: [
          { kind: 'learnTechnique', techniqueId: 'technique.longhan.blood_breath' },
          { kind: 'grantItem', itemId: 'item.longhan.dragon_scale', count: 1 },
          { kind: 'gainBodyTemper', amount: 36 },
          {
            kind: 'setFlag',
            flag: 'longhan.blood_awakening_known',
            value: true,
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.blood_first_heat',
            text: '你把一滴血滴进四海。血没有散，反而在浪里逆着潮走了半尺。老头说：“它认路了。剩下的，看你敢不敢开门。”',
          },
        ],
        outcome:
          '血滴入海，没有散开，反而逆着潮走了半尺才被浪吞掉。老头把一片旧龙鳞按在你掌心：“引子有了。记住，血脉不是捡来的力气；你开门，它进来，往后它也会向你要东西。”',
      },
      {
        id: 'choice.longhan.blood_first_heat.ask',
        text: '问老头这血是从哪里来的。',
        requirements: [],
        effects: [
          { kind: 'learnTechnique', techniqueId: 'technique.longhan.blood_breath' },
          { kind: 'grantItem', itemId: 'item.longhan.beast_sinew', count: 2 },
          { kind: 'changeResource', resource: 'karma', amount: 1 },
          {
            kind: 'setFlag',
            flag: 'longhan.blood_awakening_known',
            value: true,
          },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.blood_first_heat_origin',
            text: '老散修说，龙汉初年有很多旧血没有跟着族谱走，而是沉进了散修的骨缝。谁先听见，谁就先替那支血脉活一次。',
          },
        ],
        outcome:
          '老头想了想，说：“龙汉初立那会儿，很多族把血留在了路上。有的为逃命，有的为留种，还有的只是死得太急。你身上这条，大概是某位不肯散的前辈留下的。”他从鱼篓底下摸出两截荒兽筋，“拿去做引子。问来历要付因果，这条我替你记着。”',
      },
      {
        id: 'choice.longhan.blood_first_heat.suppress',
        text: '先把血热压下去，不急着开门。',
        requirements: [],
        effects: [
          { kind: 'learnTechnique', techniqueId: 'technique.longhan.blood_breath' },
          { kind: 'gainBodyTemper', amount: 52 },
          { kind: 'changeResource', resource: 'merit', amount: 1 },
          {
            kind: 'setFlag',
            flag: 'longhan.blood_awakening_known',
            value: true,
          },
        ],
        outcome:
          '你把血热按回骨缝里，按到天边发白。老头没有催你，只在火堆将熄时说：“能忍住不开门，也算一种本事。门一直在，什么时候想开，自己挑个不后悔的日子。”',
      },
    ],
    tags: ['world', 'bloodline', 'four_seas', 'intro'],
  },
  {
    id: 'event.longhan.bloodline_ancestor_echo',
    eraId: 'era.longhan',
    kind: 'hidden',
    title: '祖血回响',
    summary: '血脉凝成一条窄脉之后，你第一次听见它在替某位先人说话。',
    body:
      '你在静坐时听见一个很远的名字。不是从耳朵进来的，是从血里浮上来的。\n\n那名字只响了一次，随后整条血脉开始回响，像一口很久没有人敲的钟。你分明记得自己没有学过这个音节，舌头却已经会念了。\n\n礁石老头这一次没有出现。火堆旁只留着一行用树枝写在沙上的字：\n\n“听见了，就去打一拳。祖血不认嘴。”\n\n你握了握拳，血里的回响还在。',
    pause: 'ambient',
    repeatable: false,
    dispatch: true,
    weight: 7,
    regionId: 'region.longhan.four_seas',
    requirements: [
      {
        kind: 'flag',
        flag: 'longhan.blood_awakening_known',
        value: true,
      },
      { kind: 'bloodlineStage', minStage: 2 },
    ],
    onEnter: [
      {
        kind: 'setFlag',
        flag: 'longhan.bloodline_ancestor_heard',
        value: true,
      },
      {
        kind: 'addRumor',
        rumorId: 'rumor.longhan.bloodline_ancestor_echo',
        text: '有散修在四海静坐时听见血里有人念名。那名字已经没人用了，但旧血还记得。',
      },
    ],
    choices: [
      {
        id: 'choice.longhan.bloodline_ancestor_echo.strike',
        text: '朝海面打一拳，把回响放出去。',
        requirements: [],
        effects: [
          { kind: 'grantItem', itemId: 'item.longhan.tempering_pill', count: 1 },
          { kind: 'gainBodyTemper', amount: 60 },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.bloodline_ancestor_strike',
            text: '你朝海面打出一拳。浪没有碎，只在拳锋前分开了一瞬。血里的回响停了，像有人终于点了一下头。',
          },
        ],
        outcome:
          '一拳落在海面上，浪没有碎，只在拳锋前分开一瞬，又很快合拢。血里的回响停了。你听见一个很轻的声音说：“用法不对，力气倒还像样。”沙上多了一枚被潮水推来的丹丸，还是温的。',
      },
      {
        id: 'choice.longhan.bloodline_ancestor_echo.listen',
        text: '不打断回响，把那个名字记下来。',
        requirements: [],
        effects: [
          { kind: 'changeDaoguo', amount: 1 },
          { kind: 'addMemory', memoryId: 'memory.longhan.bloodline_ancestor_name', text: '你把血里浮出的名字记了下来。念第二遍时，四海的风停了一息。' },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.bloodline_ancestor_name',
            text: '有人记住了一个早已无人使用的旧名。那名字在血里，不在任何一块碑上。',
          },
        ],
        outcome:
          '你没有出拳，只跟着血里的声音念了一遍。念到第二遍时，四海的风停了一息。回响散去之前，你听见它把那个名字又重复了一次，确定你已经记住。',
      },
      {
        id: 'choice.longhan.bloodline_ancestor_echo.reflect',
        text: '以血意反照自身，看看这条血脉究竟改了什么。',
        requirements: [],
        effects: [
          { kind: 'applyStatus', statusId: 'status.longhan.clear_mind', months: 3, source: '祖血回响' },
          { kind: 'grantItem', itemId: 'item.longhan.tempering_pill', count: 1 },
          {
            kind: 'setFlag',
            flag: 'longhan.bloodline_ancestor_reflected',
            value: true,
          },
        ],
        outcome:
          '你把血意收回自身，一层层照过骨、脉、皮。旧血没有阻止你，反而把几处暗伤推到了明处。照到最后，你终于知道它把哪一截骨头换得更硬，又从哪里悄悄拿走了几分轻快。',
      },
    ],
    tags: ['hidden', 'bloodline', 'four_seas', 'ancestor'],
  },
  {
    id: 'event.longhan.body_marrow_echo',
    eraId: 'era.longhan',
    kind: 'hidden',
    title: '骨里有回声',
    summary: '易骨之后，你在骨腔里听见一阵很慢的回声，像有人在很远的地方敲石。',
    body:
      '你翻身时听见骨里有回声。不是疼，是空；像两根骨头之间留出了一条本不该有的路，风正从那里穿过。\n\n你去找礁石老头。他这回没有编草鞋，正把一块兽骨按在膝上听。\n\n“我骨里有声音。”你说。\n\n“嗯。”他没抬头，“说明旧骨换到一半，新骨还没长满。这个时候最容易觉得自己变强了，也最容易把自己敲断。”\n\n他把兽骨递给你：“听。骨不会说话，但它记得每一次挨打。你要学的不是怎么再挨一下，是怎么让新骨替你记住。”',
    pause: 'ambient',
    repeatable: false,
    dispatch: true,
    weight: 8,
    regionId: 'region.longhan.four_seas',
    requirements: [
      {
        kind: 'flag',
        flag: 'longhan.body_stone_pose_done',
        value: true,
      },
      { kind: 'bodyStage', minStage: 2 },
    ],
    onEnter: [
      {
        kind: 'addRumor',
        rumorId: 'rumor.longhan.body_marrow_echo',
        text: '有淬体者说，易骨之后骨腔里会有回声；老散修说那不是病，是新骨还没记住挨打的力道。',
      },
    ],
    choices: [
      {
        id: 'choice.longhan.body_marrow_echo.knock',
        text: '以指叩骨，听着回声把新骨敲实。',
        requirements: [],
        effects: [
          { kind: 'learnTechnique', techniqueId: 'technique.longhan.marrow_forge' },
          { kind: 'gainBodyTemper', amount: 90 },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.body_marrow_echo',
            text: '你一节一节叩过自己的骨头。老散修在旁边听着，偶尔说“轻了”“过了”。叩到最后一节时，骨里的回声终于和心跳合上。',
          },
        ],
        outcome:
          '你从指骨叩到脊椎，一节一节听回声。老头偶尔说“轻了”，偶尔说“过了”。叩到最后一节时，骨里的空响终于和心跳合上。他把兽骨扔进火里，说：“成了。往后再破体，骨头会先替你撑一下。”',
      },
      {
        id: 'choice.longhan.body_marrow_echo.water',
        text: '沉进冷水里闭气，让新骨自己长满。',
        requirements: [],
        effects: [
          { kind: 'learnTechnique', techniqueId: 'technique.longhan.marrow_forge' },
          { kind: 'gainCultivation', amount: 70 },
          { kind: 'grantItem', itemId: 'item.longhan.vein_crystal', count: 1 },
          {
            kind: 'setFlag',
            flag: 'longhan.body_marrow_echo_water',
            value: true,
          },
        ],
        outcome:
          '你在冷水里闭气到眼前发白。骨里的回声一开始很吵，后来渐渐被水压按住，变成一种很慢的沉响。上岸时老头递来一枚脉晶：“从水底捡的。新骨长满之前，别急着跟人动手。”',
      },
      {
        id: 'choice.longhan.body_marrow_echo.record',
        text: '把回声的节奏记在石上，留给后来的人。',
        requirements: [],
        effects: [
          { kind: 'learnTechnique', techniqueId: 'technique.longhan.marrow_forge' },
          { kind: 'changeResource', resource: 'merit', amount: 2 },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.body_marrow_echo_record',
            text: '有人把易骨时的骨鸣节奏刻在四海礁石上。照那些刻痕叩骨的人，破体时似乎少受些罪。',
          },
        ],
        outcome:
          '你把叩骨的节奏刻在礁石背面，刻得很浅，只有脱鞋站上去的人才摸得到。老头看完说：“你自己还没长满，倒先替别人记路。”他没有拦你，只让你把最后一节叩完。',
      },
    ],
    tags: ['hidden', 'body', 'four_seas', 'marrow'],
  },
]
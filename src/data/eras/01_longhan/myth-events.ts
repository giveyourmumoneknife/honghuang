import type { EventDefinition } from '@/types/content'

/**
 * 神话志异：从龙凤初劫的传说缝隙里抠出来的小故事。
 * 台词尽量像活人说话，别端着。
 */
export const longhanMythEvents: EventDefinition[] = [
  {
    id: 'event.longhan.myth_four_fiends_tracks',
    eraId: 'era.longhan',
    kind: 'world',
    title: '四凶的脚印',
    summary: '一个断了腿的猎人说，荒原上那四个东西昨晚一起过去了，脚印比车辙还深。',
    body:
      '猎人靠在一块被啃过的骨头上，腿上绑着两根树枝。他看见你，先问有没有水，喝完了才肯说自己看见了什么。\n\n“四个。”他伸出四根手指，又弯下去一根，“一个像牛，一个像老虎，一个长着人脸，还有一个……我也说不好，像一张嘴在走路。”\n\n他指了指西边。地上的脚印确实还在，深得能积住夜里的露水。\n\n“你要追就追。”他说，“不过先说好，我可不跟着。我还得回去告诉我婆娘，我今天没死。”',
    pause: 'ambient',
    repeatable: false,
    dispatch: true,
    weight: 9,
    regionId: 'region.longhan.beast_waste',
    requirements: [
      { kind: 'regionVisited', regionId: 'region.longhan.beast_waste' },
      { kind: 'phase', eraId: 'era.longhan', phaseId: 'phase.longhan.strife' },
    ],
    onEnter: [
      { kind: 'setFlag', flag: 'longhan.myth_four_tracks_seen', value: true },
    ],
    choices: [
      {
        id: 'choice.longhan.myth_four_tracks.hunt',
        text: '“你在这等着，我去看看它们到底长什么样。”',
        requirements: [
          { kind: 'realm', minRealm: 'foundation', minStage: 2 },
        ],
        effects: [
          { kind: 'setFlag', flag: 'longhan.myth_four_tracks_hunted', value: true },
          { kind: 'startCombat', encounterId: 'encounter.longhan.qiongqi', fleeAllowed: true },
        ],
        outcome:
          '你顺着脚印翻过两道土脊，风忽然停了。那头像老虎的东西就蹲在前面，背对着你，尾巴一下一下地敲着地。它没回头，只是说了一句：“人，你也闻着味儿来的？”',
      },
      {
        id: 'choice.longhan.myth_four_tracks.rescue',
        text: '先别管脚印，把猎人拖到背风的地方，给他留点水和伤药。',
        requirements: [],
        effects: [
          { kind: 'grantItem', itemId: 'item.longhan.old_bone_slip' },
          { kind: 'changeResource', resource: 'merit', amount: 2 },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.myth_four_tracks',
            text: '你把一个断了腿的猎人拖到背风处。他疼得直咧嘴，还惦记着回家告诉婆娘自己没死。',
          },
        ],
        outcome:
          '他疼得直抽气，还是把腰上挂的骨片塞给你。“上面刻的是我这些天数的数，哪天真数不清了，你替我记得。”你走的时候，他已经在打呼噜了。',
      },
      {
        id: 'choice.longhan.myth_four_tracks.listen',
        text: '把四个名字记下来，回去说给愿意听的人。',
        requirements: [],
        effects: [
          { kind: 'gainCultivation', amount: 40 },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.myth_four_fiends',
            text: '荒原的老人说，四凶不是四个怪物，是四件没有还回去的东西：贪、凶、傲、混沌。',
          },
        ],
        outcome:
          '你蹲下来，把猎人说过的四个模样在心里过了一遍。他看你记得认真，反倒笑了：“记这个有啥用？”你想了想，说：“以后遇上了，至少知道该往哪边跑。”',
      },
    ],
    tags: ['myth', 'four_fiends', 'beast_waste'],
  },
  {
    id: 'event.longhan.myth_clan_courier',
    eraId: 'era.longhan',
    kind: 'world',
    title: '三族传令兵',
    summary: '龙、凤、麒麟的信使同时到了路口，三封信都说自己最急。',
    body:
      '路口只有一条窄道，三匹马堵在一起，谁也不肯退。龙族的信使穿鳞甲，凤族的信使一身火气，麒麟族的信使最客气，可他的马横在路中间，一点让的意思都没有。\n\n“会盟的时辰要到了。”龙族信使说，“误了潮信，你担得起？”\n\n“火山的信晚一个时辰，灰就多落一层。”凤族信使把缰绳一拍，“你让他退。”\n\n麒麟族信使不说话，只把信举高了一点。\n\n三个人一起看你。',
    pause: 'ambient',
    repeatable: false,
    dispatch: true,
    weight: 10,
    regionId: 'region.longhan.honghuang_land',
    requirements: [
      { kind: 'regionVisited', regionId: 'region.longhan.honghuang_land' },
      { kind: 'phase', eraId: 'era.longhan', phaseId: 'phase.longhan.dawn' },
    ],
    onEnter: [
      { kind: 'setFlag', flag: 'longhan.myth_courier_seen', value: true },
    ],
    choices: [
      {
        id: 'choice.longhan.myth_courier.dragon',
        text: '“潮信不等人。龙族的先过。”',
        requirements: [],
        effects: [
          { kind: 'grantItem', itemId: 'item.longhan.dragon_tally' },
          { kind: 'changeFactionState', factionId: 'faction.longhan.dragon', reputationDelta: 4 },
          { kind: 'changeFactionState', factionId: 'faction.longhan.phoenix', reputationDelta: -1 },
        ],
        outcome:
          '龙族信使拱了拱手，打马就走，路过你时丢下一枚潮令：“下次过海，亮这个。”凤族的信使骂了一句，掉头绕路，火气把路边的草燎焦了一小片。',
      },
      {
        id: 'choice.longhan.myth_courier.phoenix',
        text: '“灰落下来可不会挑人。凤族的先过。”',
        requirements: [],
        effects: [
          { kind: 'grantItem', itemId: 'item.longhan.phoenix_feather' },
          { kind: 'changeFactionState', factionId: 'faction.longhan.phoenix', reputationDelta: 4 },
          { kind: 'changeFactionState', factionId: 'faction.longhan.qilin', reputationDelta: -1 },
        ],
        outcome:
          '凤族信使笑了一声，扬鞭就走。火星子溅到麒麟族信使的袖口上，他也不恼，只拍了拍，说：“行，我走慢些。反正地脉也不会跑。”',
      },
      {
        id: 'choice.longhan.myth_courier.open',
        text: '把三封信都借过来看一眼，再让他们猜拳定先后。',
        requirements: [],
        effects: [
          { kind: 'grantItem', itemId: 'item.longhan.nameless_letter' },
          { kind: 'changeResource', resource: 'karma', amount: 1 },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.myth_courier_letters',
            text: '三族的急信都只写了一句话：“会盟之前，先别让另外两家先到。”',
          },
        ],
        outcome:
          '三个人盯着你拆信，脸色一个比一个难看。三封信的墨迹还没干，内容居然差不多。你把信还回去，说：“要不你们猜拳吧。”他们真的猜了。龙族输了，脸黑了一路。',
      },
    ],
    tags: ['myth', 'three_clans', 'courier'],
  },
  {
    id: 'event.longhan.myth_ancestor_dragon_shed',
    eraId: 'era.longhan',
    kind: 'world',
    title: '祖龙蜕鳞',
    summary: '退潮后的滩上躺着一片比船还大的鳞，鳞根还带着血丝。',
    body:
      '潮水退到最远的地方，露出平时见不到的滩涂。那片鳞就搁在淤泥里，边缘还卷着，像刚从谁身上揭下来。\n\n几个赶海的小妖远远围着，不敢靠近。有个老龟趴在旁边，眯着眼看了半天，说：“祖龙换甲，掉一片不稀奇。稀奇的是，它掉在这，没人来收。”\n\n鳞上还沾着新鲜的潮气，摸上去是温的。远处海面很平，平得有点不对劲。',
    pause: 'ambient',
    repeatable: false,
    dispatch: true,
    weight: 8,
    regionId: 'region.longhan.four_seas',
    requirements: [
      { kind: 'regionVisited', regionId: 'region.longhan.four_seas' },
      { kind: 'phase', eraId: 'era.longhan', phaseId: 'phase.longhan.strife' },
    ],
    onEnter: [
      { kind: 'setFlag', flag: 'longhan.myth_dragon_shed_seen', value: true },
    ],
    choices: [
      {
        id: 'choice.longhan.myth_dragon_shed.take',
        text: '掰下一小片收进怀里。这么大的鳞，掉着也是掉着。',
        requirements: [],
        effects: [
          { kind: 'grantItem', itemId: 'item.longhan.dragon_scale' },
          { kind: 'changeFactionState', factionId: 'faction.longhan.dragon', reputationDelta: -4 },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.myth_dragon_shed',
            text: '有人在海滩上捡走了祖龙蜕下的鳞。龙庭的巡海使已经在打听那天谁去过滩涂。',
          },
        ],
        outcome:
          '鳞片入手比想象中轻，掰口处渗出一线血，转眼就凝成了珠子。你走出很远，回头看见海水不知什么时候涨了回来，把剩下的鳞和脚印一起盖住了。',
      },
      {
        id: 'choice.longhan.myth_dragon_shed.report',
        text: '去龙庭报个信。这么大的东西，总得有人管。',
        requirements: [],
        effects: [
          { kind: 'changeFactionState', factionId: 'faction.longhan.dragon', reputationDelta: 6, contributionDelta: 4 },
          { kind: 'setFlag', flag: 'longhan.myth_dragon_shed_reported', value: true },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.myth_dragon_shed',
            text: '你向龙庭报了祖龙蜕鳞的事。巡海使听完，只问了一句：“你碰了吗？”你说没有，他才点头。',
          },
        ],
        outcome:
          '巡海使来得很快，到了滩上先看鳞，再看你，最后问：“你碰了吗？”你说没有。他点点头，叫人把鳞抬走，临走扔下一句：“下回见着，别靠近。那不是掉下来的，是它自己揭的。”',
      },
      {
        id: 'choice.longhan.myth_dragon_shed.listen',
        text: '在鳞下坐一会儿，听听潮声里有没有别的东西。',
        requirements: [],
        effects: [
          { kind: 'gainCultivation', amount: 60 },
          { kind: 'applyStatus', statusId: 'status.longhan.tide_breath', months: 6, source: '祖龙蜕鳞' },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.myth_dragon_shed_tide',
            text: '你坐在祖龙蜕下的鳞下听潮。潮声里有一句话反复了三遍：“海不是我的，是我替它守的。”',
          },
        ],
        outcome:
          '你贴着鳞根坐下，潮声从骨头上爬过去。听久了，能听出里面有一句很慢的话，像是有谁在很远的地方自言自语：“海不是我的……是我替它守的。”你起身时，鳞片上的血丝已经干了。',
      },
    ],
    tags: ['myth', 'dragon', 'four_seas'],
  },
  {
    id: 'event.longhan.myth_yuanfeng_ember',
    eraId: 'era.longhan',
    kind: 'world',
    title: '元凤留火',
    summary: '火山口边有一小簇火，没有柴，也不灭。火边有人用石头压了一张字条。',
    body:
      '字条上只有两行字，笔画很急：“别让它灭。也别让它长大。”\n\n那簇火只有拳头大，蹲在一块焦黑的石头上，安安静静地烧。周围没有柴，没有油，连风都不往那边吹。\n\n火里偶尔会翻出一小片羽毛的影子，转眼又没了。你伸手试了试，隔着半尺就能觉出烫。',
    pause: 'ambient',
    repeatable: false,
    dispatch: true,
    weight: 9,
    regionId: 'region.longhan.undying_volcano',
    requirements: [
      { kind: 'regionVisited', regionId: 'region.longhan.undying_volcano' },
      { kind: 'phase', eraId: 'era.longhan', phaseId: 'phase.longhan.calamity' },
    ],
    onEnter: [
      { kind: 'setFlag', flag: 'longhan.myth_yuanfeng_ember_seen', value: true },
    ],
    choices: [
      {
        id: 'choice.longhan.myth_yuanfeng_ember.keep',
        text: '找一只不漏风的玉盒，把它收起来带走。',
        requirements: [],
        effects: [
          { kind: 'grantItem', itemId: 'item.longhan.phoenix_feather' },
          { kind: 'applyStatus', statusId: 'status.longhan.first_flame_mark', months: 8, source: '元凤留火' },
          { kind: 'changeFactionState', factionId: 'faction.longhan.phoenix', reputationDelta: 3 },
        ],
        outcome:
          '玉盒合上的时候，火在里头轻轻撞了一下盒壁，像有什么东西翻了个身。你把它贴身收好，掌心一路都是温的。字条你没动，还压在石头上。',
      },
      {
        id: 'choice.longhan.myth_yuanfeng_ember.smother',
        text: '用湿泥把它捂住。来历不明的东西，还是不沾为妙。',
        requirements: [],
        effects: [
          { kind: 'grantItem', itemId: 'item.longhan.nirvana_ash' },
          { kind: 'changeFactionState', factionId: 'faction.longhan.phoenix', reputationDelta: -5 },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.myth_yuanfeng_ember_out',
            text: '火山口边那簇不灭的火灭了。有人说是风，有人说是人。凤族在找那个捂火的人。',
          },
        ],
        outcome:
          '湿泥盖上的一瞬间，火没挣扎，只是暗了一下，然后从泥缝里冒出最后一股白烟。烟散了，地上剩一小撮灰，形状像半片羽毛。远处火山口忽然轰了一声，像是有人在梦里翻了个身。',
      },
      {
        id: 'choice.longhan.myth_yuanfeng_ember.blood',
        text: '割开手指，滴一滴血进去，看它认不认你。',
        requirements: [],
        effects: [
          { kind: 'gainCultivation', amount: 90 },
          { kind: 'applyStatus', statusId: 'status.longhan.burn_scar', months: 6, source: '元凤留火' },
          { kind: 'setFlag', flag: 'longhan.myth_yuanfeng_ember_fed', value: true },
        ],
        outcome:
          '血滴进去，火苗先是缩了一下，接着立起来，长到一人高，烫得你后退了半步。火里有一双眼睛看了你一眼，又很快熄回去，重新变成拳头大的一簇。你低头看手指，伤口已经焦了，不疼，但留下了一道白印。',
      },
    ],
    tags: ['myth', 'phoenix', 'volcano'],
  },
  {
    id: 'event.longhan.myth_false_qilin',
    eraId: 'era.longhan',
    kind: 'world',
    title: '假麒麟',
    summary: '麒麟崖下摆了一只“祥瑞”，会点头，会流泪，就是不吃草。',
    body:
      '崖下的空地上搭了个台子，台上伏着一只麒麟。毛色很亮，角也齐全，围观的小妖跪下就拜，香火堆了一地。\n\n可你走近了才发现，它眨眼的频率太整齐，眼泪也不是从眼睛里出来的——是台子底下有人在挤一只水囊。\n\n“别声张。”旁边一个麒麟族的年轻人压低声音，“是我三叔弄的。他说，总得让底下的人有个盼头。”\n\n台上那只假麒麟又点了点头，动作有点僵。',
    pause: 'ambient',
    repeatable: false,
    dispatch: true,
    weight: 9,
    regionId: 'region.longhan.qilin_cliff',
    requirements: [
      { kind: 'regionVisited', regionId: 'region.longhan.qilin_cliff' },
      { kind: 'phase', eraId: 'era.longhan', phaseId: 'phase.longhan.strife' },
    ],
    onEnter: [
      { kind: 'setFlag', flag: 'longhan.myth_false_qilin_seen', value: true },
    ],
    choices: [
      {
        id: 'choice.longhan.myth_false_qilin.expose',
        text: '当着大家的面，把台子底下的人叫出来。',
        requirements: [],
        effects: [
          { kind: 'grantItem', itemId: 'item.longhan.qilin_seal' },
          { kind: 'changeFactionState', factionId: 'faction.longhan.qilin', reputationDelta: 5 },
          { kind: 'setFlag', flag: 'longhan.myth_false_qilin_exposed', value: true },
        ],
        outcome:
          '水囊被拽出来的时候，台下安静得能听见香灰落地的声。那年轻人涨红了脸，他三叔从台子底下爬出来，没跑，只叹了口气：“行吧，是假的。可他们哭着哭着，心里是不是好受点了？”没人接话。那枚麒麟印是他后来塞给你的，说算是谢你，也算是谢他自己挨了这顿骂。',
      },
      {
        id: 'choice.longhan.myth_false_qilin.play_along',
        text: '什么也不说，往香火堆里添一块灵石，把这场戏看完。',
        requirements: [],
        effects: [
          { kind: 'changeResource', resource: 'spirit_stones', amount: -12 },
          { kind: 'changeResource', resource: 'karma', amount: 1 },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.myth_false_qilin',
            text: '麒麟崖下的祥瑞还在。有人说它灵，有人说它假。真假不知道，反正香火越来越旺了。',
          },
        ],
        outcome:
          '你添的灵石被恭恭敬敬地供上去了。假麒麟低着头，泪一滴一滴掉，台下有人跟着抹眼睛。你站在人群里，忽然分不清大家拜的是台上那只，还是自己心里那个“总得有点好事”的念头。',
      },
      {
        id: 'choice.longhan.myth_false_qilin.ask',
        text: '等人都散了，凑到假麒麟耳边问它一句话。',
        requirements: [],
        effects: [
          { kind: 'gainCultivation', amount: 50 },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.myth_false_qilin',
            text: '你问假麒麟：“你装着装着，累不累？”台子底下沉默了很久，才有人说：“累。可我一停下来，他们就不拜了。”',
          },
          { kind: 'setFlag', flag: 'longhan.myth_false_qilin_asked', value: true },
        ],
        outcome:
          '人都走光以后，你低声问：“你装着装着，累不累？”台子底下半天没动静，最后传来一句闷闷的回答：“累。可我一停下来，他们就不拜了。”你抬头看那只假麒麟，它还在笑，眼泪早就干了。',
      },
    ],
    tags: ['myth', 'qilin', 'false_omen'],
  },
  {
    id: 'event.longhan.myth_zi_xiao_empty_seat',
    eraId: 'era.longhan',
    kind: 'hidden',
    title: '紫霄宫的空席',
    summary: '大殿里很多位置都空着，只有一只蒲团是热的，像刚有人站起来。',
    body:
      '你在殿外听过的那道回声，今天又响了。殿门自己开了一条缝，里面没有灯，却看得清每一只蒲团。\n\n大多落着灰，只有一个位置干干净净，蒲团还是温的。\n\n殿里没有别人。可你站了一会儿，总觉得有人在等你开口，而且他已经等了很久。\n\n墙上有一行很淡的字：先来后到，不分高低。字下面画了个空圈，圈里没写字。',
    pause: 'ambient',
    repeatable: false,
    dispatch: true,
    weight: 8,
    regionId: 'region.longhan.zi_xiao_palace',
    requirements: [
      { kind: 'flag', flag: 'longhan.hidden_zi_xiao_echo', value: true },
      { kind: 'regionVisited', regionId: 'region.longhan.zi_xiao_palace' },
    ],
    onEnter: [
      { kind: 'setFlag', flag: 'longhan.myth_zi_xiao_seat_seen', value: true },
    ],
    choices: [
      {
        id: 'choice.longhan.myth_zi_xiao_seat.sit',
        text: '坐上去。地方空着，总得有人坐。',
        requirements: [],
        effects: [
          { kind: 'gainCultivation', amount: 120 },
          { kind: 'applyStatus', statusId: 'status.longhan.quiet_room', months: 8, source: '紫霄宫空席' },
          { kind: 'setFlag', flag: 'longhan.myth_zi_xiao_sat', value: true },
        ],
        outcome:
          '蒲团一承重，殿里所有的灰都浮了起来，又慢慢落回去。你听见很多声音在很远的地方讲同一件事，听不清内容，只觉得每一句都跟你有点关系。等你站起来，腿早麻了，外面已经过了一夜。',
      },
      {
        id: 'choice.longhan.myth_zi_xiao_seat.stand',
        text: '站着听完。位置既然不是留给你的，就别坐。',
        requirements: [],
        effects: [
          { kind: 'changeResource', resource: 'merit', amount: 3 },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.myth_zi_xiao_stand',
            text: '你在紫霄宫站了一夜，没坐那个空位。临走时，墙上那行字下面多了一个点，像是有人拿指头按的。',
          },
        ],
        outcome:
          '你靠着殿柱站到天光透进来。声音一条一条散了，最后只剩一句：“知道不坐，也算听过。”你出门时回头看了一眼，那个蒲团还是温的，墙上的空圈里多了一个很小很小的点。',
      },
      {
        id: 'choice.longhan.myth_zi_xiao_seat.flip',
        text: '把蒲团翻过来，看看底下压着什么。',
        requirements: [],
        effects: [
          { kind: 'grantItem', itemId: 'item.longhan.nameless_mirror' },
          { kind: 'changeResource', resource: 'karma', amount: 1 },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.myth_zi_xiao_mirror',
            text: '紫霄宫的一只蒲团底下压着一面没有名字的镜子。照谁，谁就想不起自己刚说过的话。',
          },
        ],
        outcome:
          '蒲团底下什么也没压，只有一面很旧的镜子，镜面朝下。你把它翻过来照了照，镜子里的人比你慢半拍才眨眼。你走出殿门，忽然想不起自己刚在里面跟谁说过话。',
      },
    ],
    tags: ['myth', 'zi_xiao', 'hidden'],
  },
  {
    id: 'event.longhan.myth_four_swords',
    eraId: 'era.longhan',
    kind: 'world',
    title: '魔渊四剑',
    summary: '魔渊边上插着四把剑，每把都只入土半寸，却谁也拔不动。',
    body:
      '四把剑排成一排，剑身上各刻了一个字：诛、戮、陷、绝。土是软的，剑只插进去半寸，可你握住剑柄往外拽，纹丝不动。\n\n“别白费劲。”身后有人说话。你回头，看见一个没有影子的人站在三步开外，“它们不认力气。”\n\n他走近了些，声音很平：“它们认主。你回答我一个问题，回答对了，就能挑一把。答错了……”他看了看你，没往下说。',
    pause: 'ambient',
    repeatable: false,
    dispatch: true,
    weight: 8,
    regionId: 'region.longhan.rahu_abyss',
    requirements: [
      { kind: 'regionVisited', regionId: 'region.longhan.rahu_abyss' },
      { kind: 'phase', eraId: 'era.longhan', phaseId: 'phase.longhan.calamity' },
    ],
    onEnter: [
      { kind: 'setFlag', flag: 'longhan.myth_four_swords_seen', value: true },
    ],
    choices: [
      {
        id: 'choice.longhan.myth_four_swords.take',
        text: '“别问了。剑放这这么久，总得有人用。”',
        requirements: [
          { kind: 'realm', minRealm: 'foundation', minStage: 3 },
        ],
        effects: [
          { kind: 'grantItem', itemId: 'item.longhan.abyss_needle' },
          { kind: 'applyStatus', statusId: 'status.longhan.name_borrowed', months: 6, source: '魔渊四剑' },
          { kind: 'setFlag', flag: 'longhan.myth_four_swords_taken', value: true },
        ],
        outcome:
          '那人看了你很久，最后竟笑了：“行，算你答对。”最边上那把刻着“绝”的剑自己跳起来，落到你手里，轻得像一片铁皮。你握久了，剑身上慢慢浮出两个小字，是你自己的名字。',
      },
      {
        id: 'choice.longhan.myth_four_swords.ask',
        text: '“这四把剑，原来是谁的？”',
        requirements: [],
        effects: [
          { kind: 'gainCultivation', amount: 70 },
          { kind: 'setFlag', flag: 'longhan.myth_four_swords_owner', value: true },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.myth_four_swords',
            text: '魔渊边的人说，四剑本来是一把。后来剑主把自己的心分成了四份，一人一份，免得哪一份先烂。',
          },
        ],
        outcome:
          '“同一把。”他说，“本来是一把。后来剑主把心分成四份，说这样坏得慢一点。”他抬手指了指四把剑，“你看看这字，连起来念，像不像一个人的死法？”你顺着看过去，诛、戮、陷、绝，念到最后一个字，嗓子有点发干。',
      },
      {
        id: 'choice.longhan.myth_four_swords.leave',
        text: '倒退着离开，别把名字留在这。',
        requirements: [],
        effects: [
          { kind: 'applyStatus', statusId: 'status.longhan.clear_mind', months: 6, source: '魔渊四剑' },
          { kind: 'changeResource', resource: 'merit', amount: 2 },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.myth_four_swords',
            text: '魔渊边上四把剑，你一把也没碰。走出很远，那个没有影子的人还在原地看着你，像是记住了一件小事。',
          },
        ],
        outcome:
          '你一步一步退，始终没把背留给那四把剑。退到看不见它们的地方，脚后跟才敢着地。风里有个声音轻轻说：“不贪，也算一种答法。”',
      },
    ],
    tags: ['myth', 'rahu', 'four_swords'],
  },
  {
    id: 'event.longhan.myth_one_night_truce',
    eraId: 'era.longhan',
    kind: 'world',
    title: '停火一夜',
    summary: '火堆边坐着三个伤兵，一个龙族，一个凤族，一个麒麟族。今晚谁都没力气打了。',
    body:
      '火堆是在一道干河沟里升起来的，烧的是断枪和碎旗。三个人各占一边，伤口都还在渗血，谁也没先开口。\n\n你走过去时，龙族的那个抬起眼皮看了看你：“自己人？”\n\n“不是。”凤族的那个先答了，咳出一口血沫，“看他这样子，三边都不像。”\n\n麒麟族的那个最年轻，抱着膝盖没说话。火快灭了，谁也不想动。',
    pause: 'ambient',
    repeatable: false,
    dispatch: true,
    weight: 10,
    regionId: 'region.longhan.honghuang_land',
    requirements: [
      { kind: 'regionVisited', regionId: 'region.longhan.honghuang_land' },
      { kind: 'phase', eraId: 'era.longhan', phaseId: 'phase.longhan.calamity' },
    ],
    onEnter: [
      { kind: 'setFlag', flag: 'longhan.myth_one_night_seen', value: true },
    ],
    choices: [
      {
        id: 'choice.longhan.myth_one_night.tea',
        text: '烧一壶水，添点柴，让三个人都往火边挪一挪。',
        requirements: [],
        effects: [
          { kind: 'changeResource', resource: 'merit', amount: 3 },
          { kind: 'changeFactionState', factionId: 'faction.longhan.dragon', reputationDelta: 2 },
          { kind: 'changeFactionState', factionId: 'faction.longhan.phoenix', reputationDelta: 2 },
          { kind: 'changeFactionState', factionId: 'faction.longhan.qilin', reputationDelta: 2 },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.myth_one_night',
            text: '停火的一夜，三个伤兵分喝了一壶水。天快亮的时候，最年轻的那个说了声“谢了”，也不知道是谢谁。',
          },
        ],
        outcome:
          '水开了，你给三个人各倒了一碗。没人说话，但三个人都往火边挪了挪。后半夜龙族的那个先睡着了，打起了呼噜，另外两个对看了一眼，居然都没笑他。天快亮时，三个人各自起身，朝三个方向走，谁也没回头，谁也没再动手。',
      },
      {
        id: 'choice.longhan.myth_one_night.ask',
        text: '“你们三个，到底在争什么？”',
        requirements: [],
        effects: [
          { kind: 'gainCultivation', amount: 50 },
          { kind: 'setFlag', flag: 'longhan.myth_one_night_asked', value: true },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.myth_one_night',
            text: '有人问三个伤兵在争什么。龙族说潮路，凤族说火山，麒麟族说地脉。可他们说的三个地方，压根不挨着。',
          },
        ],
        outcome:
          '龙族的说：“潮路。”凤族的说：“火山。”年轻的那个想了想，说：“地脉。”你问：“那你们仨怎么打到一块来的？”三个人都愣住了。火堆噼啪响了一声，谁也没答上来。',
      },
      {
        id: 'choice.longhan.myth_one_night.take',
        text: '等他们都睡着了，把剩下的干粮和伤药收走。',
        requirements: [],
        effects: [
          { kind: 'changeResource', resource: 'spirit_stones', amount: 18 },
          { kind: 'changeResource', resource: 'karma', amount: 2 },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.myth_one_night_taken',
            text: '停火的一夜，你拿走了三个伤兵的干粮。后半夜最年轻的那个饿醒了，看了你一眼，什么也没说，又闭上了眼睛。',
          },
        ],
        outcome:
          '你走的时候火还没灭。最年轻的那个其实没睡着，你收拾东西时他一直看着，直到你把最后一块干粮塞进怀里，他才闭上眼。走出很远，你回头，看见他坐起来，往火里添了一根柴。',
      },
    ],
    tags: ['myth', 'three_clans', 'mercy'],
  },
  {
    id: 'event.longhan.myth_buzhou_listen',
    eraId: 'era.longhan',
    kind: 'world',
    title: '不周山听天',
    summary: '山肚子里有声音，贴着石头能听见。守山的老头说，听可以，别应。',
    body:
      '不周山脚下有个老头，坐在一块大石头上编草鞋，面前摆着一排编好的，谁路过都可以拿一双。\n\n“山上别乱敲。”他头也不抬地说，“里头有东西在说话，你听听就得了，别搭腔。一搭腔，它就当你答应了。”\n\n你抬头看山。山很高，高到看不见顶。风从石缝里过的时候，确实带着一点含混的人声。',
    pause: 'ambient',
    repeatable: false,
    dispatch: true,
    weight: 9,
    regionId: 'region.longhan.buzhou_mountain',
    requirements: [
      { kind: 'regionVisited', regionId: 'region.longhan.buzhou_mountain' },
    ],
    onEnter: [
      { kind: 'setFlag', flag: 'longhan.myth_buzhou_seen', value: true },
    ],
    choices: [
      {
        id: 'choice.longhan.myth_buzhou.listen',
        text: '把耳朵贴上石壁，听一会儿。',
        requirements: [],
        effects: [
          { kind: 'gainCultivation', amount: 80 },
          { kind: 'applyStatus', statusId: 'status.longhan.quiet_room', months: 6, source: '不周山听天' },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.myth_buzhou',
            text: '你贴着不周山的石头听了一个时辰。里面有个声音一直在报数，报的好像是天底下还剩多少根柱子。',
          },
        ],
        outcome:
          '石头是凉的，贴着贴着自己也凉下来。里头的声音很慢，一直在报数：“一根，两根，三根……”报到最后停了一会儿，又说：“还差一根。”你直起腰的时候，老头正看着你：“听见了？”你点头。他说：“听见就行，别往心里去。”',
      },
      {
        id: 'choice.longhan.myth_buzhou.knock',
        text: '敲三下，看看山答不答。',
        requirements: [],
        effects: [
          { kind: 'grantItem', itemId: 'item.longhan.ridge_tablet' },
          { kind: 'setFlag', flag: 'longhan.myth_buzhou_knocked', value: true },
          { kind: 'changeResource', resource: 'karma', amount: 1 },
        ],
        outcome:
          '你敲了三下。山没塌，只是脚下的碎石跳了跳，石缝里吐出一块薄薄的石片，正落在你手心里。老头凑过来看了一眼，咂咂嘴：“它给你，你就拿着。不过记住，柱子裂了的时候，你得回来。”',
      },
      {
        id: 'choice.longhan.myth_buzhou.offering',
        text: '什么也不问，从路边捧一捧土，添到山根下。',
        requirements: [],
        effects: [
          { kind: 'changeResource', resource: 'merit', amount: 2 },
          { kind: 'changeRegionState', regionId: 'region.longhan.buzhou_mountain', key: 'offering_made', value: true },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.myth_buzhou_offering',
            text: '不周山根下多了一捧新土。守山的老头说，山上不缺口粮不缺香火，缺的是有人记得它也会累。',
          },
        ],
        outcome:
          '你蹲下来，捧了一捧土，拍在山根上。老头没拦你，等你拍完了，才说：“山上不缺香火，也不缺口粮。缺的是有人记得，它也累。”他递给你一双草鞋，你没要，他也没坚持，又低头继续编。',
      },
    ],
    tags: ['myth', 'buzhou', 'heaven'],
  },
  {
    id: 'event.longhan.myth_wandering_physician',
    eraId: 'era.longhan',
    kind: 'world',
    title: '走方药师',
    summary: '一个女人在战场旧址摆了个药摊，牌子上写着：不问哪族的，先来后到。',
    body:
      '她的药摊就一张毡子，几把干草，一口豁了口的锅。来看伤的人排了一条小队，龙族的排在前面，凤族的排在中间，麒麟族的排在最后，居然没人插队。\n\n“骨头断了先别动。”她一边给人接骨一边说，“你，把袖子卷起来。血都干成这样了才来，你是想省药钱还是想省命？”\n\n伤号被她训得一声不吭。轮到你时，她头也没抬：“哪不舒服？”',
    pause: 'ambient',
    repeatable: true,
    cooldownMonths: 6,
    dispatch: true,
    weight: 8,
    regionId: 'region.longhan.honghuang_land',
    requirements: [
      { kind: 'regionVisited', regionId: 'region.longhan.honghuang_land' },
    ],
    onEnter: [
      { kind: 'setFlag', flag: 'longhan.myth_physician_seen', value: true },
    ],
    choices: [
      {
        id: 'choice.longhan.myth_physician.gather',
        text: '“我没事。帮你采一夜药吧。”',
        requirements: [],
        effects: [
          { kind: 'changeResource', resource: 'spirit_herbs', amount: 12 },
          { kind: 'changeResource', resource: 'merit', amount: 2 },
          { kind: 'grantItem', itemId: 'item.longhan.purifying_dew' },
        ],
        outcome:
          '她愣了一下，随即指了指后山：“紫叶的别采，根上有毒。别的随便。”你采到后半夜回来，她已经在锅边睡着了，锅里还给你留了一碗热汤。第二天你走，她在药摊上多摆了一块石头，上头刻着：“采药的，免诊金。”',
      },
      {
        id: 'choice.longhan.myth_physician.treat',
        text: '“手上这道旧伤，一直好不利索。”',
        requirements: [],
        effects: [
          { kind: 'applyStatus', statusId: 'status.longhan.pill_breath', months: 6, source: '走方药师' },
          { kind: 'changeResource', resource: 'spirit_stones', amount: -10 },
          { kind: 'setFlag', flag: 'longhan.myth_physician_treated', value: true },
        ],
        outcome:
          '她抓过你的手，翻来覆去看了看，皱着眉说：“拖了这么久，再晚点就得从根上剜。”药敷上去的时候很烫，过了一会儿又凉得透骨。临走她塞给你一小包药粉：“三日一换。别嫌麻烦，命比麻烦贵。”',
      },
      {
        id: 'choice.longhan.myth_physician.ask',
        text: '“三族的伤号你都治，不怕有人来找麻烦？”',
        requirements: [],
        effects: [
          { kind: 'gainCultivation', amount: 40 },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.myth_physician',
            text: '有人问走方药师，三族的伤都治，图什么。她说：“图他们打完仗还能回家。家里有人等，就还有得谈。”',
          },
          { kind: 'setFlag', flag: 'longhan.myth_physician_asked', value: true },
        ],
        outcome:
          '她把捣药的杵子放下，想了一会儿：“怕啊。可我要是不治，他们打完了也回不了家。家里还有人等，就还有得谈。”她说完又低下头，“你问这个干啥，你又不受伤。”',
      },
    ],
    tags: ['myth', 'mercy', 'healer'],
  },
  {
    id: 'event.longhan.myth_crack_counter',
    eraId: 'era.longhan',
    kind: 'world',
    title: '裂缝计数人',
    summary: '魔渊口坐着一个人，正用骨刀在手臂上刻道子。他说他在数天裂了几道。',
    body:
      '他坐在魔渊边上，背对深渊，面朝天。每过一会儿，他就抬手往自己左边小臂上刻一道，眼皮都不眨。\n\n小臂上已经密密麻麻，新伤叠着旧疤。\n\n“别挡着。”他说，“你一站过来，我就少看一道。”\n\n你退开半步，问他在数什么。他抬了抬下巴，让你自己看天。天上有云，云缝里有一道很淡的白线，细看像瓷上的裂。再看，好像又多了一道。',
    pause: 'ambient',
    repeatable: false,
    dispatch: true,
    weight: 8,
    regionId: 'region.longhan.rahu_abyss',
    requirements: [
      { kind: 'regionVisited', regionId: 'region.longhan.rahu_abyss' },
      { kind: 'phase', eraId: 'era.longhan', phaseId: 'phase.longhan.calamity' },
    ],
    onEnter: [
      { kind: 'setFlag', flag: 'longhan.myth_crack_counter_seen', value: true },
    ],
    choices: [
      {
        id: 'choice.longhan.myth_crack_counter.count',
        text: '在他旁边坐下，替他从天亮数到天黑。',
        requirements: [],
        effects: [
          { kind: 'gainCultivation', amount: 70 },
          { kind: 'applyStatus', statusId: 'status.longhan.old_tide_dream', months: 4, source: '裂缝计数人' },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.myth_crack_counter',
            text: '你替一个人在魔渊口数天上的裂缝。数到天黑，他说：“你数得比我准。可惜这活儿，人越多越好。”',
          },
        ],
        outcome:
          '你们两个人一人看一边，看到眼花就换班。天黑的时候他停下来，活动了一下脖子，说：“你数得比我准。可惜这活儿，人越多越好。”他把骨刀递给你看了一眼，又收回去：“这个不能给你，我还得用。”',
      },
      {
        id: 'choice.longhan.myth_crack_counter.ask',
        text: '“一共裂了多少道？”',
        requirements: [],
        effects: [
          { kind: 'gainCultivation', amount: 30 },
          { kind: 'setFlag', flag: 'longhan.myth_crack_counter_asked', value: true },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.myth_crack_counter',
            text: '魔渊口数裂缝的人说，天裂了多少道他也不知道。他每多数一道，天上就多裂一道。',
          },
        ],
        outcome:
          '“不知道。”他很痛快地说，“我每多数一道，它就多裂一道。我要是不数，它还是裂，可我心里没数。”他想了想，“你要问总数，得去问裂的那个人。”',
      },
      {
        id: 'choice.longhan.myth_crack_counter.take',
        text: '趁他抬头看天，把他脚边的骨片拿走。',
        requirements: [],
        effects: [
          { kind: 'grantItem', itemId: 'item.longhan.old_bone_slip' },
          { kind: 'changeResource', resource: 'karma', amount: 2 },
          { kind: 'setFlag', flag: 'longhan.myth_crack_counter_taken', value: true },
        ],
        outcome:
          '骨片上刻满了道子，密得没有下刀的地方。他等你拿完了，才慢慢说：“拿了就替我一件事——每天晚上看一眼天。看见多了，就自己想个办法。”他没追，也没生气，低头继续刻自己的手臂。',
      },
    ],
    tags: ['myth', 'rahu', 'crack'],
  },
  {
    id: 'event.longhan.myth_last_veteran',
    eraId: 'era.longhan',
    kind: 'world',
    title: '最后一个老兵',
    summary: '大劫过去以后，会盟台旧址还坐着一个老兵。他问你，最后是哪边赢了。',
    body:
      '会盟台早就塌了一半，旗也烧没了，只剩几根焦黑的木桩。老兵坐在最中间，铠甲脱了半边，怀里抱着一顶头盔。\n\n看见你，他眯起眼认了半天，没认出来，就招了招手：“过来坐。你也是来等消息的？”\n\n他指了指天边：“我在这等了三拨人。一拨说龙族赢了，一拨说凤族赢了，还有一拨没说话就走了。”他顿了顿，抬头看你，“你说，到底是哪边赢了？”',
    pause: 'ambient',
    repeatable: false,
    dispatch: true,
    weight: 8,
    regionId: 'region.longhan.honghuang_land',
    requirements: [
      { kind: 'regionVisited', regionId: 'region.longhan.honghuang_land' },
      { kind: 'phase', eraId: 'era.longhan', phaseId: 'phase.longhan.aftermath' },
    ],
    onEnter: [
      { kind: 'setFlag', flag: 'longhan.myth_last_veteran_seen', value: true },
    ],
    choices: [
      {
        id: 'choice.longhan.myth_last_veteran.truth',
        text: '“都没赢。死了的人最多。”',
        requirements: [],
        effects: [
          { kind: 'changeResource', resource: 'merit', amount: 2 },
          { kind: 'setFlag', flag: 'longhan.myth_last_veteran_truth', value: true },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.myth_last_veteran',
            text: '你告诉会盟台的老兵，这一劫没人赢。他想了很久，说：“那我这几个兄弟，算是白死了？”你说：“不算。有人记得。”',
          },
        ],
        outcome:
          '老兵听完，没发火，只是把头盔抱紧了些，过了很久才说：“那我这几个兄弟，算是白死了？”你说：“不算。有人记得。”他点点头，像终于把一件很重的东西放下了：“行。记得就行。记着，比赢强。”',
      },
      {
        id: 'choice.longhan.myth_last_veteran.lie',
        text: '“赢了。你这边赢了，赢得挺漂亮。”',
        requirements: [],
        effects: [
          { kind: 'changeResource', resource: 'spirit_stones', amount: 15 },
          { kind: 'setFlag', flag: 'longhan.myth_last_veteran_lie', value: true },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.myth_last_veteran',
            text: '会盟台旧址坐着一个老兵，逢人就问哪边赢了。跟他说哪边赢了，他都会笑；笑完了，又接着问。',
          },
        ],
        outcome:
          '他眼睛一下亮了，抓着你的袖子问了好几遍“真的？”。你说真的。他笑起来，笑出了眼泪，把怀里那顶头盔端端正正地放在木桩上，说：“听见没，咱们赢了。”你走的时候没回头。',
      },
      {
        id: 'choice.longhan.myth_last_veteran.stay',
        text: '不回答，在他旁边坐下，陪他等天黑。',
        requirements: [],
        effects: [
          { kind: 'gainCultivation', amount: 60 },
          { kind: 'applyStatus', statusId: 'status.longhan.quiet_room', months: 4, source: '最后一个老兵' },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.myth_last_veteran_stay',
            text: '你在会盟台旧址陪一个老兵坐到天黑。他后来没再问，只说了一句：“有人陪着等，等什么就不那么要紧了。”',
          },
        ],
        outcome:
          '你坐下，什么也没说。老兵等了一会儿，也没再问。天一点点黑下去，远处的潮声起来了，又落下去。他后来靠着木桩睡着了，鼾声很轻。你没有叫醒他，走的时候把外袍盖在了他腿上。',
      },
    ],
    tags: ['myth', 'aftermath', 'veteran'],
  },
]
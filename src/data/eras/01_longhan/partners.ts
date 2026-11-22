import type { PartnerDefinition } from '@/types/content'

export const longhanPartners: PartnerDefinition[] = [
  {
    id: 'partner.longhan.ao_guang',
    name: '敖光',
    factionId: 'faction.longhan.dragon',
    eraFates: {
      'era.prologue': '潮线初退时，她曾在很远的海面巡过一遭，没有留下名字。',
      'era.longhan': '在四海潮眼与旧宫之间巡行，等你把听潮洞的灯一盏盏点亮。',
    },
    description:
      '龙庭的巡潮使，惯于在退潮后清点失物。她记得每一枚潮印的来处，却很少提自己的旧名。敖光说话像潮水：先退一步，再决定要不要漫过来。',
    role: 'scout',
    bond: {
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
      eventId: 'event.longhan.ao_guang_bond',
      description:
        '与敖光共守一次完整的潮汐，并在潮退后仍记得彼此的名字。龙族的结缘不是誓词，而是把归期交给对方保管。',
    },
    postBondEventIds: ['event.longhan.cave_discovery'],
    publicEventIds: ['event.longhan.tide_market'],
    tags: ['dragon', 'scout', 'tide'],
  },
  {
    id: 'partner.longhan.dan_yu',
    name: '丹羽',
    factionId: 'faction.longhan.phoenix',
    eraFates: {
      'era.prologue': '不死火山尚未醒来时，她已经蹲在灰里数过很多次火。',
      'era.longhan': '守着涅槃池与旧火道，等一个愿意听她讲完三种火的人。',
    },
    description:
      '凤族的执火人，专替同族辨认哪一缕火该留下、哪一缕该烧尽。她说话很慢，因为每一次判断都可能决定一位同族还能不能被记住。丹羽不轻易落羽；她说落下的羽会替主人记住一个错误。',
    role: 'teacher',
    bond: {
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
      ],
      eventId: 'event.longhan.dan_yu_bond',
      description:
        '在涅槃池边看一次完整的复燃，并替她记住那一次烧掉的是什么。凤族的结缘不是相守，而是互相保管最后一次重生的凭据。',
    },
    postBondEventIds: ['event.longhan.dan_yu_rebirth'],
    publicEventIds: [
      'event.longhan.dan_yu_ember',
      'event.longhan.dan_yu_lesson',
      'event.longhan.dan_yu_scar',
    ],
    tags: ['phoenix', 'teacher', 'fire'],
  },
  {
    id: 'partner.longhan.qing_li',
    name: '青璃',
    factionId: 'faction.longhan.qilin',
    eraFates: {
      'era.prologue': '她还只是崖下最年轻的一个守脉人，常常把耳朵贴在石头上听到深夜。',
      'era.longhan': '在麒麟崖记每一道石纹的深浅，替大地保管那些没人愿意承认的疼。',
    },
    description:
      '麒麟崖最年轻的守脉人，左掌心有一道被石纹磨出的薄茧。她相信大地记得一切，所以从不轻易替别人许下关于土地的承诺。青璃走路很轻，说话却像在替整座崖作证。',
    role: 'guardian',
    bond: {
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
      ],
      eventId: 'event.longhan.qing_li_bond',
      description:
        '在七道石纹前听完地脉的回答，并把自己的名字刻进其中一道。麒麟族的结缘不是把彼此留在身边，而是把彼此写进大地记忆。',
    },
    postBondEventIds: ['event.longhan.qing_li_watch'],
    publicEventIds: [
      'event.longhan.qing_li_marks',
      'event.longhan.qing_li_vein',
      'event.longhan.qing_li_weight',
    ],
    tags: ['qilin', 'guardian', 'earth'],
  },
  {
    id: 'partner.longhan.mo_ji',
    name: '墨姬',
    factionId: 'faction.longhan.rahu',
    eraFates: {
      'era.prologue': '无光海边的灯还没有亮。她已经在灯下替很多人改过名字。',
      'era.longhan': '在魔渊与三族之间来回，替一些不该被记住的人保管名字。',
    },
    description:
      '罗睺门下的引路人，专替新入魔渊的人抹去第一笔旧名。她从不劝人留下，也不替人后悔；她只问一笔账够不够还。墨姬笑的时候很少，但每次笑都像把一件很重的东西暂时放下。',
    role: 'scout',
    bond: {
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
      ],
      eventId: 'event.longhan.mo_ji_bond',
      description:
        '在无光海边互相念出对方的名字，并答应不让第三个人听见。魔道的结缘不是光明正大，而是替彼此留一条没人知道的归路。',
    },
    postBondEventIds: ['event.longhan.mo_ji_dawn'],
    publicEventIds: [
      'event.longhan.mo_ji_lantern',
      'event.longhan.mo_ji_name',
      'event.longhan.mo_ji_debt',
    ],
    tags: ['rahu', 'scout', 'hidden'],
  },
  {
    id: 'partner.longhan.bai_ze',
    name: '白泽',
    eraFates: {
      'era.prologue': '他曾在序章的荒原上画过一条不存在的路，说总有人会走到那里。',
      'era.longhan': '在洪荒各处问同一个问题：若一个名字被所有人忘记，它还算存在过吗。',
    },
    description:
      '游走三族之外的知者，据说认得天下所有异兽的名字，却总记不清自己昨夜宿在哪里。白泽替人解答难题，也替人保留那些还不到时候说出口的答案。他看你的眼神，像在核对一本很久以前的书。',
    role: 'teacher',
    bond: {
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
      ],
      eventId: 'event.longhan.bai_ze_bond',
      description:
        '与白泽同行一段没有目的地的路，并在他忘记自己名字时替他回答。知者的结缘不是答案，而是有人愿意替他保管问题。',
    },
    postBondEventIds: ['event.longhan.bai_ze_answer'],
    publicEventIds: [
      'event.longhan.bai_ze_riddle',
      'event.longhan.bai_ze_map',
      'event.longhan.bai_ze_memory',
    ],
    tags: ['wanderer', 'teacher', 'name'],
  },
]

import type {
  DaoClusterDefinition,
  DaoNodeDefinition,
  DaoPrincipleDefinition,
} from '@/types/dao'

export const longhanDaoClusters: DaoClusterDefinition[] = [
  {
    id: 'dao.cluster.tide',
    name: '潮脉',
    subtitle: '洞府 · 灵脉 · 潮汐',
    glyph: '潮',
    description:
      '潮水不是仓库里的数，是洞府的呼吸。引潮的人让海先开口，滤浊的人让灵脉不被旧泥堵死，蓄汐的人把满出来的那一点留下。三条线都走通，才谈得上让一座洞府自己养自己。',
    nodeIds: ['dao.node.tide.draw', 'dao.node.tide.filter', 'dao.node.tide.store'],
  },
  {
    id: 'dao.cluster.war',
    name: '战途',
    subtitle: '争斗 · 先机 · 气血',
    glyph: '战',
    description:
      '斗法不只看谁修为高。有人赢在头一息，有人在护体最厚的地方下刀，也有人把命押在刀口上，赌自己先倒下之前能多递出一招。',
    nodeIds: ['dao.node.war.opening', 'dao.node.war.break', 'dao.node.war.blood'],
  },
  {
    id: 'dao.cluster.karma',
    name: '因果',
    subtitle: '历练 · 抉择 · 业报',
    glyph: '因',
    description:
      '你在故事里欠下的、还上的、装作没看见的，都会在某个潮口回来找你。看得见因的人先一步避开，肯背因的人拿得更重，能转劫的人把账拖到下一个月。',
    nodeIds: ['dao.node.karma.insight', 'dao.node.karma.burden', 'dao.node.karma.tribulation'],
  },
]

export const longhanDaoNodes: DaoNodeDefinition[] = [
  {
    id: 'dao.node.tide.draw',
    clusterId: 'dao.cluster.tide',
    name: '引潮',
    epithet: '让海先开口',
    description:
      '你在洞府的水路上刻下第一道引痕。潮水不必灌进来，只要它在外面起落，阵眼就能借到那一线来回的劲。',
    cost: 1,
    stats: { health: 12, spirit: 2 },
    rules: [
      { label: '潮眼', detail: '洞府潮汐上限 +4' },
      { label: '潮息', detail: '洞府每月自然凝聚 +0.3' },
    ],
  },
  {
    id: 'dao.node.tide.filter',
    clusterId: 'dao.cluster.tide',
    name: '滤浊',
    epithet: '不让旧泥堵死灵脉',
    description:
      '灵脉里的浊气像水底的旧绳，平时不显，缠住运转时才觉出滞涩。你学会了在潮水入洞之前先让它过一层石砂。',
    cost: 1,
    requires: 'dao.node.tide.draw',
    stats: { health: 8, defense: 1 },
    rules: [
      { label: '澄脉', detail: '蚀脉的生产链每月浊染减半' },
      { label: '养脉', detail: '亲手疏脉时灵脉澄澈 +3' },
    ],
  },
  {
    id: 'dao.node.tide.store',
    clusterId: 'dao.cluster.tide',
    name: '蓄汐',
    epithet: '把满出来的留下',
    description:
      '潮水涨过阵眼时，多出来的那一截原本就白白退回海里。你在礁腹深处凿出几个暗池，让溢出来的汐先在里面沉一沉。',
    cost: 2,
    requires: 'dao.node.tide.filter',
    stats: { health: 18, defense: 2 },
    rules: [
      { label: '深库', detail: '洞府潮汐上限 +6' },
      { label: '溢汐', detail: '潮满时每 3 点溢流化为 1 点澄澈（每月至多 2 点）' },
    ],
  },
  {
    id: 'dao.node.war.opening',
    clusterId: 'dao.cluster.war',
    name: '先声',
    epithet: '头一息就抢势',
    description:
      '你把起手的动作改短了半拍。别人还在看你的肩，你的第一击已经递到了他护体最薄的地方。',
    cost: 1,
    stats: { attack: 3, speed: 1 },
    rules: [{ label: '抢势', detail: '争斗首回合造成的伤害 +30%' }],
  },
  {
    id: 'dao.node.war.break',
    clusterId: 'dao.cluster.war',
    name: '破军',
    epithet: '往最厚的地方下刀',
    description:
      '护体不是墙，是一层层叠起来的甲片。你不再硬砸，而是找甲片之间那道总是对不齐的缝。',
    cost: 1,
    requires: 'dao.node.war.opening',
    stats: { attack: 4, crit: 1 },
    mods: { armorPen: 0.2 },
    rules: [{ label: '破甲', detail: '攻击无视目标 20% 护体' }],
  },
  {
    id: 'dao.node.war.blood',
    clusterId: 'dao.cluster.war',
    name: '浴血',
    epithet: '把命押在刀口上',
    description:
      '你发现疼到极点时，手反而更稳。血不是要命的东西，是让你知道自己还站着的记号。',
    cost: 2,
    requires: 'dao.node.war.break',
    stats: { attack: 6, health: 15 },
    mods: { lowHpAttack: 0.12 },
    rules: [
      { label: '饮血', detail: '击杀敌手时回复 10% 最大气血' },
      { label: '困兽', detail: '气血低于四成时攻势 +12%' },
    ],
  },
  {
    id: 'dao.node.karma.insight',
    clusterId: 'dao.cluster.karma',
    name: '洞见',
    epithet: '先看见因',
    description:
      '你开始留意那些不起眼的小事：谁在人群里多看了一眼，哪条路上没有鸟叫。因果不是天书，是这些没说出口的细节。',
    cost: 1,
    stats: { spirit: 2, crit: 1 },
    mods: { cultivation: 0.08, dropRate: 0.1 },
    rules: [
      { label: '见微', detail: '历练器物掉落率 +10%' },
      { label: '灵觉', detail: '修行与历练修为 +8%' },
    ],
  },
  {
    id: 'dao.node.karma.burden',
    clusterId: 'dao.cluster.karma',
    name: '承负',
    epithet: '肯把因背在身上',
    description:
      '有些账你可以装作没看见，但你没有。你替别人接下的那一份，会在故事走完时变成更重的东西回到你手里。',
    cost: 1,
    requires: 'dao.node.karma.insight',
    stats: { spirit: 2, health: 10 },
    rules: [{ label: '承因', detail: '剧情事件中的资源与修为收益 +50%' }],
  },
  {
    id: 'dao.node.karma.tribulation',
    clusterId: 'dao.cluster.karma',
    name: '转劫',
    epithet: '把账拖到下一个月',
    description:
      '你学会了不跟劫数正面相撞。该来的还会来，只是你让它在门外多等了一会；该走的好运，你也能多留它一程。',
    cost: 2,
    requires: 'dao.node.karma.burden',
    stats: { spirit: 3, health: 12, speed: 1 },
    rules: [
      { label: '顺劫', detail: '正面状态多持续 1 月' },
      { label: '避劫', detail: '负面状态少持续 1 月' },
    ],
  },
]

export const longhanDaoPrinciples: DaoPrincipleDefinition[] = [
  {
    id: 'dao.principle.tide_life',
    clusterId: 'dao.cluster.tide',
    name: '潮生',
    title: '潮水所至，灵脉自生',
    description:
      '你不再向潮水索取，而是让潮水自己养脉。每一轮涨落都在灵脉里留下一点活气，洞府不必靠人守着也能慢慢回澄。与「向死而生」互斥，一世只能择一。',
    cost: 4,
    requiredNodes: 3,
    stats: { health: 30, spirit: 4 },
    rules: [
      { label: '生潮', detail: '洞府每月潮汐达到 6 点时，灵脉澄澈 +2' },
      { label: '道则 · 互斥', detail: '与「向死而生」不能并存' },
    ],
  },
  {
    id: 'dao.principle.desperate',
    clusterId: 'dao.cluster.war',
    name: '向死而生',
    title: '无路可退，便不必退',
    description:
      '你把退路亲手斩断了。气血越薄，手里的力道越重，每一息都在烧自己的命换下一招。与「潮生」互斥，一世只能择一。',
    cost: 4,
    requiredNodes: 3,
    stats: { attack: 10, crit: 3, health: 20 },
    mods: { lowHpAttack: 0.3, critDamage: 0.4 },
    rules: [
      { label: '无退', detail: '争斗中无法主动退走' },
      { label: '燃血', detail: '气血低于四成时攻势 +30%、暴伤 +40%' },
      { label: '血债', detail: '争斗每回合失去 1% 最大气血' },
      { label: '道则 · 互斥', detail: '与「潮生」不能并存' },
    ],
  },
]

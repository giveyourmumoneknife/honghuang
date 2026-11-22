import type { CharacterPhysiqueDefinition } from '@/types/content'

export const commonPhysiques: CharacterPhysiqueDefinition[] = [
  {
    id: 'physique.longhan.mortal',
    name: '凡胎',
    description:
      '没有异象，也没有旧血在骨里回响。你只是以一具最普通的血肉之躯踏入洪荒，往后能走到哪一步，全看自己。',
    note: '旧存档的归处。修行与淬体皆无偏倚，也没有额外的血脉亲和。',
    selectable: false,
    stats: {},
    cultivationMultiplier: 1,
    bodyTemperMultiplier: 1,
    bodyBreakthroughBonus: 0,
    bloodlineAffinity: {},
    awakenings: [],
  },
  {
    id: 'physique.longhan.chaos_womb',
    name: '混沌胎',
    description:
      '你的骨血里留着一小团未曾分清的混沌。它不偏向任何一行，却让每一次淬体都像在重演开天。',
    note: '修为进境稍慢，淬体与破体更猛；对诸般血脉都有一点说不清的亲近。',
    stats: { health: 14, spirit: 3 },
    cultivationMultiplier: 0.93,
    bodyTemperMultiplier: 1.18,
    bodyBreakthroughBonus: 0.04,
    bloodlineAffinity: {
      'bloodline.longhan.canglan': 0.03,
      'bloodline.longhan.chiyan': 0.03,
      'bloodline.longhan.houtu': 0.03,
      'bloodline.longhan.xuanming': 0.03,
      'bloodline.longhan.leize': 0.03,
      'bloodline.longhan.hundun': 0.06,
    },
    awakenings: [
      {
        stage: 2,
        name: '混元一气',
        description: '筋骨初成后，那团混沌开始在经脉间自行回旋，伤势收拢得更快。',
        mods: { regen: 1.5, elementResist: 2 },
      },
      {
        stage: 3,
        name: '开天骨',
        description: '骨节里响起极轻的裂声，像有另一片天地要从里面撑开。',
        stats: { attack: 5, defense: 4 },
      },
      {
        stage: 5,
        name: '鸿蒙不漏',
        description: '气血、神识与灵机终于不再彼此争道。混沌胎至此才算真正睁开眼。',
        stats: { health: 80, attack: 8, defense: 8, spirit: 8 },
        mods: { elementResist: 4, cultivation: 0.04 },
      },
    ],
  },
  {
    id: 'physique.longhan.deep_water',
    name: '玄水体',
    description:
      '你出生时没有哭声，只有一口很长的气。经脉像深水，灵机落进去便不肯轻易离开。',
    note: '修行更快，淬体稍缓；对沧澜龙血与玄冥寒血格外亲近。',
    stats: { spirit: 4, speed: 2 },
    cultivationMultiplier: 1.05,
    bodyTemperMultiplier: 0.95,
    bodyBreakthroughBonus: 0.01,
    bloodlineAffinity: {
      'bloodline.longhan.canglan': 0.1,
      'bloodline.longhan.xuanming': 0.06,
    },
    awakenings: [
      {
        stage: 2,
        name: '潮息',
        description: '呼吸与远处水脉同拍，受伤后气血会自己找回退路。',
        mods: { regen: 1, travel: 0.04 },
      },
      {
        stage: 3,
        name: '渊藏',
        description: '经脉深处多出一层看不见的水意，最猛烈的第一击也会先被它卸去几分。',
        stats: { health: 30, defense: 4 },
        mods: { elementResist: 3 },
      },
      {
        stage: 5,
        name: '北冥无岸',
        description: '你不再需要借水行法。自身气血便是一片不冻的深海。',
        stats: { health: 60, spirit: 10, defense: 6 },
        mods: { cultivation: 0.05, healing: 0.1 },
      },
    ],
  },
  {
    id: 'physique.longhan.ember',
    name: '炎煌体',
    description:
      '你体温比常人高一线，伤口结痂时总会冒出一点火星。凤族见了只会点头，从不解释。',
    note: '淬体更快，出手更重；对赤炎凤血有极高的亲和。',
    stats: { attack: 4, health: 6 },
    cultivationMultiplier: 0.98,
    bodyTemperMultiplier: 1.08,
    bodyBreakthroughBonus: 0.02,
    bloodlineAffinity: {
      'bloodline.longhan.chiyan': 0.1,
      'bloodline.longhan.hundun': 0.03,
    },
    awakenings: [
      {
        stage: 2,
        name: '烬火',
        description: '每次受伤都像添了一把柴，气血将尽时出手反而更凶。',
        mods: { lowHpAttack: 0.05 },
      },
      {
        stage: 3,
        name: '赤骨',
        description: '骨头被心火重新烧过一遍，锋锐得不像活人的骨。',
        stats: { attack: 7, crit: 3 },
      },
      {
        stage: 5,
        name: '不灭薪',
        description: '火种藏在血里，熄了又燃。除非你自己认输，否则很难被彻底打倒。',
        stats: { attack: 12, health: 50 },
        mods: { burn: 4, lifesteal: 0.03 },
      },
    ],
  },
  {
    id: 'physique.longhan.mountain',
    name: '山岳体',
    description:
      '你从小就比同龄人重。不是胖，而是骨肉里像压着一小块山根，站稳之后谁也很难推动。',
    note: '修行稍慢，淬体极稳；破体成功率更高，与后土祖巫血相合。',
    stats: { health: 30, defense: 4 },
    cultivationMultiplier: 0.94,
    bodyTemperMultiplier: 1.15,
    bodyBreakthroughBonus: 0.05,
    bloodlineAffinity: {
      'bloodline.longhan.houtu': 0.1,
      'bloodline.longhan.xuanming': 0.03,
    },
    awakenings: [
      {
        stage: 2,
        name: '定岳',
        description: '双足落地时，外力会先被大地分走一半。',
        mods: { thorns: 2, shieldStart: 1 },
      },
      {
        stage: 3,
        name: '石心',
        description: '心脉慢得像岩层，剧痛与惊惧都要多走一段路才追得上你。',
        stats: { health: 60, defense: 6 },
        mods: { elementResist: 3 },
      },
      {
        stage: 5,
        name: '不周',
        description: '你的脊背像一根没有断过的天柱，扛得住塌下来的那一片天。',
        stats: { health: 120, defense: 14, attack: 5 },
        mods: { shieldStart: 2 },
      },
    ],
  },
  {
    id: 'physique.longhan.storm',
    name: '风雷体',
    description:
      '你奔跑时衣角会带起很细的电光。旧人说是雷泽的风吹进了胎里，也有人说只是命太急。',
    note: '身法与暴击更盛，淬体不偏不倚；与雷泽夔血相合。',
    stats: { speed: 4, crit: 3 },
    cultivationMultiplier: 1.02,
    bodyTemperMultiplier: 1,
    bodyBreakthroughBonus: 0,
    bloodlineAffinity: {
      'bloodline.longhan.leize': 0.1,
      'bloodline.longhan.canglan': 0.03,
    },
    awakenings: [
      {
        stage: 2,
        name: '疾走',
        description: '念头落下之前，身体已经先动了半步。',
        mods: { firstStrike: 0.08, dodge: 3 },
      },
      {
        stage: 3,
        name: '雷骨',
        description: '骨缝里有了细微的雷声，出手时会自行找上敌手最薄的那一处。',
        stats: { speed: 5, crit: 6 },
        mods: { armorPen: 0.04 },
      },
      {
        stage: 5,
        name: '风行雷动',
        description: '风与雷不再分先后。你出手时，旁人往往只听见迟来的那一声。',
        stats: { speed: 10, attack: 8, crit: 8 },
        mods: { firstStrike: 0.12, critDamage: 0.1 },
      },
    ],
  },
  {
    id: 'physique.longhan.void',
    name: '太虚体',
    description:
      '你的影子偶尔比光慢半拍。神识极盛，肉身却像一张绷得太紧的纸，须得慢慢养厚。',
    note: '修行最快，淬体最慢；与混沌魔血、玄冥寒血更易共鸣。',
    stats: { spirit: 7, health: -12, speed: 1 },
    cultivationMultiplier: 1.1,
    bodyTemperMultiplier: 0.88,
    bodyBreakthroughBonus: -0.02,
    bloodlineAffinity: {
      'bloodline.longhan.hundun': 0.07,
      'bloodline.longhan.xuanming': 0.04,
    },
    awakenings: [
      {
        stage: 2,
        name: '虚室',
        description: '神识里空出一间安静的屋子，纷乱念头进去后会自己排好队。',
        stats: { spirit: 5 },
        mods: { cultivation: 0.03 },
      },
      {
        stage: 3,
        name: '照影',
        description: '你能看见攻势落下前那一瞬的影子，于是总比旁人早半步避开。',
        stats: { speed: 4, spirit: 4 },
        mods: { dodge: 6 },
      },
      {
        stage: 5,
        name: '太虚返实',
        description: '那张太薄的纸终于被气血填实。虚与实之间，再没有谁能轻易碰到你。',
        stats: { spirit: 14, health: 40, speed: 5 },
        mods: { dodge: 6, cultivation: 0.06 },
      },
    ],
  },
]
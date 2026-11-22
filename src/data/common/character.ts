import type {
  CharacterOriginDefinition,
  CharacterRootDefinition,
  TalentDefinition,
} from '@/types/content'

export const commonOrigins: CharacterOriginDefinition[] = [
  {
    id: 'origin.longhan.sea_drift',
    name: '海畔遗孤',
    description:
      '你在四海退潮后的礁滩上长大。没有人说得清你来自哪一族，只知道你比旁人更早学会听潮。',
    note: '潮声会替你记住归途；水行灵机更易亲近。',
    stats: { health: 12, spirit: 2 },
    startingResources: { spirit_stones: 6 },
  },
  {
    id: 'origin.longhan.ash_wanderer',
    name: '火山余烬',
    description:
      '你从一片冷却的灰烬里醒来，身上没有烧伤，只有很淡的火气。凤族说你命硬，麒麟族说你命薄。',
    note: '出手更重，也更难在长时间争斗中保住自己。',
    stats: { attack: 3, defense: -1 },
  },
  {
    id: 'origin.longhan.ridge_keeper',
    name: '崖下守脉',
    description:
      '你在麒麟崖下的石屋里长大，替守脉人挑水、记潮位，也学会在脚下轻颤时先站稳。',
    note: '根基稳固，突破时少一分心急。',
    stats: { health: 20, defense: 3 },
    startingResources: { ore: 4 },
  },
  {
    id: 'origin.longhan.bone_picker',
    name: '荒原拾骨',
    description:
      '你靠辨认荒原上的旧骨维生。哪块骨先风化、哪条路昨夜有兽群经过，你比许多修士看得更准。',
    note: '脚步轻，眼力快，但旧伤比同龄人更早找上门。',
    stats: { speed: 3, crit: 2, health: -8 },
    startingResources: { beast_cores: 2 },
  },
]

export const commonRoots: CharacterRootDefinition[] = [
  {
    id: 'root.longhan.water',
    name: '水行灵根',
    description:
      '灵机如潮，来时缓慢，退时留下很长的余韵。最擅长把一场争斗拖入自己熟悉的节奏。',
    note: '水行功法与四海传承更易入门。',
    element: 'water',
    stats: { spirit: 4, speed: 1 },
    cultivationMultiplier: 1,
  },
  {
    id: 'root.longhan.fire',
    name: '火行灵根',
    description:
      '灵机炽烈，起念即成势。你不擅长等待，但很少有人能在你第一轮攻势下站稳。',
    note: '火行攻伐更盛，恢复稍慢。',
    element: 'fire',
    stats: { attack: 4, health: -6 },
    cultivationMultiplier: 0.95,
  },
  {
    id: 'root.longhan.earth',
    name: '土行灵根',
    description:
      '灵机厚而沉，像地脉一样不急着回应。你的修为进境慢一些，但每一次落境都比旁人扎实。',
    note: '守势与破境更稳，行旅稍慢。',
    element: 'earth',
    stats: { health: 30, defense: 4, speed: -1 },
    cultivationMultiplier: 0.9,
  },
  {
    id: 'root.longhan.metal',
    name: '金行灵根',
    description:
      '灵机锋锐，最擅长在最恰当的一瞬收紧。你的攻伐不在多，而在一次足够准的落点。',
    note: '暴击与破甲更易触发。',
    element: 'metal',
    stats: { attack: 2, crit: 5 },
    cultivationMultiplier: 0.95,
  },
  {
    id: 'root.longhan.chaos',
    name: '混沌伪根',
    description:
      '灵根驳杂，五行皆有一点，像开天时没有分清的残余。修行艰难，却很难被单一属性彻底克制。',
    note: '属性抗性更均衡，修为积累较慢。',
    stats: { health: 10, attack: 1, defense: 1, speed: 1, spirit: 1 },
    cultivationMultiplier: 0.82,
  },
]

export const commonTalents: TalentDefinition[] = [
  {
    id: 'talent.longhan.tide_ear',
    name: '潮听',
    description: '你总能先听见潮水改变方向，再看见它。',
    note: '先手与身法更稳。',
    stats: { speed: 2, spirit: 2 },
  },
  {
    id: 'talent.longhan.iron_bone',
    name: '筋骨天成',
    description: '旧伤好得比别人慢，却也比别人更能挨。',
    note: '气血上限更高。',
    stats: { health: 30 },
  },
  {
    id: 'talent.longhan.killing_instinct',
    name: '杀伐决断',
    description: '你在该落手的时候从不犹豫，这使得许多人来不及后悔。',
    note: '暴击更高，心性更冷。',
    stats: { crit: 5, speed: 1 },
  },
  {
    id: 'talent.longhan.earth_breath',
    name: '厚土之息',
    description: '双脚沾地时，灵机便不容易被外力拔走。',
    note: '守势更强。',
    stats: { defense: 4, health: 10 },
  },
  {
    id: 'talent.longhan.fire_grasp',
    name: '火中取栗',
    description: '你擅长在别人还在观望时伸手，也擅长及时缩回。',
    note: '攻势更盛，身法稍乱。',
    stats: { attack: 4, speed: -1 },
  },
  {
    id: 'talent.longhan.early_spirit',
    name: '神识早开',
    description: '你很早就学会了在内视时分辨哪些念头不是自己的。',
    note: '灵机更盛，修行更快。',
    stats: { spirit: 4 },
    cultivationBonus: 0.08,
  },
  {
    id: 'talent.longhan.thin_fate',
    name: '命薄如纸',
    description: '你总能比别人更早察觉危险，也总被危险更早找上。',
    note: '身法极快，气血偏薄。',
    stats: { speed: 4, health: -12, crit: 2 },
  },
  {
    id: 'talent.longhan.old_dream',
    name: '旧梦缠身',
    description: '梦里常有一座不属于此世的旧宫。醒来后你会多记得一点东西，也多累一分。',
    note: '神识更盛，体魄偏弱。',
    stats: { spirit: 3, health: -6 },
  },
]

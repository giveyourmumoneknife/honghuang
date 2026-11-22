import type { MountDefinition } from '@/types/content'

export const longhanMounts: MountDefinition[] = [
  {
    id: 'mount.longhan.wave_deer',
    name: '踏潮鹿',
    description:
      '四海浅滩常见的水鹿，蹄间生着一层薄膜。它不会飞，但能在涨潮时踩着浪脊走出很远。',
    terrain: 'sea',
    stages: [
      {
        stage: 1,
        name: '幼鹿',
        description: '还怕大浪，只敢在你身前半步走。',
        effects: [],
        stats: { speed: 2 },
        travelBonus: 0.15,
      },
      {
        stage: 2,
        name: '逐潮',
        description: '能听出潮线最薄的地方，载着你从两段浪之间穿过去。',
        effects: [],
        stats: { speed: 3, defense: 1 },
        travelBonus: 0.3,
      },
      {
        stage: 3,
        name: '踏汐',
        description: '蹄下那层薄膜已经能踩住退去的潮脊。它不说要去哪里，只在你上背之后朝海平线偏半步。',
        effects: [],
        stats: { speed: 6, defense: 3, spirit: 2 },
        travelBonus: 0.5,
      },
    ],
    tags: ['mount', 'water', 'travel'],
  },
  {
    id: 'mount.longhan.stone_ox',
    name: '负山牛',
    description:
      '麒麟崖下的老牛，背脊宽得能放下整间石屋。它走路极慢，却从不走错路。',
    terrain: 'land',
    stages: [
      {
        stage: 1,
        name: '驮石',
        description: '愿意替你背行囊，但尚未完全认路。',
        effects: [],
        stats: { health: 15, defense: 2 },
        travelBonus: 0.08,
      },
      {
        stage: 2,
        name: '知径',
        description: '闭上眼也能沿着地脉走回崖下。坐在它背上的人很少迷路。',
        effects: [],
        stats: { health: 30, defense: 4 },
        travelBonus: 0.18,
      },
      {
        stage: 3,
        name: '镇岳',
        description: '它走过的路面会留下极浅的凹痕，像大地替你记下这条路线。负重已不再是它的负担，反而让它走得更稳。',
        effects: [],
        stats: { health: 50, defense: 7 },
        travelBonus: 0.3,
      },
    ],
    tags: ['mount', 'earth', 'travel'],
  },
  {
    id: 'mount.longhan.ash_crow',
    name: '灰羽鸦',
    description:
      '不死火山边缘的群鸦之一。羽毛灰白，飞过火口时不会燃烧。它不亲人，只认一条路线。',
    terrain: 'cloud',
    stages: [
      {
        stage: 1,
        name: '灰羽',
        description: '只肯短途载人，落地时会先确认附近有没有更高的地方。',
        effects: [],
        stats: { speed: 4 },
        travelBonus: 0.22,
      },
      {
        stage: 2,
        name: '火背',
        description: '能贴着火山气流滑行，背上的人会闻到很淡的灰烬味。',
        effects: [],
        stats: { speed: 6, crit: 1 },
        travelBonus: 0.4,
      },
      {
        stage: 3,
        name: '焚巡',
        description: '它开始绕着火山口巡飞，灰羽上落下细小的火星。坐在它背上时，云层会短暂让开一条颜色更暗的路。',
        effects: [],
        stats: { speed: 9, crit: 3 },
        travelBonus: 0.58,
      },
    ],
    tags: ['mount', 'fire', 'travel'],
  },
  {
    id: 'mount.longhan.mirror_carp',
    name: '镜鲤',
    description:
      '四海旧宫后方的鲤鱼，鳞片像一面面小镜子。它游过的地方，水面会短暂映出另一处潮位；骑着它的人常会看见还没发生的退潮。',
    terrain: 'sea',
    stages: [
      {
        stage: 1,
        name: '银鳞',
        description: '鳞面还很浅，只能映出最近的浪。它认得旧宫的灯，却不认得远路。',
        effects: [],
        stats: { speed: 3, spirit: 1 },
        travelBonus: 0.18,
      },
      {
        stage: 2,
        name: '潮镜',
        description: '鳞面能映出更远的水脉。它载着你从两段本不相连的潮路之间穿过去。',
        effects: [],
        stats: { speed: 5, spirit: 3, defense: 1 },
        travelBonus: 0.35,
      },
      {
        stage: 3,
        name: '万潮镜',
        description: '每一片鳞里都映着不同时刻的潮水。它游过时，水面会短暂同时亮起涨潮与退潮两条路。',
        effects: [],
        stats: { speed: 8, spirit: 6, defense: 2 },
        travelBonus: 0.55,
      },
    ],
    tags: ['mount', 'water', 'travel'],
  },
]

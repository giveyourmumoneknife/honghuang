import type { SecretRealmDefinition } from '@/types/content'

/**
 * 补遗秘境：一处埋在三族会盟旧址下面，一处藏在紫霄宫的雷声里。
 */
export const longhanSupplementSecretRealms: SecretRealmDefinition[] = [
  {
    id: 'secret.longhan.covenant_understage',
    eraId: 'era.longhan',
    name: '盟誓台下',
    summary: '会盟的高台早已塌了，台底却还压着一间没散席的石屋。',
    description:
      '你踩到一块空心的旧砖，往下挖了几尺，露出一段向内的台阶。台底的屋子不大，三族的长案仍按旧位摆着，案上酒器俱在，酒早干了。\n\n主位空着，主位背后的墙上刻着一行被反复描过的新字：“这次也没谈成。”\n\n角落里有一只石匣，匣盖没有锁，只压着一片很薄的骨简。',
    regionIds: ['region.longhan.honghuang_land'],
    tier: 4,
    weight: 10,
    rewardPicks: [2, 3],
    rewards: [
      { kind: 'gear', gearTier: 4, qualityBonus: 0.35, weight: 22 },
      { kind: 'item', itemId: 'item.longhan.dragon_scale', countMin: 1, countMax: 3, weight: 14 },
      { kind: 'item', itemId: 'item.longhan.phoenix_feather', countMin: 1, countMax: 3, weight: 14 },
      { kind: 'item', itemId: 'item.longhan.pillar_dust', countMin: 1, countMax: 2, weight: 12 },
      { kind: 'resource', resource: 'spirit_stones', amountMin: 55, amountMax: 95, weight: 18 },
      { kind: 'cultivation', cultivationMin: 85, cultivationMax: 140, weight: 24 },
      { kind: 'technique', techniqueId: 'technique.longhan.vermilion_pact', weight: 6 },
    ],
    tags: ['covenant', 'three_clans', 'underside'],
  },
  {
    id: 'secret.longhan.thunder_corridor',
    eraId: 'era.longhan',
    name: '雷音回廊',
    summary: '紫霄宫背后的长廊里，每一步都会踩出一声迟到的雷。',
    description:
      '长廊两侧没有墙，只有一层压得很低的雷云。你往前走，脚下就亮一次；走得越慢，雷声落得越晚。\n\n廊柱上挂着很多旧铃，大多已经哑了。只有最里面那只还在响，铃声与脚步声总差半拍。\n\n云里有个声音说：“别找拍子。找那个总也合不上的声音。”',
    regionIds: ['region.longhan.zi_xiao_palace'],
    tier: 5,
    weight: 8,
    rewardPicks: [2, 3],
    rewards: [
      { kind: 'technique', techniqueId: 'technique.longhan.palace_bell', weight: 8 },
      { kind: 'technique', techniqueId: 'technique.longhan.return_tide', weight: 6 },
      { kind: 'pet', petId: 'pet.longhan.scripture_crane', weight: 5 },
      { kind: 'item', itemId: 'item.longhan.pillar_dust', countMin: 1, countMax: 3, weight: 16 },
      { kind: 'gear', gearTier: 5, qualityBonus: 0.45, weight: 18 },
      { kind: 'resource', resource: 'merit', amountMin: 3, amountMax: 7, weight: 14 },
      { kind: 'cultivation', cultivationMin: 140, cultivationMax: 230, weight: 22 },
    ],
    tags: ['palace', 'thunder', 'dao', 'technique'],
  },
]
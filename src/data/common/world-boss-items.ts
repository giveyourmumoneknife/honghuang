import type { QuestItemDefinition } from '@/types/content'

/**
 * 世界 Boss 一系旧物。每一件都来自某个原身，而不是现世分身；
 * 分身死后会把原身的一小段记忆留在这些物件的边缘。
 */
export const commonWorldBossItems: QuestItemDefinition[] = [
  {
    id: 'item.worldboss.tide_eye_scale',
    name: '潮眼旧鳞',
    category: 'quest',
    rarity: 'rare',
    description: '一片比船板还大的旧鳞，内侧刻着早已退去的潮位。握久了，掌心会先听见退潮，再听见自己的心跳。',
    flavor: '无名鲸落沉在归墟之前，只翻身留下过这一片鳞。',
    value: 180,
    tags: ['worldboss', 'tide_eye', 'water', 'trophy'],
  },
  {
    id: 'item.worldboss.ao_ming_whisker',
    name: '潮祖逆鳞',
    category: 'quest',
    rarity: 'legendary',
    description: '一枚几乎透明的倒生鳞。它不割手，却会让持有者在每次退潮时想起一句没有说完的话。',
    flavor: '敖溟把自己的逆鳞留在潮眼，是为了让现世的分身记得原身曾经痛过。',
    value: 420,
    tags: ['worldboss', 'ao_ming', 'dragon', 'sigil'],
  },
  {
    id: 'item.worldboss.dan_xi_ember',
    name: '丹曦余羽',
    category: 'quest',
    rarity: 'legendary',
    description: '一支不会烧尽的赤羽，羽根处凝着一滴冷灰。它不能让火更旺，只会在火将熄时轻轻一亮。',
    flavor: '丹曦原身最后一次涅槃前，把最暖的一支羽留在了火山之外。',
    value: 420,
    tags: ['worldboss', 'dan_xi', 'phoenix', 'sigil'],
  },
  {
    id: 'item.worldboss.xuan_qi_marrow',
    name: '玄祁地髓',
    category: 'quest',
    rarity: 'legendary',
    description: '一块温润的深青石髓，表面缓慢流动着细密纹路。放在地上，周围的尘土会先安静下来。',
    flavor: '玄祁原身沉眠时，地脉替它长出了一层又一层的骨。',
    value: 420,
    tags: ['worldboss', 'xuan_qi', 'qilin', 'sigil'],
  },
  {
    id: 'item.worldboss.greed_shard',
    name: '贪身碎面',
    category: 'quest',
    rarity: 'legendary',
    description: '半张碎裂的面具残片，断面还在缓慢生长。靠近时，会听见一段不属于自己的渴望。',
    flavor: '罗睺把“贪”从原身里分出来时，没有告诉它自己只是被留下的一小部分。',
    value: 520,
    tags: ['worldboss', 'rahu', 'greed', 'sigil', 'forbidden'],
  },
  {
    id: 'item.worldboss.kalpa_seal',
    name: '劫主残印',
    category: 'quest',
    rarity: 'legendary',
    description: '一枚没有字的旧印。按在掌心里时，会短暂浮现出这一劫所有未曾发生过的结局。',
    flavor: '劫主不是一个人，而是龙汉初劫在将闭合时留下的一道自问。',
    value: 800,
    tags: ['worldboss', 'kalpa', 'final', 'sigil'],
  },
]
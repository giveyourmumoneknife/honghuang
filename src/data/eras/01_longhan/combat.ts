import type { EncounterDefinition, EnemyDefinition } from '@/types/content'

export const longhanEnemies: EnemyDefinition[] = [
  {
    id: 'enemy.longhan.tide_wraith',
    name: '潮尸',
    title: '被潮水留在原地的旧人',
    description:
      '一具被海草缠住的旧尸。它不追人，只在退潮时朝有火光的地方挪一步。靠近时，能听见它胸腔里有很轻的潮声。',
    element: 'water',
    stats: { health: 55, attack: 8, defense: 4, speed: 2, crit: 2 },
    traits: ['regenerating'],
    skills: [
      {
        id: 'skill.longhan.tide_grip',
        name: '缠潮',
        description: '海草从脚下探出，把活人的脚步留在一段已经退去的潮里。',
        cooldown: 3,
        multiplier: 1.1,
        effect: 'stun',
        power: 2,
      },
    ],
    reward: { resources: { spirit_stones: 8 } },
  },
  {
    id: 'enemy.longhan.scale_raider',
    name: '鳞贼',
    title: '不认龙庭的旧巡队',
    description:
      '披着不合身旧鳞的散修，专在四海边缘劫落单行旅。他的枪法还有龙宫操练的影子，只是已经不再守任何规矩。',
    element: 'water',
    stats: { health: 60, attack: 10, defense: 4, speed: 4, crit: 4 },
    traits: ['swift'],
    skills: [
      {
        id: 'skill.longhan.raider_thrust',
        name: '抢潮',
        description: '趁着潮线交错的一瞬抢进，枪尖只取腰间最软处。',
        cooldown: 3,
        multiplier: 1.5,
        effect: 'drain',
        power: 2,
      },
    ],
    reward: {
      resources: { spirit_stones: 16 },
      items: [{ itemId: 'item.longhan.dragon_scale', count: 1 }],
    },
  },
  {
    id: 'enemy.longhan.ash_crow_swarm',
    name: '灰羽鸦群',
    title: '火山口不肯散去的影子',
    description:
      '十几只灰羽鸦贴着热浪盘旋。它们不叫，只在同一瞬间改变方向，像一整片会呼吸的灰。',
    element: 'fire',
    stats: { health: 50, attack: 9, defense: 1, speed: 8, crit: 6 },
    traits: ['swift', 'berserk'],
    skills: [
      {
        id: 'skill.longhan.crow_dive',
        name: '群扑',
        description: '鸦群从不同方向同时落下，只在最后一刻合成一条灰线。',
        cooldown: 2,
        multiplier: 1.3,
        effect: 'burn',
        power: 2,
      },
    ],
    reward: {
      resources: { beast_cores: 1 },
      items: [{ itemId: 'item.longhan.phoenix_feather', count: 1 }],
    },
  },
  {
    id: 'enemy.longhan.ember_hound',
    name: '火鬃犬',
    title: '火山灰里养大的猎兽',
    description:
      '肩背覆着烧红又冷却的硬鬃。它受伤后不会后退，只会把喉咙里的火压低，再冲一次。',
    element: 'fire',
    stats: { health: 70, attack: 10, defense: 3, speed: 3, crit: 3 },
    traits: ['berserk'],
    skills: [
      {
        id: 'skill.longhan.hound_breath',
        name: '低焰',
        description: '把一口火压进喉底，近身时突然吐出，火焰贴着地面散开。',
        cooldown: 4,
        multiplier: 1.7,
        effect: 'burn',
        power: 4,
      },
    ],
    reward: {
      resources: { beast_cores: 2, spirit_stones: 10 },
    },
  },
  {
    id: 'enemy.longhan.stoneback',
    name: '负碑兽',
    title: '把旧碑背成山脊的兽',
    description:
      '一头背着一截断裂石碑的巨兽。它走得极慢，背上的碑文已经完全磨平。它仍按旧日路线巡视崖下，像在替谁守一个已经失效的约定。',
    element: 'earth',
    stats: { health: 120, attack: 15, defense: 11, speed: 1, crit: 1 },
    traits: ['armored'],
    skills: [
      {
        id: 'skill.longhan.stoneback_slam',
        name: '碑落',
        description: '背上的半截石碑随着俯冲砸下，地面会出现一圈很浅的裂。',
        cooldown: 4,
        multiplier: 1.8,
        effect: 'stun',
        power: 3,
      },
    ],
    reward: {
      resources: { ore: 4, spirit_stones: 14 },
    },
  },
  {
    id: 'enemy.longhan.vein_worm',
    name: '地脉蠕虫',
    title: '被灵脉养得过大的东西',
    description:
      '从崖下裂缝里探出的半截虫身，皮如湿土。它不看见你，只感到脚下每一步的震动。',
    element: 'earth',
    stats: { health: 110, attack: 11, defense: 8, speed: 2, crit: 2 },
    traits: ['venom', 'regenerating'],
    skills: [
      {
        id: 'skill.longhan.worm_spit',
        name: '浊脉',
        description: '吐出一股混着地脉浊气的黏液，沾上后灵机运转会慢下来。',
        cooldown: 3,
        multiplier: 1.2,
        effect: 'poison',
        power: 5,
      },
    ],
    reward: {
      resources: { ore: 2, spirit_herbs: 3 },
    },
  },
  {
    id: 'enemy.longhan.bone_beast',
    name: '荒骨兽',
    title: '从骨原里重新站起的东西',
    description:
      '许多兽骨被同一股荒气拢在一起，拼成一头看不出原本模样的兽。它每走一步，都有碎骨从背上落下，又有新的骨补上去。',
    element: 'earth',
    stats: { health: 115, attack: 16, defense: 6, speed: 4, crit: 5 },
    traits: ['berserk', 'regenerating'],
    skills: [
      {
        id: 'skill.longhan.bone_charge',
        name: '骨突',
        description: '背脊上的碎骨同时立起，整头兽像一排会奔跑的骨刺。',
        cooldown: 3,
        multiplier: 1.6,
        effect: 'stun',
        power: 2,
      },
    ],
    reward: {
      resources: { beast_cores: 3, ore: 2 },
    },
  },
  {
    id: 'enemy.longhan.abyss_watcher',
    name: '渊影',
    title: '从光拐弯处走出来的轮廓',
    description:
      '它没有固定形状。你越看，它越像某个你认识却叫不出名字的人。它不急，只是在你每次回头时靠近一点。',
    element: 'fire',
    stats: { health: 110, attack: 13, defense: 7, speed: 6, crit: 7 },
    traits: ['spirit_eater', 'swift'],
    skills: [
      {
        id: 'skill.longhan.abyss_call',
        name: '唤名',
        description: '用你自己的声音叫你的名字。答应的人会短暂忘记自己站在哪里。',
        cooldown: 4,
        multiplier: 1.4,
        effect: 'poison',
        power: 4,
      },
    ],
    reward: {
      resources: { karma: 1, spirit_stones: 20 },
    },
  },
  {
    id: 'enemy.longhan.phoenix_zealot',
    name: '焚羽卫',
    title: '守着旧火道的凤族旁支',
    description:
      '披着烧焦旧羽的凤族旁支。他把火道看得比自己的命更重，因为火道尽头埋着他没能救回来的同族。',
    element: 'fire',
    stats: { health: 120, attack: 17, defense: 7, speed: 4, crit: 6 },
    traits: ['berserk'],
    skills: [
      {
        id: 'skill.longhan.zealot_brand',
        name: '焚身印',
        description: '把心口的一点火按进兵刃，出手之后自己的经脉也会留下焦痕。',
        cooldown: 3,
        multiplier: 1.9,
        effect: 'burn',
        power: 4,
      },
    ],
    reward: {
      resources: { spirit_stones: 22, spirit_herbs: 2 },
    },
  },
  {
    id: 'enemy.longhan.nirvana_moth',
    name: '涅槃蛾',
    title: '从灰里又飞起来的东西',
    description:
      '翅膀上覆着未散的旧名，飞动时会落下很细的灰。它不咬人，只绕着将死未死的人飞，直到对方想起自己本该忘记的事。',
    element: 'fire',
    stats: { health: 100, attack: 16, defense: 4, speed: 8, crit: 8 },
    traits: ['swift', 'spirit_eater'],
    skills: [
      {
        id: 'skill.longhan.moth_dust',
        name: '落灰',
        description: '翅上的灰落在伤口里，痛感消失，记忆却开始松动。',
        cooldown: 3,
        multiplier: 1.3,
        effect: 'drain',
        power: 3,
      },
    ],
    reward: {
      resources: { spirit_herbs: 3 },
    },
  },
  {
    id: 'enemy.longhan.vein_colossus',
    name: '脉兽',
    title: '地脉翻身时立起来的那一块',
    description:
      '整片崖坡在它身上站起，旧石纹是它的骨。它走得很慢，每一步都让地脉深处传来一声闷响。',
    element: 'earth',
    stats: { health: 260, attack: 25, defense: 21, speed: 1, crit: 1 },
    traits: ['armored', 'regenerating'],
    skills: [
      {
        id: 'skill.longhan.colossus_step',
        name: '落脉',
        description: '抬脚时地脉先沉一寸，落下时整片崖坡都在回应。',
        cooldown: 4,
        multiplier: 1.8,
        effect: 'stun',
        power: 4,
      },
    ],
    reward: {
      resources: { ore: 6, spirit_stones: 18 },
    },
  },
  {
    id: 'enemy.longhan.auspicious_shade',
    name: '瑞影',
    title: '重复旧日祥瑞的影子',
    description:
      '它有着麒麟的轮廓，脚下却没有土地。它把一段旧日的吉兆一遍遍念给你听，声音越来越像你自己的。',
    element: 'earth',
    stats: { health: 240, attack: 25, defense: 13, speed: 5, crit: 5 },
    traits: ['spirit_eater'],
    skills: [
      {
        id: 'skill.longhan.shade_omen',
        name: '伪兆',
        description: '用一段本该是吉兆的画面压住你的判断，让你慢半拍。',
        cooldown: 3,
        multiplier: 1.4,
        effect: 'poison',
        power: 4,
      },
    ],
    reward: {
      resources: { spirit_stones: 22 },
    },
  },
  {
    id: 'enemy.longhan.dragon_exile',
    name: '逐潮者',
    title: '被巡海册抹去名字的旧使',
    description:
      '他仍穿着巡海使的旧鳞衣，只是鳞片已褪成灰白。他的枪法比龙庭现役更狠，因为他早已不求回来。',
    element: 'water',
    stats: { health: 270, attack: 31, defense: 14, speed: 6, crit: 7 },
    traits: ['swift'],
    skills: [
      {
        id: 'skill.longhan.exile_return',
        name: '无归',
        description: '一枪之后不再收势，像把自己的归途也一并刺出去。',
        cooldown: 3,
        multiplier: 1.8,
        effect: 'drain',
        power: 4,
      },
    ],
    reward: {
      resources: { spirit_stones: 28 },
      items: [{ itemId: 'item.longhan.tide_silver', count: 1 }],
    },
  },
  {
    id: 'enemy.longhan.abyss_scribe',
    name: '渊书吏',
    title: '替魔渊记录名字的人',
    description:
      '没有面孔，只有一双很长的袖口。它记下每个走进魔渊的人，也记下谁在最后一刻改了口。',
    element: 'metal',
    stats: { health: 230, attack: 24, defense: 12, speed: 5, crit: 6 },
    traits: ['spirit_eater', 'venom'],
    skills: [
      {
        id: 'skill.longhan.scribe_strike',
        name: '删名',
        description: '用笔锋划去名字中的一笔，被划去的人会短暂忘记自己为何而战。',
        cooldown: 4,
        multiplier: 1.5,
        effect: 'poison',
        power: 5,
      },
    ],
    reward: {
      resources: { karma: 1, spirit_stones: 20 },
    },
  },
  {
    id: 'enemy.longhan.rahu_echo',
    name: '罗睺回声',
    title: '魔祖留在深渊的一段耐心',
    description:
      '它没有形体，只在你说完一句话之后重复最后三个字。回声里藏着罗睺听过的一切，也藏着他还没说完的部分。',
    element: 'fire',
    stats: { health: 520, attack: 42, defense: 20, speed: 8, crit: 10 },
    traits: ['berserk', 'spirit_eater'],
    skills: [
      {
        id: 'skill.longhan.echo_name',
        name: '复名',
        description: '把你的名字拆成两半念出。每一半都会从你身上带走一样东西。',
        cooldown: 4,
        multiplier: 2.1,
        effect: 'burn',
        power: 8,
      },
    ],
    reward: {
      resources: { karma: 3, spirit_stones: 60 },
    },
  },
  {
    id: 'enemy.longhan.nameless_one',
    name: '无名者',
    title: '走进不周山阶之后没有回来的人',
    description:
      '他身上没有一处旧伤，也没有一处属于自己的痕迹。他不报名字，只问你：如果现在放下名字，你还剩什么。',
    element: 'metal',
    stats: { health: 500, attack: 44, defense: 27, speed: 7, crit: 8 },
    traits: ['swift', 'spirit_eater'],
    skills: [
      {
        id: 'skill.longhan.nameless_cut',
        name: '去名',
        description: '一线无声的锋芒越过护体灵机，只削去与名字有关的那部分。',
        cooldown: 4,
        multiplier: 2,
        effect: 'drain',
        power: 6,
      },
    ],
    reward: {
      resources: { karma: 2, spirit_stones: 50 },
    },
  },
  {
    id: 'enemy.longhan.bone_sovereign',
    name: '骨原王',
    title: '整片骨原站起来的模样',
    description:
      '无数旧骨被同一股荒气拢成一顶王冠。它没有眼睛，却在听见人声时低头，像在辨认一位早该回来的旧主。',
    element: 'earth',
    stats: { health: 700, attack: 65, defense: 38, speed: 3, crit: 4 },
    traits: ['armored', 'berserk', 'regenerating'],
    skills: [
      {
        id: 'skill.longhan.sovereign_sentence',
        name: '骨诏',
        description: '骨原上的碎骨同时立起，替它宣读一道没有文字的诏令。',
        cooldown: 5,
        multiplier: 2.2,
        effect: 'stun',
        power: 6,
      },
    ],
    reward: {
      resources: { beast_cores: 6, ore: 5 },
    },
  },
  {
    id: 'enemy.longhan.ash_wyrm',
    name: '灰烬蛟',
    title: '在火山灰里蜕过太多次的蛟',
    description:
      '它的鳞片一层叠着一层，每一层都是上一次蜕下的自己。它不再记得原本的模样，只记得火该往哪里烧。',
    element: 'fire',
    stats: { health: 460, attack: 45, defense: 18, speed: 4, crit: 5 },
    traits: ['berserk'],
    skills: [
      {
        id: 'skill.longhan.wyrm_shed',
        name: '蜕火',
        description: '烧掉一层旧鳞，火势顺着裂纹反扑向持械的人。',
        cooldown: 4,
        multiplier: 1.9,
        effect: 'burn',
        power: 6,
      },
    ],
    reward: {
      resources: { spirit_herbs: 4, beast_cores: 2 },
    },
  },
  {
    id: 'enemy.longhan.tide_leviathan',
    name: '潮渊巨鲸',
    title: '比旧宫更大的旧客',
    description:
      '它背上的旧伤排成一行潮位，每一道都对应四海的一次退潮。它不主动伤人，只把身体横在潮眼上，让潮水无处可回。',
    element: 'water',
    stats: { health: 760, attack: 62, defense: 32, speed: 2, crit: 3 },
    traits: ['armored', 'regenerating'],
    skills: [
      {
        id: 'skill.longhan.leviathan_press',
        name: '压潮',
        description: '整片海面下沉一寸，站在其中的人会先听见自己的骨响。',
        cooldown: 5,
        multiplier: 2,
        effect: 'stun',
        power: 7,
      },
    ],
    reward: {
      resources: { spirit_stones: 80, spirit_herbs: 5 },
    },
  },
  {
    id: 'enemy.longhan.broken_banner',
    name: '残旗战魂',
    title: '替一面倒下旗子继续冲锋的人',
    description:
      '甲胄早锈成了一整块，他还攥着半截旗杆。旗面只剩一角，认不出属于哪一族。你靠近时，他先把旗往你这边一横：“报个名。没名字的，过不去。”',
    element: 'earth',
    stats: { health: 210, attack: 22, defense: 11, speed: 5, crit: 5 },
    traits: ['armored', 'berserk'],
    skills: [
      {
        id: 'skill.longhan.banner_stand',
        name: '旗倒不退',
        description: '把断旗往地上一插，人便像钉在旗杆旁边，谁来都得先撞一次。',
        cooldown: 4,
        multiplier: 1.7,
        effect: 'stun',
        power: 4,
      },
    ],
    reward: {
      resources: { spirit_stones: 26, ore: 2 },
    },
  },
  {
    id: 'enemy.longhan.hornless_dragon',
    name: '断角龙卒',
    title: '在混战里被自己人撞断角的巡海卒',
    description:
      '他头上的角断了一只，伤口早长住了。他还守着巡海的旧规矩，只是不再分得清该拦谁：“退潮不走船。你连这个都不懂？”',
    element: 'water',
    stats: { health: 235, attack: 24, defense: 14, speed: 4, crit: 4 },
    traits: ['armored'],
    skills: [
      {
        id: 'skill.longhan.broken_horn_thrust',
        name: '残潮枪',
        description: '用断角那一侧的肩膀顶住浪，枪从潮底下递出来。',
        cooldown: 3,
        multiplier: 1.8,
        effect: 'drain',
        power: 4,
      },
    ],
    reward: {
      resources: { spirit_stones: 24 },
      items: [{ itemId: 'item.longhan.dragon_scale', count: 1 }],
    },
  },
  {
    id: 'enemy.longhan.wingless_guard',
    name: '折翼凤卫',
    title: '翅骨烧断之后仍站在火前的守卫',
    description:
      '他的翅膀只剩两截焦骨，仍把火口挡在身后。“过火先过我。别跟我讲你现在有急事，我当年也有。”',
    element: 'fire',
    stats: { health: 195, attack: 26, defense: 8, speed: 8, crit: 7 },
    traits: ['swift', 'berserk'],
    skills: [
      {
        id: 'skill.longhan.wingless_dive',
        name: '扑火',
        description: '没有翅膀也能借火势扑起来，落地时先烧着的是自己的衣角。',
        cooldown: 3,
        multiplier: 1.9,
        effect: 'burn',
        power: 5,
      },
    ],
    reward: {
      resources: { beast_cores: 2, spirit_stones: 18 },
      items: [{ itemId: 'item.longhan.phoenix_feather', count: 1 }],
    },
  },
  {
    id: 'enemy.longhan.cracked_qilin',
    name: '裂碑麒麟',
    title: '替一块碎碑守了太久的瑞兽',
    description:
      '它身上的石纹从背脊裂到前蹄，仍把碎碑护在腹下。它说话很慢：“碑上写的是真的。只是没人爱听。”',
    element: 'earth',
    stats: { health: 310, attack: 30, defense: 23, speed: 4, crit: 4 },
    traits: ['armored', 'regenerating'],
    skills: [
      {
        id: 'skill.longhan.tablet_press',
        name: '碑压',
        description: '把背上驮了太久的碎石一并卸下，山一样的重量落在原地。',
        cooldown: 4,
        multiplier: 1.8,
        effect: 'stun',
        power: 5,
      },
    ],
    reward: {
      resources: { ore: 6 },
      items: [{ itemId: 'item.longhan.vein_crystal', count: 1 }],
    },
  },
  {
    id: 'enemy.longhan.hundun_beast',
    name: '混沌兽',
    title: '没有正脸的四足影子',
    description:
      '它走路没有声音，转身时永远找不到正脸。你盯着它看久了，会先忘记自己刚才想说什么。',
    element: 'metal',
    stats: { health: 225, attack: 24, defense: 9, speed: 7, crit: 6 },
    traits: ['spirit_eater', 'venom'],
    skills: [
      {
        id: 'skill.longhan.hundun_pounce',
        name: '无面扑',
        description: '影子先到你面前，身体才随后跟上；被扑中的人会短暂忘了怎么躲。',
        cooldown: 3,
        multiplier: 1.8,
        effect: 'drain',
        power: 5,
      },
    ],
    reward: {
      resources: { beast_cores: 3, karma: 1 },
      items: [{ itemId: 'item.longhan.abyss_ink', count: 1 }],
    },
  },
  {
    id: 'enemy.longhan.qiongqi',
    name: '穷奇',
    title: '专挑好人和好事下口的凶兽',
    description:
      '它长着虎身鸟翼，落地时先闻人身上的善意。“别装了，”它咧嘴，“你心里那点想救人的念头，最香。”',
    element: 'wind',
    stats: { health: 340, attack: 35, defense: 12, speed: 9, crit: 9 },
    traits: ['swift', 'berserk'],
    skills: [
      {
        id: 'skill.longhan.qiongqi_bite',
        name: '食善',
        description: '避开护体最厚的地方，一口咬向人最舍不得的那点念头。',
        cooldown: 4,
        multiplier: 2,
        effect: 'drain',
        power: 6,
      },
    ],
    reward: {
      resources: { beast_cores: 4, spirit_stones: 30 },
      items: [{ itemId: 'item.longhan.beast_sinew', count: 2 }],
    },
  },
  {
    id: 'enemy.longhan.taowu',
    name: '梼杌',
    title: '挨了打也绝不改口的荒原恶兽',
    description:
      '它被无数人围过，身上的旧伤比毛还多，脾气却一点没改。你还没开口，它已经先顶了回来：“看什么看。”',
    element: 'earth',
    stats: { health: 390, attack: 33, defense: 21, speed: 3, crit: 5 },
    traits: ['armored', 'berserk'],
    skills: [
      {
        id: 'skill.longhan.taowu_charge',
        name: '顽石撞',
        description: '低着头一路撞过来，不找破绽，只把挡路的东西全算成破绽。',
        cooldown: 4,
        multiplier: 1.9,
        effect: 'stun',
        power: 5,
      },
    ],
    reward: {
      resources: { ore: 8, beast_cores: 3 },
      items: [{ itemId: 'item.longhan.old_bone_slip', count: 1 }],
    },
  },
  {
    id: 'enemy.longhan.taotie',
    name: '饕餮',
    title: '连自己的影子都吃的四凶之首',
    description:
      '它的肚子垂到地上，嘴里还在嚼。四周的骨头、草根、碎石都在往那边挪。“你带吃的了吗？”它问，“没带也行。”',
    element: 'earth',
    stats: { health: 540, attack: 45, defense: 18, speed: 5, crit: 7 },
    traits: ['spirit_eater', 'regenerating'],
    skills: [
      {
        id: 'skill.longhan.taotie_swallow',
        name: '吞仓',
        description: '张开嘴时连灵气带兵刃一起往里吸，吞不下的才吐回来。',
        cooldown: 5,
        multiplier: 2.2,
        effect: 'drain',
        power: 8,
      },
    ],
    reward: {
      resources: { beast_cores: 7, ore: 4 },
      items: [{ itemId: 'item.longhan.beast_sinew', count: 3 }],
    },
  },
  {
    id: 'enemy.longhan.name_eater',
    name: '吞名者',
    title: '在魔渊替人保管名字的瘦长影子',
    description:
      '它手里拿着一本没有封皮的名册，翻一页，你便少记起一个熟人的脸。“别怕，”它很客气，“名字放我这儿，比放你身上稳当。”',
    element: 'metal',
    stats: { health: 320, attack: 34, defense: 14, speed: 7, crit: 8 },
    traits: ['spirit_eater'],
    skills: [
      {
        id: 'skill.longhan.name_erase',
        name: '忘名',
        description: '从名册上划掉一笔，你的招式便先忘了自己该往哪里落。',
        cooldown: 4,
        multiplier: 1.8,
        effect: 'stun',
        power: 6,
      },
    ],
    reward: {
      resources: { karma: 2, spirit_stones: 36 },
      items: [{ itemId: 'item.longhan.abyss_ink', count: 1 }],
    },
  },
  {
    id: 'enemy.longhan.sword_shade',
    name: '无面剑影',
    title: '断剑冢里没有名字的那道锋',
    description:
      '他站在断剑之间，脸被剑影切成很多块。你看不清他何时出剑，只听见他很轻地说：“把名字留下，或者把剑留下。”',
    element: 'metal',
    stats: { health: 490, attack: 48, defense: 22, speed: 11, crit: 12 },
    traits: ['swift', 'spirit_eater'],
    skills: [
      {
        id: 'skill.longhan.shade_line',
        name: '一线',
        description: '剑光细得像一根线，越过护体之后才慢慢散开。',
        cooldown: 4,
        multiplier: 2.1,
        effect: 'drain',
        power: 8,
      },
    ],
    reward: {
      resources: { spirit_stones: 55, karma: 2 },
      items: [{ itemId: 'item.longhan.tide_silver', count: 2 }],
    },
  },
  {
    id: 'enemy.longhan.mountain_bearer',
    name: '负山巨灵',
    title: '把不周山碎石背在身上赶路的老灵',
    description:
      '他背着一座小山，走得比谁都慢，却从不肯卸。“卸下来？那下头压着的东西就醒了。你替我背？”',
    element: 'earth',
    stats: { health: 620, attack: 42, defense: 35, speed: 2, crit: 3 },
    traits: ['armored', 'regenerating'],
    skills: [
      {
        id: 'skill.longhan.shoulder_shift',
        name: '换肩',
        description: '看似只是换了个肩，整条山道都跟着晃了一遍。',
        cooldown: 5,
        multiplier: 2,
        effect: 'stun',
        power: 7,
      },
    ],
    reward: {
      resources: { ore: 10, spirit_stones: 40 },
      items: [{ itemId: 'item.longhan.vein_crystal', count: 2 }],
    },
  },
  {
    id: 'enemy.longhan.thunder_beast',
    name: '云中雷兽',
    title: '把雷声养在胸腔里的白毛兽',
    description:
      '它伏在云里，呼吸一次，云层就亮一次。它不先动手，只把耳朵转向你：“你心跳太吵了。收着点。”',
    element: 'thunder',
    stats: { health: 305, attack: 37, defense: 10, speed: 10, crit: 8 },
    traits: ['swift', 'berserk'],
    skills: [
      {
        id: 'skill.longhan.thunder_drop',
        name: '雷落',
        description: '胸腔里的雷先响，天上的雷才落；听见第一声时已经晚了。',
        cooldown: 3,
        multiplier: 1.9,
        effect: 'stun',
        power: 5,
      },
    ],
    reward: {
      resources: { spirit_stones: 34, spirit_herbs: 3 },
    },
  },
  {
    id: 'enemy.longhan.rip_tide_serpent',
    name: '逆潮蛟',
    title: '偏要往退潮方向游的旧蛟',
    description:
      '四海都在退，它偏要逆着游回来。鳞片被潮水刮得翻起，仍不肯转头。“让开，”它喘着气，“我赶着回去认个错。”',
    element: 'water',
    stats: { health: 350, attack: 33, defense: 16, speed: 6, crit: 6 },
    traits: ['regenerating', 'berserk'],
    skills: [
      {
        id: 'skill.longhan.rip_tide',
        name: '逆潮',
        description: '把整条潮路往自己身后拽，站在潮里的人先失去的是方向。',
        cooldown: 4,
        multiplier: 1.9,
        effect: 'drain',
        power: 6,
      },
    ],
    reward: {
      resources: { spirit_stones: 30 },
      items: [{ itemId: 'item.longhan.tide_silver', count: 1 }],
    },
  },
]

export const longhanEncounters: EncounterDefinition[] = [
  {
    id: 'encounter.longhan.tide_wraith',
    name: '退潮后的旧客',
    summary: '一具潮尸拖住了你的行舟。',
    description:
      '退潮时，一个被海草缠住的身影挡在浅滩上。它没有抬头，只把手伸向船头，像在讨一件很多年前借出去的东西。',
    enemyIds: ['enemy.longhan.tide_wraith'],
    regionId: 'region.longhan.four_seas',
    tier: 1,
    requirements: [],
    victoryEffects: [
      {
        kind: 'changeRegionState',
        regionId: 'region.longhan.four_seas',
        key: 'tide_wraith_cleared',
        value: true,
      },
    ],
    defeatEffects: [
      {
        kind: 'changeResource',
        resource: 'spirit_stones',
        amount: -6,
      },
    ],
    reward: {
      cultivation: 12,
      resources: { spirit_stones: 8 },
    },
    fleeAllowed: true,
    tags: ['sea', 'ambient'],
  },
  {
    id: 'encounter.longhan.scale_raiders',
    name: '鳞贼截舟',
    summary: '一队不认龙庭的水匪围了上来。',
    description:
      '三艘轻舟从礁后滑出，船头站着披旧鳞的人。他不问你的来历，只问你船上有没有龙宫的东西。',
    enemyIds: ['enemy.longhan.scale_raider', 'enemy.longhan.scale_raider'],
    regionId: 'region.longhan.four_seas',
    tier: 1,
    requirements: [{ kind: 'realm', minRealm: 'qi_refining' }],
    victoryEffects: [
      {
        kind: 'changeRegionState',
        regionId: 'region.longhan.four_seas',
        key: 'scale_raiders_broken',
        value: true,
      },
      {
        kind: 'grantItem',
        itemId: 'item.longhan.wave_treads',
        count: 1,
      },
    ],
    defeatEffects: [
      {
        kind: 'changeResource',
        resource: 'spirit_stones',
        amount: -15,
      },
      {
        kind: 'applyStatus',
        statusId: 'status.longhan.raider_wound',
        months: 2,
        source: '鳞贼截舟',
      },
    ],
    reward: {
      cultivation: 22,
      resources: { spirit_stones: 18 },
    },
    fleeAllowed: true,
    tags: ['sea', 'raider'],
  },
  {
    id: 'encounter.longhan.ash_crow_storm',
    name: '鸦群低掠',
    summary: '灰羽鸦群从火口上方压了下来。',
    description:
      '你刚走到火山口边缘，天空忽然暗了一块。鸦群没有散开，而是像一件被抖开的灰袍，直直罩向你。',
    enemyIds: ['enemy.longhan.ash_crow_swarm'],
    regionId: 'region.longhan.undying_volcano',
    tier: 1,
    requirements: [],
    victoryEffects: [
      {
        kind: 'changeRegionState',
        regionId: 'region.longhan.undying_volcano',
        key: 'crow_storm_scattered',
        value: true,
      },
    ],
    defeatEffects: [
      {
        kind: 'applyStatus',
        statusId: 'status.longhan.crow_pecked',
        months: 2,
        source: '鸦群低掠',
      },
    ],
    reward: {
      cultivation: 14,
      resources: { beast_cores: 1 },
    },
    fleeAllowed: true,
    tags: ['volcano', 'beast'],
  },
  {
    id: 'encounter.longhan.ember_hound_cave',
    name: '火鬃守门',
    summary: '一头火鬃犬伏在旧路的入口。',
    description:
      '火山腹地的旧路被一具烧红的兽影堵住。它没有主动扑来，只在你向前一步时抬起眼，喉咙里压着一线低火。',
    enemyIds: ['enemy.longhan.ember_hound'],
    regionId: 'region.longhan.undying_volcano',
    tier: 1,
    requirements: [{ kind: 'realm', minRealm: 'qi_refining', minStage: 2 }],
    victoryEffects: [
      {
        kind: 'changeRegionState',
        regionId: 'region.longhan.undying_volcano',
        key: 'old_road_opened',
        value: true,
      },
      {
        kind: 'grantItem',
        itemId: 'item.longhan.flame_ring',
        count: 1,
      },
    ],
    defeatEffects: [
      {
        kind: 'applyStatus',
        statusId: 'status.longhan.burn_scar',
        months: 3,
        source: '火鬃守门',
      },
    ],
    reward: {
      cultivation: 26,
      resources: { beast_cores: 2 },
    },
    fleeAllowed: false,
    tags: ['volcano', 'guardian'],
  },
  {
    id: 'encounter.longhan.stoneback_patrol',
    name: '负碑而行',
    summary: '负碑兽按旧路线走到了你面前。',
    description:
      '崖下传来极沉的脚步。一头背着断碑的巨兽沿旧日巡路走来，既不加快，也不绕开。它背上的碑文已经磨平，路却仍然记得。',
    enemyIds: ['enemy.longhan.stoneback'],
    regionId: 'region.longhan.qilin_cliff',
    tier: 2,
    requirements: [{ kind: 'realm', minRealm: 'qi_refining', minStage: 3 }],
    victoryEffects: [
      {
        kind: 'changeRegionState',
        regionId: 'region.longhan.qilin_cliff',
        key: 'stoneback_passed',
        value: true,
      },
      {
        kind: 'grantItem',
        itemId: 'item.longhan.qilin_seal',
        count: 1,
      },
    ],
    defeatEffects: [
      {
        kind: 'changeResource',
        resource: 'ore',
        amount: -3,
      },
    ],
    reward: {
      cultivation: 32,
      resources: { ore: 5, spirit_stones: 16 },
    },
    fleeAllowed: true,
    tags: ['cliff', 'guardian'],
  },
  {
    id: 'encounter.longhan.vein_worm_nest',
    name: '地脉浊息',
    summary: '裂缝里探出半截蠕虫。',
    description:
      '地脉深井旁的土层忽然塌下一块。一条被灵脉养得过大的蠕虫从缝里探出半身，吐出的浊气让周围的石纹都暗了下去。',
    enemyIds: ['enemy.longhan.vein_worm'],
    regionId: 'region.longhan.qilin_cliff',
    tier: 2,
    requirements: [],
    victoryEffects: [
      {
        kind: 'changeRegionState',
        regionId: 'region.longhan.qilin_cliff',
        key: 'vein_worm_cleared',
        value: true,
      },
    ],
    defeatEffects: [
      {
        kind: 'applyStatus',
        statusId: 'status.longhan.vein_corruption',
        months: 3,
        source: '地脉浊息',
      },
    ],
    reward: {
      cultivation: 18,
      resources: { spirit_herbs: 3, ore: 2 },
    },
    fleeAllowed: true,
    tags: ['cliff', 'beast'],
  },
  {
    id: 'encounter.longhan.bone_herd',
    name: '骨原兽潮',
    summary: '荒骨兽从骨脊后站了起来。',
    description:
      '风停之后，骨原深处传来细密的摩擦声。一头由旧骨拼成的兽从山脊后站起，更多碎骨正从四面八方向它聚拢。',
    enemyIds: ['enemy.longhan.bone_beast'],
    regionId: 'region.longhan.beast_waste',
    tier: 2,
    requirements: [{ kind: 'realm', minRealm: 'foundation' }],
    victoryEffects: [
      {
        kind: 'changeRegionState',
        regionId: 'region.longhan.beast_waste',
        key: 'bone_herd_broken',
        value: true,
      },
      {
        kind: 'grantItem',
        itemId: 'item.longhan.bone_vest',
        count: 1,
      },
    ],
    defeatEffects: [
      {
        kind: 'changeResource',
        resource: 'beast_cores',
        amount: -2,
      },
    ],
    reward: {
      cultivation: 38,
      resources: { beast_cores: 3, ore: 3 },
    },
    fleeAllowed: true,
    tags: ['wilds', 'beast'],
  },
  {
    id: 'encounter.longhan.abyss_watcher',
    name: '渊影窥视',
    summary: '某种东西从无光处走进了你的影子。',
    description:
      '魔渊里的光拐了个弯。你回头时看见一个人形的轮廓站在不远处，它没有脸，却让你想起某个很久以前离开的人。',
    enemyIds: ['enemy.longhan.abyss_watcher'],
    regionId: 'region.longhan.rahu_abyss',
    tier: 2,
    requirements: [{ kind: 'flag', flag: 'longhan.rahu_whisper', value: true }],
    victoryEffects: [
      {
        kind: 'changeRegionState',
        regionId: 'region.longhan.rahu_abyss',
        key: 'watcher_dispelled',
        value: true,
      },
      {
        kind: 'addRumor',
        rumorId: 'rumor.longhan.watcher_name',
        text: '渊影消散前用你自己的声音叫了一个名字。你确定自己从未听过。',
      },
    ],
    defeatEffects: [
      {
        kind: 'applyStatus',
        statusId: 'status.longhan.mirror_mind',
        months: 4,
        source: '渊影窥视',
      },
    ],
    reward: {
      cultivation: 45,
      resources: { karma: 1, spirit_stones: 24 },
    },
    fleeAllowed: false,
    tags: ['abyss', 'rahu', 'hidden'],
  },
  {
    id: 'encounter.longhan.phoenix_zealot',
    name: '焚羽拦路',
    summary: '凤族旁支的焚羽卫守在旧火道前。',
    description:
      '火道很窄，只容一人通过。焚羽卫把一支烧到一半的旧羽横在道口，说火道尽头的东西不该由外人先看见。',
    enemyIds: ['enemy.longhan.phoenix_zealot'],
    regionId: 'region.longhan.undying_volcano',
    tier: 2,
    requirements: [{ kind: 'realm', minRealm: 'foundation' }],
    victoryEffects: [
      {
        kind: 'changeRegionState',
        regionId: 'region.longhan.undying_volcano',
        key: 'old_fire_road',
        value: 'opened',
      },
      {
        kind: 'grantItem',
        itemId: 'item.longhan.nirvana_ash',
        count: 1,
      },
    ],
    defeatEffects: [
      {
        kind: 'applyStatus',
        statusId: 'status.longhan.burn_scar',
        months: 3,
        source: '焚羽拦路',
      },
    ],
    reward: {
      cultivation: 40,
      resources: { spirit_stones: 20 },
    },
    fleeAllowed: true,
    tags: ['volcano', 'phoenix'],
  },
  {
    id: 'encounter.longhan.nirvana_moth',
    name: '灰翅扑火',
    summary: '一只涅槃蛾从灰里飞起，翅膀上带着未散的旧名。',
    description:
      '它原本伏在灰烬里，翅膀与灰几乎分不清。当你靠近，它忽然飞起，绕着你的影子转了半圈，像在确认你是不是它等的那个人。',
    enemyIds: ['enemy.longhan.nirvana_moth'],
    regionId: 'region.longhan.undying_volcano',
    tier: 2,
    requirements: [{ kind: 'realm', minRealm: 'foundation', minStage: 2 }],
    victoryEffects: [
      {
        kind: 'addRumor',
        rumorId: 'rumor.longhan.nirvana_moth',
        text: '涅槃蛾只绕着将死未死的人飞。它落在谁肩上，谁就会在当夜梦见一场没有烧完的火。',
      },
    ],
    defeatEffects: [
      {
        kind: 'applyStatus',
        statusId: 'status.longhan.memory_ash',
        months: 3,
        source: '灰翅扑火',
      },
    ],
    reward: {
      cultivation: 44,
      resources: { spirit_herbs: 2 },
    },
    fleeAllowed: true,
    tags: ['volcano', 'beast', 'rebirth'],
  },
  {
    id: 'encounter.longhan.vein_colossus',
    name: '脉兽翻身',
    summary: '地脉深处的东西翻了个身，整片崖坡随之立起。',
    description:
      '崖下的土层先是鼓起一个缓慢的弧度，随后整块地面站了起来。它身上覆着旧石纹，动作迟钝，却把退路一并抬离了地面。',
    enemyIds: ['enemy.longhan.vein_colossus'],
    regionId: 'region.longhan.qilin_cliff',
    tier: 3,
    requirements: [{ kind: 'realm', minRealm: 'foundation', minStage: 2 }],
    victoryEffects: [
      {
        kind: 'changeRegionState',
        regionId: 'region.longhan.qilin_cliff',
        key: 'vein_colossus',
        value: 'calmed',
      },
      {
        kind: 'grantItem',
        itemId: 'item.longhan.vein_crystal',
        count: 1,
      },
    ],
    defeatEffects: [
      {
        kind: 'changeResource',
        resource: 'ore',
        amount: -4,
      },
    ],
    reward: {
      cultivation: 52,
      resources: { ore: 5 },
    },
    fleeAllowed: false,
    tags: ['cliff', 'earth', 'guardian'],
  },
  {
    id: 'encounter.longhan.auspicious_shade',
    name: '祥瑞之影',
    summary: '一道本该带来祥瑞的影子，站在崖上背对着你。',
    description:
      '它有着麒麟的轮廓，却没有瑞兽的温度。崖上的石纹在它脚下依次熄灭；它不回头，只把一段旧日的吉兆重复给你听。',
    enemyIds: ['enemy.longhan.auspicious_shade'],
    regionId: 'region.longhan.qilin_cliff',
    tier: 3,
    requirements: [{ kind: 'realm', minRealm: 'foundation' }],
    victoryEffects: [
      {
        kind: 'changeRegionState',
        regionId: 'region.longhan.qilin_cliff',
        key: 'auspicious_shade',
        value: 'dispersed',
      },
      {
        kind: 'addRumor',
        rumorId: 'rumor.longhan.auspicious_shade',
        text: '有影子在麒麟崖上重复旧日的祥瑞。真正的地脉在那之后安静了整整一夜。',
      },
    ],
    defeatEffects: [
      {
        kind: 'applyStatus',
        statusId: 'status.longhan.mirror_mind',
        months: 3,
        source: '祥瑞之影',
      },
    ],
    reward: {
      cultivation: 48,
      resources: { spirit_stones: 22 },
    },
    fleeAllowed: true,
    tags: ['cliff', 'shadow', 'hidden'],
  },
  {
    id: 'encounter.longhan.dragon_exile',
    name: '逐潮者的旧枪',
    summary: '一名被龙庭除名的巡海使拦住了潮路。',
    description:
      '他站在潮线正中间，身上的旧鳞衣已经褪色。他不问你从哪里来，只问你还记不记得自己第一次听见退潮时站在哪里。',
    enemyIds: ['enemy.longhan.dragon_exile'],
    regionId: 'region.longhan.four_seas',
    tier: 3,
    requirements: [{ kind: 'realm', minRealm: 'foundation', minStage: 2 }],
    victoryEffects: [
      {
        kind: 'changeRegionState',
        regionId: 'region.longhan.four_seas',
        key: 'exile',
        value: 'passed',
      },
      {
        kind: 'grantItem',
        itemId: 'item.longhan.tide_silver',
        count: 2,
      },
    ],
    defeatEffects: [
      {
        kind: 'changeResource',
        resource: 'spirit_stones',
        amount: -18,
      },
    ],
    reward: {
      cultivation: 56,
      resources: { spirit_stones: 26 },
    },
    fleeAllowed: true,
    tags: ['sea', 'dragon', 'exile'],
  },
  {
    id: 'encounter.longhan.abyss_scribe',
    name: '渊书吏',
    summary: '一个在无光处记录名字的身影，翻开了属于你的那一页。',
    description:
      '它没有面孔，只有一双很长的袖口。袖中滑出一册薄薄的旧账，每一页都写着一个被抹去的名字。翻到某一页时，它停住了。',
    enemyIds: ['enemy.longhan.abyss_scribe'],
    regionId: 'region.longhan.rahu_abyss',
    tier: 3,
    requirements: [
      { kind: 'flag', flag: 'longhan.rahu_whisper', value: true },
      { kind: 'realm', minRealm: 'foundation' },
    ],
    victoryEffects: [
      {
        kind: 'changeRegionState',
        regionId: 'region.longhan.rahu_abyss',
        key: 'scribe',
        value: 'erased',
      },
      {
        kind: 'grantItem',
        itemId: 'item.longhan.abyss_ink',
        count: 1,
      },
    ],
    defeatEffects: [
      {
        kind: 'applyStatus',
        statusId: 'status.longhan.mirror_mind',
        months: 4,
        source: '渊书吏',
      },
    ],
    reward: {
      cultivation: 60,
      resources: { karma: 1, spirit_stones: 20 },
    },
    fleeAllowed: false,
    tags: ['abyss', 'rahu'],
  },
  {
    id: 'encounter.longhan.rahu_echo',
    name: '魔祖回声',
    summary: '魔渊深处有一段不属于罗睺本人的声音，替他回答了所有问题。',
    description:
      '你听见自己的名字被念出，随后是第二个名字、第三个名字，每一个都像从你身上剥下来的。回声不是罗睺，却拥有他留下的一切耐心。',
    enemyIds: ['enemy.longhan.rahu_echo'],
    regionId: 'region.longhan.rahu_abyss',
    tier: 4,
    requirements: [
      { kind: 'flag', flag: 'longhan.calamity_resolved', value: true },
      { kind: 'realm', minRealm: 'golden_core' },
    ],
    victoryEffects: [
      {
        kind: 'changeRegionState',
        regionId: 'region.longhan.rahu_abyss',
        key: 'echo',
        value: 'silenced',
      },
      {
        kind: 'grantItem',
        itemId: 'item.longhan.rahu_mask',
        count: 1,
      },
      {
        kind: 'addMemory',
        memoryId: 'memory.longhan.rahu_echo',
        text: '你在魔渊里杀死了一段回声。它消散前用罗睺的声音说：下一次，轮到你自己回答。',
      },
    ],
    defeatEffects: [
      {
        kind: 'applyStatus',
        statusId: 'status.longhan.mirror_mind',
        months: 6,
        source: '魔祖回声',
      },
      {
        kind: 'changeResource',
        resource: 'karma',
        amount: 2,
      },
    ],
    reward: {
      cultivation: 120,
      resources: { karma: 2, spirit_stones: 60 },
    },
    fleeAllowed: false,
    tags: ['abyss', 'rahu', 'boss'],
  },
  {
    id: 'encounter.longhan.bone_sovereign',
    name: '骨原王',
    summary: '整片骨原同时站了起来，骨骼在荒原尽头拼成一顶王冠。',
    description:
      '兽潮退去后，骨原没有安静。所有碎骨朝同一个方向聚拢，堆出一头比山脊更高的兽。它没有眼睛，却在你看它时低下了头，像在确认一位旧主的归来。',
    enemyIds: ['enemy.longhan.bone_sovereign'],
    regionId: 'region.longhan.beast_waste',
    tier: 5,
    requirements: [
      { kind: 'flag', flag: 'longhan.beast_tide_answered', value: true },
      { kind: 'realm', minRealm: 'foundation', minStage: 3 },
    ],
    victoryEffects: [
      {
        kind: 'changeRegionState',
        regionId: 'region.longhan.beast_waste',
        key: 'bone_sovereign',
        value: 'fallen',
      },
      {
        kind: 'grantItem',
        itemId: 'item.longhan.beast_sinew',
        count: 3,
      },
      {
        kind: 'grantItem',
        itemId: 'item.longhan.old_bone_slip',
        count: 1,
      },
    ],
    defeatEffects: [
      {
        kind: 'changeResource',
        resource: 'beast_cores',
        amount: -3,
      },
      {
        kind: 'applyStatus',
        statusId: 'status.longhan.bone_chill',
        months: 4,
        source: '骨原王',
      },
    ],
    reward: {
      cultivation: 100,
      resources: { beast_cores: 5, ore: 4 },
    },
    fleeAllowed: false,
    tags: ['wilds', 'beast', 'boss'],
  },
  {
    id: 'encounter.longhan.tide_leviathan',
    name: '潮渊巨鲸',
    summary: '四海退到最低处时，一头比旧宫更大的鲸从潮渊里浮起。',
    description:
      '它的背脊露出水面时，四海像被抬起了一寸。鲸不攻击，只把身体横在潮眼上；退去的潮水因此无处可回，旧宫的宫门重新露出水面。',
    enemyIds: ['enemy.longhan.tide_leviathan'],
    regionId: 'region.longhan.four_seas',
    tier: 5,
    requirements: [
      { kind: 'flag', flag: 'longhan.calamity_resolved', value: true },
      { kind: 'realm', minRealm: 'golden_core' },
    ],
    victoryEffects: [
      {
        kind: 'changeRegionState',
        regionId: 'region.longhan.four_seas',
        key: 'leviathan',
        value: 'returned_to_depth',
      },
      {
        kind: 'grantItem',
        itemId: 'item.longhan.tide_silver',
        count: 4,
      },
      {
        kind: 'addRumor',
        rumorId: 'rumor.longhan.tide_leviathan',
        text: '潮渊巨鲸只在四海同时退潮时浮起。有人说它背上的旧伤，是上一劫留下的潮位。',
      },
    ],
    defeatEffects: [
      {
        kind: 'changeResource',
        resource: 'spirit_stones',
        amount: -30,
      },
      {
        kind: 'applyStatus',
        statusId: 'status.longhan.deep_pressure',
        months: 4,
        source: '潮渊巨鲸',
      },
    ],
    reward: {
      cultivation: 130,
      resources: { spirit_stones: 70, spirit_herbs: 4 },
    },
    fleeAllowed: false,
    tags: ['sea', 'beast', 'boss'],
  },
  {
    id: 'encounter.longhan.broken_banner',
    name: '残旗还在等号令',
    summary: '一面早该倒下的旗子，还插在旧战场中央。',
    description:
      '低地上只有风。你走近时，那面残旗忽然朝你转过来，旗杆下站起一个锈成一整块的人：“报个名。没名字的，算逃兵。”',
    enemyIds: ['enemy.longhan.broken_banner'],
    regionId: 'region.longhan.honghuang_land',
    tier: 3,
    requirements: [{ kind: 'realm', minRealm: 'qi_refining', minStage: 2 }],
    victoryEffects: [
      {
        kind: 'changeRegionState',
        regionId: 'region.longhan.honghuang_land',
        key: 'broken_banner',
        value: 'laid_down',
      },
      { kind: 'grantItem', itemId: 'item.longhan.old_bone_slip', count: 1 },
    ],
    defeatEffects: [
      { kind: 'changeResource', resource: 'ore', amount: -2 },
      {
        kind: 'applyStatus',
        statusId: 'status.longhan.raider_wound',
        months: 2,
        source: '残旗战魂',
      },
    ],
    reward: { cultivation: 38, resources: { spirit_stones: 20, ore: 2 } },
    fleeAllowed: true,
    tags: ['battlefield', 'three_clans'],
  },
  {
    id: 'encounter.longhan.hornless_dragon',
    name: '断角龙卒拦潮',
    summary: '一个断了角的旧巡卒，还守着早已作废的潮规。',
    description:
      '他把枪横在浅滩上，先看了一眼你的船，又看了一眼潮线。“退潮不走船。”他说得很认真，像这条规矩今天仍然算数。',
    enemyIds: ['enemy.longhan.hornless_dragon'],
    regionId: 'region.longhan.four_seas',
    tier: 3,
    requirements: [{ kind: 'realm', minRealm: 'qi_refining', minStage: 2 }],
    victoryEffects: [
      {
        kind: 'changeRegionState',
        regionId: 'region.longhan.four_seas',
        key: 'hornless_dragon',
        value: 'sent_home',
      },
      { kind: 'grantItem', itemId: 'item.longhan.dragon_scale', count: 1 },
    ],
    defeatEffects: [
      { kind: 'changeResource', resource: 'spirit_stones', amount: -10 },
      {
        kind: 'applyStatus',
        statusId: 'status.longhan.raider_wound',
        months: 2,
        source: '断角龙卒',
      },
    ],
    reward: { cultivation: 42, resources: { spirit_stones: 24 } },
    fleeAllowed: true,
    tags: ['sea', 'dragon'],
  },
  {
    id: 'encounter.longhan.wingless_guard',
    name: '折翼者守火',
    summary: '一个翅膀烧断的凤卫，挡在火口前不肯让路。',
    description:
      '他背上的翅骨只剩两截焦黑。你还没说话，他先把手一抬：“过火先过我。你要真有急事，就先打赢再说。”',
    enemyIds: ['enemy.longhan.wingless_guard'],
    regionId: 'region.longhan.undying_volcano',
    tier: 3,
    requirements: [{ kind: 'realm', minRealm: 'qi_refining', minStage: 2 }],
    victoryEffects: [
      {
        kind: 'changeRegionState',
        regionId: 'region.longhan.undying_volcano',
        key: 'wingless_guard',
        value: 'stood_aside',
      },
      { kind: 'grantItem', itemId: 'item.longhan.phoenix_feather', count: 1 },
    ],
    defeatEffects: [
      {
        kind: 'applyStatus',
        statusId: 'status.longhan.burn_scar',
        months: 2,
        source: '折翼凤卫',
      },
    ],
    reward: { cultivation: 44, resources: { beast_cores: 2 } },
    fleeAllowed: true,
    tags: ['fire', 'phoenix'],
  },
  {
    id: 'encounter.longhan.cracked_qilin',
    name: '裂碑前的瑞兽',
    summary: '一头麒麟把碎碑护在腹下，不肯让任何人靠近。',
    description:
      '它的石纹从背脊裂到前蹄，仍把碎碑遮得严严实实。“碑上写的是真的。”它说，“你们不爱听，也不能把它砸了。”',
    enemyIds: ['enemy.longhan.cracked_qilin'],
    regionId: 'region.longhan.qilin_cliff',
    tier: 4,
    requirements: [{ kind: 'realm', minRealm: 'foundation' }],
    victoryEffects: [
      {
        kind: 'changeRegionState',
        regionId: 'region.longhan.qilin_cliff',
        key: 'cracked_qilin',
        value: 'relieved',
      },
      { kind: 'grantItem', itemId: 'item.longhan.vein_crystal', count: 1 },
    ],
    defeatEffects: [
      { kind: 'changeResource', resource: 'ore', amount: -4 },
      {
        kind: 'applyStatus',
        statusId: 'status.longhan.ridge_slowness',
        months: 3,
        source: '裂碑麒麟',
      },
    ],
    reward: { cultivation: 62, resources: { ore: 5 } },
    fleeAllowed: true,
    tags: ['earth', 'qilin'],
  },
  {
    id: 'encounter.longhan.hundun',
    name: '没有正脸的影子',
    summary: '荒原上有个四足影子，怎么转都看不到脸。',
    description:
      '它从骨堆后面绕出来，每一步都没有声音。你盯着它看，脑子里先空了一块，像有人把刚想好的话擦掉了。',
    enemyIds: ['enemy.longhan.hundun_beast'],
    regionId: 'region.longhan.beast_waste',
    tier: 3,
    requirements: [{ kind: 'realm', minRealm: 'qi_refining', minStage: 2 }],
    victoryEffects: [
      {
        kind: 'changeRegionState',
        regionId: 'region.longhan.beast_waste',
        key: 'hundun',
        value: 'scattered',
      },
      { kind: 'grantItem', itemId: 'item.longhan.abyss_ink', count: 1 },
    ],
    defeatEffects: [
      {
        kind: 'applyStatus',
        statusId: 'status.longhan.ember_forgetting',
        months: 2,
        source: '混沌兽',
      },
    ],
    reward: { cultivation: 46, resources: { beast_cores: 3, karma: 1 } },
    fleeAllowed: true,
    tags: ['wilds', 'four_fiends'],
  },
  {
    id: 'encounter.longhan.qiongqi',
    name: '穷奇嗅善',
    summary: '一只虎身鸟翼的凶兽，专挑人心里最软的地方下口。',
    description:
      '它从半空落下，先闻了闻你。“你身上有救人的味儿。”它咧开嘴，“我好久没吃这个了。”',
    enemyIds: ['enemy.longhan.qiongqi'],
    regionId: 'region.longhan.beast_waste',
    tier: 4,
    requirements: [{ kind: 'realm', minRealm: 'foundation' }],
    victoryEffects: [
      {
        kind: 'changeRegionState',
        regionId: 'region.longhan.beast_waste',
        key: 'qiongqi',
        value: 'wounded',
      },
      { kind: 'grantItem', itemId: 'item.longhan.beast_sinew', count: 2 },
    ],
    defeatEffects: [
      { kind: 'changeResource', resource: 'beast_cores', amount: -2 },
      {
        kind: 'applyStatus',
        statusId: 'status.longhan.bone_chill',
        months: 3,
        source: '穷奇',
      },
    ],
    reward: { cultivation: 68, resources: { beast_cores: 4, spirit_stones: 26 } },
    fleeAllowed: true,
    tags: ['wilds', 'four_fiends'],
  },
  {
    id: 'encounter.longhan.taowu',
    name: '梼杌不让路',
    summary: '一头浑身旧伤的恶兽，横在山道上，脾气比伤还硬。',
    description:
      '它趴在路中间，身上的旧伤一层压一层。你还没开口，它先顶了回来：“看什么看。要过就快点。”',
    enemyIds: ['enemy.longhan.taowu'],
    regionId: 'region.longhan.beast_waste',
    tier: 4,
    requirements: [{ kind: 'realm', minRealm: 'foundation' }],
    victoryEffects: [
      {
        kind: 'changeRegionState',
        regionId: 'region.longhan.beast_waste',
        key: 'taowu',
        value: 'driven_off',
      },
      { kind: 'grantItem', itemId: 'item.longhan.old_bone_slip', count: 1 },
    ],
    defeatEffects: [
      {
        kind: 'applyStatus',
        statusId: 'status.longhan.crow_pecked',
        months: 3,
        source: '梼杌',
      },
    ],
    reward: { cultivation: 70, resources: { ore: 7, beast_cores: 3 } },
    fleeAllowed: true,
    tags: ['wilds', 'four_fiends'],
  },
  {
    id: 'encounter.longhan.taotie',
    name: '饕餮开口',
    summary: '四凶之首张开了嘴，整片荒原都在往那边滑。',
    description:
      '它没有先扑过来，只是张了张嘴。碎石先动了，草根跟着动，你脚下的土也在往那边挪。“带吃的了吗？”它含含糊糊地问，“没带也行。”',
    enemyIds: ['enemy.longhan.taotie'],
    regionId: 'region.longhan.beast_waste',
    tier: 5,
    requirements: [{ kind: 'realm', minRealm: 'foundation', minStage: 3 }],
    victoryEffects: [
      {
        kind: 'changeRegionState',
        regionId: 'region.longhan.beast_waste',
        key: 'taotie',
        value: 'sated',
      },
      { kind: 'grantItem', itemId: 'item.longhan.beast_sinew', count: 3 },
      {
        kind: 'addRumor',
        rumorId: 'rumor.longhan.taotie_sleep',
        text: '饕餮吃饱之后会睡很久。荒原上的散修把这句话当成年景：它睡一年，草就能长一年。',
      },
    ],
    defeatEffects: [
      { kind: 'changeResource', resource: 'beast_cores', amount: -4 },
      {
        kind: 'applyStatus',
        statusId: 'status.longhan.vein_corruption',
        months: 3,
        source: '饕餮',
      },
    ],
    reward: { cultivation: 105, resources: { beast_cores: 6, ore: 4 } },
    fleeAllowed: false,
    tags: ['wilds', 'four_fiends', 'boss'],
  },
  {
    id: 'encounter.longhan.name_eater',
    name: '它在翻你的名字',
    summary: '魔渊里有人拿着一本没有封皮的名册。',
    description:
      '瘦长的影子坐在路边翻册子，翻一页，你就少想起一个熟人。“别紧张，”它说，“名字放我这儿，比放你身上稳。”',
    enemyIds: ['enemy.longhan.name_eater'],
    regionId: 'region.longhan.rahu_abyss',
    tier: 4,
    requirements: [{ kind: 'realm', minRealm: 'foundation' }],
    victoryEffects: [
      {
        kind: 'changeRegionState',
        regionId: 'region.longhan.rahu_abyss',
        key: 'name_eater',
        value: 'book_lost',
      },
      { kind: 'grantItem', itemId: 'item.longhan.abyss_ink', count: 1 },
    ],
    defeatEffects: [
      {
        kind: 'applyStatus',
        statusId: 'status.longhan.name_borrowed',
        months: 3,
        source: '吞名者',
      },
    ],
    reward: { cultivation: 72, resources: { karma: 2, spirit_stones: 32 } },
    fleeAllowed: true,
    tags: ['abyss', 'name'],
  },
  {
    id: 'encounter.longhan.sword_shade',
    name: '断剑冢的无面人',
    summary: '断剑之间站着一道没有脸的剑影。',
    description:
      '他没有脸，也没有多话：“把名字留下，或者把剑留下。”断剑在他脚边轻轻响，像在替他数你还剩几口气。',
    enemyIds: ['enemy.longhan.sword_shade'],
    regionId: 'region.longhan.rahu_abyss',
    tier: 5,
    requirements: [{ kind: 'realm', minRealm: 'foundation', minStage: 3 }],
    victoryEffects: [
      {
        kind: 'changeRegionState',
        regionId: 'region.longhan.rahu_abyss',
        key: 'sword_shade',
        value: 'sheathed',
      },
      { kind: 'grantItem', itemId: 'item.longhan.tide_silver', count: 2 },
    ],
    defeatEffects: [
      { kind: 'changeResource', resource: 'spirit_stones', amount: -25 },
      {
        kind: 'applyStatus',
        statusId: 'status.longhan.deep_pressure',
        months: 3,
        source: '无面剑影',
      },
    ],
    reward: { cultivation: 110, resources: { spirit_stones: 50, karma: 2 } },
    fleeAllowed: false,
    tags: ['abyss', 'sword', 'boss'],
  },
  {
    id: 'encounter.longhan.mountain_bearer',
    name: '负山的人',
    summary: '一个老灵背着碎石小山，慢慢走在天柱山道上。',
    description:
      '他走得很慢，肩上的山却很大。你让路时，他停下来喘了口气：“别帮我卸。卸了，下头压着的东西就醒了。”',
    enemyIds: ['enemy.longhan.mountain_bearer'],
    regionId: 'region.longhan.buzhou_mountain',
    tier: 5,
    requirements: [{ kind: 'realm', minRealm: 'foundation', minStage: 3 }],
    victoryEffects: [
      {
        kind: 'changeRegionState',
        regionId: 'region.longhan.buzhou_mountain',
        key: 'mountain_bearer',
        value: 'rested',
      },
      { kind: 'grantItem', itemId: 'item.longhan.vein_crystal', count: 2 },
    ],
    defeatEffects: [
      {
        kind: 'applyStatus',
        statusId: 'status.longhan.ridge_slowness',
        months: 4,
        source: '负山巨灵',
      },
    ],
    reward: { cultivation: 108, resources: { ore: 9, spirit_stones: 38 } },
    fleeAllowed: true,
    tags: ['mountain', 'pillar'],
  },
  {
    id: 'encounter.longhan.thunder_beast',
    name: '云里的雷声',
    summary: '云层亮了一下，一只白毛兽从雷声里探出头。',
    description:
      '它伏在云边，呼吸一次，云就亮一次。“你心跳太吵了。”它把耳朵转向你，“收着点，不然我睡不着。”',
    enemyIds: ['enemy.longhan.thunder_beast'],
    regionId: 'region.longhan.buzhou_mountain',
    tier: 4,
    requirements: [{ kind: 'realm', minRealm: 'foundation' }],
    victoryEffects: [
      {
        kind: 'changeRegionState',
        regionId: 'region.longhan.buzhou_mountain',
        key: 'thunder_beast',
        value: 'quieted',
      },
      { kind: 'grantItem', itemId: 'item.longhan.tide_elixir', count: 1 },
    ],
    defeatEffects: [
      {
        kind: 'applyStatus',
        statusId: 'status.longhan.burn_scar',
        months: 2,
        source: '云中雷兽',
      },
    ],
    reward: { cultivation: 66, resources: { spirit_stones: 34, spirit_herbs: 3 } },
    fleeAllowed: true,
    tags: ['mountain', 'thunder'],
  },
  {
    id: 'encounter.longhan.rip_tide_serpent',
    name: '逆潮而归',
    summary: '一条旧蛟逆着退潮游回来，鳞片都被刮翻了。',
    description:
      '它逆着潮水游得很吃力，仍不肯转头。“让开，”它喘着气，“我赶着回去认个错。晚了，她就不等了。”',
    enemyIds: ['enemy.longhan.rip_tide_serpent'],
    regionId: 'region.longhan.four_seas',
    tier: 4,
    requirements: [{ kind: 'realm', minRealm: 'foundation' }],
    victoryEffects: [
      {
        kind: 'changeRegionState',
        regionId: 'region.longhan.four_seas',
        key: 'rip_tide_serpent',
        value: 'let_pass',
      },
      { kind: 'grantItem', itemId: 'item.longhan.tide_silver', count: 1 },
      {
        kind: 'addRumor',
        rumorId: 'rumor.longhan.rip_tide_serpent',
        text: '逆潮蛟每年退潮时都会往回游一次。有人说它在认错，也有人说它只是记错了潮的方向。',
      },
    ],
    defeatEffects: [
      { kind: 'changeResource', resource: 'spirit_stones', amount: -12 },
      {
        kind: 'applyStatus',
        statusId: 'status.longhan.tide_recovery',
        months: 2,
        source: '逆潮蛟',
      },
    ],
    reward: { cultivation: 64, resources: { spirit_stones: 28 } },
    fleeAllowed: true,
    tags: ['sea', 'serpent'],
  },
]

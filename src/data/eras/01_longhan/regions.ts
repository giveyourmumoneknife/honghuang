import type { RegionDefinition } from '@/types/content'

export const longhanRegions: RegionDefinition[] = [
  {
    id: 'region.longhan.honghuang_land',
    name: '洪荒大地',
    kind: 'land',
    description:
      '开天之后最辽阔的陆块。山川尚在生长，河流时常改道；三族的足迹、凶兽的骨与散修的洞火，都被同一阵风吹在同一片原野上。',
    eraIds: ['era.prologue', 'era.longhan'],
    hidden: false,
    danger: 3,
    neighbors: [
      'region.longhan.four_seas',
      'region.longhan.undying_volcano',
      'region.longhan.qilin_cliff',
      'region.longhan.beast_waste',
      'region.longhan.buzhou_mountain',
    ],
    encounterIds: [
      'encounter.longhan.broken_banner',
      'encounter.longhan.road_asker',
      'encounter.longhan.oathless_rider',
    ],
    factionPresence: ['faction.longhan.dragon', 'faction.longhan.phoenix', 'faction.longhan.qilin'],
    sites: [
      {
        id: 'site.longhan.meeting_ground',
        name: '三族会盟台',
        description:
          '一块没有主人、也没有碑文的巨石。三族曾在此立誓，也在此第一次拔出兵刃。石面上的裂纹比盟约更长久。',
        hidden: false,
        unlockRequirements: [],
        tags: ['landmark', 'diplomacy'],
      },
      {
        id: 'site.longhan.ancient_forest',
        name: '原初林海',
        description:
          '树木在夜里会挪动根系，像在避开什么。林间散落着开天时未散尽的清气，偶尔能拾到不属于这个时代的回声。',
        hidden: false,
        unlockRequirements: [],
        tags: ['wilderness', 'origin'],
      },
    ],
    tags: ['land', 'frontier'],
  },
  {
    id: 'region.longhan.four_seas',
    name: '四海',
    kind: 'sea',
    description:
      '龙族以潮汐划定疆界，海底的旧宫一层压着一层。海面上风平浪静时，水下常有看不见的巡队擦过你的船底。',
    eraIds: ['era.prologue', 'era.longhan'],
    hidden: false,
    danger: 3,
    neighbors: ['region.longhan.honghuang_land', 'region.longhan.beast_waste'],
    encounterIds: [
      'encounter.longhan.tide_wraith',
      'encounter.longhan.scale_raiders',
      'encounter.longhan.hornless_dragon',
      'encounter.longhan.rip_tide_serpent',
      'encounter.longhan.dragon_exile',
      'encounter.longhan.tide_leviathan',
    ],
    factionPresence: ['faction.longhan.dragon'],
    sites: [
      {
        id: 'site.longhan.east_sea_palace',
        name: '东海龙宫',
        description:
          '龙庭所在。珊瑚与沉铁筑成的宫殿随潮水缓缓呼吸，宫门上的潮纹认得每一位龙族血脉，也记得一些不肯离开的客人。',
        hidden: false,
        unlockRequirements: [],
        tags: ['faction_home', 'dragon'],
      },
      {
        id: 'site.longhan.returning_abyss',
        name: '归墟海眼',
        description:
          '四海之水最终都会在这里消失。海眼不吞船，只吞声音；靠近时，连自己的心跳都像从很远处传来。',
        hidden: true,
        unlockRequirements: [
          {
            kind: 'flag',
            flag: 'longhan.tide_echo',
            value: true,
          },
        ],
        tags: ['hidden', 'abyss'],
      },
    ],
    tags: ['sea', 'dragon'],
  },
  {
    id: 'region.longhan.undying_volcano',
    name: '不死火山',
    kind: 'volcano',
    description:
      '火从不熄灭，也从不真正燃烧同一片山林。凤族在火山腹地筑巢，灰烬落处会在多年后长出新的赤羽花。',
    eraIds: ['era.longhan'],
    hidden: false,
    danger: 3,
    neighbors: ['region.longhan.honghuang_land', 'region.longhan.qilin_cliff'],
    encounterIds: [
      'encounter.longhan.ash_crow_storm',
      'encounter.longhan.ember_hound_cave',
      'encounter.longhan.wingless_guard',
      'encounter.longhan.phoenix_zealot',
      'encounter.longhan.nirvana_moth',
    ],
    factionPresence: ['faction.longhan.phoenix'],
    sites: [
      {
        id: 'site.longhan.nirvana_pool',
        name: '涅槃池',
        description:
          '一池看不出深浅的暗红。凤族在此洗去旧羽，也在此把不愿忘记的东西烧成灰。池边没有倒影。',
        hidden: false,
        unlockRequirements: [],
        tags: ['faction_home', 'phoenix'],
      },
      {
        id: 'site.longhan.fire_mouth',
        name: '火山口',
        description:
          '不死火唯一的出口。火焰喷涌时会短暂照亮整片天空，也照出山腹里一条通往更深处的旧路。',
        hidden: false,
        unlockRequirements: [],
        tags: ['landmark', 'fire'],
      },
    ],
    tags: ['volcano', 'phoenix'],
  },
  {
    id: 'region.longhan.qilin_cliff',
    name: '麒麟崖',
    kind: 'cliff',
    description:
      '崖体由层层叠叠的瑞石构成，踩上去会听见极低的回响。麒麟族在此看守地脉，地脉的每一次轻颤都会先传到崖上。',
    eraIds: ['era.longhan'],
    hidden: false,
    danger: 3,
    neighbors: [
      'region.longhan.honghuang_land',
      'region.longhan.undying_volcano',
      'region.longhan.buzhou_mountain',
      'region.longhan.rahu_abyss',
    ],
    encounterIds: [
      'encounter.longhan.stoneback_patrol',
      'encounter.longhan.vein_worm_nest',
      'encounter.longhan.cracked_qilin',
      'encounter.longhan.auspicious_shade',
      'encounter.longhan.vein_colossus',
    ],
    factionPresence: ['faction.longhan.qilin'],
    sites: [
      {
        id: 'site.longhan.auspicious_terrace',
        name: '祥瑞台',
        description:
          '麒麟族议事的高台。台面没有台阶，只有七道天然石纹；传说每一道石纹对应一次大地的呼吸。',
        hidden: false,
        unlockRequirements: [],
        tags: ['faction_home', 'qilin'],
      },
      {
        id: 'site.longhan.earth_vein_well',
        name: '地脉深井',
        description:
          '井口只有一人宽，井下却没有回声。俯身时能看见一线温润的青光，像大地睁开的眼睛。',
        hidden: false,
        unlockRequirements: [],
        tags: ['landmark', 'earth'],
      },
    ],
    tags: ['cliff', 'qilin'],
  },
  {
    id: 'region.longhan.rahu_abyss',
    name: '魔渊',
    kind: 'abyss',
    description:
      '光在这里会拐弯，声音会落在身后。罗睺的教众把深渊叫作“尚未合拢的伤口”，而洪荒众族更愿意叫它“不该去看的地方”。',
    eraIds: ['era.longhan'],
    hidden: false,
    danger: 4,
    neighbors: ['region.longhan.qilin_cliff', 'region.longhan.beast_waste'],
    unlockRequirements: [
      {
        kind: 'flag',
        flag: 'longhan.rahu_whisper',
        value: true,
      },
    ],
    encounterIds: [
      'encounter.longhan.abyss_watcher',
      'encounter.longhan.abyss_scribe',
      'encounter.longhan.name_eater',
      'encounter.longhan.sword_shade',
      'encounter.longhan.rahu_echo',
    ],
    factionPresence: ['faction.longhan.rahu'],
    sites: [
      {
        id: 'site.longhan.demon_fire_cave',
        name: '魔火窟',
        description:
          '火焰不热，只烧影子。魔道弟子在此试炼时，往往先被自己的影子逼到无路可退。',
        hidden: false,
        unlockRequirements: [],
        tags: ['faction_home', 'rahu'],
      },
      {
        id: 'site.longhan.lightless_sea',
        name: '无光海',
        description:
          '一片没有水声的海。海面像凝固的黑石，踩上去却会泛起细密的涟漪，仿佛有什么在极深处回应。',
        hidden: true,
        unlockRequirements: [
          {
            kind: 'factionMembership',
            factionId: 'faction.longhan.rahu',
            rankAtLeast: 1,
          },
        ],
        tags: ['hidden', 'rahu'],
      },
    ],
    tags: ['abyss', 'rahu'],
  },
  {
    id: 'region.longhan.beast_waste',
    name: '凶兽荒原',
    kind: 'wilds',
    description:
      '开天时被震碎的边角，凶兽在此繁衍。草从骨缝里长出来，风把旧日厮杀的回声带得很远。',
    eraIds: ['era.longhan'],
    hidden: false,
    danger: 5,
    neighbors: [
      'region.longhan.honghuang_land',
      'region.longhan.four_seas',
      'region.longhan.rahu_abyss',
      'region.longhan.buzhou_mountain',
    ],
    encounterIds: [
      'encounter.longhan.bone_herd',
      'encounter.longhan.hundun',
      'encounter.longhan.qiongqi',
      'encounter.longhan.taowu',
      'encounter.longhan.taotie',
      'encounter.longhan.bone_sovereign',
    ],
    factionPresence: [],
    sites: [
      {
        id: 'site.longhan.bone_plain',
        name: '万兽骨原',
        description:
          '一眼望不到边的白骨，彼此支撑成低矮的山脊。夜里骨缝会发出细响，像无数只兽在睡梦中磨牙。',
        hidden: false,
        unlockRequirements: [],
        tags: ['wilds', 'beast'],
      },
      {
        id: 'site.longhan.chaos_rift',
        name: '混沌裂隙',
        description:
          '荒原中央的一道狭长裂口。裂口里没有风，却有不属于此界的微弱呼吸，时有时无。',
        hidden: true,
        unlockRequirements: [
          {
            kind: 'realm',
            minRealm: 'foundation',
            minStage: 1,
          },
        ],
        tags: ['hidden', 'chaos'],
      },
    ],
    tags: ['wilds', 'beast'],
  },
  {
    id: 'region.longhan.buzhou_mountain',
    name: '不周山',
    kind: 'mountain',
    description:
      '天柱尚在，山体直入云外。越往上走，时间越像变慢；山道旁的旧刻没有作者，只有一道道被风磨圆的指尖痕。',
    eraIds: ['era.longhan'],
    hidden: false,
    danger: 5,
    neighbors: [
      'region.longhan.honghuang_land',
      'region.longhan.qilin_cliff',
      'region.longhan.beast_waste',
      'region.longhan.zi_xiao_palace',
    ],
    encounterIds: [
      'encounter.longhan.thunder_beast',
      'encounter.longhan.mountain_bearer',
      'encounter.longhan.star_quarry',
      'encounter.longhan.pillar_warden',
    ],
    factionPresence: [],
    sites: [
      {
        id: 'site.longhan.pillar_scar',
        name: '天柱残痕',
        description:
          '山腰一处巨大的凹陷，像曾被什么撞过。凹陷边缘的石质与别处不同，摸上去有极淡的温热。',
        hidden: false,
        unlockRequirements: [],
        tags: ['landmark', 'pillar'],
      },
      {
        id: 'site.longhan.ancestral_path',
        name: '祖巫旧径',
        description:
          '一条只容一人通过的窄径，尽头没入云中。石阶上每隔百步便有一枚模糊的足印，尺寸远大于当今生灵。',
        hidden: true,
        unlockRequirements: [
          {
            kind: 'realm',
            minRealm: 'golden_core',
            minStage: 1,
          },
        ],
        tags: ['hidden', 'ancestor'],
      },
    ],
    tags: ['mountain', 'origin'],
  },
  {
    id: 'region.longhan.zi_xiao_palace',
    name: '紫霄宫',
    kind: 'palace',
    description:
      '云海之上的一座旧宫，不在任何地图的边界内。宫门偶尔开启，听见道音的人会忘记自己是如何走到这里的。',
    eraIds: ['era.longhan'],
    hidden: true,
    danger: 2,
    neighbors: ['region.longhan.buzhou_mountain'],
    encounterIds: ['encounter.longhan.lectern_shadow'],
    unlockRequirements: [
      {
        kind: 'flag',
        flag: 'longhan.heard_dao',
        value: true,
      },
    ],
    factionPresence: [],
    sites: [
      {
        id: 'site.longhan.palace_steps',
        name: '宫门石阶',
        description:
          '九十九级石阶，每一级都比前一级更冷。走到尽头的人会发现，宫门并没有锁。',
        hidden: true,
        unlockRequirements: [
          {
            kind: 'flag',
            flag: 'longhan.heard_dao',
            value: true,
          },
        ],
        tags: ['hidden', 'dao'],
      },
      {
        id: 'site.longhan.ancient_mat_hall',
        name: '蒲团古殿',
        description:
          '空殿里摆着几个旧蒲团，落满不惹尘埃的灰。最靠里的那一个始终空着，像在等一个尚未到来的人。',
        hidden: true,
        unlockRequirements: [
          {
            kind: 'flag',
            flag: 'longhan.palace_entered',
            value: true,
          },
        ],
        tags: ['hidden', 'dao'],
      },
    ],
    tags: ['palace', 'hidden', 'dao'],
  },
]

import type { CaveDefinition } from '@/types/content'

export const longhanCaves: CaveDefinition[] = [
  {
    id: 'cave.longhan.tide_grotto',
    name: '听潮洞',
    description:
      '藏在四海一处退潮才露出的礁腹里。洞口窄得只容一人侧身，腹地却有一汪不会随潮起落的清水。敖光说，这里听得见四海换气。',
    buildings: [
      {
        id: 'building.longhan.tide_array',
        name: '聚潮阵',
        description:
          '顺着礁腹水脉刻下的引潮阵。阵眼不与海争水，只借潮水来回时留下的那一线灵机。',
        levels: [
          {
            level: 1,
            name: '引潮阶',
            description: '把洞外潮声引进阵眼，修炼时能借到一缕海息。',
            cost: { spirit_stones: 20 },
            verbs: ['导引海息'],
            verb: {
              id: 'verb.longhan.tide_array.guide',
              name: '导引海息',
              description: '闭目调息一月，借潮水来回之间的一线灵机推动修为。',
              cost: { spirit_stones: 2 },
              cooldownMonths: 1,
              effects: [
                { kind: 'gainCultivation', amount: 8 },
                {
                  kind: 'applyStatus',
                  statusId: 'status.longhan.tide_breath',
                  months: 2,
                  source: '导引海息',
                },
              ],
            },
            effects: [
              {
                kind: 'setFlag',
                flag: 'longhan.cave.tide_array',
                value: 'guiding',
              },
            ],
          },
          {
            level: 2,
            name: '回澜台',
            description: '阵势转折处多出一层回澜，可把外来的灵力推回原处。',
            cost: { spirit_stones: 45, ore: 10 },
            verbs: ['回澜护穴'],
            verb: {
              id: 'verb.longhan.tide_array.ward',
              name: '回澜护穴',
              description: '把回澜压在洞口。若来袭者在这几月里进洞，会先撞上自己的力道。',
              cost: { spirit_stones: 3, ore: 1 },
              cooldownMonths: 2,
              effects: [
                {
                  kind: 'applyStatus',
                  statusId: 'status.longhan.cave_ward',
                  months: 3,
                  source: '回澜护穴',
                },
                { kind: 'gainCultivation', amount: 18 },
              ],
            },
            effects: [
              {
                kind: 'setFlag',
                flag: 'longhan.cave.tide_array',
                value: 'returning',
              },
            ],
          },
          {
            level: 3,
            name: '潮眼阵心',
            description: '阵心与四海潮眼短暂相连，能在潮头站定时借一步水路。',
            cost: { spirit_stones: 90, beast_cores: 2 },
            verbs: ['借潮移形'],
            verb: {
              id: 'verb.longhan.tide_array.stride',
              name: '借潮移形',
              description: '沿着潮眼走一段不该存在的水路，回来时修为与身法都像被潮水洗过。',
              cost: { spirit_stones: 5, beast_cores: 1 },
              cooldownMonths: 3,
              effects: [
                { kind: 'gainCultivation', amount: 50 },
                {
                  kind: 'applyStatus',
                  statusId: 'status.longhan.tide_stride',
                  months: 2,
                  source: '借潮移形',
                },
              ],
            },
            effects: [
              {
                kind: 'setFlag',
                flag: 'longhan.cave.tide_array',
                value: 'tide_eye',
              },
            ],
          },
        ],
      },
      {
        id: 'building.longhan.tide_loft',
        name: '听潮阁',
        description:
          '用沉船木与旧宫瓦搭起的小楼。风平浪静时听不见什么，潮水将起未起时，楼板会先轻轻发响。',
        levels: [
          {
            level: 1,
            name: '观潮轩',
            description: '一扇朝海的窗，能把潮汐变化记成可读的刻痕。',
            cost: { spirit_stones: 25, ore: 5 },
            verbs: ['记潮'],
            verb: {
              id: 'verb.longhan.tide_loft.record',
              name: '记潮',
              description: '把一段潮汐刻在楼板上。看得懂的人，愿意为这些刻痕付钱。',
              cost: { spirit_stones: 1 },
              cooldownMonths: 1,
              effects: [
                { kind: 'changeResource', resource: 'spirit_stones', amount: 2 },
                {
                  kind: 'changeRegionState',
                  regionId: 'region.longhan.four_seas',
                  key: 'cave_tide_marked',
                  value: true,
                },
              ],
            },
            effects: [
              {
                kind: 'setFlag',
                flag: 'longhan.cave.tide_loft',
                value: 'watched',
              },
            ],
          },
          {
            level: 2,
            name: '听海楼',
            description: '楼中悬着一面旧潮鼓，能分辨巡海队与海兽的动静。',
            cost: { spirit_stones: 50, ore: 12 },
            verbs: ['辨踪'],
            verb: {
              id: 'verb.longhan.tide_loft.trace',
              name: '辨踪',
              description: '听一夜潮鼓，把海面上不属于潮水的声音一一分出来。',
              cost: { spirit_stones: 2 },
              cooldownMonths: 2,
              effects: [
                {
                  kind: 'addRumor',
                  rumorId: 'rumor.longhan.cave_patrol',
                  text: '潮鼓在半夜响了三下。你循声望去，看见一队旧鳞船贴着礁影往南去了。',
                },
                {
                  kind: 'changeRegionState',
                  regionId: 'region.longhan.four_seas',
                  key: 'cave_patrol_known',
                  value: true,
                },
              ],
            },
            effects: [
              {
                kind: 'setFlag',
                flag: 'longhan.cave.tide_loft',
                value: 'listening',
              },
            ],
          },
          {
            level: 3,
            name: '望归台',
            description: '台顶没有灯，只有一枚朝向归墟的潮纹；远行的人能循着它找到回来的路。',
            cost: { spirit_stones: 100, beast_cores: 3 },
            verbs: ['唤潮指路'],
            verb: {
              id: 'verb.longhan.tide_loft.guide_home',
              name: '唤潮指路',
              description: '对着潮纹唤一声，远处的潮水会替你亮出一条很淡的路。',
              cost: { spirit_stones: 4 },
              cooldownMonths: 3,
              effects: [
                {
                  kind: 'addRumor',
                  rumorId: 'rumor.longhan.cave_way_home',
                  text: '望归台上的潮纹亮了一瞬。你忽然记起一条从未走过、却知道自己能走回去的路。',
                },
                {
                  kind: 'applyStatus',
                  statusId: 'status.longhan.clear_mind',
                  months: 2,
                  source: '唤潮指路',
                },
              ],
            },
            effects: [
              {
                kind: 'setFlag',
                flag: 'longhan.cave.tide_loft',
                value: 'guiding_home',
              },
            ],
          },
        ],
      },
      {
        id: 'building.longhan.herb_garden',
        name: '盐生圃',
        description:
          '洞腹最深处的一片潮土，盐分重，寻常灵植活不了。敖光从旧宫带来几株耐盐的种子，说它们比修士更懂得等潮。',
        levels: [
          {
            level: 1,
            name: '盐生畦',
            description: '三垄窄畦，种着能在退潮时自行闭合的盐药。',
            cost: { spirit_stones: 15, spirit_herbs: 5 },
            verbs: ['采盐药'],
            verb: {
              id: 'verb.longhan.herb_garden.harvest',
              name: '采盐药',
              description: '趁退潮收一茬盐药，根上还带着洞里的潮气。',
              cost: {},
              cooldownMonths: 2,
              effects: [
                { kind: 'changeResource', resource: 'spirit_herbs', amount: 3 },
                { kind: 'gainCultivation', amount: 1 },
              ],
            },
            effects: [
              {
                kind: 'setFlag',
                flag: 'longhan.cave.herb_garden',
                value: 'salted',
              },
            ],
          },
          {
            level: 2,
            name: '温畦',
            description: '用聚潮阵余温养出的灵畦，能让海生灵植适应洞中水汽。',
            cost: { spirit_stones: 35, spirit_herbs: 15 },
            verbs: ['育灵植'],
            verb: {
              id: 'verb.longhan.herb_garden.nurture',
              name: '育灵植',
              description: '以灵草汁液喂养新根，慢，但能让下一茬长得更稳。',
              cost: { spirit_herbs: 2 },
              cooldownMonths: 3,
              effects: [
                { kind: 'changeResource', resource: 'spirit_herbs', amount: 7 },
                { kind: 'gainCultivation', amount: 4 },
              ],
            },
            effects: [
              {
                kind: 'setFlag',
                flag: 'longhan.cave.herb_garden',
                value: 'warmed',
              },
            ],
          },
          {
            level: 3,
            name: '潮生圃',
            description: '圃中自成小潮，一季可催熟一茬本需数年的海药。',
            cost: { spirit_stones: 80, spirit_herbs: 30, beast_cores: 1 },
            verbs: ['催熟一季'],
            verb: {
              id: 'verb.longhan.herb_garden.ripen',
              name: '催熟一季',
              description: '把小潮压进圃里，听见泥土下面同时有几十枚种子破壳。',
              cost: { spirit_stones: 4, spirit_herbs: 4 },
              cooldownMonths: 4,
              effects: [
                { kind: 'changeResource', resource: 'spirit_herbs', amount: 16 },
                { kind: 'grantItem', itemId: 'item.longhan.purifying_dew', count: 1 },
              ],
            },
            effects: [
              {
                kind: 'setFlag',
                flag: 'longhan.cave.herb_garden',
                value: 'tidegrown',
              },
            ],
          },
        ],
      },
      {
        id: 'building.longhan.alchemy',
        name: '丹房',
        description:
          '借礁壁渗出的冷水砌成的矮屋。屋里没有明火，只有一只以潮气养着的旧炉，炉盖边缘永远凝着一圈白霜。',
        levels: [
          {
            level: 1,
            name: '冷炉',
            description: '用盐药与潮露试炼最粗浅的净火露。',
            cost: { spirit_stones: 30, spirit_herbs: 10 },
            verbs: ['炼露'],
            verb: {
              id: 'verb.longhan.alchemy.dew',
              name: '炼露',
              description: '守着一炉冷火，把盐药里的火意一点点逼出来。',
              cost: { spirit_herbs: 3 },
              cooldownMonths: 2,
              effects: [
                { kind: 'grantItem', itemId: 'item.longhan.purifying_dew', count: 1 },
              ],
            },
            effects: [
              {
                kind: 'setFlag',
                flag: 'longhan.cave.alchemy',
                value: 'cold_furnace',
              },
            ],
          },
          {
            level: 2,
            name: '温炉',
            description: '炉壁内层嵌了龙鳞，炉温终于能稳稳停在一个不伤药性的位置。',
            cost: { spirit_stones: 55, spirit_herbs: 20, ore: 5 },
            verbs: ['温养灵息'],
            verb: {
              id: 'verb.longhan.alchemy.warm_breath',
              name: '温养灵息',
              description: '服下一炉还未成形的药息，把经脉里驳杂的灵机慢慢熨平。',
              cost: { spirit_herbs: 5, spirit_stones: 4 },
              cooldownMonths: 3,
              effects: [
                { kind: 'gainCultivation', amount: 22 },
                {
                  kind: 'applyStatus',
                  statusId: 'status.longhan.pill_breath',
                  months: 2,
                  source: '温养灵息',
                },
              ],
            },
            effects: [
              {
                kind: 'setFlag',
                flag: 'longhan.cave.alchemy',
                value: 'warm_furnace',
              },
            ],
          },
          {
            level: 3,
            name: '潮丹炉',
            description: '炉底与洞中灵脉相通。开炉时，整座洞府都会短暂地安静下来。',
            cost: { spirit_stones: 110, spirit_herbs: 40, beast_cores: 2 },
            verbs: ['开炉'],
            verb: {
              id: 'verb.longhan.alchemy.open_furnace',
              name: '开炉',
              description: '以兽核引火，一次开炉能得两枚净火露；炉门合上时，你的手还在发烫。',
              cost: { spirit_herbs: 10, spirit_stones: 8, beast_cores: 1 },
              cooldownMonths: 4,
              effects: [
                { kind: 'grantItem', itemId: 'item.longhan.purifying_dew', count: 2 },
                { kind: 'gainCultivation', amount: 10 },
              ],
            },
            effects: [
              {
                kind: 'setFlag',
                flag: 'longhan.cave.alchemy',
                value: 'tide_furnace',
              },
            ],
          },
        ],
      },
      {
        id: 'building.longhan.forge',
        name: '器坊',
        description:
          '半间石屋，半间水榭。砧台一半浸在水里，淬火时不用舀水，潮线会自己漫上来。墙边堆着从各地捡回的断器。',
        levels: [
          {
            level: 1,
            name: '水砧',
            description: '只够修修补补，但比在外头求人便宜得多。',
            cost: { spirit_stones: 25, ore: 8 },
            verbs: ['修器'],
            verb: {
              id: 'verb.longhan.forge.repair',
              name: '修器',
              description: '把旧器上的裂口一一敲平，换下来的碎料还能卖给潮市。',
              cost: { ore: 2, spirit_stones: 2 },
              cooldownMonths: 3,
              effects: [
                { kind: 'changeResource', resource: 'spirit_stones', amount: 10 },
                { kind: 'gainCultivation', amount: 2 },
              ],
            },
            effects: [
              {
                kind: 'setFlag',
                flag: 'longhan.cave.forge',
                value: 'water_anvil',
              },
            ],
          },
          {
            level: 2,
            name: '熔鳞池',
            description: '一汪被炉火温着的水池，能把旧鳞重新熔开而不伤其纹。',
            cost: { spirit_stones: 55, ore: 20 },
            verbs: ['熔鳞'],
            verb: {
              id: 'verb.longhan.forge.melt_scale',
              name: '熔鳞',
              description: '从旧器上剥下鳞片，重新熔成一枚可用的龙鳞。',
              cost: { ore: 4, spirit_stones: 4 },
              cooldownMonths: 3,
              effects: [
                { kind: 'grantItem', itemId: 'item.longhan.dragon_scale', count: 1 },
              ],
            },
            effects: [
              {
                kind: 'setFlag',
                flag: 'longhan.cave.forge',
                value: 'scale_pool',
              },
            ],
          },
          {
            level: 3,
            name: '听潮炉',
            description: '炉火与潮声同频。器物在火中成形时，会先响一声海。',
            cost: { spirit_stones: 110, ore: 45, beast_cores: 2 },
            verbs: ['开炉铸器'],
            verb: {
              id: 'verb.longhan.forge.cast',
              name: '开炉铸器',
              description: '以兽核压火，铸一件能带出洞府的旧制式器物。',
              cost: { ore: 6, spirit_stones: 10, beast_cores: 1 },
              cooldownMonths: 6,
              effects: [
                { kind: 'grantItem', itemId: 'item.longhan.tide_pearl', count: 1 },
              ],
            },
            effects: [
              {
                kind: 'setFlag',
                flag: 'longhan.cave.forge',
                value: 'tide_furnace',
              },
            ],
          },
        ],
      },
      {
        id: 'building.longhan.meditation',
        name: '悟道室',
        description:
          '洞中最安静的一间空室。四面石壁没有刻痕，只有水汽凝结又退去留下的浅白纹路。坐久了，会分不清潮声在洞外还是在自己体内。',
        levels: [
          {
            level: 1,
            name: '静室',
            description: '一席蒲团，一盏不灭的冷灯。',
            cost: { spirit_stones: 20, spirit_herbs: 5 },
            verbs: ['静坐'],
            verb: {
              id: 'verb.longhan.meditation.sit',
              name: '静坐',
              description: '什么也不做，只把呼吸放到与潮水一样慢。',
              cost: { spirit_stones: 1 },
              cooldownMonths: 2,
              effects: [
                { kind: 'gainCultivation', amount: 15 },
                {
                  kind: 'applyStatus',
                  statusId: 'status.longhan.quiet_room',
                  months: 2,
                  source: '静坐',
                },
              ],
            },
            effects: [
              {
                kind: 'setFlag',
                flag: 'longhan.cave.meditation',
                value: 'quiet',
              },
            ],
          },
          {
            level: 2,
            name: '观壁',
            description: '石壁上被潮气洗出层层浅纹，看久了像一部没有字的旧经。',
            cost: { spirit_stones: 50, spirit_herbs: 10, ore: 5 },
            verbs: ['观壁'],
            verb: {
              id: 'verb.longhan.meditation.wall',
              name: '观壁',
              description: '对着一面没有字的墙坐足一月，直到墙上的水痕自己动起来。',
              cost: { spirit_stones: 3 },
              cooldownMonths: 3,
              effects: [{ kind: 'gainCultivation', amount: 40 }],
            },
            effects: [
              {
                kind: 'setFlag',
                flag: 'longhan.cave.meditation',
                value: 'wall_gazing',
              },
            ],
          },
          {
            level: 3,
            name: '问心',
            description: '室顶有一道很细的裂缝，雨时会落下一线水。听过它落满一夜的人，会知道自己真正怕什么。',
            cost: { spirit_stones: 100, beast_cores: 2 },
            verbs: ['问心'],
            verb: {
              id: 'verb.longhan.meditation.ask',
              name: '问心',
              description: '把最不愿想起的那件事请出来，与它同坐一室。',
              cost: { spirit_stones: 6, beast_cores: 1 },
              cooldownMonths: 5,
              effects: [
                { kind: 'gainCultivation', amount: 95 },
                {
                  kind: 'applyStatus',
                  statusId: 'status.longhan.clear_mind',
                  months: 3,
                  source: '问心',
                },
              ],
            },
            effects: [
              {
                kind: 'setFlag',
                flag: 'longhan.cave.meditation',
                value: 'heart_asked',
              },
            ],
          },
        ],
      },
      {
        id: 'building.longhan.beast_pen',
        name: '灵兽栏',
        description:
          '用潮木围出的一片浅池，池底铺着细沙。灵兽在这里不必一直警惕，连洞外的潮声都像是隔了一层。',
        levels: [
          {
            level: 1,
            name: '浅池',
            description: '几根木桩围出的水面，够一只小兽打滚。',
            cost: { spirit_stones: 20, spirit_herbs: 5 },
            verbs: ['喂灵'],
            verb: {
              id: 'verb.longhan.beast_pen.feed',
              name: '喂灵',
              description: '用盐药喂养栏中灵兽，它们会在夜里替你叼回一些东西。',
              cost: { spirit_herbs: 2 },
              cooldownMonths: 2,
              effects: [
                { kind: 'changeResource', resource: 'beast_cores', amount: 1 },
              ],
            },
            effects: [
              {
                kind: 'setFlag',
                flag: 'longhan.cave.beast_pen',
                value: 'shallow_pool',
              },
            ],
          },
          {
            level: 2,
            name: '驯栏',
            description: '栏中多了一道可开合的水闸，能让不同性情的小兽各占一角。',
            cost: { spirit_stones: 45, spirit_herbs: 12, ore: 4 },
            verbs: ['驯兽'],
            verb: {
              id: 'verb.longhan.beast_pen.tame',
              name: '驯兽',
              description: '陪它们在水里耗上几日，直到有一头愿意把背脊贴过来。',
              cost: { spirit_herbs: 3, spirit_stones: 2 },
              cooldownMonths: 3,
              effects: [
                { kind: 'changeResource', resource: 'beast_cores', amount: 2 },
                { kind: 'gainCultivation', amount: 5 },
              ],
            },
            effects: [
              {
                kind: 'setFlag',
                flag: 'longhan.cave.beast_pen',
                value: 'tamed',
              },
            ],
          },
          {
            level: 3,
            name: '巡山栏',
            description: '栏门直通洞外的一条暗路。灵兽从这里出去，会在天亮前回来。',
            cost: { spirit_stones: 90, spirit_herbs: 25, beast_cores: 2 },
            verbs: ['纵兽巡山'],
            verb: {
              id: 'verb.longhan.beast_pen.patrol',
              name: '纵兽巡山',
              description: '让灵兽沿着洞外的暗路走一圈，替你确认哪些动静该在意。',
              cost: { beast_cores: 1, spirit_stones: 4 },
              cooldownMonths: 5,
              effects: [
                {
                  kind: 'addRumor',
                  rumorId: 'rumor.longhan.cave_beast_patrol',
                  text: '灵兽天亮前回来，身上沾着别处的灰。它没有受伤，只是一直朝山外看。',
                },
                {
                  kind: 'changeRegionState',
                  regionId: 'region.longhan.four_seas',
                  key: 'cave_beast_patrol',
                  value: true,
                },
                { kind: 'gainCultivation', amount: 20 },
              ],
            },
            effects: [
              {
                kind: 'setFlag',
                flag: 'longhan.cave.beast_pen',
                value: 'patrol',
              },
            ],
          },
        ],
      },
      {
        id: 'building.longhan.storehouse',
        name: '潮库',
        description:
          '洞中最干燥的一块高台，堆着从沉船、潮市和旧宫里带回来的东西。潮库不讲品类，只记住每件东西是哪一年哪一次潮留下的。',
        levels: [
          {
            level: 1,
            name: '石台',
            description: '几块垫高的石板，足以让器物离地。',
            cost: { spirit_stones: 20, ore: 5 },
            verbs: ['盘库'],
            verb: {
              id: 'verb.longhan.storehouse.tally',
              name: '盘库',
              description: '把积下的旧物重新清点一遍，总有些被忘在角落里的东西还能用。',
              cost: {},
              cooldownMonths: 2,
              effects: [
                { kind: 'changeResource', resource: 'spirit_stones', amount: 4 },
                { kind: 'changeResource', resource: 'ore', amount: 1 },
              ],
            },
            effects: [
              {
                kind: 'setFlag',
                flag: 'longhan.cave.storehouse',
                value: 'stone_platform',
              },
            ],
          },
          {
            level: 2,
            name: '纳潮架',
            description: '用沉船龙骨搭起的架子，潮气进不来，旧物在这里会慢慢聚灵。',
            cost: { spirit_stones: 45, ore: 15 },
            verbs: ['纳潮'],
            verb: {
              id: 'verb.longhan.storehouse.gather',
              name: '纳潮',
              description: '把一季散落的余料归拢，窟中灵气会自己找到它们。',
              cost: { spirit_stones: 4, ore: 2 },
              cooldownMonths: 3,
              effects: [
                { kind: 'changeResource', resource: 'spirit_stones', amount: 14 },
                { kind: 'changeResource', resource: 'spirit_herbs', amount: 3 },
              ],
            },
            effects: [
              {
                kind: 'setFlag',
                flag: 'longhan.cave.storehouse',
                value: 'tide_shelf',
              },
            ],
          },
          {
            level: 3,
            name: '回声库',
            description: '库中每一件旧物都记得自己的来处。站久了，会听见许多年前的潮声。',
            cost: { spirit_stones: 95, ore: 30, beast_cores: 2 },
            verbs: ['潮库共鸣'],
            verb: {
              id: 'verb.longhan.storehouse.resonate',
              name: '潮库共鸣',
              description: '让库中旧物彼此相认。有些东西会在这一夜换一个主人。',
              cost: { spirit_stones: 8, beast_cores: 2 },
              cooldownMonths: 5,
              effects: [
                { kind: 'changeResource', resource: 'spirit_stones', amount: 30 },
                { kind: 'grantItem', itemId: 'item.longhan.dragon_tally', count: 1 },
              ],
            },
            effects: [
              {
                kind: 'setFlag',
                flag: 'longhan.cave.storehouse',
                value: 'echo_store',
              },
            ],
          },
        ],
      },
    ],
    spiritVein: {
      name: '潮眼灵脉',
      attributes: ['水行', '潮汐', '回声'],
      description:
        '灵脉不涌泉，只随四海潮汐涨落。涨潮时灵气自礁壁渗出，退潮时又把洞中的浊息带走；在潮眼边修炼，最忌在退潮前强行留住灵气。',
      levels: [
        {
          level: 1,
          name: '潮息初通',
          description: '灵气只在涨潮时渗进洞来，稀薄，但干净。',
          cost: {},
          effects: [
            {
              kind: 'setFlag',
              flag: 'longhan.cave.vein_tide',
              value: 'first',
            },
          ],
        },
        {
          level: 2,
          name: '双潮回环',
          description: '涨潮入洞，退潮不急走，在礁壁间绕出一圈回环。',
          cost: { spirit_stones: 60, ore: 15 },
          effects: [
            {
              kind: 'setFlag',
              flag: 'longhan.cave.vein_tide',
              value: 'echo',
            },
          ],
        },
        {
          level: 3,
          name: '潮眼内敛',
          description: '灵脉把潮眼收进洞腹，洞外风浪再大，此处只余一线起伏。',
          cost: { spirit_stones: 140, beast_cores: 3 },
          effects: [
            {
              kind: 'setFlag',
              flag: 'longhan.cave.vein_tide',
              value: 'inward',
            },
          ],
        },
        {
          level: 4,
          name: '海脉同息',
          description: '洞中潮息与四海同频。你吸气时，远处的海也在吸气。',
          cost: { spirit_stones: 260, spirit_herbs: 30, ore: 30 },
          effects: [
            {
              kind: 'setFlag',
              flag: 'longhan.cave.vein_tide',
              value: 'same_breath',
            },
          ],
        },
        {
          level: 5,
          name: '听潮见海',
          description: '灵脉不再是洞中的一汪水，而是四海伸进洞腹的一只手。',
          cost: { spirit_stones: 360, spirit_herbs: 60, beast_cores: 8 },
          effects: [
            {
              kind: 'setFlag',
              flag: 'longhan.cave.vein_tide',
              value: 'sea_hand',
            },
          ],
        },
      ],
    },
    disciples: [
      {
        id: 'disciple.longhan.tide_boy',
        name: '阿迟',
        title: '听潮童子',
        description:
          '在潮市替人跑腿的孩子，话很少，记得每一道潮声。你第一次见他时，他正蹲在退潮后的礁缝里，把一只翻不过身的小蟹放回水里。',
        temperament: '安静，怕生，认定一个人后会一直在洞口等到潮退。',
        bondNote: '他会在你出门时把洞口的水痕擦干，再从新留下的水痕里认你回来的方向。',
        aptitude: 'gather',
        requirements: [],
        recruitCost: { spirit_stones: 20 },
        trustLines: [
          '他只在你在的时候才肯进洞，站在离你三步远的地方。',
          '他开始把捡到的盐药分门别类放在石台上，最嫩的一小把总留给你。',
          '你出门时，他会先跑到洞口听一会儿潮，再回头说：“今天可以走。”',
        ],
      },
      {
        id: 'disciple.longhan.salt_girl',
        name: '盐七',
        title: '盐场学徒',
        description:
          '在四海盐场长大的姑娘，手指被盐水泡得发白。她会看盐色、辨药性，也懂得在潮市上把一文钱掰成两半花。',
        temperament: '嘴快，心细，讨厌别人把灵草当柴烧。',
        bondNote: '她替你记账，账本最后总有一页记着：某年某月，洞主又忘了吃饭。',
        aptitude: 'craft',
        requirements: [{ kind: 'item', itemId: 'item.longhan.dragon_scale', count: 2 }],
        recruitCost: { spirit_stones: 35, spirit_herbs: 5 },
        trustLines: [
          '她把丹房里的药罐按大小重新排了一遍，说这样能少走两步。',
          '她开始在你开炉时守在门外，听见炉盖响就先把窗推开一条缝。',
          '她把自己攒下的盐票压在潮库最底层，说万一有一天洞府要搬，这些还能换路费。',
        ],
      },
      {
        id: 'disciple.longhan.old_keeper',
        name: '守墨',
        title: '守脉旧人',
        description:
          '麒麟崖守脉人的后裔，背着一柄没有开锋的旧锤。他来找你时只说了一句话：听说你这里挨过一回袭，还没有搬走。',
        temperament: '寡言，固执，认定守过的地方就不该轻易丢。',
        bondNote: '他每晚绕洞走一圈，回来后在石壁上刻一道很浅的痕。痕已连成半圈。',
        aptitude: 'guard',
        requirements: [
          { kind: 'flag', flag: 'longhan.cave.raids_defended', value: true },
        ],
        recruitCost: { spirit_stones: 40, ore: 10 },
        trustLines: [
          '他站在洞口，像一块被搬错了地方的石。你看得出他在记路。',
          '他开始用旧锤夯洞外那段最松的礁土。声音很轻，怕吵着里面的人。',
          '他把半圈刻痕补齐，又在旁边留了一小块空壁，说下一位守脉人会用上。',
        ],
      },
    ],
    raids: [
      {
        id: 'raid.longhan.scale_tide',
        name: '鳞贼摸潮',
        description:
          '不认龙庭的旧巡队顺着洞府聚起的灵气摸了过来。他们不急着进洞，先把退路一段段踩熟。',
        warning:
          '巡夜时，你在洞外浅滩上看见三盏不该出现的灯。灯没有靠近，只在你回望时同时熄灭。',
        encounterId: 'encounter.longhan.scale_raiders',
        minVeinLevel: 1,
        warningMonths: 3,
        weight: 6,
        ignoredEffects: [
          { kind: 'changeResource', resource: 'spirit_stones', amount: -12 },
          {
            kind: 'changeRegionState',
            regionId: 'region.longhan.four_seas',
            key: 'cave_scaled',
            value: true,
          },
        ],
      },
      {
        id: 'raid.longhan.crow_ash',
        name: '灰羽压洞',
        description:
          '火山口的鸦群被洞中潮气引来。它们停在洞顶，不叫，只一层层加厚。',
        warning:
          '洞顶的礁石上忽然落下一层灰。你抬头时，看见一整片灰羽贴着岩缝，没有一只在动。',
        encounterId: 'encounter.longhan.ash_crow_storm',
        minVeinLevel: 2,
        warningMonths: 2,
        weight: 4,
        ignoredEffects: [
          {
            kind: 'applyStatus',
            statusId: 'status.longhan.crow_pecked',
            months: 2,
            source: '灰羽压洞',
          },
          { kind: 'changeResource', resource: 'spirit_herbs', amount: -6 },
        ],
      },
      {
        id: 'raid.longhan.vein_worm',
        name: '地脉翻浊',
        description:
          '灵脉被掏深的动静惊醒了崖下的东西。它不认洞府，也不认修士，只把浊气一点点顶进灵脉。',
        warning:
          '灵脉的水忽然浑了半日，又自己清回来。洞底传来一声很长的摩擦声，像有什么东西在换方向。',
        encounterId: 'encounter.longhan.vein_worm_nest',
        minVeinLevel: 3,
        warningMonths: 3,
        weight: 3,
        veinDamage: 1,
        ignoredEffects: [
          {
            kind: 'applyStatus',
            statusId: 'status.longhan.vein_corruption',
            months: 3,
            source: '地脉翻浊',
          },
          { kind: 'changeResource', resource: 'ore', amount: -5 },
        ],
      },
      {
        id: 'raid.longhan.bone_tide',
        name: '骨潮过境',
        description:
          '荒原的骨潮沿着地脉走到海边，在你洞府外停了半日。停下来，是因为闻到了活人的气。',
        warning:
          '洞外没有风，沙却一直往一个方向走。你顺着沙看过去，看见一条由碎骨接成的线，正慢慢拐向洞口。',
        encounterId: 'encounter.longhan.bone_herd',
        minVeinLevel: 4,
        warningMonths: 4,
        weight: 2,
        veinDamage: 1,
        ignoredEffects: [
          { kind: 'changeResource', resource: 'beast_cores', amount: -2 },
          { kind: 'changeResource', resource: 'spirit_stones', amount: -20 },
          {
            kind: 'setFlag',
            flag: 'longhan.cave.bone_mark',
            value: true,
          },
        ],
      },
    ],
    visitors: [
      {
        id: 'visitor.longhan.salt_trader',
        name: '裴老盐',
        title: '走潮的盐商',
        description:
          '挑着两筐盐与药的小商人，鞋底永远沾着不同地方的泥。他进门先看洞顶，再看水，最后才看你。',
        greeting:
          '“洞主这地方，潮气收得住，火气也压得下。好地方。”他把担子放下，筐底压着几张被盐浸硬的旧票。',
        requirements: [],
        weight: 5,
        choices: [
          {
            id: 'choice.longhan.salt_trader.trade',
            label: '换一篓盐药',
            description: '用四枚灵石换他担子底下那篓今年新晒的盐药。',
            requirements: [],
            cost: { spirit_stones: 4 },
            effects: [
              { kind: 'changeResource', resource: 'spirit_herbs', amount: 9 },
              {
                kind: 'setFlag',
                flag: 'longhan.cave.salt_deal',
                value: true,
              },
            ],
          },
          {
            id: 'choice.longhan.salt_trader.listen',
            label: '听他说潮外的事',
            description: '不买东西，只留他坐一会儿。商人的路，往往比修士的消息更远。',
            requirements: [],
            effects: [
              {
                kind: 'addRumor',
                rumorId: 'rumor.longhan.salt_road',
                text: '裴老盐说，四海之外有条只在退潮时出现的旧路。走过的人回来时，鞋上都没有海盐。',
              },
              {
                kind: 'setFlag',
                flag: 'longhan.cave.salt_road_heard',
                value: true,
              },
            ],
          },
          {
            id: 'choice.longhan.salt_trader.tea',
            label: '留他喝一盏茶',
            description: '用洞中清水煮一壶盐茶。他说这茶比他走过的许多地方都干净。',
            requirements: [],
            effects: [
              {
                kind: 'applyStatus',
                statusId: 'status.longhan.clear_mind',
                months: 1,
                source: '盐茶',
              },
              { kind: 'changeResource', resource: 'spirit_herbs', amount: 1 },
            ],
          },
          {
            id: 'choice.longhan.salt_trader.marten',
            label: '收下翻筐的洞貂',
            description:
              '一只灰貂从他筐底钻出来，鼻尖沾着盐，先看了看洞顶，又看了看你。裴老盐说它在盐场赖了半个月，始终不肯跟人走。',
            requirements: [
              { kind: 'petNotOwned', petId: 'pet.longhan.cave_marten' },
            ],
            cost: { spirit_herbs: 3 },
            effects: [
              { kind: 'grantPet', petId: 'pet.longhan.cave_marten' },
              {
                kind: 'setFlag',
                flag: 'longhan.cave.marten_kept',
                value: true,
              },
              {
                kind: 'addRumor',
                rumorId: 'rumor.longhan.cave_marten',
                text: '洞貂在潮库里转了一圈，最后钻进最深那层货架后头，再也不肯出来。它似乎认得那里曾放过什么。',
              },
            ],
          },
        ],
      },
      {
        id: 'visitor.longhan.dragon_envoy',
        name: '敖巡',
        title: '龙宫巡海使',
        description:
          '披旧鳞、带短戟的巡海使。他站在洞外不进来，只让洞里的潮气自己出来见他。',
        greeting:
          '“这一带的水脉归龙宫记档。”他看了看洞口，“你占了潮眼，却没有把潮眼占死。敖光没看错人。”',
        requirements: [],
        weight: 3,
        choices: [
          {
            id: 'choice.longhan.dragon_envoy.present',
            label: '呈上洞府潮契',
            description: '把洞府记入龙宫水册。此后巡海队经过时，会先绕开这一段礁。',
            requirements: [],
            cost: { spirit_stones: 6 },
            effects: [
              {
                kind: 'changeFactionState',
                factionId: 'faction.longhan.dragon',
                reputationDelta: 5,
                flags: { cave_recognized: true },
              },
              {
                kind: 'setFlag',
                flag: 'longhan.cave.dragon_recognized',
                value: true,
              },
            ],
          },
          {
            id: 'choice.longhan.dragon_envoy.ask',
            label: '问潮眼旧事',
            description: '问他这处潮眼以前属于谁。他沉默了一会儿，只说了一个已经不在名册上的名字。',
            requirements: [],
            effects: [
              {
                kind: 'addRumor',
                rumorId: 'rumor.longhan.cave_old_owner',
                text: '龙宫水册上，潮眼洞府的前一任主人叫“无灯”。这个名字在两百年前被整页涂掉了。',
              },
              {
                kind: 'setFlag',
                flag: 'longhan.cave.old_owner_known',
                value: true,
              },
            ],
          },
          {
            id: 'choice.longhan.dragon_envoy.decline',
            label: '闭门不见',
            description: '不把洞府记入任何名册。他看了你很久，最后收起短戟，转身走进潮里。',
            requirements: [],
            effects: [
              {
                kind: 'changeRegionState',
                regionId: 'region.longhan.four_seas',
                key: 'cave_envoy_refused',
                value: true,
              },
              {
                kind: 'changeFactionState',
                factionId: 'faction.longhan.dragon',
                reputationDelta: -2,
              },
            ],
          },
        ],
      },
      {
        id: 'visitor.longhan.keeper',
        name: '石三',
        title: '守脉游士',
        description:
          '背着一柄开山镐的游士，衣角全是不同颜色的土。他自称只是路过，却在洞口看了很久的灵脉走向。',
        greeting:
          '“你这灵脉像一条没睡醒的河。”他蹲下去，把手掌贴在礁壁上，“别急着把它叫醒。先听听它愿不愿意。”',
        requirements: [],
        weight: 2,
        choices: [
          {
            id: 'choice.longhan.keeper.vigil',
            label: '与他共守一夜',
            description: '两人轮流听脉，直到天亮。他话不多，但每一句都落在实处。',
            requirements: [],
            effects: [
              { kind: 'gainCultivation', amount: 25 },
              {
                kind: 'applyStatus',
                statusId: 'status.longhan.ridge_hold',
                months: 2,
                source: '共守灵脉',
              },
            ],
          },
          {
            id: 'choice.longhan.keeper.show_vein',
            label: '请他看洞中灵脉',
            description: '把他带到潮眼边。他看了很久，用镐柄在沙上画出一条你从未想过的水路。',
            requirements: [],
            effects: [
              {
                kind: 'setFlag',
                flag: 'longhan.cave.vein_insight',
                value: true,
              },
              { kind: 'changeResource', resource: 'ore', amount: 2 },
            ],
          },
          {
            id: 'choice.longhan.keeper.send_off',
            label: '送他一些路上用的',
            description: '给他装一袋灵草和几块干粮。他没有推辞，只把一只旧罗盘留在石台上。',
            requirements: [],
            effects: [
              { kind: 'changeResource', resource: 'spirit_stones', amount: 2 },
              {
                kind: 'addRumor',
                rumorId: 'rumor.longhan.keeper_road',
                text: '石三走时把罗盘留给了你。指针不朝南北，只朝着洞府深处那汪清水。',
              },
            ],
          },
          {
            id: 'choice.longhan.keeper.ox',
            label: '替负山牛卸下旧鞍',
            description:
              '洞外礁道边站着一头老牛，背上的鞍已经和皮肉长在一起。石三说他认识原来的主人，但那人不会再回来了。',
            requirements: [
              { kind: 'mountNotOwned', mountId: 'mount.longhan.stone_ox' },
            ],
            cost: { spirit_herbs: 5, ore: 4 },
            effects: [
              { kind: 'grantMount', mountId: 'mount.longhan.stone_ox' },
              {
                kind: 'setFlag',
                flag: 'longhan.cave.stone_ox_kept',
                value: true,
              },
              {
                kind: 'addRumor',
                rumorId: 'rumor.longhan.cave_stone_ox',
                text: '负山牛进洞时先低头看了看门槛，像是确认这处地方经不经得起它站。',
              },
            ],
          },
          {
            id: 'choice.longhan.keeper.tablet',
            label: '请他把碑上的路画完',
            description:
              '他从怀里摸出一块巴掌高的旧碑，碑上刻着一条只画了一半的灵脉。他说这不是送，是托付：画完的那一天，得由你决定它通向哪里。',
            requirements: [
              { kind: 'treasureNotOwned', treasureId: 'item.longhan.ridge_tablet' },
            ],
            cost: { spirit_stones: 12, ore: 6 },
            effects: [
              { kind: 'grantTreasure', treasureId: 'item.longhan.ridge_tablet' },
              {
                kind: 'setFlag',
                flag: 'longhan.cave.ridge_tablet_kept',
                value: true,
              },
              {
                kind: 'addRumor',
                rumorId: 'rumor.longhan.cave_ridge_tablet',
                text: '镇脉碑入洞后，潮眼灵脉的走向微微一偏，像在给一块更古老的石头让路。',
              },
            ],
          },
        ],
      },
      {
        id: 'visitor.longhan.reed_aunt',
        name: '芦姑',
        title: '渡口拾荒人',
        description:
          '背着半人高苇篓的老妇人，裤脚全是湿泥。她不进门，只把篓子放在洞口，让里面的东西自己决定要不要留下。',
        greeting:
          '“退潮后的渡口最干净，也最容易捡到没人要的东西。”她掀开苇篓，里面传来细小的沙沙声，“你这里潮气不吵，它们应该睡得着。”',
        requirements: [{ kind: 'realm', minRealm: 'qi_refining', minStage: 1 }],
        weight: 4,
        choices: [
          {
            id: 'choice.longhan.reed_aunt.reed_spirit',
            label: '收下芦苇精',
            description:
              '一丛青芦从篓底探出来，叶尖还挂着渡口的泥。它不会说话，只在你伸手时把叶子往你掌心偏了偏。',
            requirements: [
              { kind: 'petNotOwned', petId: 'pet.longhan.reed_spirit' },
            ],
            cost: { spirit_herbs: 2 },
            effects: [
              { kind: 'grantPet', petId: 'pet.longhan.reed_spirit' },
              {
                kind: 'setFlag',
                flag: 'longhan.cave.reed_spirit_kept',
                value: true,
              },
              {
                kind: 'addRumor',
                rumorId: 'rumor.longhan.cave_reed_spirit',
                text: '芦苇精在盐生圃边扎了根。夜里洞中没有风，它也会朝某个方向轻轻摇。',
              },
            ],
          },
          {
            id: 'choice.longhan.reed_aunt.finch',
            label: '替云雀留一处檐',
            description:
              '一只灰背小鸟落在洞口檐上，不进来，也不飞走。芦姑说它已经跟了她三处渡口，该找个不再搬的地方了。',
            requirements: [
              { kind: 'petNotOwned', petId: 'pet.longhan.cloud_finch' },
            ],
            cost: { spirit_stones: 4 },
            effects: [
              { kind: 'grantPet', petId: 'pet.longhan.cloud_finch' },
              {
                kind: 'setFlag',
                flag: 'longhan.cave.cloud_finch_kept',
                value: true,
              },
              {
                kind: 'addRumor',
                rumorId: 'rumor.longhan.cave_cloud_finch',
                text: '云雀每天天亮前先飞出去一圈，回来时总落在望归台最高那块石头上。',
              },
            ],
          },
          {
            id: 'choice.longhan.reed_aunt.listen',
            label: '听她讲渡口的旧事',
            description:
              '她讲起退潮后露出的旧桥，桥下刻着一排被水磨平的名字。讲到最后，她从篓底摸出一小把还带露的盐药塞给你。',
            requirements: [],
            effects: [
              { kind: 'changeResource', resource: 'spirit_herbs', amount: 1 },
              {
                kind: 'addRumor',
                rumorId: 'rumor.longhan.reed_bridge',
                text: '芦姑说，旧桥下那些名字里有一个还在等人。每年退潮时，桥头都会多出一双湿脚印。',
              },
            ],
          },
        ],
      },
      {
        id: 'visitor.longhan.old_ostler',
        name: '敖丁',
        title: '龙宫旧厩人',
        description:
          '穿旧鳞甲的高个男人，腰间挂着一串不再配套的铜铃。他走路很轻，像怕惊动什么。',
        greeting:
          '“旧厩拆了。这些小的没地方去，又不肯认新主人。”他把铜铃解下来放在石台上，“你这里若还空着，就替它们留个门。”',
        requirements: [{ kind: 'realm', minRealm: 'qi_refining', minStage: 2 }],
        weight: 3,
        choices: [
          {
            id: 'choice.longhan.old_ostler.scale_hound',
            label: '收留鳞犬',
            description:
              '一条覆着旧鳞的犬从礁影里走出来，先绕着你转了一圈，最后在你脚边坐下。它没有摇尾，只把下巴搁在前爪上。',
            requirements: [
              { kind: 'petNotOwned', petId: 'pet.longhan.scale_hound' },
            ],
            cost: { beast_cores: 2 },
            effects: [
              { kind: 'grantPet', petId: 'pet.longhan.scale_hound' },
              {
                kind: 'setFlag',
                flag: 'longhan.cave.scale_hound_kept',
                value: true,
              },
              {
                kind: 'addRumor',
                rumorId: 'rumor.longhan.cave_scale_hound',
                text: '鳞犬第一夜没有睡。它面朝洞口趴到天亮，直到你起身，才闭上眼。',
              },
            ],
          },
          {
            id: 'choice.longhan.old_ostler.mirror_carp',
            label: '牵走镜鲤',
            description:
              '洞外浅水里浮着一条鲤鱼，鳞片映着不该出现在这里的潮位。敖丁说它游得太快，旧厩留不住，得有个更安静的水。',
            requirements: [
              { kind: 'mountNotOwned', mountId: 'mount.longhan.mirror_carp' },
            ],
            cost: { spirit_stones: 14 },
            effects: [
              { kind: 'grantMount', mountId: 'mount.longhan.mirror_carp' },
              {
                kind: 'setFlag',
                flag: 'longhan.cave.mirror_carp_kept',
                value: true,
              },
              {
                kind: 'addRumor',
                rumorId: 'rumor.longhan.cave_mirror_carp',
                text: '镜鲤入洞后，潮眼水面会偶尔映出第二个月亮。敖丁看了一眼，说旧宫当年也是这样。',
              },
            ],
          },
          {
            id: 'choice.longhan.old_ostler.repair',
            label: '陪他把旧厩的铜铃擦完',
            description:
              '他把铜铃一枚枚拆开，用鳞甲上的油慢慢擦。擦完最后一枚时，他把铃系回腰间，说这样旧厩就不算真正拆完。',
            requirements: [],
            effects: [
              { kind: 'changeResource', resource: 'spirit_stones', amount: 3 },
              {
                kind: 'changeFactionState',
                factionId: 'faction.longhan.dragon',
                reputationDelta: 2,
              },
              {
                kind: 'addRumor',
                rumorId: 'rumor.longhan.old_ostler',
                text: '旧厩的铜铃响了一夜。巡海队从礁外经过时，没有一盏灯转向洞口。',
              },
            ],
          },
        ],
      },
      {
        id: 'visitor.longhan.ash_herder',
        name: '灰牧人',
        title: '火山牧鸦人',
        description:
          '披着灰羽斗篷的人，脸上看不出年纪。他不赶鸦，只走在鸦群下面，像一块会移动的阴影。',
        greeting:
          '“火季前，鸦会先知道。”他抬头看了看洞顶，“你这里收得住灰，也压得住火。正好。”',
        requirements: [{ kind: 'realm', minRealm: 'qi_refining', minStage: 3 }],
        weight: 2,
        choices: [
          {
            id: 'choice.longhan.ash_herder.ash_crow',
            label: '借灰羽鸦一程',
            description:
              '一只灰羽大鸦落在洞外礁石上，翅缘还带着火山灰。灰牧人说它认路，不认人；若你肯替它留一条固定的归路，它便替你飞。',
            requirements: [
              { kind: 'mountNotOwned', mountId: 'mount.longhan.ash_crow' },
            ],
            cost: { spirit_stones: 10, ore: 4 },
            effects: [
              { kind: 'grantMount', mountId: 'mount.longhan.ash_crow' },
              {
                kind: 'setFlag',
                flag: 'longhan.cave.ash_crow_kept',
                value: true,
              },
              {
                kind: 'addRumor',
                rumorId: 'rumor.longhan.cave_ash_crow',
                text: '灰羽鸦在望归台边筑了巢。它从不叫，只在火季将临时绕着洞顶飞三圈。',
              },
            ],
          },
          {
            id: 'choice.longhan.ash_herder.cauldron',
            label: '求一鼎初火',
            description:
              '他从斗篷下抱出一只小鼎，鼎腹的火纹在阴天里仍微微发亮。他说这鼎跟过三任主人，每一任都以为自己能守住它到最后。',
            requirements: [
              { kind: 'treasureNotOwned', treasureId: 'item.longhan.cauldron_of_first_flame' },
              { kind: 'realm', minRealm: 'foundation' },
            ],
            cost: { spirit_stones: 45, ore: 10, beast_cores: 2 },
            effects: [
              {
                kind: 'grantTreasure',
                treasureId: 'item.longhan.cauldron_of_first_flame',
              },
              {
                kind: 'setFlag',
                flag: 'longhan.cave.first_flame_kept',
                value: true,
              },
              {
                kind: 'addRumor',
                rumorId: 'rumor.longhan.cave_first_flame',
                text: '初火鼎放进丹房那一夜，冷炉自己热了一次。炉盖上结了三年的白霜退了半寸。',
              },
            ],
          },
          {
            id: 'choice.longhan.ash_herder.listen',
            label: '问他火季会烧到哪里',
            description:
              '他没有正面回答，只在地上画了一条弯线，说火不一定顺着风走，有时会顺着人心里最干的那一块走。',
            requirements: [],
            effects: [
              {
                kind: 'applyStatus',
                statusId: 'status.longhan.clear_mind',
                months: 2,
                source: '灰牧人的火季话',
              },
              {
                kind: 'addRumor',
                rumorId: 'rumor.longhan.ash_herder_fire_season',
                text: '灰牧人走前留下一句：若见灰羽全落在洞北，就该把水缸挪到门口了。',
              },
            ],
          },
        ],
      },
    ],
    chains: [
      {
        id: 'chain.longhan.herb_alchemy',
        name: '药脉丹火',
        description:
          '盐生圃的灵草晒足潮气后送进丹房，丹房再用聚潮阵引来的潮火慢慢焙。草是圃里长的，火是阵里借的，中间断一环，这一炉就得停。',
        buildingIds: [
          'building.longhan.herb_garden',
          'building.longhan.alchemy',
        ],
        assignments: ['gather', 'tend'],
        tidePerMonth: 1.6,
        intervalMonths: 3,
        inputs: { spirit_herbs: 2 },
        outputs: [
          { kind: 'gainCultivation', amount: 12 },
          { kind: 'changeResource', resource: 'spirit_stones', amount: 4 },
          { kind: 'changeResource', resource: 'spirit_herbs', amount: 8 },
        ],
        purityPerMonth: -0.1,
      },
      {
        id: 'chain.longhan.beast_forge',
        name: '兽火铸器',
        description:
          '灵兽栏积下的兽骨与矿料一起送进器坊，以兽火反复锻打。锻得好，能留下龙属旧器上才有的鳞纹；锻得急，炉灰里只剩一层白。',
        buildingIds: [
          'building.longhan.beast_pen',
          'building.longhan.forge',
        ],
        assignments: ['craft', 'guard'],
        tidePerMonth: 2,
        intervalMonths: 4,
        inputs: { ore: 2, beast_cores: 1 },
        outputs: [
          { kind: 'changeResource', resource: 'spirit_stones', amount: 14 },
          { kind: 'changeResource', resource: 'ore', amount: 4 },
          { kind: 'changeResource', resource: 'beast_cores', amount: 2 },
        ],
        purityPerMonth: -0.2,
      },
      {
        id: 'chain.longhan.tide_dao',
        name: '潮眼悟道',
        description:
          '聚潮阵把潮眼压在阵心，悟道室顺着那一线起伏静坐。潮涨时不追，潮退时不拦，坐得久了，人会听见自己心里的回音。',
        buildingIds: [
          'building.longhan.tide_array',
          'building.longhan.meditation',
        ],
        assignments: ['study', 'tend'],
        tidePerMonth: 1.8,
        intervalMonths: 4,
        inputs: { spirit_stones: 6 },
        outputs: [
          { kind: 'gainCultivation', amount: 30 },
          { kind: 'changeResource', resource: 'spirit_stones', amount: 12 },
          {
            kind: 'applyStatus',
            statusId: 'status.longhan.clear_mind',
            months: 3,
            source: '潮眼悟道',
          },
        ],
        purityPerMonth: 0.1,
      },
    ],
  },
]

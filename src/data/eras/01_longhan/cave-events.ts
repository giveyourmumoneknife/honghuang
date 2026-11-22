import type { EventDefinition } from '@/types/content'

export const longhanCaveEvents: EventDefinition[] = [
  {
    id: 'event.longhan.cave_tide_visitor',
    eraId: 'era.longhan',
    kind: 'cave',
    title: '洞府外的候潮人',
    summary: '一个背着旧筐的少年在你洞府外等了三天。他说自己不是来拜师，是来还一样东西。',
    body:
      '少年坐在洞府外的青石上，筐里铺着湿草，草里卧着一只灰扑扑的小雀。雀的翅膀没有伤，却一直不肯飞。\n\n“它在我家门口落了三天。”少年说，“我查过，这种雀只认有潮气的地方。我那里没有潮，所以我想它是在找路。”\n\n他把筐往前推了推，又立刻收回去，像怕你不收，也怕你收得太快。',
    pause: 'ambient',
    repeatable: false,
    dispatch: true,
    weight: 7,
    regionId: 'region.longhan.honghuang_land',
    requirements: [
      {
        kind: 'flag',
        flag: 'longhan.cave.complete',
        value: true,
      },
    ],
    onEnter: [
      {
        kind: 'setFlag',
        flag: 'longhan.cave_tide_visitor_seen',
        value: true,
      },
    ],
    choices: [
      {
        id: 'choice.longhan.cave_tide_visitor.keep',
        text: '留下小雀，替少年在洞府里给它搭一个巢。',
        requirements: [],
        effects: [
          {
            kind: 'grantPet',
            petId: 'pet.longhan.ember_sparrow',
          },
          {
            kind: 'changeRegionState',
            regionId: 'region.longhan.honghuang_land',
            key: 'cave_visitor',
            value: 'sparrow_kept',
          },
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.cave_sparrow',
            text: '小雀进了洞府就自己找到潮气最重的那面墙，在墙缝里卧下。少年看了很久，说原来它真的在找路。',
          },
        ],
        outcome:
          '小雀进洞后自己找到潮气最重的墙缝，卧下就不动了。少年松了很大一口气，说原来它真的在找路。他临走时把筐也留下了，说巢要用旧东西才搭得稳。',
      },
      {
        id: 'choice.longhan.cave_tide_visitor.guide',
        text: '不收雀，带少年去潮线，让他自己把雀放回该去的地方。',
        requirements: [],
        effects: [
          {
            kind: 'changeResource',
            resource: 'merit',
            amount: 2,
          },
          {
            kind: 'changeResource',
            resource: 'spirit_stones',
            amount: 10,
          },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.cave_sparrow',
            text: '有个少年把一只不肯飞的灰雀送到了潮线上。雀飞走前在他肩头停了一下，后来他每年都能在同一个地方捡到一根灰羽。',
          },
        ],
        outcome:
          '潮线刚到的时候，小雀自己从筐里站起来，飞到少年肩头停了一下，然后朝四海方向去了。少年站到潮水退完才走，后来每年都能在同一个地方捡到一根灰羽。',
      },
      {
        id: 'choice.longhan.cave_tide_visitor.ask',
        text: '先问清楚：他为什么不在自己家门口放了它。',
        requirements: [],
        effects: [
          {
            kind: 'addMemory',
            memoryId: 'memory.longhan.cave_sparrow_ask',
            text: '少年说，他家门口没有潮，也没有人会替雀看路。他怕放了它，它会在原地等到死。',
          },
          {
            kind: 'grantItem',
            itemId: 'item.longhan.beast_sinew',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.cave_sparrow_asked',
            value: true,
          },
        ],
        outcome:
          '少年说，他家门口没有潮，也没有人会替雀看路。他怕放了它，它会在原地等到死。你收下雀时，他补了一句：“我也不是来拜师的。我就是想看看，能养潮气的地方长什么样。”',
      },
    ],
    tags: ['cave', 'visitor', 'pet'],
  },
  {
    id: 'event.longhan.cave_vein_guest',
    eraId: 'era.longhan',
    kind: 'cave',
    title: '洞府地下的第二道脉',
    summary: '洞府扩建时挖到一条很细的地脉。青璃来看过，说它不属于麒麟崖。',
    body:
      '新挖开的石壁下有一条细脉，细得只能容下一根手指。脉光很淡，却和麒麟崖的石纹不是同一种颜色。\n\n青璃趴下来听了很久，起身说这条脉是后来才长过来的，可能从很远的地方一路摸到了你的洞府底下。\n\n“它没有恶意。”她说，“但它在这里，说明外面有一条更大的脉改了道。你要留下它，还是把它引开？”',
    pause: 'ambient',
    repeatable: false,
    dispatch: true,
    weight: 7,
    regionId: 'region.longhan.qilin_cliff',
    requirements: [
      {
        kind: 'flag',
        flag: 'longhan.cave.complete',
        value: true,
      },
      {
        kind: 'flag',
        flag: 'longhan.qing_li_marks_seen',
        value: true,
      },
    ],
    onEnter: [
      {
        kind: 'setFlag',
        flag: 'longhan.cave_vein_guest_seen',
        value: true,
      },
    ],
    choices: [
      {
        id: 'choice.longhan.cave_vein_guest.keep',
        text: '留下这条细脉，替它在新石壁上开一条安稳的槽。',
        requirements: [],
        effects: [
          {
            kind: 'grantPet',
            petId: 'pet.longhan.vein_lizard',
          },
          {
            kind: 'changeRegionState',
            regionId: 'region.longhan.honghuang_land',
            key: 'cave_vein',
            value: 'kept',
          },
          {
            kind: 'changeFavorTier',
            partnerId: 'partner.longhan.qing_li',
            delta: 1,
            reason: '留下了洞府地下那条不属于麒麟崖的细脉',
          },
        ],
        outcome:
          '细脉被引进新槽后，石壁里爬出一只听脉蜥。它贴着脉光一动不动，青璃说这说明细脉在你这里找到了愿意听它的东西。',
      },
      {
        id: 'choice.longhan.cave_vein_guest.redirect',
        text: '请青璃把细脉引回地脉主线，不让它留在洞府。',
        requirements: [],
        effects: [
          {
            kind: 'changeFactionState',
            factionId: 'faction.longhan.qilin',
            reputationDelta: 2,
          },
          {
            kind: 'changeRegionState',
            regionId: 'region.longhan.qilin_cliff',
            key: 'cave_vein',
            value: 'returned_to_main',
          },
          {
            kind: 'addRumor',
            rumorId: 'rumor.longhan.cave_vein',
            text: '有人的洞府底下曾长出一条不属于麒麟崖的细脉。守脉人把它引回主线时，崖上的石纹同时亮了一夜。',
          },
        ],
        outcome:
          '青璃引脉时在石壁上画了七道很浅的纹。细脉离开后，洞府地底的潮气反而更稳了。她说脉也该有自己的归处，不是所有能留下的东西都该留。',
      },
      {
        id: 'choice.longhan.cave_vein_guest.follow',
        text: '先把细脉的来处记下来，回头沿它找过去。',
        requirements: [],
        effects: [
          {
            kind: 'grantItem',
            itemId: 'item.longhan.vein_crystal',
          },
          {
            kind: 'setFlag',
            flag: 'longhan.cave_vein_traced',
            value: true,
          },
          {
            kind: 'changeDaoguo',
            amount: 1,
          },
        ],
        outcome:
          '细脉的来处指向麒麟崖更深处。青璃把方位记下，说这段路她也没走过；等你准备好，可以一起去看。',
      },
    ],
    tags: ['cave', 'qilin', 'pet', 'vein'],
  },
]

import type { EraDefinition } from '@/types/content'

export const prologueEra: EraDefinition = {
  id: 'era.prologue',
  order: 1,
  name: '序章 · 潮声之前',
  subtitle: '开天未久，万物初名',
  summary:
    '天地从混沌里分开不久，山川还在生长，海也没有学会按时退去。三族的远影第一次落入水中，而你在潮线之上睁开眼，身上没有名字，只有一段尚未用过的命。',
  startYear: -129600,
  endYear: 0,
  phases: [
    {
      id: 'phase.prologue.wake',
      name: '初醒',
      order: 1,
      summary: '潮线退到很远的地方。你第一次听见自己的呼吸。',
      gateRequirements: [],
    },
    {
      id: 'phase.prologue.walk',
      name: '初行',
      order: 2,
      summary: '你开始为自己挑一个称呼，也第一次看见别的生灵如何活。',
      gateRequirements: [
        {
          kind: 'flag',
          flag: 'prologue.first_name',
          value: true,
        },
      ],
    },
    {
      id: 'phase.prologue.tide',
      name: '潮声将起',
      order: 3,
      summary: '三道远影同时掠过天边。四海正在学会涨落，而三族已经准备为它立约。',
      gateRequirements: [
        {
          kind: 'flag',
          flag: 'prologue.three_lights',
          value: true,
        },
      ],
    },
  ],
  factionRoster: [
    {
      factionId: 'faction.longhan.dragon',
      status: 'active',
      note: '龙族尚在四海深处试写潮路，龙庭还没有名字。',
    },
    {
      factionId: 'faction.longhan.phoenix',
      status: 'active',
      note: '不死火山第一次整夜不熄，凤族围着火种守了整整一轮月。',
    },
    {
      factionId: 'faction.longhan.qilin',
      status: 'active',
      note: '地脉初定，麒麟族沿着仍在生长的山脊一条条记下脉向。',
    },
    {
      factionId: 'faction.longhan.rahu',
      status: 'hidden',
      note: '魔渊尚无名字。偶尔有人在潮声之外听见另一个声音，但它还太轻。',
    },
  ],
  regionIds: ['region.longhan.four_seas', 'region.longhan.honghuang_land'],
  eventIds: [
    'event.prologue.first_breath',
    'event.prologue.first_light',
    'event.prologue.first_name',
    'event.prologue.first_fire',
    'event.prologue.first_wound',
    'event.prologue.three_lights',
    'event.prologue.first_mirror',
    'event.prologue.first_loss',
    'event.prologue.covenant_rumor',
    'event.prologue.tide_call',
  ],
  transition: {
    nextEraId: 'era.longhan',
    modes: ['continue', 'reincarnate', 'stay'],
    summary:
      '序章不在劫数之内。你带着初醒时的名字与旧物走进龙汉，此后每一场潮汐都会记得你曾经无名。',
  },
  settlement: [
    {
      id: 'settlement.prologue.leave',
      label: '走出潮线',
      description: '序章不会被结算为劫末；它只在你身上留下一段无法交还的初名。',
      effects: [
        {
          kind: 'setFlag',
          flag: 'prologue.complete',
          value: true,
        },
        {
          kind: 'addMemory',
          memoryId: 'memory.prologue.leave',
          text: '你走出潮线时，身后的海第一次按着自己的意思涨起。',
        },
      ],
    },
  ],
  tags: ['era', 'prologue', 'origin'],
}

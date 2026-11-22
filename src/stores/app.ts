import { defineStore } from 'pinia'
import { getDataStats } from '@/data'
import { GAME_TITLE, GAME_VERSION } from '@/core/version'

export const useAppStore = defineStore('app', {
  state: () => {
    const stats = getDataStats()

    return {
      title: GAME_TITLE,
      version: GAME_VERSION,
      demoSpec: [
        { label: '事件', value: `${stats.events} 条` },
        { label: '道侣', value: `${stats.partners} 位` },
        { label: '洞府', value: `${stats.caves} 座` },
        { label: '区域', value: `${stats.regions} 处` },
      ],
    }
  },
})

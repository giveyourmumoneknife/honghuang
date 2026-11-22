import { defineStore } from 'pinia'

export type DetailPanelId =
  | 'character'
  | 'idle'
  | 'map'
  | 'era'
  | 'faction'
  | 'partner'
  | 'cave'
  | 'inventory'
  | 'equipment'
  | 'training'
  | 'treasure'
  | 'arts'
  | 'beast'
  | 'combat'
  | 'worldboss'
  | 'dao'
  | 'inbox'
  | 'archive'
  | 'codex'
  | 'settings'
  | 'newgame'

export type ArchiveTab = 'chronicle' | 'rumors' | 'memories'

export const useUiStore = defineStore('ui', {
  state: () => ({
    activePanel: null as DetailPanelId | null,
    archiveTab: 'chronicle' as ArchiveTab,
  }),

  actions: {
    openPanel(panel: DetailPanelId): void {
      this.activePanel = panel
    },

    openArchive(tab: ArchiveTab): void {
      this.archiveTab = tab
      this.activePanel = 'archive'
    },

    closePanel(): void {
      this.activePanel = null
    },
  },
})

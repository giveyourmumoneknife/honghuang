import type { InjectionKey } from 'vue'

/** 每个弹窗自带一条位于滚动区之外的功能栏。 */
export const PANEL_TOOLBAR_KEY: InjectionKey<string> = Symbol('panel-toolbar')

let toolbarSequence = 0

export function nextPanelToolbarId(): string {
  toolbarSequence += 1
  return `panel-toolbar-${toolbarSequence}`
}
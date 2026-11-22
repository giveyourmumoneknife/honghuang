import { readonly, ref, shallowRef } from 'vue'
import type { Directive } from 'vue'

const currentHint = ref('')

export const hintText = readonly(currentHint)
export const hintAnchor = shallowRef<HTMLElement | null>(null)

interface HintState {
  hover: boolean
  focus: boolean
  value: string
}

const states = new WeakMap<Element, HintState>()
const cleanups = new WeakMap<Element, () => void>()
let activeElement: HTMLElement | null = null

function sync(el: HTMLElement): void {
  const state = states.get(el)
  if (state && (state.hover || state.focus) && state.value) {
    activeElement = el
    hintAnchor.value = el
    currentHint.value = state.value
    return
  }
  if (activeElement === el) {
    activeElement = null
    hintAnchor.value = null
    currentHint.value = ''
  }
}

export const vHint: Directive<HTMLElement, string | undefined> = {
  mounted(el, binding) {
    const state: HintState = {
      hover: false,
      focus: false,
      value: (binding.value ?? '').trim(),
    }
    states.set(el, state)
    const enter = () => {
      state.hover = true
      sync(el)
    }
    const leave = () => {
      state.hover = false
      sync(el)
    }
    const focus = () => {
      state.focus = true
      sync(el)
    }
    const blur = () => {
      state.focus = false
      sync(el)
    }
    el.addEventListener('mouseenter', enter)
    el.addEventListener('mouseleave', leave)
    el.addEventListener('focus', focus)
    el.addEventListener('blur', blur)
    cleanups.set(el, () => {
      el.removeEventListener('mouseenter', enter)
      el.removeEventListener('mouseleave', leave)
      el.removeEventListener('focus', focus)
      el.removeEventListener('blur', blur)
      states.delete(el)
      cleanups.delete(el)
      if (activeElement === el) {
        activeElement = null
        hintAnchor.value = null
        currentHint.value = ''
      }
    })
  },
  updated(el, binding) {
    const state = states.get(el)
    if (!state) return
    state.value = (binding.value ?? '').trim()
    if (activeElement === el) sync(el)
  },
  beforeUnmount(el) {
    cleanups.get(el)?.()
  },
}

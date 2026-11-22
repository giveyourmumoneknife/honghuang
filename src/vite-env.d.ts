/// <reference types="vite/client" />

import type { vHint } from '@/ui/hint'

declare module 'vue' {
  interface GlobalDirectives {
    vHint: typeof vHint
  }
}

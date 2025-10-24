import type { RouterManagedTag } from '@tanstack/router-core'

declare module '@tanstack/router-core' {
  interface RouteMatchExtensions {
    meta?: RouterManagedTag[]
  }
}

export {}

interface HomeTab {
  color?: string
  icon: string
  name: string
  path?: string
}

export const homeTabs: HomeTab[] = [
  { icon: 'mdi-email', name: 'notice', path: '/notice' },
  { icon: 'mdi-cog', name: 'setting' },
  { color: 'red', icon: 'mdi-exit-to-app', name: 'exit' }
]

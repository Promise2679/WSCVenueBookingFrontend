interface HomeTab {
  icon: string
  name: string
  path: string | undefined
}

export const homeTabs: HomeTab[] = [
  { icon: 'mdi-email', name: 'notice', path: '/notice' },
  { icon: 'mdi-cog', name: 'setting', path: '/setting' }
]

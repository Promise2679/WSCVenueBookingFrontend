interface HomeTab {
  color: string | undefined
  icon: string
  name: string
  path: string | undefined
}

export const homeTabs: HomeTab[] = [
  { color: undefined, icon: 'mdi-email', name: 'notice', path: '/notice' },
  { color: undefined, icon: 'mdi-cog', name: 'setting', path: '/setting' },
  { color: 'red', icon: 'mdi-exit-to-app', name: 'exit', path: undefined }
]

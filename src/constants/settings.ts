export interface Setting {
  label: string
  path: string
}

export const settings: Setting[] = [
  { label: '我的预约', path: '/reservation' },
  { label: '编辑资料', path: '/edit' },
  { label: '关于我们', path: '/about' }
]

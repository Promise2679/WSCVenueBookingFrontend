interface PermissionOption {
  label: string
  value: number
}

export const permissionOptions: PermissionOption[] = [
  { label: '基本权限', value: 0 },
  { label: '新建场地', value: 1 },
  { label: '访问与申请所有场地', value: 2 },
  { label: '审批所有场地下属申请单', value: 3 },
  { label: '管理所有场地', value: 4 },
  { label: '编辑所有场地', value: 5 },
  { label: '修改用户的场地权限', value: 6 },
  { label: '用户管理', value: 7 },
  { label: '发送系统通知', value: 8 },
  { label: '发送对单用户通知', value: 9 },
  { label: '修改用户权限', value: 62 }
]

export interface VenueDetail {
  icon: string
  label: string
  value: string
}

export const venueDetails = [
  { icon: 'mdi-tag', label: '场地类型', value: 'type' },
  { icon: 'mdi-account-group', label: '容纳人数', value: 'capacity' },
  { icon: 'mdi-map-marker', label: '地点', value: 'room' }
] as const satisfies VenueDetail[]

export const venueTypes = [
  { title: '运动场地', value: 1 },
  { title: '会议室', value: 2 },
  { title: '教室', value: 3 }
]

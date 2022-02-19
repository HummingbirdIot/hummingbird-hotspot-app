import { StackNavigationProp } from '@react-navigation/stack'

export type HotspotStackParamList = {
  HotspotListScreen:
    | undefined
    | { address: string; resource: 'validator' | 'hotspot' }
  HotspotDetailScreen:
    | undefined
    | { address: string; resource: 'validator' | 'hotspot' }
}

export type HotspotNavigationProp = StackNavigationProp<HotspotStackParamList>

export type HotspotSyncStatus = 'full' | 'partial'

export const GLOBAL_OPTS = ['explore', 'search', 'home'] as const
export type GlobalOpt = typeof GLOBAL_OPTS[number]

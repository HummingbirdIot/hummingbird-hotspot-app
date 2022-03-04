import { StackNavigationProp } from '@react-navigation/stack'
import { Hotspot } from '@helium/http'
import { B58Address } from '../../store/txns/txnsTypes'
import { GatewayAction } from './features/featuresNavigationTypes'

export type MainTabType = 'Account' | 'Hotspots' | 'Explorer' | 'Settings'

export type TabBarIconType = {
  focused: boolean
  color: string
  size: number
}

export type LockScreenRequestType =
  | 'disablePin'
  | 'enablePinForPayments'
  | 'disablePinForPayments'
  | 'resetPin'
  | 'unlock'

export type RootStackParamList = {
  MainTabs:
    | undefined
    | { pinVerifiedFor: LockScreenRequestType }
    | { screen: string }
  LockScreen: {
    requestType: LockScreenRequestType
    lock?: boolean
  }
  HotspotSetup: undefined
  HotspotAssert: {
    hotspot: Hotspot
    hotspotAddress: B58Address
    locationName?: string
    coords?: [number, number]
    gain?: number
    elevation?: number
    currentLocation?: string
    gatewayAction: GatewayAction
  }
  HotspotSetWiFi: {
    hotspotAddress: B58Address
    gatewayAction: GatewayAction
  }
  ScanStack: undefined
  ActivityScreen: undefined
  HotspotScreen: {
    address: B58Address
  }
}

export type RootNavigationProp = StackNavigationProp<RootStackParamList>

import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'

export type MainTabParamList = {
  Account: undefined
  Hotspots: undefined
  Explorer: undefined
  Settings: undefined
}

export type MainTabNavigationProp = BottomTabNavigationProp<MainTabParamList>

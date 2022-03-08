import { StackNavigationProp } from '@react-navigation/stack'

export type ScanResultMatcher = (result: string) => boolean

export type LoginStackParamList = {
  Welcome: undefined
  TypeInExplorationCode: undefined
  CreateHeliumAccount: undefined
  ScanQRCode: {
    title?: string
    pattern: RegExp | ScanResultMatcher
    callback: (result: string) => void
  }
}

export type LoginNavigationProp = StackNavigationProp<LoginStackParamList>

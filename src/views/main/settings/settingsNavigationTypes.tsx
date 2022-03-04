import { StackNavigationProp } from '@react-navigation/stack'
import { LockScreenRequestType } from '../../navigation/rootNavigationTypes'

export type SettingsStackParamList = {
  SettingsScreen: undefined | { pinVerifiedFor: LockScreenRequestType }
  AccountCreatePinScreen:
    | { fromImport?: boolean; pinReset?: boolean }
    | undefined
  AccountConfirmPinScreen: {
    pin: string
    fromImport?: boolean
    pinReset?: boolean
  }
}

export type SettingsNavigationProp = StackNavigationProp<SettingsStackParamList>

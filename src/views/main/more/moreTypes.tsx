import { StackNavigationProp } from '@react-navigation/stack'
import { LockScreenRequestType } from '../../navi/naviTypes'

export type MoreStackParamList = {
  MoreScreen: undefined | { pinVerifiedFor: LockScreenRequestType }
  AccountCreatePinScreen:
    | { fromImport?: boolean; pinReset?: boolean }
    | undefined
  AccountConfirmPinScreen: {
    pin: string
    fromImport?: boolean
    pinReset?: boolean
  }
}

export type MoreNavigationProp = StackNavigationProp<MoreStackParamList>

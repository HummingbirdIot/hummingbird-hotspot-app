import { StackNavigationProp } from '@react-navigation/stack'

export type LoginStackParamList = {
  Welcome: undefined
  TypeInExplorationCode: undefined
  CreateHeliumAccount: undefined
}

export type LoginNavigationProp = StackNavigationProp<LoginStackParamList>

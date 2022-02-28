import { StackNavigationProp } from '@react-navigation/stack'

export type OnboardingStackParamList = {
  Welcome: undefined
  TypeInExplorationCode: undefined
  CreateHeliumAccount: undefined
}

export type OnboardingNavigationProp =
  StackNavigationProp<OnboardingStackParamList>

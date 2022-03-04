import * as React from 'react'
import { getFocusedRouteNameFromRoute } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { Platform } from 'react-native'
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import { SettingsStackParamList } from './settingsNavigationTypes'
import DefaultScreenOptions from '../../defaultScreenOptions'
import SettingsScreen from './SettingsScreen'
import AccountCreatePinScreen from './CreatePinScreen'
import AccountConfirmPinScreen from './ConfirmPinScreen'
import { RootStackParamList } from '../../navigation/rootNavigationTypes'

const SettingsStack = createStackNavigator<SettingsStackParamList>()

type Props = BottomTabScreenProps<RootStackParamList>
const SettingsNavigator = ({ navigation, route }: Props) => {
  React.useLayoutEffect(() => {
    const routeName = getFocusedRouteNameFromRoute(route)
    navigation.setOptions({
      tabBarVisible: !routeName || routeName === 'SettingsScreen',
    })
  }, [navigation, route])

  return (
    <SettingsStack.Navigator
      headerMode="none"
      screenOptions={
        Platform.OS === 'android' ? DefaultScreenOptions : undefined
      }
      mode={Platform.OS === 'android' ? 'modal' : undefined}
    >
      <SettingsStack.Screen name="SettingsScreen" component={SettingsScreen} />
      <SettingsStack.Screen
        name="AccountCreatePinScreen"
        component={AccountCreatePinScreen}
      />
      <SettingsStack.Screen
        name="AccountConfirmPinScreen"
        component={AccountConfirmPinScreen}
      />
    </SettingsStack.Navigator>
  )
}

export default SettingsNavigator

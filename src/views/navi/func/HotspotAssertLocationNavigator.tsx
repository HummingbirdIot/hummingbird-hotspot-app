import * as React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { useRoute } from '@react-navigation/native'
import HotspotSetupPickLocationScreen from '../../func/setup/HotspotSetupPickLocationScreen'
import HotspotSetupConfirmLocationScreen from '../../func/setup/HotspotSetupConfirmLocationScreen'
import AntennaSetupScreen from '../../func/others/AntennaSetupScreen'
import HotspotTxnsProgressScreen from '../../func/txns/HotspotTxnsProgressScreen'
import HotspotTxnsSubmitScreen from '../../func/txns/HotspotTxnsSubmitScreen'
import OnboardingErrorScreen from '../../func/error/OnboardingErrorScreen'
import defaultScreenOptions from '../../defaultScreenOptions'

const HotspotAssertStack = createStackNavigator()

const HotspotAssert = () => {
  const { params } = useRoute()
  return (
    <HotspotAssertStack.Navigator
      headerMode="none"
      screenOptions={{ ...defaultScreenOptions }}
    >
      <HotspotAssertStack.Screen
        name="HotspotSetupPickLocationScreen"
        component={HotspotSetupPickLocationScreen}
        initialParams={{
          hotspotType: 'HUMMINGBIRD_H500',
          gatewayAction: 'assertLocation',
          ...params,
        }}
      />
      <HotspotAssertStack.Screen
        name="HotspotSetupConfirmLocationScreen"
        component={HotspotSetupConfirmLocationScreen}
      />
      <HotspotAssertStack.Screen
        name="AntennaSetupScreen"
        component={AntennaSetupScreen}
      />
      <HotspotAssertStack.Screen
        name="HotspotTxnsProgressScreen"
        component={HotspotTxnsProgressScreen}
        options={{ gestureEnabled: false }}
      />
      <HotspotAssertStack.Screen
        name="HotspotTxnsSubmitScreen"
        component={HotspotTxnsSubmitScreen}
      />
      <HotspotAssertStack.Screen
        name="OnboardingErrorScreen"
        component={OnboardingErrorScreen}
      />
    </HotspotAssertStack.Navigator>
  )
}

export default HotspotAssert

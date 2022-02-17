import * as React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import HotspotSetupScanningScreen from './setup/HotspotSetupScanningScreen'
import HotspotSetupPickHotspotScreen from './setup/HotspotSetupPickHotspotScreen'
import defaultScreenOptions from '../../../navigation/defaultScreenOptions'
import HotspotSetupPickLocationScreen from './setup/HotspotSetupPickLocationScreen'
import HotspotTxnsProgressScreen from './setup/HotspotTxnsProgressScreen'
import HotspotSetupConfirmLocationScreen from './setup/HotspotSetupConfirmLocationScreen'
import OnboardingErrorScreen from './setup/OnboardingErrorScreen'
import NotHotspotOwnerError from './setup/NotHotspotOwnerError'
import OwnedHotspotError from './setup/OwnedHotspotError'
import AntennaSetupScreen from './setup/AntennaSetupScreen'
import HotspotTxnsSubmitScreen from './setup/HotspotTxnsSubmitScreen'

const HotspotAssertStack = createStackNavigator()

const HotspotAssert = () => {
  return (
    <HotspotAssertStack.Navigator
      headerMode="none"
      screenOptions={{ ...defaultScreenOptions }}
    >
      <HotspotAssertStack.Screen
        name="HotspotSetupScanningScreen"
        component={HotspotSetupScanningScreen}
        initialParams={{
          hotspotType: 'HUMMINGBIRD_H500',
          gatewayAction: 'assertLocation',
        }}
      />
      <HotspotAssertStack.Screen
        name="HotspotSetupPickHotspotScreen"
        component={HotspotSetupPickHotspotScreen}
      />
      <HotspotAssertStack.Screen
        name="OnboardingErrorScreen"
        component={OnboardingErrorScreen}
      />
      <HotspotAssertStack.Screen
        name="HotspotSetupPickLocationScreen"
        component={HotspotSetupPickLocationScreen}
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
        name="NotHotspotOwnerErrorScreen"
        component={NotHotspotOwnerError}
      />
      <HotspotAssertStack.Screen
        name="OwnedHotspotErrorScreen"
        component={OwnedHotspotError}
      />
      <HotspotAssertStack.Screen
        name="HotspotTxnsSubmitScreen"
        component={HotspotTxnsSubmitScreen}
      />
    </HotspotAssertStack.Navigator>
  )
}

export default HotspotAssert

import * as React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import HotspotSetupSelectionScreen from './setup/HotspotSetupSelectionScreen'
import HotspotSetupEducationScreen from './setup/HotspotSetupEducationScreen'
import HotspotSetupScanningScreen from './setup/HotspotSetupScanningScreen'
import HotspotSetupPickHotspotScreen from './setup/HotspotSetupPickHotspotScreen'
import HotspotSetupWifiScreen from './setup/HotspotSetupWifiScreen'
import defaultScreenOptions from '../../../navigation/defaultScreenOptions'
import HotspotSetupLocationInfoScreen from './setup/HotspotSetupLocationInfoScreen'
import FirmwareUpdateNeededScreen from './setup/FirmwareUpdateNeededScreen'
import HotspotSetupPickLocationScreen from './setup/HotspotSetupPickLocationScreen'
import HotspotTxnsProgressScreen from './setup/HotspotTxnsProgressScreen'
import HotspotSetupWifiConnectingScreen from './setup/HotspotSetupWifiConnectingScreen'
import HotspotSetupConfirmLocationScreen from './setup/HotspotSetupConfirmLocationScreen'
import HotspotSetupPickWifiScreen from './setup/HotspotSetupPickWifiScreen'
import OnboardingErrorScreen from './setup/OnboardingErrorScreen'
import HotspotSetupSkipLocationScreen from './setup/HotspotSetupSkipLocationScreen'
import NotHotspotOwnerError from './setup/NotHotspotOwnerError'
import OwnedHotspotError from './setup/OwnedHotspotError'
import AntennaSetupScreen from './setup/AntennaSetupScreen'
import HotspotSetupExternalScreen from './setup/HotspotSetupExternalScreen'
import HotspotSetupExternalConfirmScreen from './setup/HotspotSetupExternalConfirmScreen'
import HotspotSetupInstructionsScreen from './setup/HotspotSetupInstructionsScreen'
import HotspotTxnsSubmitScreen from './setup/HotspotTxnsSubmitScreen'

const HotspotSetupStack = createStackNavigator()

const HotspotSetup = () => {
  return (
    <HotspotSetupStack.Navigator
      headerMode="none"
      screenOptions={{ ...defaultScreenOptions }}
    >
      <HotspotSetupStack.Screen
        name="HotspotSetupSelectionScreen"
        component={HotspotSetupSelectionScreen}
        initialParams={{
          gatewayAction: 'addGateway',
        }}
      />
      <HotspotSetupStack.Screen
        name="HotspotSetupEducationScreen"
        component={HotspotSetupEducationScreen}
      />
      <HotspotSetupStack.Screen
        name="HotspotSetupExternalScreen"
        component={HotspotSetupExternalScreen}
      />
      <HotspotSetupStack.Screen
        name="HotspotSetupExternalConfirmScreen"
        component={HotspotSetupExternalConfirmScreen}
      />
      <HotspotSetupStack.Screen
        name="HotspotSetupInstructionsScreen"
        component={HotspotSetupInstructionsScreen}
      />
      <HotspotSetupStack.Screen
        name="HotspotSetupScanningScreen"
        component={HotspotSetupScanningScreen}
      />
      <HotspotSetupStack.Screen
        name="HotspotSetupPickHotspotScreen"
        component={HotspotSetupPickHotspotScreen}
      />
      <HotspotSetupStack.Screen
        name="OnboardingErrorScreen"
        component={OnboardingErrorScreen}
      />
      <HotspotSetupStack.Screen
        name="HotspotSetupPickWifiScreen"
        component={HotspotSetupPickWifiScreen}
      />
      <HotspotSetupStack.Screen
        name="HotspotSetupWifiScreen"
        component={HotspotSetupWifiScreen}
      />
      <HotspotSetupStack.Screen
        name="HotspotSetupWifiConnectingScreen"
        component={HotspotSetupWifiConnectingScreen}
      />
      <HotspotSetupStack.Screen
        name="FirmwareUpdateNeededScreen"
        component={FirmwareUpdateNeededScreen}
      />
      <HotspotSetupStack.Screen
        name="HotspotSetupLocationInfoScreen"
        component={HotspotSetupLocationInfoScreen}
      />
      <HotspotSetupStack.Screen
        name="HotspotSetupPickLocationScreen"
        component={HotspotSetupPickLocationScreen}
      />
      <HotspotSetupStack.Screen
        name="HotspotSetupConfirmLocationScreen"
        component={HotspotSetupConfirmLocationScreen}
      />
      <HotspotSetupStack.Screen
        name="AntennaSetupScreen"
        component={AntennaSetupScreen}
      />
      <HotspotSetupStack.Screen
        name="HotspotSetupSkipLocationScreen"
        component={HotspotSetupSkipLocationScreen}
      />
      <HotspotSetupStack.Screen
        name="HotspotTxnsProgressScreen"
        component={HotspotTxnsProgressScreen}
        options={{ gestureEnabled: false }}
      />
      <HotspotSetupStack.Screen
        name="NotHotspotOwnerErrorScreen"
        component={NotHotspotOwnerError}
      />
      <HotspotSetupStack.Screen
        name="OwnedHotspotErrorScreen"
        component={OwnedHotspotError}
      />
      <HotspotSetupStack.Screen
        name="HotspotTxnsSubmitScreen"
        component={HotspotTxnsSubmitScreen}
      />
    </HotspotSetupStack.Navigator>
  )
}

export default HotspotSetup

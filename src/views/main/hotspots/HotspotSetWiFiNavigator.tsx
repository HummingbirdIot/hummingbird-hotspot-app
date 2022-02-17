import * as React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import HotspotSetupScanningScreen from './setup/HotspotSetupScanningScreen'
import HotspotSetupPickHotspotScreen from './setup/HotspotSetupPickHotspotScreen'
import HotspotSetupWifiScreen from './setup/HotspotSetupWifiScreen'
import defaultScreenOptions from '../../../navigation/defaultScreenOptions'
import HotspotSetupWifiConnectingScreen from './setup/HotspotSetupWifiConnectingScreen'
import HotspotSetupPickWifiScreen from './setup/HotspotSetupPickWifiScreen'

const HotspotSetupStack = createStackNavigator()

const HotspotAssert = () => {
  return (
    <HotspotSetupStack.Navigator
      headerMode="none"
      screenOptions={{ ...defaultScreenOptions }}
    >
      <HotspotSetupStack.Screen
        name="HotspotSetupScanningScreen"
        component={HotspotSetupScanningScreen}
        initialParams={{
          hotspotType: 'HUMMINGBIRD_H500',
          gatewayAction: 'setWiFi',
        }}
      />
      <HotspotSetupStack.Screen
        name="HotspotSetupPickHotspotScreen"
        component={HotspotSetupPickHotspotScreen}
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
    </HotspotSetupStack.Navigator>
  )
}

export default HotspotAssert

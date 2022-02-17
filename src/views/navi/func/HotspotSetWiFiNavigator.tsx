import * as React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import HotspotSetupScanningScreen from '../../func/setup/HotspotSetupScanningScreen'
import HotspotSetupPickHotspotScreen from '../../func/setup/HotspotSetupPickHotspotScreen'
import HotspotSetupWifiScreen from '../../func/setup/HotspotSetupWifiScreen'
import defaultScreenOptions from '../../defaultScreenOptions'
import HotspotSetupWifiConnectingScreen from '../../func/setup/HotspotSetupWifiConnectingScreen'
import HotspotSetupPickWifiScreen from '../../func/setup/HotspotSetupPickWifiScreen'

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

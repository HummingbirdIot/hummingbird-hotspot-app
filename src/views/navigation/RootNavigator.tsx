import React, { useEffect, useMemo } from 'react'
import { Platform } from 'react-native'
import { createStackNavigator } from '@react-navigation/stack'

import { useSelector } from 'react-redux'

import changeNavigationBarColor from 'react-native-navigation-bar-color'
import { RootState } from '../../store/rootReducer'
import defaultScreenOptions from '../defaultScreenOptions'
import { useColors } from '../../theme/themeHooks'
import MainTabs from './main/MainTabs'
import HotspotAssertLocationNavigator from './features/HotspotAssertNavigator'
import HotspotSetupNavigator from './features/HotspotSetupNavigator'
import HotspotSetWiFiNavigator from './features/HotspotSetWiFiNavigator'
import WelcomeScreen from '../more/login/WelcomeScreen'
import CreateHeliumAccountScreen from '../more/login/CreateHeliumAccountScreen'
import SingInAsAWatcherScreen from '../more/login/SingInAsAWatcherScreen'
import { LoginStackParamList } from './loginNavigationTypes'
import ActivityScreen from '../main/account/ActivityScreen'
import LockScreen from '../more/LockScreen'
import HotspotScreen from '../main/hotspots/HotspotScreen'
import Box from '../../components/boxes/Box'
import ScanQRCodeScreen from '../more/ScanQRCodeScreen'

const LoginStack = createStackNavigator<LoginStackParamList>()
const RootStack = createStackNavigator()
// const RootStack = createNativeStackNavigator()

const RootNavigator = () => {
  const { isWatcher, walletLinkToken, accountAddress } = useSelector(
    (state: RootState) => state.app.user,
  )
  const colors = useColors()
  // const { surfaceContrast, white } = colors

  useEffect(() => {
    changeNavigationBarColor(colors.primaryBackground, true, false)
  }, [colors.primaryBackground])

  const root = useMemo(
    () => (
      <RootStack.Navigator
        // headerMode="none"
        screenOptions={({ route }) => {
          if (route.name === 'LockScreen')
            // 锁频模式下，禁用掉手势
            return { ...defaultScreenOptions, gestureEnabled: false }

          if (Platform.OS === 'android') return defaultScreenOptions
          return {}
        }}
      >
        <RootStack.Screen
          name="MainTabs"
          options={{ headerShown: false }}
          component={MainTabs}
        />

        <RootStack.Group screenOptions={{ headerShown: false }}>
          <RootStack.Screen
            name="HotspotSetup"
            component={HotspotSetupNavigator}
          />
          <RootStack.Screen
            name="HotspotAssert"
            component={HotspotAssertLocationNavigator}
          />
          <RootStack.Screen
            name="HotspotSetWiFi"
            component={HotspotSetWiFiNavigator}
          />
          <RootStack.Screen
            name="AddWatchingAccount"
            component={SingInAsAWatcherScreen}
          />
          <RootStack.Screen name="ScanQRCode" component={ScanQRCodeScreen} />
        </RootStack.Group>
        <RootStack.Group screenOptions={{ headerShown: false }}>
          <RootStack.Screen name="ActivityScreen" component={ActivityScreen} />
          <RootStack.Screen name="HotspotScreen" component={HotspotScreen} />
          <RootStack.Screen name="LockScreen" component={LockScreen} />
        </RootStack.Group>
      </RootStack.Navigator>
    ),
    [],
  )

  const sign = useMemo(
    () => (
      <LoginStack.Navigator
        headerMode="none"
        screenOptions={defaultScreenOptions}
        options={{ gestureEnabled: false }}
      >
        <LoginStack.Screen name="Welcome" component={WelcomeScreen} />
        <LoginStack.Screen
          name="TypeInExplorationCode"
          component={SingInAsAWatcherScreen}
        />
        <LoginStack.Screen
          name="CreateHeliumAccount"
          component={CreateHeliumAccountScreen}
        />
      </LoginStack.Navigator>
    ),
    [],
  )

  return (
    <Box flex={1} backgroundColor="primaryBackground">
      {(isWatcher || walletLinkToken) && accountAddress ? root : sign}
    </Box>
  )
}
export default RootNavigator

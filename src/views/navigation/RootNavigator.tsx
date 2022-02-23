import React, { useEffect } from 'react'
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
import WelcomeScreen from '../link/WelcomeScreen'
import CreateAccountScreen from '../link/CreateAccountScreen'
import { OnboardingStackParamList } from '../link/onboardingTypes'
import ActivityScreen from '../main/overview/ActivityScreen'
import LockScreen from '../lock/LockScreen'
import HotspotScreen from '../main/hotspots/HotspotScreen'

const OnboardingStack = createStackNavigator<OnboardingStackParamList>()
const MainStack = createStackNavigator()
// const MainStack = createNativeStackNavigator()

const RootNavigator = () => {
  const { walletLinkToken } = useSelector((state: RootState) => state.app)
  const colors = useColors()
  // const { surfaceContrast, white } = colors

  useEffect(() => {
    changeNavigationBarColor(colors.primaryBackground, true, false)
  }, [colors.primaryBackground])

  if (!walletLinkToken) {
    return (
      <OnboardingStack.Navigator
        headerMode="none"
        screenOptions={defaultScreenOptions}
        options={{ gestureEnabled: false }}
      >
        <OnboardingStack.Screen name="Welcome" component={WelcomeScreen} />
        <OnboardingStack.Screen
          name="CreateAccount"
          component={CreateAccountScreen}
        />
      </OnboardingStack.Navigator>
    )
  }

  return (
    <MainStack.Navigator
      // headerMode="none"
      screenOptions={({ route }) => {
        if (route.name === 'LockScreen')
          // 锁频模式下，禁用掉手势
          return { ...defaultScreenOptions, gestureEnabled: false }

        if (Platform.OS === 'android') return defaultScreenOptions
        return {}
      }}
    >
      <MainStack.Screen
        name="MainTabs"
        options={{ headerShown: false }}
        component={MainTabs}
      />

      <MainStack.Group screenOptions={{ headerShown: false }}>
        <MainStack.Screen
          name="HotspotSetup"
          component={HotspotSetupNavigator}
        />
        <MainStack.Screen
          name="HotspotAssert"
          component={HotspotAssertLocationNavigator}
        />
        <MainStack.Screen
          name="HotspotSetWiFi"
          component={HotspotSetWiFiNavigator}
        />
      </MainStack.Group>
      <MainStack.Group screenOptions={{ headerShown: false }}>
        <MainStack.Screen name="ActvityScreen" component={ActivityScreen} />
        <MainStack.Screen name="HotspotScreen" component={HotspotScreen} />
        <MainStack.Screen name="LockScreen" component={LockScreen} />
      </MainStack.Group>
    </MainStack.Navigator>
  )
}

export default RootNavigator

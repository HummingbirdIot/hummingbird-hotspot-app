import React, { useEffect } from 'react'
import { Platform, Text, View } from 'react-native'
import { createStackNavigator } from '@react-navigation/stack'

import { useSelector } from 'react-redux'

import changeNavigationBarColor from 'react-native-navigation-bar-color'
import { RootState } from '../../store/rootReducer'
import defaultScreenOptions from '../defaultScreenOptions'
import { useColors } from '../../theme/themeHooks'
import MainTabs from './tabs/MainTabs'
import HotspotAssertLocationNavigator from './func/HotspotAssertNavigator'
import HotspotSetupNavigator from './func/HotspotSetupNavigator'
import HotspotSetWiFiNavigator from './func/HotspotSetWiFiNavigator'
import WelcomeScreen from '../link/WelcomeScreen'
import CreateAccountScreen from '../link/CreateAccountScreen'
import { OnboardingStackParamList } from '../link/onboardingTypes'

const OnboardingStack = createStackNavigator<OnboardingStackParamList>()
const MainStack = createStackNavigator()
// const MainStack = createNativeStackNavigator()

const DetailsScreen = () => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <Text>Details Screen</Text>
  </View>
)

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
      <MainStack.Group>
        <MainStack.Screen
          name="HotspotSetup"
          options={{ headerShown: false }}
          component={HotspotSetupNavigator}
        />
        <MainStack.Screen
          name="HotspotAssert"
          options={{ headerShown: false }}
          component={HotspotAssertLocationNavigator}
        />
        <MainStack.Screen
          name="HotspotSetWiFi"
          options={{ headerShown: false }}
          component={HotspotSetWiFiNavigator}
        />
      </MainStack.Group>
      <MainStack.Screen name="LockScreen" component={DetailsScreen} />
    </MainStack.Navigator>
  )
}

export default RootNavigator

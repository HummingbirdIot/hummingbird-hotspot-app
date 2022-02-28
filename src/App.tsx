/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useMemo } from 'react'
// import { Platform } from 'react-native'
import { LogBox, Platform, StatusBar, UIManager } from 'react-native'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { ColorSchemeName, useColorScheme } from 'react-native-appearance'
import { ThemeProvider } from '@shopify/restyle'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {
  ThemeProvider as ElementsThemeProvider,
  // Button,
  // colors,
} from 'react-native-elements'
// import { NavigationContainer } from '@react-navigation/native'
import MapboxGL from '@react-native-mapbox-gl/maps'
import Config from 'react-native-config'
import useAppState from 'react-native-appstate-hook'
import {
  HotspotBleProvider,
  OnboardingProvider,
} from '@helium/react-native-sdk'
import * as SplashScreen from 'expo-splash-screen'
import { useSelector } from 'react-redux'
import { useAsync } from 'react-async-hook'
import { NavigationContainer } from '@react-navigation/native'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { theme, darkThemeColors, lightThemeColors } from './theme/theme'
import SecurityScreen from './views/splash/SecurityScreen'
import { useAppDispatch } from './store/store'
import { RootState } from './store/rootReducer'
import appSlice, { restoreAppSettings } from './store/app/appSlice'
import useMount from './utils/hooks/useMount'
import { fetchInitialData } from './store/helium/heliumSlice'
import { navigationRef } from './views/navigation/navigator'
import RootNavigator from './views/navigation/RootNavigator'
import { useElementsTheme } from './theme/themeHooks'
import AppLinkProvider from './providers/AppLinkProvider'
import { configChainVars } from './utils/clients/appDataClient'

SplashScreen.preventAutoHideAsync().catch(() => {
  /* reloading the app might trigger some race conditions, ignore them */
})

const appConfig = () => {
  // 设置安卓动画增强优化特性
  if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true)
    }
  }

  // 设置应忽略的警报信息
  // LogBox.ignoreAllLogs(true) // Ignore all log notifications
  LogBox.ignoreLogs([
    "Accessing the 'state' property of the 'route' object is not supported.",
    'Setting a timer',
    'Calling getNode() on the ref of an Animated component',
    'Native splash screen is already hidden',
    'No Native splash screen',
    'RCTBridge required dispatch_sync to load',
    'Require cycle',
    'new NativeEventEmitter',
    'EventEmitter.removeListener(',
    'expo-permissions is now',
    "Can't perform a React state update on an unmounted component.",
    'Sending `onAnimatedValueUpdate` with no listeners registered.',
    'Possible Unhandled Promise Rejection',
  ]) // Ignore log notification by message
}

const App = () => {
  // 获取当前系统主题信息
  const colorScheme: ColorSchemeName = useColorScheme()
  // console.log('App::ColorSchemeName:', colorScheme)

  appConfig()

  const { appState } = useAppState()
  const dispatch = useAppDispatch()

  const {
    lastIdle,
    isPinRequired,
    authInterval,
    isRestored,
    isBackedUp,
    isRequestingPermission,
    isLocked,
  } = useSelector((state: RootState) => state.app)

  useMount(() => {
    dispatch(restoreAppSettings())
  })

  // 获取和更新初始信息
  useEffect(() => {
    if (!isBackedUp) return

    dispatch(fetchInitialData())
    configChainVars() // 当前版本SDK没有对应的接口
  })

  useEffect(() => {
    // console.log('App::Config:', Config)
    MapboxGL.setAccessToken(Config.MAPBOX_ACCESS_TOKEN)
  }, [dispatch])

  // 处理应用状态信息
  useEffect(() => {
    if (appState === 'background' && !isLocked) {
      dispatch(appSlice.actions.updateLastIdle())
      return
    }

    const isActive = appState === 'active'
    const now = Date.now()
    const expiration = now - authInterval
    const lastIdleExpired = lastIdle && expiration > lastIdle

    // pin is required and last idle is past user interval, lock the screen
    const shouldLock =
      isActive && isPinRequired && !isRequestingPermission && lastIdleExpired

    if (shouldLock) {
      dispatch(appSlice.actions.lock(true))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appState])

  // 启动界面状态管理
  useAsync(async () => {
    if (isRestored) {
      await SplashScreen.hideAsync()
    }
  }, [isRestored])

  useEffect(() => {
    // Hide splash after 5 seconds, deal with the consequences?
    const timeout = setTimeout(() => {
      SplashScreen.hideAsync()
    }, 5000)
    return () => clearInterval(timeout)
  }, [dispatch])

  const colorAdaptedTheme = useMemo(
    () => ({
      ...theme,
      colors: colorScheme === 'light' ? lightThemeColors : darkThemeColors,
      // colors: lightThemeColors,
    }),
    // [],
    [colorScheme],
  )

  const elementsTheme = useElementsTheme()

  return (
    <OnboardingProvider baseUrl="https://onboarding.dewi.org/api/v2">
      <HotspotBleProvider>
        <ThemeProvider theme={colorAdaptedTheme}>
          <ElementsThemeProvider theme={elementsTheme}>
            <BottomSheetModalProvider>
              <SafeAreaProvider>
                {/* TODO: Will need to adapt status bar for light/dark modes */}
                {Platform.OS === 'ios' && (
                  <StatusBar barStyle="light-content" />
                )}
                {Platform.OS === 'android' && (
                  <StatusBar translucent backgroundColor="transparent" />
                )}
                <NavigationContainer ref={navigationRef}>
                  <AppLinkProvider>
                    <RootNavigator />
                  </AppLinkProvider>
                </NavigationContainer>
              </SafeAreaProvider>
            </BottomSheetModalProvider>

            <SecurityScreen
              visible={appState !== 'active' && appState !== 'unknown'}
            />
          </ElementsThemeProvider>
        </ThemeProvider>
      </HotspotBleProvider>
    </OnboardingProvider>
  )
}

export default App

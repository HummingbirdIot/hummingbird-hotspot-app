import React, { useEffect, memo, useMemo, useCallback } from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useNavigation } from '@react-navigation/native'
import { useSelector } from 'react-redux'
import { ColorSchemeName, useColorScheme } from 'react-native-appearance'
import { TabBarIconType, MainTabType, RootNavigationProp } from '../naviTypes'
import TabBarIcon from './TabBarIcon'
import { RootState } from '../../../store/rootReducer'
import { useColors } from '../../../theme/themeHooks'
import { useAppDispatch } from '../../../store/store'
import { wp } from '../../../utils/layout'
import appSlice from '../../../store/app/appSlice'

import OverviewScreen from '../../main/overview/OverviewScreen'
import HotspotsScreen from '../../main/hotspots/HotspotsScreen'
// import ExplorerScreen from '../../main/explorer/ExplorerScreen'
import MoreNavigator from '../../main/settings/MoreNavigator'

const MainTab = createBottomTabNavigator()

const MainTabs = () => {
  const { primaryBackground, secondaryBackground, surface } = useColors()
  const navigation = useNavigation<RootNavigationProp>()
  const {
    app: { isLocked, isSettingUpHotspot },
  } = useSelector((state: RootState) => state)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!isLocked) return
    navigation.navigate('LockScreen', { requestType: 'unlock', lock: true })
  }, [isLocked, navigation])

  useEffect(() => {
    if (!isSettingUpHotspot) return

    dispatch(appSlice.actions.startHotspotSetup())
    navigation.navigate('HotspotSetup')
  }, [isSettingUpHotspot, dispatch, navigation])

  const sceneContainerStyle = useMemo(
    () => ({
      opacity: isLocked ? 0 : 1,
    }),
    [isLocked],
  )

  // console.log('surfaceContrast', surfaceContrast)
  const colorScheme: ColorSchemeName = useColorScheme()

  const tabBarOptions = useMemo(
    () => ({
      showLabel: false,
      style: {
        backgroundColor: colorScheme === 'light' ? primaryBackground : surface,
        borderTopColor: secondaryBackground,
        paddingHorizontal: wp(12),
      },
    }),
    [colorScheme, primaryBackground, secondaryBackground, surface],
  )

  const screenOptions = useCallback(
    ({ route }) => ({
      tabBarIcon: ({ focused, color, size }: TabBarIconType) => {
        return (
          <TabBarIcon
            name={route.name as MainTabType}
            focused={focused}
            color={color}
            size={Math.min(size, 22)}
          />
        )
      },
    }),
    [],
  )

  return (
    <MainTab.Navigator
      sceneContainerStyle={sceneContainerStyle}
      initialRouteName="Overview"
      tabBarOptions={tabBarOptions}
      screenOptions={screenOptions}
    >
      <MainTab.Screen name="Overview" component={OverviewScreen} />
      <MainTab.Screen name="Hotspots" component={HotspotsScreen} />
      {/* <MainTab.Screen name="Explorer" component={ExplorerScreen} /> */}
      <MainTab.Screen name="More" component={MoreNavigator} />
    </MainTab.Navigator>
  )
}

export default memo(MainTabs)

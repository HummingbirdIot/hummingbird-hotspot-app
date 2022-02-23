import * as React from 'react'
import { getFocusedRouteNameFromRoute } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { Platform } from 'react-native'
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
// import { HotspotStackParamList } from './hotspotTypes'
import DefaultScreenOptions from '../../defaultScreenOptions'
import { RootStackParamList } from '../../navigation/naviTypes'
import HotspotDetailScreen from '../hotspots/HotspotScreen'
import HotspotListScreen from '../hotspots/HotspotsScreen'

const HotspotStack = createStackNavigator()

type Props = BottomTabScreenProps<RootStackParamList>
const More = ({ navigation, route }: Props) => {
  React.useLayoutEffect(() => {
    const routeName = getFocusedRouteNameFromRoute(route)
    navigation.setOptions({
      tabBarVisible: !routeName || routeName === 'HotspotListScreen',
    })
  }, [navigation, route])

  return (
    <HotspotStack.Navigator
      headerMode="none"
      screenOptions={
        Platform.OS === 'android' ? DefaultScreenOptions : undefined
      }
      mode={Platform.OS === 'android' ? 'modal' : undefined}
    >
      <HotspotStack.Screen
        name="HotspotListScreen"
        component={HotspotListScreen}
      />
      <HotspotStack.Screen
        name="HotspotDetailScreen"
        component={HotspotDetailScreen}
      />
    </HotspotStack.Navigator>
  )
}

export default More

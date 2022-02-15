import React, { memo } from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import HotspotsListScreen from './HotspotsListScreen'
import HotspotDetailScreen from './HotspotDetailScreen'
import { useColors } from '../../../theme/themeHooks'

const Stack = createNativeStackNavigator()

const HotspotsScreen = () => {
  const { surfaceContrast, white } = useColors()
  return (
    <Stack.Navigator
      initialRouteName="HotspotsListScreen"
      screenOptions={{
        headerTitleStyle: {
          color: white,
        },
        headerStyle: {
          backgroundColor: surfaceContrast,
        },
      }}
    >
      <Stack.Screen
        name="HotspotsListScreen"
        options={{ headerShown: false }}
        component={HotspotsListScreen}
      />
      <Stack.Screen
        name="HotspotDetailScreen"
        options={{ headerShown: true }}
        component={HotspotDetailScreen}
      />
    </Stack.Navigator>
  )
}

export default memo(HotspotsScreen)

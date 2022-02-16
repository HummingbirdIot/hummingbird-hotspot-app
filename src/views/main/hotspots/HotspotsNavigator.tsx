import React, { memo } from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Text, View } from 'react-native'
// import HotspotDetailScreen from './HotspotDetailScreen'
import { useColors } from '../../../theme/themeHooks'
import HotspotDetailScreen from './HotspotDetailScreen'

const Stack = createNativeStackNavigator()

console.log('Stack', Stack)

const HomeScreen = () => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <Text>Home Screen</Text>
  </View>
)

const HotspotsNavigator = () => {
  const { surfaceContrast, white } = useColors()
  return (
    <Stack.Navigator
      initialRouteName="HotspotDetail"
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
        name="HotspotDetail"
        options={{ headerShown: true }}
        component={HotspotDetailScreen}
      />
      <Stack.Screen
        name="HotspotSetup"
        options={{ headerShown: false }}
        component={HomeScreen}
      />
      <Stack.Screen
        name="HotspotAssert"
        options={{ headerShown: false }}
        component={HomeScreen}
      />
    </Stack.Navigator>
  )
}

export default memo(HotspotsNavigator)

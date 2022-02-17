import React, { memo } from 'react'
import { Text, View } from 'react-native'

const OverviewScreen = () => {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Overview Screen</Text>
    </View>
  )
}

export default memo(OverviewScreen)

import React, { memo } from 'react'
import { Text, View } from 'react-native'

const MoreScreen = () => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <Text>More Screen</Text>
  </View>
)

export default memo(MoreScreen)

import React, { memo } from 'react'
import { ScrollView } from 'react-native'
import Box from '../../components/Box'
import RewardsStatistics from '../main/RewardsStatistics'
import { B58Address } from '../../store/txns/txnsTypes'

const HotspotStatistics = ({ address }: { address: B58Address }) => (
  <ScrollView
    style={{
      height: '100%',
      paddingLeft: 10,
      paddingRight: 10,
    }}
  >
    <Box
      width="100%"
      minHeight={300}
      backgroundColor="grayBoxLight"
      borderRadius="l"
    >
      <RewardsStatistics address={address} resource="hotspots" />
    </Box>
  </ScrollView>
)

export default memo(HotspotStatistics)

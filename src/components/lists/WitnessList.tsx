import React, { memo } from 'react'
import { ScrollView } from 'react-native'
import { Witness } from '@helium/http'
import Box from '../boxes/Box'
import Text from '../texts/Text'
import { formatHotspotName } from '../../utils/formatter'

const WitnessList = ({ witnessed }: { witnessed: Witness[] }) => {
  return (
    <ScrollView
      style={{
        height: '100%',
      }}
    >
      <Box
        style={{
          backgroundColor: '#f6f6f6',
          paddingVertical: 20,
          borderRadius: 5,
        }}
      >
        {witnessed.map((witness) => (
          <Box key={witness.address}>
            <Text textAlign="center" color="gray">
              {formatHotspotName(witness.name || 'unknow-hotspot-name')}
            </Text>
            <Text textAlign="center" color="gray">
              Location: {witness.geocode?.longStreet},{' '}
              {witness.geocode?.longCity}, {witness.geocode?.shortCountry}
            </Text>
            <Text textAlign="center" color="gray">
              RewardScale: {witness.rewardScale}
            </Text>
            <Text textAlign="center" color="gray">
              --------------------------------------
            </Text>
          </Box>
        ))}
      </Box>
    </ScrollView>
  )
}

export default memo(WitnessList)

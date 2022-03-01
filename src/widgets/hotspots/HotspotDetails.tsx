import React, { memo, useMemo, useState } from 'react'
import { ScrollView } from 'react-native'
import { ButtonGroup } from 'react-native-elements'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Hotspot, Witness } from '@helium/http'
import Box from '../../components/Box'
import Text from '../../components/Text'
import ActivitiesList from '../main/ActivitiesList/ListContainer'
import RewardsStatistics from '../main/RewardsStatistics'
import { formatHotspotName } from '../../utils/formatter'

const HotspotDetails = ({
  hotspot,
  witnessed,
}: {
  hotspot: Hotspot
  witnessed: Witness[]
}) => {
  const insets = useSafeAreaInsets()
  const [selectedIndex, updateIndex] = useState(0)

  const buttons = ['Statistics', 'Activity', 'Witnessed']
  const Statistics = useMemo(
    () => (
      <ScrollView
        style={{
          flex: 1,
          paddingLeft: 10,
          paddingRight: 10,
        }}
      >
        <Box
          width="100%"
          minHeight={260}
          backgroundColor="grayBoxLight"
          borderRadius="l"
        >
          <RewardsStatistics address={hotspot.address} resource="hotspots" />
        </Box>
      </ScrollView>
    ),
    [hotspot],
  )
  const Activity = useMemo(
    () =>
      hotspot ? (
        <ActivitiesList
          address={hotspot.address}
          addressType="hotspot"
          lng={hotspot.lng || 0}
          lat={hotspot.lat || 0}
        />
      ) : null,
    [hotspot],
  )
  const Witnessed = useMemo(
    () =>
      witnessed && witnessed.length ? (
        <ScrollView
          style={{
            flex: 1,
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
      ) : (
        <Box
          style={{
            backgroundColor: '#f6f6f6',
            paddingVertical: 20,
            borderRadius: 5,
          }}
        >
          <Text textAlign="center" color="gray">
            Empty
          </Text>
        </Box>
      ),
    [witnessed],
  )
  const widgets = [Statistics, Activity, Witnessed]

  return (
    <>
      <ButtonGroup
        onPress={updateIndex}
        selectedIndex={selectedIndex}
        buttons={buttons}
        containerStyle={{ height: 36 }}
      />
      <Box
        flex={1}
        style={{
          paddingTop: 5,
          paddingBottom: insets.bottom,
        }}
      >
        {widgets[selectedIndex] || null}
      </Box>
    </>
  )
}

export default memo(HotspotDetails)

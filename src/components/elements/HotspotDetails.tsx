import React, { memo, useMemo, useState } from 'react'
import { ButtonGroup } from 'react-native-elements'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Hotspot, Witness } from '@helium/http'
import Box from '../boxes/Box'
import ActivitiesList from '../lists/ActivityList/ListContainer'
import WitnessList from '../lists/WitnessList'
import useListWidgets from '../../utils/hooks/useListWidgets'
import HotspotStatistics from './HotspotStatistics'

const HotspotDetails = ({
  hotspot,
  witnessed,
}: {
  hotspot: Hotspot
  witnessed: Witness[]
}) => {
  const insets = useSafeAreaInsets()
  const [selectedIndex, updateIndex] = useState(0)
  const { Empty } = useListWidgets()

  const buttons = ['Statistics', 'Activity', 'Witnessed']
  const Statistics = useMemo(
    () => <HotspotStatistics address={hotspot.address} />,
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
        <WitnessList witnessed={witnessed} />
      ) : (
        <Empty />
      ),
    [Empty, witnessed],
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

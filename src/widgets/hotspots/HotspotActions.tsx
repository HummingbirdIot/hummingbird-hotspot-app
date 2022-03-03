import React, { memo } from 'react'
import { Hotspot } from '@helium/http'
import BottomActionsModal from '../modals/BottomActionsModal'
import useActions from '../../utils/hooks/useActions'
import useListWidgets from '../../utils/hooks/useListWidgets'

const HotspotActions = ({
  hotspot,
  locationName,
  isVisible,
  setIsVisible,
}: {
  hotspot: Hotspot
  locationName: string
  isVisible: boolean
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  const { assertLocation, assertAntenna, setWiFi } = useActions({
    hotspot,
    locationName,
    setIsVisible,
  })
  const { ActivityIndicator } = useListWidgets()

  const data = [
    {
      label: 'Assert Location And Antenna',
      action: assertLocation,
    },
    {
      label: 'Assert Antenna',
      action: assertAntenna,
    },
    {
      label: 'Update WiFi',
      action: setWiFi,
    },
  ]
  return hotspot ? (
    <BottomActionsModal
      title="Actions"
      data={data}
      modalVisible={isVisible}
      handleClose={() => setIsVisible(false)}
      maxModalHeight={0}
    />
  ) : (
    <ActivityIndicator />
  )
}

export default memo(HotspotActions)

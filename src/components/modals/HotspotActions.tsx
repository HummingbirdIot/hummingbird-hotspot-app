import React, { memo, useMemo } from 'react'
import { Hotspot } from '@helium/http'
import { useSelector } from 'react-redux'
import BottomActionsModal from './BottomActionsModal'
import useActions from '../../utils/hooks/useActions'
import useListWidgets from '../../utils/hooks/useListWidgets'
import { RootState } from '../../store/rootReducer'

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
  const { isWatcher } = useSelector((state: RootState) => state.app.user)
  const { ActivityIndicator } = useListWidgets()

  const data = useMemo(() => {
    const list = [
      {
        label: 'Assert Location And Antenna',
        action: assertLocation,
      },
      {
        label: 'Assert Antenna',
        action: assertAntenna,
      },
    ]
    if (!isWatcher) {
      list.push({
        label: 'Update WiFi',
        action: setWiFi,
      })
    }
    return list
  }, [assertAntenna, assertLocation, isWatcher, setWiFi])

  return hotspot ? (
    <BottomActionsModal
      title="Hotspot Actions"
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

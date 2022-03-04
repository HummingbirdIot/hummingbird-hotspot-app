import React, { memo, useEffect, useState } from 'react'
import { Text } from 'react-native'
import { useSelector } from 'react-redux'
import { useAsync } from 'react-async-hook'
import { Hotspot, Witness } from '@helium/http'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import Box from '../../../components/boxes/Box'
import { getLocationPermission } from '../../../store/app/locationSlice'
import { RootState } from '../../../store/rootReducer'
import { useAppDispatch } from '../../../store/store'
import HotspotLocationView from '../../../components/locations/HotspotLocationView'
import { fetchHotspotDetail } from '../../../store/data/hotspotsSlice'
import { reverseGeocode } from '../../../utils/location'
import { formatHotspotNameArray } from '../../../utils/formatter'
import {
  RootNavigationProp,
  RootStackParamList,
} from '../../navigation/rootNavigationTypes'
import DetailViewContainer from '../../../components/containers/DetailScreenContainer'
import useActions from '../../../utils/hooks/useActions'
import HotspotActions from '../../../components/modals/HotspotActions'
import HotspotCard from '../../../components/cards/HotspotCard'
import HotspotDetails from '../../../components/elements/HotspotDetails'

type Route = RouteProp<RootStackParamList, 'HotspotScreen'>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const HotspotDetailScreen = () => {
  const navigation = useNavigation<RootNavigationProp>()
  const { address } = useRoute<Route>().params
  const [witnessedData, setWitnessedData] = useState<Witness[]>([])
  const dispatch = useAppDispatch()
  const { hotspotsData } = useSelector((state: RootState) => state.hotspots)
  const [hotspotData, setHotspotData] = useState<Hotspot>(
    hotspotsData[address]?.hotspot || undefined,
  )

  const [isVisible, setIsVisible] = useState(false)
  const [locationName, setLocationName] = useState('')

  const { assertLocation } = useActions({
    hotspot: hotspotData,
    locationName,
    setIsVisible,
  })

  useEffect(() => {
    dispatch(getLocationPermission())
    dispatch(fetchHotspotDetail(address))
  }, [address, dispatch])

  useEffect(() => {
    if (hotspotsData[address]) {
      const { hotspot, witnessed } = hotspotsData[address]
      // console.log('HotspotDetailScreen::witnessed:', witnessed)
      setHotspotData(hotspot)
      setWitnessedData(witnessed)
    }
  }, [address, hotspotsData])

  useAsync(async () => {
    if (hotspotData) {
      const hotspot = hotspotData as unknown as Hotspot & {
        locationName: string
      }
      if ((hotspot as unknown as { locationName: string }).locationName) {
        setLocationName(
          (hotspot as unknown as { locationName: string }).locationName,
        )
      } else if (hotspot.geocode) {
        const { longStreet, longCity } = hotspot.geocode
        setLocationName(
          longStreet && longCity ? `${longStreet}, ${longCity}` : 'Loading...',
        )
        const { lat, lng } = hotspot
        if (lat && lng) {
          const [{ street, city }] = await reverseGeocode(lat, lng)
          if (street && city) {
            setLocationName(`${street}, ${city}`)
          } else if (street && longCity) {
            setLocationName(`${street}, ${longCity}`)
          } else if (longStreet && city) {
            setLocationName(`${longStreet}, ${city}`)
          }
        }
      }
    }
  }, [hotspotData])

  return (
    <DetailViewContainer
      title={formatHotspotNameArray(hotspotData?.name || '').join(' ')}
      goBack={() => {
        if (navigation.canGoBack()) {
          navigation.goBack()
        }
      }}
      icon={{ name: 'more-horiz', onPress: () => setIsVisible(true) }}
    >
      <Box flex={1}>
        <Box flex={5}>
          <HotspotLocationView
            mapCenter={
              hotspotData?.location
                ? [hotspotData.lng || 0, hotspotData.lat || 0]
                : undefined
            }
            locationName={locationName}
            assertLocation={assertLocation}
          />
        </Box>
        <Box flex={13}>
          {hotspotData ? (
            <Box flex={1}>
              <HotspotCard hotspot={hotspotData} locationName={locationName} />
              <Box
                flex={1}
                backgroundColor="white"
                paddingTop="s"
                borderRadius="l"
              >
                <HotspotDetails
                  hotspot={hotspotData}
                  witnessed={witnessedData}
                />
              </Box>
            </Box>
          ) : (
            <Box
              flex={1}
              justifyContent="center"
              style={{
                backgroundColor: '#1a2637',
              }}
            >
              <Text style={{ textAlign: 'center' }}>Loading...</Text>
            </Box>
          )}
        </Box>
        <HotspotActions
          hotspot={hotspotData}
          locationName={locationName}
          isVisible={isVisible}
          setIsVisible={setIsVisible}
        />
      </Box>
    </DetailViewContainer>
  )
}

export default memo(HotspotDetailScreen)

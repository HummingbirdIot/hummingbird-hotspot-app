import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { Position } from 'geojson'
import Search from '@assets/images/search.svg'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
} from '@gorhom/bottom-sheet'
import Box from '../../../components/boxes/Box'
import { DebouncedButton } from '../../../components/buttons/Button'
import Map from '../../../components/locations/Map'
import Text from '../../../components/texts/Text'
import { reverseGeocode } from '../../../utils/location'
import sleep from '../../../utils/sleep'
import {
  FeaturesNavigationProp,
  FeaturesStackParamList,
} from '../../navigation/features/featuresNavigationTypes'
import SafeAreaBox from '../../../components/boxes/SafeAreaBox'
import TouchableOpacityBox from '../../../components/boxes/TouchableOpacityBox'
import { useColors, useSpacing } from '../../../theme/themeHooks'
import BSHandle from '../../../components/modals/BSHandle'
import AddressSearchModal from '../../../components/modals/AddressSearchModal'
import { PlaceGeography } from '../../../utils/clients/googlePlacesClient'

type Route = RouteProp<
  FeaturesStackParamList,
  'HotspotAssertPickLocationScreen'
>
const HotspotAssertPickLocationScreen = () => {
  const { t } = useTranslation()
  const { params } = useRoute<Route>()
  const navigation = useNavigation<FeaturesNavigationProp>()
  const [disabled, setDisabled] = useState(true)
  const [mapCenter, setMapCenter] = useState([-122.419, 37.775])
  const [markerCenter, setMarkerCenter] = useState([-122.419, 37.775])
  const [hasGPSLocation, setHasGPSLocation] = useState(false)
  const [locationName, setLocationName] = useState('')
  const spacing = useSpacing()
  const insets = useSafeAreaInsets()
  const searchModal = useRef<BottomSheetModal>(null)
  const { surface } = useColors()

  useEffect(() => {
    const sleepThenEnable = async () => {
      await sleep(3000)
      setDisabled(false)
    }
    sleepThenEnable()
  }, [])

  const onMapMoved = useCallback(async (newCoords?: Position) => {
    if (newCoords) {
      setMarkerCenter(newCoords)

      const [longitude, latitude] = newCoords
      const [{ street, city }] = await reverseGeocode(latitude, longitude)
      const name = street && city ? [street, city].join(', ') : 'Loading...'
      setLocationName(name)
    }
  }, [])

  const navToAntennaSetup = useCallback(() => {
    console.log(
      'HotspotAssertPickLocationScreen::navToAntennaSetup',
      locationName,
      markerCenter,
      params,
    )
    navigation.navigate('HotspotAssertPickAntennaScreen', {
      ...params,
      coords: markerCenter,
      locationName,
    })
  }, [locationName, markerCenter, navigation, params])

  const navNext = useCallback(() => {
    // console.log('HotspotAssertPickLocationScreen::navNext:', {
    //   ...params,
    //   coords: markerCenter,
    //   locationName,
    // })
    navigation.navigate('HotspotAssertConfirmLocationScreen', {
      ...params,
      coords: markerCenter,
      locationName,
      // gain,
      // elevation,
    })
  }, [locationName, markerCenter, navigation, params])

  const onDidFinishLoadingMap = useCallback(
    (latitude: number, longitude: number) => {
      setHasGPSLocation(true)
      setMapCenter([longitude, latitude])
    },
    [],
  )

  const handleSearchPress = useCallback(() => {
    searchModal.current?.present()
  }, [])

  const handleSelectPlace = useCallback((placeGeography: PlaceGeography) => {
    setMapCenter([placeGeography.lng, placeGeography.lat])
    searchModal.current?.dismiss()
  }, [])

  const searchSnapPoints = useMemo(() => ['85%'], [])

  return (
    <SafeAreaBox
      flex={1}
      edges={['bottom']}
      backgroundColor="primaryBackground"
    >
      <TouchableOpacityBox
        onPress={handleSearchPress}
        position="absolute"
        padding="m"
        top={insets.top + spacing.s}
        right={spacing.m}
        zIndex={1}
      >
        <Search width={30} height={30} color="white" />
      </TouchableOpacityBox>
      <Box flex={1.2}>
        <Map
          maxZoomLevel={17}
          mapCenter={mapCenter}
          onMapMoved={onMapMoved}
          onDidFinishLoadingMap={onDidFinishLoadingMap}
          markerLocation={markerCenter}
          currentLocationEnabled
        />
      </Box>
      <Box backgroundColor="primaryBackground" padding="l">
        <Box
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          marginBottom="lm"
        >
          <Box>
            <Text variant="body1" marginBottom="xs">
              {t('hotspot_setup.location.title')}
            </Text>
            <Text variant="body1">Location Name: {locationName}</Text>
          </Box>
        </Box>
        <DebouncedButton
          onPress={navToAntennaSetup}
          variant="primary"
          mode="contained"
          disabled={disabled || !hasGPSLocation}
          title="Set Antenna"
          marginBottom="m"
        />
        {params.gatewayAction !== 'addGateway' ? (
          <DebouncedButton
            onPress={navNext}
            variant="primary"
            mode="contained"
            disabled={disabled || !hasGPSLocation}
            title={t('hotspot_setup.location.next')}
          />
        ) : null}
      </Box>
      <BottomSheetModalProvider>
        <BottomSheetModal
          ref={searchModal}
          snapPoints={searchSnapPoints}
          handleComponent={BSHandle}
          backdropComponent={BottomSheetBackdrop}
          backgroundStyle={{ backgroundColor: surface }}
        >
          <AddressSearchModal onSelectPlace={handleSelectPlace} />
        </BottomSheetModal>
      </BottomSheetModalProvider>
    </SafeAreaBox>
  )
}

export default memo(HotspotAssertPickLocationScreen)

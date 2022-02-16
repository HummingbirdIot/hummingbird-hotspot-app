// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { useTranslation } from 'react-i18next'
// import { useRoute } from '@react-navigation/native'
// import AddIcon from '@assets/images/add.svg'
// import { Linking } from 'react-native'
import { Hotspot } from '@helium/http'
import { useAsync } from 'react-async-hook'
import { useSelector } from 'react-redux'
import { ScrollView, StyleSheet } from 'react-native'
import { locale } from '../../../utils/i18n'
import { RootState } from '../../../store/rootReducer'
import { useAppDispatch } from '../../../store/store'
import { fetchHotspotsData } from '../../../store/hotspots/hotspotsSlice'
import Box from '../../../components/Box'
import Text from '../../../components/Text'
import Map from '../../../components/Map'
// import Button from '../../../components/Button'
// import { RootNavigationProp } from '../../../navigation/main/tabTypes'
import useMount from '../../../utils/useMount'
// import { EXPLORER_BASE_URL } from '../../../utils/config'
import { getAddress } from '../../../utils/secureAccount'
// import { fetchInitialData } from '../../../store/helium/heliumDataSlice'

export const HELIUM_OLD_MAKER_ADDRESS =
  '14fzfjFcHpDR1rTH8BNPvSi5dKBbgxaDnmsVPbCjuq9ENjpZbxh'

export const HUMMINGBIRD_MAKER_ADDRESS =
  '14DdSjvEkBQ46xQ24LAtHwQkAeoUUZHfGCosgJe33nRQ6rZwPG3'

const HotspotsScreen = () => {
  const { t } = useTranslation()
  // const navigation = useNavigation<RootNavigationProp>()
  const [accountAddress, setAccountAddress] = useState('')

  // const route = useRoute()
  // console.log('MyLOG::HotspotsScreen::route:', route)

  const [mapCenter, setMapCenter] = useState([-122.419, 37.775])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // const [markerCenter, setMarkerCenter] = useState([-122.419, 37.775])
  const markerCenter = [-122.419, 37.775]
  // const [hasGPSLocation, setHasGPSLocation] = useState(false)

  const dispatch = useAppDispatch()

  useAsync(async () => {
    const account = await getAddress()
    // console.log('MyLOG::accountAddress:', typeof account, account)
    setAccountAddress(account || '')
    // setAccountAddress(
    //   account || '13YxjCpiGrbDtbthrPAH2zrJKCk5UajQHJRfqtSSmqTE8924Q65',
    // )
  }, [])

  const makers = useSelector((state: RootState) => state.heliumData.makers)
  // console.log('MyLOG::HotspotsScreen::makers:', makers)

  const hotspots = useSelector(
    (state: RootState) => state.hotspots.hotspots.data,
  )
  // console.log('MyLOG::HotspotsScreen::hotspots:', hotspots)
  const formatHotspotName = (name: string) => {
    return name.split('-').map((str) => {
      return str.replace(/^\w/, (c) => c.toLocaleUpperCase())
    })
  }

  useMount(() => {
    dispatch(fetchHotspotsData())
    // maybeGetLocation(false)
  })

  const onDidFinishLoadingMap = useCallback(
    (latitude: number, longitude: number) => {
      // setHasGPSLocation(true)
      // setMapCenter([longitude, latitude])
      console.log(
        'MyLOG::HotspotsScreen::Location:',
        longitude,
        latitude,
        hotspots[0]?.lng || 0,
        hotspots[0]?.lat || 0,
      )
      setMapCenter([hotspots[0]?.lng || 0, hotspots[0]?.lat || 0])
    },
    [hotspots],
  )

  useEffect(() => {
    setMapCenter([hotspots[0]?.lng || 0, hotspots[0]?.lat || 0])
  }, [hotspots])

  // const addHotspot = useCallback(() => navigation.push('HotspotSetup'), [
  //   navigation,
  // ])

  // const assertHotspot = useCallback(() => navigation.push('HotspotAssert'), [
  //   navigation,
  // ])

  // const openExplorer = useCallback(
  //   () => Linking.openURL(`${EXPLORER_BASE_URL}/accounts/${accountAddress}`),
  //   [accountAddress],
  // )

  return (
    <Box backgroundColor="primaryBackground" flex={1}>
      <BottomSheetModalProvider>
        <Box
          padding="l"
          flex={1}
          justifyContent="center"
          backgroundColor="primaryBackground"
        >
          <Text variant="h2">Hello Hummingbird</Text>
          <Text variant="body1" marginTop="ms">
            {/* {t('hotspots.empty.body')} */}
            accountAddress: {accountAddress}
          </Text>

          {/* <Text variant="body1" marginTop="l">
            {t('hotspots.view_activity')}
            <Text variant="body1" color="primary" onPress={openExplorer}>
              {t('hotspots.explorer')}
            </Text>
            {t('generic.period')}
          </Text> */}
          <Map
            maxZoomLevel={17}
            mapCenter={mapCenter}
            // onMapMoved={onMapMoved}
            onDidFinishLoadingMap={onDidFinishLoadingMap}
            markerLocation={markerCenter}
            currentLocationEnabled
          />
          <ScrollView style={styles.scrollView}>
            {hotspots.map((hotspot: Hotspot) => {
              const makerName = (() => {
                if (hotspot?.payer === HELIUM_OLD_MAKER_ADDRESS) {
                  // special case for old Helium Hotspots
                  return 'Helium'
                }
                return makers?.find((m) => m.address === hotspot?.payer)?.name
              })()
              return (
                <Box key={hotspot.address}>
                  <Text variant="body1">------------------</Text>
                  <Text variant="body1">------------------</Text>
                  <Text variant="body1">------------------</Text>
                  <Text variant="body1">------------------</Text>
                  <Text variant="body1">
                    {formatHotspotName(hotspot.name || '').join(' ')}
                  </Text>
                  <Text variant="body1">{hotspot.address}</Text>
                  <Text variant="body1">
                    {hotspot.geocode?.shortStreet}, {hotspot.geocode?.shortCity}
                    , {hotspot.geocode?.shortCountry}
                  </Text>
                  <Text variant="body2">
                    {hotspot.lng}, {hotspot.lat}
                  </Text>
                  <Text
                    variant="body2"
                    // color={isHidden ? 'grayLightText' : 'grayText'}
                    marginLeft="xs"
                  >
                    {t('generic.meters', { distance: hotspot?.elevation || 0 })}
                  </Text>
                  {hotspot?.gain !== undefined && (
                    <Text variant="body2" marginLeft="xs">
                      {(hotspot.gain / 10).toLocaleString(locale, {
                        maximumFractionDigits: 1,
                      }) + t('antennas.onboarding.dbi')}
                    </Text>
                  )}
                  <Text variant="body2">{hotspot.status?.online}</Text>
                  <Text variant="body2">{hotspot.rewardScale}</Text>
                  <Text variant="body1">{makerName}</Text>
                </Box>
              )
            })}
          </ScrollView>
        </Box>
      </BottomSheetModalProvider>
    </Box>
  )
}

const styles = StyleSheet.create({
  // container: {
  //   flex: 1,
  //   paddingTop: StatusBar.currentHeight,
  // },
  scrollView: {
    backgroundColor: 'pink',
    marginHorizontal: 20,
  },
  text: {
    fontSize: 42,
  },
})

export default memo(HotspotsScreen)

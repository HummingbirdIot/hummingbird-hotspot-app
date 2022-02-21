/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { Button, Linking, Platform, ScrollView, Text, View } from 'react-native'
import { useSelector } from 'react-redux'
import {
  BottomSheet,
  ButtonGroup,
  Header,
  ListItem,
} from 'react-native-elements'
import { useTranslation } from 'react-i18next'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useHotspotBle } from '@helium/react-native-sdk'
// import SafeAreaBox from '../../../components/SafeAreaBox'
import { useAsync } from 'react-async-hook'
import Box from '../../../components/Box'
import Map from '../../../components/Map'
import ThemedText from '../../../components/Text'
import Location from '../../../assets/images/location.svg'
import IconMaker from '../../../assets/images/maker.svg'
import IconElevation from '../../../assets/images/gain.svg'
import IconGain from '../../../assets/images/elevation.svg'
import IconAddress from '../../../assets/images/address-symbol.svg'
import IconAccount from '../../../assets/images/account-green.svg'
import { locale } from '../../../utils/i18n'
import ActivitiesList from '../../../widgets/main/ActivitiesList'
import { useColors } from '../../../theme/themeHooks'
import { getLocationPermission } from '../../../store/app/locationSlice'
import { RootState } from '../../../store/rootReducer'
import usePermissionManager from '../../../utils/hooks/usePermissionManager'
import { useAppDispatch } from '../../../store/store'
import useAlert from '../../../utils/hooks/useAlert'
import { getSecureItem, setSecureItem } from '../../../utils/secureAccount'
import HotspotStatistics from '../../../widgets/main/RewardsStatistics'

const truncateAddress = (address: string, startWith = 10) => {
  // console.log('truncateAddress::address:', address)
  const start = address.slice(0, startWith)
  const end = address.slice(address.length - 7)
  return `${start}...${end}`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const HotspotDetailScreen = ({ navigation }: any) => {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const { index, routes } = navigation.getState()
  const { title, makerName } = routes[index].params
  const { enable, getState } = useHotspotBle()
  const { showOKCancelAlert } = useAlert()
  const dispatch = useAppDispatch()
  const { requestLocationPermission } = usePermissionManager()
  const { permissionResponse, locationBlocked } = useSelector(
    (state: RootState) => state.location,
  )
  const [hotspot, setHotspot] = useState(routes[index].params.hotspot)

  // console.log('Root::SafeAreaInsets:', insets)
  // console.log(
  //   'HotspotDetailScreen::navigation::route:',
  //   index,
  //   routes,
  //   navigation,
  // )
  //   console.log(
  //     'HotspotDetailScreen::navigation::routeParams:',
  //     index,
  //     routes[index].params,
  //   )
  console.log('HotspotDetailScreen::hotspot:', hotspot)

  // useEffect(() => navigation.setOptions({ title }), [navigation, title])

  useAsync(async () => {
    if (hotspot) {
      await setSecureItem('currentHotspot', hotspot)
    } else {
      const h = await getSecureItem('currentHotspot')
      console.log(
        'HotspotDetailScreen::getSecureItem::currentHotspot::hotspot:',
        hotspot,
      )
      setHotspot(h)
    }
  }, [hotspot])

  useEffect(() => {
    getState()
    dispatch(getLocationPermission())
  }, [dispatch, getState])

  const checkBluetooth = useCallback(async () => {
    const state = await getState()

    if (state === 'PoweredOn') {
      return true
    }

    if (Platform.OS === 'ios') {
      if (state === 'PoweredOff') {
        const decision = await showOKCancelAlert({
          titleKey: 'hotspot_setup.pair.alert_ble_off.title',
          messageKey: 'hotspot_setup.pair.alert_ble_off.body',
          okKey: 'generic.go_to_settings',
        })
        if (decision) Linking.openURL('App-Prefs:Bluetooth')
      } else {
        const decision = await showOKCancelAlert({
          titleKey: 'hotspot_setup.pair.alert_ble_off.title',
          messageKey: 'hotspot_setup.pair.alert_ble_off.body',
          okKey: 'generic.go_to_settings',
        })
        if (decision) Linking.openURL('app-settings:')
      }
    }
    if (Platform.OS === 'android') {
      await enable()
      return true
    }
  }, [enable, getState, showOKCancelAlert])

  const checkLocation = useCallback(async () => {
    if (Platform.OS === 'ios') return true

    if (permissionResponse?.granted) {
      return true
    }

    if (!locationBlocked) {
      const response = await requestLocationPermission()
      if (response && response.granted) {
        return true
      }
    } else {
      const decision = await showOKCancelAlert({
        titleKey: 'permissions.location.title',
        messageKey: 'permissions.location.message',
        okKey: 'generic.go_to_settings',
      })
      if (decision) Linking.openSettings()
    }
  }, [
    locationBlocked,
    permissionResponse?.granted,
    requestLocationPermission,
    showOKCancelAlert,
  ])

  const [mapArea, setMapArea] = useState(<Box />)

  const [selectedIndex, updateIndex] = useState(0)
  const buttons = ['Statistics', 'Activity', 'Witnessed']
  const Statistics = useMemo(
    () => <HotspotStatistics hotspot={hotspot} />,
    [hotspot],
  )
  const Activity = useMemo(
    () => (
      <ActivitiesList
        address={hotspot.address}
        lng={hotspot.lng}
        lat={hotspot.lat}
      />
    ),
    [hotspot.address, hotspot.lng, hotspot.lat],
  )
  const Empty = useMemo(
    () => (
      <Box
        style={{
          backgroundColor: '#f6f6f6',
          paddingVertical: 20,
          borderRadius: 5,
        }}
      >
        <ThemedText textAlign="center" color="gray">
          Empty
        </ThemedText>
      </Box>
    ),
    [],
  )
  const widgets = [Statistics, Activity, Empty]

  const { surfaceContrast } = useColors()

  const assertLocation = useCallback(async () => {
    if (!hotspot) return
    setIsVisible(false)
    await checkLocation()
    navigation.push('HotspotAssert', {
      hotspot,
      hotspotAddress: hotspot.address,
      gatewayAction: 'assertLocation',
      gain: hotspot.gain ? hotspot.gain / 10 : 1.2,
      elevation: hotspot.elevation || 0,
    })
  }, [hotspot, navigation, checkLocation])
  const assertAntenna = async () => {
    // console.log('HotspotDetailScreen::assertAntenna::hotspot:', hotspot)
    if (hotspot) {
      const { address, lng, lat, geocode, location } = hotspot
      if (lng && lat) {
        setIsVisible(false)
        await checkLocation()
        const { longStreet, longCity } = geocode
        const locationName =
          longStreet && longCity ? `${longStreet}, ${longCity}` : 'Loading...'
        navigation.push('HotspotAssert', {
          hotspot,
          hotspotAddress: address,
          locationName,
          coords: [lng, lat],
          currentLocation: location,
          gatewayAction: 'assertAntenna',
        })
      } else {
      }
    }
  }
  const setWiFi = async () => {
    if (!hotspot) return
    setIsVisible(false)
    await checkBluetooth()
    navigation.push('HotspotSetWiFi', {
      hotspotAddress: hotspot.address,
    })
  }
  const [isVisible, setIsVisible] = useState(false)
  const list = [
    {
      title: 'Assert Location And Antenna',
      onPress: assertLocation,
    },
    {
      title: 'Assert Antenna',
      onPress: assertAntenna,
    },
    {
      title: 'Update WiFi',
      onPress: setWiFi,
    },
    {
      title: 'Cancel',
      containerStyle: {
        /* backgroundColor: 'red' */
      },
      titleStyle: { color: 'gray' },
      onPress: () => setIsVisible(false),
    },
  ]

  useEffect(() => {
    const { lng, lat } = hotspot
    if (lng && lat) {
      const el = (
        <Map
          maxZoomLevel={12}
          mapCenter={[lng, lat]}
          //   onDidFinishLoadingMap={onDidFinishLoadingMap}
          markerLocation={[lng, lat]}
          currentLocationEnabled
        />
      )
      setMapArea(el)
    } else {
      const el = (
        <Box flex={1} justifyContent="center">
          <Text
            style={{
              textAlign: 'center',
              fontSize: 16,
              color: 'white',
            }}
          >
            This Hotspot haven&apos;t been asserted location yet
          </Text>
          <Button title="Assert Location" onPress={assertLocation} />
        </Box>
      )
      setMapArea(el)
    }
  }, [hotspot, navigation, assertLocation])

  return (
    <Box flex={1} style={{ backgroundColor: '#1a2637' }}>
      <Header
        backgroundColor={surfaceContrast}
        centerComponent={{
          text: title,
          // style: { fontSize: 20, color: '#fff' },
        }}
        leftComponent={{
          icon: 'arrow-back-ios',
          color: '#fff',
          onPress: () => {
            navigation.goBack()
          },
        }}
        rightComponent={{
          icon: 'menu',
          color: '#fff',
          onPress: () => {
            // navigation.navigate('HotspotAssert')
            setIsVisible(true)
          },
        }}
      />
      <Box flex={6}>{mapArea}</Box>
      <Box flex={9} backgroundColor="primaryBackground">
        <Box
          style={{
            padding: 10,
            paddingBottom: 5,
          }}
        >
          <Box
            flexDirection="row"
            justifyContent="flex-start"
            alignItems="center"
          >
            <IconAddress width={20} height={20} />
            <ThemedText
              style={{
                fontSize: 20,
                color: '#474DFF',
              }}
            >
              {truncateAddress(hotspot.address, 16)}
            </ThemedText>
          </Box>
          <Box
            flexDirection="row"
            justifyContent="flex-start"
            alignItems="center"
            marginTop="xs"
          >
            <IconMaker width={10} height={10} />
            <ThemedText
              flex={1}
              variant="body2"
              marginLeft="xs"
              marginRight="m"
            >
              {makerName}
            </ThemedText>
            <IconAccount width={10} height={10} />
            <ThemedText variant="body2" marginLeft="xs" marginRight="m">
              {truncateAddress(hotspot.owner)}
            </ThemedText>
          </Box>
          <Box
            flexDirection="row"
            justifyContent="flex-start"
            alignItems="center"
            marginTop="xs"
          >
            <Location
              width={10}
              height={10}
              // color={isHidden ? colors.grayLightText : colors.grayText}
            />
            <ThemedText
              flex={1}
              variant="body2"
              // color={isHidden ? 'grayLightText' : 'grayText'}
              marginLeft="xs"
              marginRight="m"
            >
              {`${hotspot?.geocode?.longCity}, ${hotspot?.geocode?.shortCountry}`}
            </ThemedText>
            <IconElevation width={10} height={10} />
            <ThemedText
              variant="body2"
              // color={isHidden ? 'grayLightText' : 'grayText'}
              marginLeft="xs"
              marginRight="m"
            >
              {t('generic.meters', { distance: hotspot?.elevation || 0 })}
            </ThemedText>
            <IconGain width={10} height={10} />
            <ThemedText
              variant="body2"
              // color={isHidden ? 'grayLightText' : 'grayText'}
              marginLeft="xs"
              marginRight="m"
            >
              {((hotspot?.gain || 0) / 10).toLocaleString(locale, {
                maximumFractionDigits: 1,
              }) + t('antennas.onboarding.dbi')}
            </ThemedText>
          </Box>
        </Box>
        <Box flex={1}>
          <ButtonGroup
            onPress={updateIndex}
            selectedIndex={selectedIndex}
            buttons={buttons}
            containerStyle={{ height: 36 }}
          />
          <ScrollView
            style={{
              flex: 1,
            }}
          >
            <Box
              style={{
                paddingTop: 5,
                paddingLeft: 10,
                paddingRight: 10,
                paddingBottom: insets.bottom,
              }}
            >
              {widgets[selectedIndex] || null}
            </Box>
          </ScrollView>
        </Box>
      </Box>
      <BottomSheet
        isVisible={isVisible}
        containerStyle={{ backgroundColor: 'rgba(0.5, 0.25, 0, 0.2)' }}
      >
        {list.map((l, i) => (
          <ListItem
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            containerStyle={l.containerStyle || {}}
            onPress={l.onPress}
          >
            <ListItem.Content>
              <ListItem.Title style={l.titleStyle}>{l.title}</ListItem.Title>
            </ListItem.Content>
          </ListItem>
        ))}
      </BottomSheet>
    </Box>
  )
}

export default memo(HotspotDetailScreen)

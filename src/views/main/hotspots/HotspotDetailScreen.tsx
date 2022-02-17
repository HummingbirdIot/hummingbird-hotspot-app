/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { memo, useCallback, useEffect, useState } from 'react'
import { Button, ScrollView, Text, View } from 'react-native'
import {
  BottomSheet,
  ButtonGroup,
  Header,
  ListItem,
} from 'react-native-elements'
import { useTranslation } from 'react-i18next'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
// import SafeAreaBox from '../../../components/SafeAreaBox'
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
import ActivitiesList from '../../list/ActivitiesList'
import { useColors } from '../../../theme/themeHooks'

const truncateAddress = (address: string, startWith = 10) => {
  const start = address.slice(0, startWith)
  const end = address.slice(address.length - 7)
  return `${start}...${end}`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const HotspotDetailScreen = ({ navigation }: any) => {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  // console.log('Root::SafeAreaInsets:', insets)

  const { index, routes } = navigation.getState()
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
  // return <ThemedText>Hello</ThemedText>
  const { title, hotspot, makerName } = routes[index].params
  // const [lng, lat] = [hotspot?.lng || 0, hotspot?.lat || 0]
  // console.log('HotspotDetailScreen::hotspot:', hotspot)

  // useEffect(() => navigation.setOptions({ title }), [navigation, title])

  // const [mapCenter, setMapCenter] = useState([lng, lat])
  // const [markerCenter, setMarkerCenter] = useState([lng, lat])
  const [mapArea, setMapArea] = useState(<Box />)
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
          <Button
            title="Assert Location"
            onPress={() => {
              if (!hotspot) return
              console.log('Assert Location')
              navigation.replace('HotspotAssert', {
                hotspotAddress: hotspot.address,
                hotspotType: 'ExampleHotspotBLE',
                gatewayAction: 'assertLocation',
              })
            }}
          />
        </Box>
      )
      setMapArea(el)
    }
  }, [hotspot, navigation])

  const [selectedIndex, updateIndex] = useState(1)
  const buttons = ['Statistics', 'Activity', 'Witnessed', 'Nearby']

  const { surfaceContrast } = useColors()

  const [isVisible, setIsVisible] = useState(false)
  const list = [
    {
      title: 'Assert Location And Antenna',
      onPress: () => {
        if (!hotspot) return
        console.log('Assert Location')
        navigation.replace('HotspotAssert', {
          hotspotAddress: hotspot.address,
          // hotspotType: 'ExampleHotspotBLE',
          gatewayAction: 'assertLocation',
          gain: hotspot.gain,
          elevation: hotspot.elevation,
        })
      },
    },
    {
      title: 'Assert Antenna',
      onPress: () => {
        if (!hotspot) return
        console.log('Assert Antenna')
        const { address, lng, lat, geocode, location } = hotspot
        const { long_street: street, long_city: city } = geocode
        const locationName =
          street && city ? [street, city].join(', ') : 'Loading...'
        navigation.replace('HotspotAssert', {
          hotspotAddress: address,
          // hotspotType: 'ExampleHotspotBLE',
          locationName,
          coords: [lng, lat],
          currentLocation: location,
          gatewayAction: 'assertAntenna',
        })
      },
    },
    {
      title: 'Update WiFi',
      onPress: () => {
        if (!hotspot) return
        console.log('Assert Location')
        navigation.replace('HotspotAssert', {
          hotspotAddress: hotspot.address,
          hotspotType: 'ExampleHotspotBLE',
          gatewayAction: 'assertLocation',
        })
      },
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
          {/* <ButtonGroup
            onPress={updateIndex}
            selectedIndex={selectedIndex}
            buttons={buttons}
            containerStyle={{ height: 30 }}
          /> */}
          <ScrollView
            style={{
              flex: 1,
            }}
          >
            <Box
              style={{
                paddingLeft: 10,
                paddingRight: 10,
                paddingBottom: insets.bottom,
              }}
            >
              <ActivitiesList hotspot={hotspot} />
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

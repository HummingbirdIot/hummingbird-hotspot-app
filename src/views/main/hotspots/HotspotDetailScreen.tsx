/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { memo, useCallback, useEffect, useState } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { ButtonGroup } from 'react-native-elements'
import { useTranslation } from 'react-i18next'
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

const truncateAddress = (address: string, startWith = 10) => {
  const start = address.slice(0, startWith)
  const end = address.slice(address.length - 7)
  return `${start}...${end}`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const HotspotDetailScreen = ({ navigation }: any) => {
  const { t } = useTranslation()
  const { index, routes } = navigation.getState()
  //   console.log('HotspotDetailScreen::navigation::route:', index, routes[index])
  //   console.log(
  //     'HotspotDetailScreen::navigation::routeParams:',
  //     index,
  //     routes[index].params,
  //   )
  const { title, hotspot, makerName } = routes[index].params
  const [lng, lat] = [hotspot?.lng || 0, hotspot?.lat || 0]
  console.log('HotspotDetailScreen::hotspot:', hotspot)

  useEffect(() => navigation.setOptions({ title }), [navigation, title])

  const [mapCenter, setMapCenter] = useState([lng, lat])
  const [markerCenter, setMarkerCenter] = useState([lng, lat])
  const [selectedIndex, updateIndex] = useState(0)
  const buttons = ['Statistics', 'Activity', 'Witnessed', 'Nearby']

  return (
    <Box flex={1} backgroundColor="primaryBackground">
      <Box flex={6}>
        <Map
          maxZoomLevel={12}
          mapCenter={mapCenter}
          //   onDidFinishLoadingMap={onDidFinishLoadingMap}
          markerLocation={markerCenter}
          currentLocationEnabled
        />
      </Box>
      <Box flex={8}>
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
            containerStyle={{ height: 30 }}
          />
          <ScrollView
            style={{
              paddingLeft: 10,
              paddingRight: 10,
            }}
          >
            <Text>{title}</Text>
            <Text>{title}</Text>
            <Text>{title}</Text>
            <Text>{title}</Text>
            <Text>{title}</Text>
            <Text>{title}</Text>
            <Text>{title}</Text>
            <Text>{title}</Text>
            <Text>{title}</Text>
            <Text>{title}</Text>
            <Text>{title}</Text>
            <Text>{title}</Text>
            <Text>{title}</Text>
            <Text>{title}</Text>
            <Text>{title}</Text>
            <Text>{title}</Text>
            <Text>{title}</Text>
            <Text>{title}</Text>
            <Text>{title}</Text>
            <Text>{title}</Text>
            <Text>{title}</Text>
            <Text>{title}</Text>
            <Text>{title}</Text>
            <Text>{title}</Text>
            <Text>{title}</Text>
            <Text>{title}</Text>
          </ScrollView>
        </Box>
      </Box>
    </Box>
  )
}

export default memo(HotspotDetailScreen)

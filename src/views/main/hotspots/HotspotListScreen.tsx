import React, { memo, useEffect, useState } from 'react'
import { ScrollView } from 'react-native'
import { Avatar, Header, ListItem, Text } from 'react-native-elements'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import ThemedText from '../../../components/Text'
import Box from '../../../components/Box'
import { useAppDispatch } from '../../../store/store'
import { fetchHotspotsData } from '../../../store/data/hotspotsSlice'
import { RootState } from '../../../store/rootReducer'
import useMount from '../../../utils/hooks/useMount'
import { useColors } from '../../../theme/themeHooks'
import { locale } from '../../../utils/i18n'
import {
  formatHotspotNameArray,
  formatHotspotShortName,
  getMakerName,
} from '../../../utils/formatter'

import Maker from '../../../assets/images/maker.svg'
import RewardsScale from '../../../assets/images/rewardsScale.svg'
import Location from '../../../assets/images/location.svg'
import Signal from '../../../assets/images/signal.svg'
import Elevation from '../../../assets/images/elevation.svg'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const HotspotsListScreen = ({ navigation }: any) => {
  const { t } = useTranslation()

  const { surfaceContrast } = useColors()
  // console.log('HotspotsListScreen::surfaceContrast:', surfaceContrast)

  const makers = useSelector((state: RootState) => state.helium.makers)
  // console.log('HotspotsListScreen::makers:', makers)

  const { hotspots, hotspotsData } = useSelector(
    (state: RootState) => state.hotspots,
  )
  const dispatch = useAppDispatch()

  const [addresses, setAddrresses] = useState<string[]>(hotspots.data || [])

  useEffect(() => {
    setAddrresses(hotspots.data)
    // console.log('HotspotsListScreen::hotspotAddresses:', hotspots.data)
  }, [hotspots.data])

  useMount(() => {
    dispatch(fetchHotspotsData()).catch((error) =>
      console.log('HotspotsListScreen::fetchHotspotsData:werror:', error),
    )
    // maybeGetLocation(false)
  })

  return (
    <Box flex={1}>
      <Header
        backgroundColor={surfaceContrast}
        centerComponent={{
          text: 'Hostpots',
          // style: { fontSize: 20, color: '#fff' },
        }}
        rightComponent={{
          icon: 'add',
          color: '#fff',
          onPress: () => {
            // console.log('rightComponent', navigation.getParent())
            navigation.navigate('HotspotSetup')
            // navigation.navigate('HotspotAssert')
          },
        }}
      />
      <Box flex={1}>
        <ScrollView>
          {addresses.map((address) => {
            const { hotspot } = hotspotsData[address]
            return (
              <ListItem
                key={address}
                bottomDivider
                onPress={() =>
                  navigation.navigate('HotspotDetailScreen', {
                    // screen: 'HotspotDetail',
                    title: formatHotspotNameArray(hotspot.name || '').join(' '),
                    makerName: getMakerName(hotspot?.payer, makers),
                    address: hotspot.address,
                  })
                }
              >
                <Avatar
                  rounded
                  title={formatHotspotShortName(hotspot.name || '')}
                  titleStyle={{ fontSize: 18 }}
                  // containerStyle={}
                  // onPress={() => console.log('Works!')}
                />
                <ListItem.Content>
                  <ListItem.Title>
                    {formatHotspotNameArray(hotspot.name || '').map(
                      (str, j) => {
                        if (j === 2) {
                          return (
                            <Text
                              // eslint-disable-next-line react/no-array-index-key
                              key={j}
                              style={{ fontSize: 22, fontWeight: '500' }}
                            >
                              {str}
                            </Text>
                          )
                        }
                        return (
                          <Text
                            // eslint-disable-next-line react/no-array-index-key
                            key={j}
                            style={{ fontSize: 22, fontWeight: '200' }}
                          >
                            {str}{' '}
                          </Text>
                        )
                      },
                    )}
                  </ListItem.Title>
                  <Box
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems="center"
                    marginTop="xs"
                    opacity={hotspot.address === undefined ? 0 : 100}
                  >
                    <Box flex={1} flexDirection="row" alignItems="center">
                      <Maker width={10} height={10} />
                      <ThemedText marginLeft="s">
                        {getMakerName(hotspot.payer, makers)}
                      </ThemedText>
                    </Box>
                    <Box
                      flex={1}
                      flexDirection="row-reverse"
                      alignItems="center"
                    >
                      <ThemedText marginLeft="s">
                        {hotspot.rewardScale?.toFixed(5) || '0.00'}
                      </ThemedText>
                      <RewardsScale width={10} height={10} />
                    </Box>
                  </Box>

                  <Box
                    flexDirection="row"
                    justifyContent="flex-start"
                    alignItems="center"
                    marginTop="xs"
                    opacity={hotspot.address === undefined ? 0 : 100}
                  >
                    <Box flex={8} flexDirection="row" alignItems="center">
                      <Location width={10} height={10} color="#3c82f7" />
                      <ThemedText variant="body2" marginLeft="s">
                        {`${hotspot?.geocode?.longCity}, ${hotspot?.geocode?.shortCountry}`}
                      </ThemedText>
                    </Box>
                    <Box flex={3} flexDirection="row" alignItems="center">
                      <Signal width={10} height={10} color="#3c82f7" />
                      <ThemedText variant="body2" marginLeft="s">
                        {t('generic.meters', {
                          distance: hotspot?.elevation || 0,
                        })}
                      </ThemedText>
                    </Box>
                    <Box
                      flex={3}
                      flexDirection="row-reverse"
                      alignItems="center"
                    >
                      <ThemedText variant="body2" marginLeft="s">
                        {((hotspot?.gain || 0) / 10).toLocaleString(locale, {
                          maximumFractionDigits: 1,
                        }) + t('antennas.onboarding.dbi')}
                      </ThemedText>
                      <Elevation width={10} height={10} />
                    </Box>
                  </Box>
                </ListItem.Content>
              </ListItem>
            )
          })}
        </ScrollView>
      </Box>
    </Box>
  )
}

export default memo(HotspotsListScreen)

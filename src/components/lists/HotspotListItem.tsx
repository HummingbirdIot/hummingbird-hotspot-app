import React, { memo, useEffect, useMemo } from 'react'
import { Avatar, ListItem, Text } from 'react-native-elements'
import { useTranslation } from 'react-i18next'
import { Hotspot } from '@helium/http'
import { ColorSchemeName, useColorScheme } from 'react-native-appearance'
import { useSelector } from 'react-redux'
import { locale } from '../../utils/i18n'
import {
  formatHotspotNameArray,
  formatHotspotShortName,
  useMaker,
} from '../../utils/formatter'

import Maker from '../../assets/images/maker.svg'
import HNT from '../../assets/images/hnt.svg'
import Location from '../../assets/images/location.svg'
import Signal from '../../assets/images/signal.svg'
import Elevation from '../../assets/images/elevation.svg'
import { RootNavigationProp } from '../../views/navigation/rootNavigationTypes'
import { useColors } from '../../theme/themeHooks'
import { HotspotCardGroup, HotspotCardItem } from '../cards/HotspotCard'
import { fetchRewardsData } from '../../store/data/rewardsSlice'
import { useAppDispatch } from '../../store/store'
import { RootState } from '../../store/rootReducer'

const HotspotListItem = ({
  hotspot,
  navigation,
}: {
  hotspot: Hotspot
  navigation: RootNavigationProp
}) => {
  const { t } = useTranslation()
  const colorScheme: ColorSchemeName = useColorScheme()
  const dispatch = useAppDispatch()
  const earnings =
    useSelector(
      (state: RootState) => state.rewards.earnings[hotspot.address],
    ) || {}
  const [yesterday] =
    (earnings['7'] || earnings['14'] || earnings['30'])?.rewards || []
  const { getMakerName } = useMaker()
  const {
    primaryBackground,
    secondaryBackground,
    primaryText,
    surface,
    blueMain,
    greenMain,
    error,
  } = useColors()
  const colorList = [
    '#639B81',
    '#DB90BD',
    '#97E29C',
    '#D88785',
    '#49B8F6',
    '#D37368',
    '#F49D84',
    '#3572BB',
    '#ACACAC',
  ]
  const isOnline = hotspot.status?.online === 'online'

  const calculateColor = (name: string): typeof colorList[number] => {
    if (!isOnline) return colorList[8]
    const value = name.split('').reduce((p, c) => p + c.charCodeAt(0), 0)
    const index = value % 8
    return colorList[index]
  }

  const themeColors = useMemo(
    () =>
      colorScheme === 'light'
        ? {
            backgroundColor: primaryBackground,
            borderColor: secondaryBackground,
          }
        : {
            backgroundColor: surface,
            borderColor: primaryBackground,
          },
    [colorScheme, primaryBackground, secondaryBackground, surface],
  )

  useEffect(() => {
    if (hotspot.address) {
      dispatch(
        fetchRewardsData({
          address: hotspot.address,
          numDays: 7,
          resource: 'hotspots',
        }),
      )
    }
  }, [dispatch, hotspot.address])

  return (
    <ListItem
      key={hotspot.address}
      //   bottomDivider
      containerStyle={{
        borderTopWidth: 5,
        borderTopColor: themeColors.borderColor,
        backgroundColor: themeColors.backgroundColor,
        // borderRadius: 3,
      }}
      onPress={() =>
        navigation.navigate('HotspotScreen', {
          address: hotspot.address,
        })
      }
    >
      <Avatar
        rounded
        title={formatHotspotShortName(hotspot.name || '')}
        titleStyle={{ fontSize: 18, color: isOnline ? 'white' : 'lightgray' }}
        containerStyle={{
          backgroundColor: calculateColor(hotspot.name || ''),
        }}
        // onPress={() => console.log('Works!')}
      />
      <ListItem.Content>
        <ListItem.Title>
          {formatHotspotNameArray(hotspot.name || '').map((str, j) => {
            if (j === 2) {
              return (
                <Text
                  key={hotspot.name}
                  style={{
                    fontSize: 22,
                    fontWeight: '500',
                    color: isOnline ? greenMain : error,
                  }}
                >
                  {str}
                </Text>
              )
            }
            return (
              <Text
                // eslint-disable-next-line react/no-array-index-key
                key={j}
                style={{
                  fontSize: 22,
                  fontWeight: '200',
                  color: primaryText,
                }}
              >
                {str}{' '}
              </Text>
            )
          })}
        </ListItem.Title>
        <HotspotCardGroup>
          <HotspotCardItem Icon={HNT} flex={1}>
            + {yesterday?.total || '0.00000'} HNT
          </HotspotCardItem>
          <HotspotCardItem Icon={Maker} right>
            {getMakerName(hotspot.payer)}
          </HotspotCardItem>
        </HotspotCardGroup>
        <HotspotCardGroup>
          <HotspotCardItem flex={7} Icon={Location} iconColor={blueMain}>
            {`${hotspot?.geocode?.longCity}, ${hotspot?.geocode?.shortCountry}`}
          </HotspotCardItem>
          <HotspotCardItem flex={3} Icon={Signal} iconColor={blueMain}>
            {((hotspot?.gain || 0) / 10).toLocaleString(locale, {
              maximumFractionDigits: 1,
            }) + t('antennas.onboarding.dbi')}
          </HotspotCardItem>
          <HotspotCardItem Icon={Elevation} iconColor={blueMain} right>
            {t('generic.meters', {
              distance: hotspot?.elevation || 0,
            })}
          </HotspotCardItem>
        </HotspotCardGroup>
      </ListItem.Content>
    </ListItem>
  )
}

export default memo(HotspotListItem)

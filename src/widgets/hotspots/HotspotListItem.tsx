import React, { memo, useMemo } from 'react'
import { Avatar, ListItem, Text } from 'react-native-elements'
import { useTranslation } from 'react-i18next'
import { Hotspot } from '@helium/http'
import { ColorSchemeName, useColorScheme } from 'react-native-appearance'
import { locale } from '../../utils/i18n'
import {
  formatHotspotNameArray,
  formatHotspotShortName,
  useMaker,
} from '../../utils/formatter'

import Maker from '../../assets/images/maker.svg'
import RewardsScale from '../../assets/images/rewardsScale.svg'
import Location from '../../assets/images/location.svg'
import Signal from '../../assets/images/signal.svg'
import Elevation from '../../assets/images/elevation.svg'
import { RootNavigationProp } from '../../views/navigation/naviTypes'
import { useColors } from '../../theme/themeHooks'
import { HotspotCardGroup, HotspotCardItem } from './HotspotCard'

const HotspotListItem = ({
  hotspot,
  navigation,
}: {
  hotspot: Hotspot
  navigation: RootNavigationProp
}) => {
  const { t } = useTranslation()
  const colorScheme: ColorSchemeName = useColorScheme()
  const { getMakerName } = useMaker()
  const {
    primaryBackground,
    secondaryBackground,
    primaryText,
    surface,
    blueMain,
  } = useColors()
  const colorList = [
    '#6D9088',
    '#D6A3CB',
    '#A3D6A7',
    '#E37C7B',
    '#49B8E6',
    '#A48780',
    '#E49D84',
    '#223F59',
    '#8C8C8C',
  ]

  const calculateColor = (name: string) => {
    const value = name.split('').reduce((p, c) => p + c.charCodeAt(0), 0)
    const index = value % 9
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
        titleStyle={{ fontSize: 18 }}
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
                    color: primaryText,
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
                style={{ fontSize: 22, fontWeight: '200', color: primaryText }}
              >
                {str}{' '}
              </Text>
            )
          })}
        </ListItem.Title>
        <HotspotCardGroup>
          <HotspotCardItem Icon={Maker} flex={1}>
            {getMakerName(hotspot.payer)}
          </HotspotCardItem>
          <HotspotCardItem Icon={RewardsScale} right>
            {hotspot.rewardScale?.toFixed(5) || '0.00'}
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

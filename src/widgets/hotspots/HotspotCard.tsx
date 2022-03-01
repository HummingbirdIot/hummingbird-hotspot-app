import React, { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Hotspot } from '@helium/http'
import { ColorSchemeName, useColorScheme } from 'react-native-appearance'
import { SvgProps } from 'react-native-svg'
import { TFunctionResult } from 'i18next'
import Box from '../../components/Box'
import Text from '../../components/Text'
import IconLocation from '../../assets/images/location.svg'
import IconMaker from '../../assets/images/maker.svg'
import IconElevation from '../../assets/images/gain.svg'
import IconGain from '../../assets/images/elevation.svg'
import IconAddress from '../../assets/images/address-symbol.svg'
import IconAccount from '../../assets/images/account-green.svg'
import IconRewardsScale from '../../assets/images/rewardsScale.svg'
import IconBlcok from '../../assets/images/data.svg'
import { locale } from '../../utils/i18n'
import { useColors } from '../../theme/themeHooks'
import { truncateAddress, useMaker } from '../../utils/formatter'

// eslint-disable-next-line @typescript-eslint/naming-convention
type text = string | number | TFunctionResult
export const HotspotCardItem = ({
  Icon,
  iconColor,
  children,
  flex,
  right,
}: {
  Icon: React.FC<SvgProps>
  iconColor?: string
  children: text | text[]
  flex?: number
  right?: boolean
}) => (
  <>
    <Icon width={10} height={10} color={iconColor || undefined} />
    <Text
      flex={flex}
      variant="body2"
      marginLeft="xs"
      marginRight={right ? undefined : 'm'}
    >
      {children}
    </Text>
  </>
)

export const HotspotCardGroup = ({ children }: { children: Element[] }) => (
  <Box
    flexDirection="row"
    justifyContent="flex-start"
    alignItems="center"
    marginTop="xs"
  >
    {children}
  </Box>
)

const HotspotCard = ({
  hotspot,
  locationName,
}: {
  hotspot: Hotspot
  locationName: string
}) => {
  const { t } = useTranslation()
  const colorScheme: ColorSchemeName = useColorScheme()
  const { blueMain } = useColors()
  const { getMakerName } = useMaker()

  return (
    <Box
      padding="s"
      backgroundColor={
        colorScheme === 'light' ? 'primaryBackground' : 'surface'
      }
    >
      <Box flexDirection="row" justifyContent="flex-start" alignItems="center">
        <IconAddress width={20} color={blueMain} height={20} />
        <Text
          style={{
            fontSize: 20,
            color: blueMain,
          }}
        >
          {truncateAddress(hotspot.address, 16)}
        </Text>
      </Box>
      <HotspotCardGroup>
        <IconLocation width={10} height={10} color={blueMain} />
        <Text flex={1} variant="body2" marginLeft="xs" marginRight="m">
          {locationName}
        </Text>
        <HotspotCardItem Icon={IconRewardsScale} right>
          {hotspot.rewardScale?.toFixed(5) || '0.00'}
        </HotspotCardItem>
      </HotspotCardGroup>
      <HotspotCardGroup>
        <HotspotCardItem Icon={IconMaker} flex={1}>
          {getMakerName(hotspot.payer)}
        </HotspotCardItem>
        <HotspotCardItem Icon={IconAccount} right>
          {truncateAddress(hotspot.owner || 'UnknownOwner')}
        </HotspotCardItem>
      </HotspotCardGroup>
      <HotspotCardGroup>
        <HotspotCardItem Icon={IconBlcok} flex={1}>
          {hotspot.block || ''} (+{hotspot.blockAdded || 0})
        </HotspotCardItem>
        <HotspotCardItem Icon={IconElevation}>
          {((hotspot?.gain || 0) / 10).toLocaleString(locale, {
            maximumFractionDigits: 1,
          }) + t('antennas.onboarding.dbi')}
        </HotspotCardItem>
        <HotspotCardItem Icon={IconGain} right>
          {t('generic.meters', {
            distance: hotspot?.elevation || 0,
          })}
        </HotspotCardItem>
      </HotspotCardGroup>
    </Box>
  )
}

export default memo(HotspotCard)

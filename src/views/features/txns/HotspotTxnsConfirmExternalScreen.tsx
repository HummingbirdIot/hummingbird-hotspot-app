import React, { useCallback, useEffect, useState } from 'react'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import Fingerprint from '@assets/images/fingerprint.svg'
import { ActivityIndicator } from 'react-native'
import { AddGateway, useOnboarding } from '@helium/react-native-sdk'
import BackScreenContainer from '../../../components/containers/BackScreenContainer'
import Box from '../../../components/boxes/Box'
import Text from '../../../components/texts/Text'
import {
  FeaturesNavigationProp,
  FeaturesStackParamList,
} from '../../navigation/features/featuresNavigationTypes'
import { useBreakpoints, useColors } from '../../../theme/themeHooks'
import animateTransition from '../../../utils/animateTransition'
import { DebouncedButton } from '../../../components/buttons/Button'
import { RootNavigationProp } from '../../navigation/rootNavigationTypes'
import { getAddress } from '../../../utils/secureData'
import useMount from '../../../utils/hooks/useMount'

type Route = RouteProp<
  FeaturesStackParamList,
  'HotspotTxnsConfirmExternalScreen'
>

const HotspotTxnsConfirmExternalScreen = () => {
  const { t } = useTranslation()
  const { params } = useRoute<Route>()
  const navigation = useNavigation<FeaturesNavigationProp>()
  const colors = useColors()
  const breakpoints = useBreakpoints()
  const [address, setAddress] = useState<string | null>()
  const [publicKey, setPublicKey] = useState('')
  const [macAddress, setMacAddress] = useState('')
  const [ownerAddress, setOwnerAddress] = useState('')
  const rootNav = useNavigation<RootNavigationProp>()
  const { getOnboardingRecord } = useOnboarding()

  const handleClose = useCallback(() => rootNav.navigate('MainTabs'), [rootNav])

  useMount(() => {
    getAddress().then(setAddress)
  })

  useEffect(() => {
    if (!publicKey) return

    console.log('HotspotTxnsConfirmExternalScreen::publicKey:', publicKey)

    const getRecord = async () => {
      const onboardingRecord = await getOnboardingRecord(publicKey)
      if (!onboardingRecord) return
      console.log(
        'HotspotTxnsConfirmExternalScreen::onboardingRecord:',
        onboardingRecord,
      )
      animateTransition('HotspotTxnsConfirmExternalScreen.GetMac')
      setMacAddress(onboardingRecord.macEth0 || t('generic.unknown'))
    }
    getRecord()
  }, [getOnboardingRecord, publicKey, t])

  useEffect(() => {
    if (!params.addGatewayTxn) return
    console.log('HotspotTxnsConfirmExternalScreen::useRouteParams:', params)
    const addGatewayTxn = AddGateway.txnFromString(params.addGatewayTxn)

    console.log(
      'HotspotTxnsConfirmExternalScreen::addGatewayTxn::gateway:',
      addGatewayTxn.gateway,
    )
    console.log(
      'HotspotTxnsConfirmExternalScreen::addGatewayTxn::owner:',
      addGatewayTxn.owner,
    )
    setPublicKey(addGatewayTxn.gateway?.b58 || '')
    setOwnerAddress(addGatewayTxn.owner?.b58 || '')
  }, [params])

  const navNext = useCallback(async () => {
    navigation.push('HotspotSetupEnableLocationScreen', {
      ...params,
      hotspotAddress: publicKey,
    })
  }, [navigation, params, publicKey])

  return (
    <BackScreenContainer
      backgroundColor="primaryBackground"
      paddingTop={{ smallPhone: 's', phone: 'lx' }}
      onClose={handleClose}
    >
      <Box
        height={52}
        width={52}
        backgroundColor="secondaryBackground"
        borderRadius="m"
        alignItems="center"
        justifyContent="center"
      >
        <Fingerprint color={colors.primary} width={26} height={26} />
      </Box>
      <Text
        variant="h1"
        fontSize={breakpoints.smallPhone ? 28 : 40}
        numberOfLines={breakpoints.smallPhone ? 1 : 2}
        adjustsFontSizeToFit
        marginTop="l"
      >
        {breakpoints.smallPhone
          ? t('hotspot_setup.confirm.title_one_line')
          : t('hotspot_setup.confirm.title')}
      </Text>
      <Box
        padding="l"
        backgroundColor="secondaryBackground"
        borderTopLeftRadius="s"
        borderTopRightRadius="s"
        marginTop={{ smallPhone: 'm', phone: 'xl' }}
        justifyContent="center"
      >
        <Text variant="body1" maxFontSizeMultiplier={1}>
          {t('hotspot_setup.confirm.public_key')}
        </Text>
        <Text
          variant="body1"
          marginTop="xs"
          maxFontSizeMultiplier={1}
          numberOfLines={2}
          adjustsFontSizeToFit
        >
          {publicKey}
        </Text>
      </Box>
      <Box
        padding="l"
        backgroundColor="secondaryBackground"
        marginTop="xs"
        justifyContent="center"
        alignItems="flex-start"
      >
        <Text variant="body1" maxFontSizeMultiplier={1}>
          {t('hotspot_setup.confirm.mac_address')}
        </Text>
        {macAddress ? (
          <Text variant="body1" marginTop="xs" maxFontSizeMultiplier={1}>
            {macAddress}
          </Text>
        ) : (
          <Box marginTop="s">
            <ActivityIndicator color="white" />
          </Box>
        )}
      </Box>
      <Box
        marginTop="xs"
        backgroundColor="secondaryBackground"
        borderBottomLeftRadius="s"
        borderBottomRightRadius="s"
        padding="l"
        justifyContent="center"
      >
        <Text variant="body1" maxFontSizeMultiplier={1}>
          {t('hotspot_setup.confirm.owner_address')}
        </Text>
        <Text
          variant="body1"
          maxFontSizeMultiplier={1}
          marginTop="xs"
          numberOfLines={2}
          adjustsFontSizeToFit
        >
          {ownerAddress}
        </Text>
      </Box>
      <Box flex={1} />
      <DebouncedButton
        title={t('generic.next')}
        mode="contained"
        variant="primary"
        onPress={navNext}
        disabled={ownerAddress !== address}
      />
    </BackScreenContainer>
  )
}

export default HotspotTxnsConfirmExternalScreen

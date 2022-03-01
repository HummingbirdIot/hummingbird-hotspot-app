/* eslint-disable no-nested-ternary */
import React, { useState } from 'react'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import { useAsync } from 'react-async-hook'
import { ActivityIndicator } from 'react-native'
import Box from '../../../components/Box'
import { DebouncedButton } from '../../../components/Button'
import Text from '../../../components/Text'
import { RootNavigationProp } from '../../navigation/naviTypes'
import SafeAreaBox from '../../../components/SafeAreaBox'
import { HotspotSetupStackParamList } from '../../navigation/features/hotspotSetupTypes'
import { useColors } from '../../../theme/themeHooks'

type Route = RouteProp<HotspotSetupStackParamList, 'HotspotTxnsDemoScreen'>

const HotspotTxnsSubmitScreen = () => {
  const { t } = useTranslation()
  const { params } = useRoute<Route>()
  const navigation = useNavigation<RootNavigationProp>()
  const { primaryText } = useColors()

  const [status, setStatus] = useState<number>(0)

  useAsync(async () => {
    if (status > 0) return
    setStatus(1)
    const action = await new Promise((resolve) => {
      setTimeout(() => {
        resolve(params.action)
      }, 1000 * 20)
    })
    switch (action) {
      case 'addGateway':
        setStatus(2)
        break
      case 'assertLocation':
        setStatus(3)
        break
      case 'assertAntenna':
        setStatus(4)
        break
    }
  }, [params])

  let messageBox = (
    <Box flex={1} justifyContent="center">
      <ActivityIndicator color={primaryText} />
      <Text variant="body1" textAlign="center" marginVertical="l">
        Preparing for Demonstrating Transactions
      </Text>
    </Box>
  )

  if (status > 1) {
    let title = 'Add Hotspot Demo'
    if (status > 3) {
      title = 'Assert Antenn Demo'
    } else if (status > 2) {
      title = 'Assert Location Demo'
    }
    messageBox = (
      <Box flex={1} justifyContent="center" padding="l">
        <Text textAlign="center" variant="h4">
          {title}
        </Text>
        <Box flex={1} marginTop="l">
          <Text variant="body1" marginBottom="s">
            {t(
              "This transaction hasn't truly be signed or be submitted, since your account is an exploration account.",
            )}
          </Text>
          <Text variant="body1" marginBottom="s">
            {t(
              'If you wanna explorate the completed flows of the app, you need to link as a real helium account with Helium Apps, such as Helium Wallet or Helium hotspots.',
            )}
          </Text>
          <Text variant="body1" marginBottom="s">
            {t(
              'You also need, at first, get one or more Hummingbird Hotspots, which you can buy from XDT.com, as the key devices for all the actions.',
            )}
          </Text>
        </Box>
      </Box>
    )
  }

  return (
    <SafeAreaBox
      flex={1}
      backgroundColor="primaryBackground"
      padding="lx"
      paddingTop="xxl"
    >
      <Box alignItems="center" paddingTop="xxl">
        <Text variant="subtitle1">{t('hotspot_setup.progress.title')}</Text>
        <Box paddingTop="l">
          <Text variant="body1" textAlign="center">
            {t('hotspot_setup.progress.subtitle')}
          </Text>
        </Box>
      </Box>
      <Box
        flex={1}
        marginVertical="xxl"
        justifyContent="center"
        backgroundColor="surface"
        borderRadius="xl"
      >
        {messageBox}
      </Box>
      <DebouncedButton
        onPress={() => navigation.navigate('ActivityScreen')}
        variant="primary"
        width="100%"
        mode="contained"
        title={t('hotspot_setup.progress.next')}
        disabled={status < 2}
      />
    </SafeAreaBox>
  )
}

export default HotspotTxnsSubmitScreen

import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { WalletLink } from '@helium/react-native-sdk'
import { Linking, Platform } from 'react-native'
import { getBundleId } from 'react-native-device-info'
import { useNavigation } from '@react-navigation/native'
import Text from '../../../components/texts/Text'
import { LoginNavigationProp } from '../../navigation/loginNavigationTypes'
import Box from '../../../components/boxes/Box'
import TextTransform from '../../../components/texts/TextTransform'
import SafeAreaBox from '../../../components/boxes/SafeAreaBox'
import TouchableOpacityBox from '../../../components/boxes/TouchableOpacityBox'

const WelcomeScreen = () => {
  const { t } = useTranslation()
  const { delegateApps } = WalletLink
  const [delegateApp] = delegateApps
  const navigation = useNavigation<LoginNavigationProp>()

  const handleAppSelection = useCallback(
    (app: WalletLink.DelegateApp) => async () => {
      try {
        const url = WalletLink.createWalletLinkUrl({
          universalLink:
            Platform.OS === 'android' ? app.urlScheme : app.universalLink,
          requestAppId: getBundleId(),
          callbackUrl: 'hummingbirdscheme://',
          appName: 'Hummingbird',
        })

        Linking.openURL(url)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error)
      }
    },
    [],
  )

  const enterExplorationCode = useCallback(
    () => navigation.push('TypeInExplorationCode'),
    [navigation],
  )

  const createAccount = useCallback(
    () => navigation.push('CreateHeliumAccount'),
    [navigation],
  )

  return (
    <SafeAreaBox flex={1} backgroundColor="primaryBackground">
      <Box flex={1} alignItems="center">
        <Box flex={4}>
          <Box
            backgroundColor="surface"
            style={{
              position: 'absolute',
              width: 1000,
              height: 1000,
              borderRadius: 500,
              bottom: 0,
              left: -500,
            }}
            justifyContent="flex-end"
            padding="l"
          >
            <Text variant="h1" textAlign="center" textTransform="uppercase">
              {t('account_setup.welcome.title')}
            </Text>
            <TextTransform
              variant="subtitle1"
              letterSpacing={3}
              marginVertical="xl"
              textAlign="center"
              i18nKey="account_setup.welcome.subtitle"
            />
          </Box>
        </Box>
        <Box flex={6} width="100%" padding="xl">
          <Box flex={1} flexDirection="row" justifyContent="center">
            <TouchableOpacityBox
              key={
                Platform.OS === 'android'
                  ? delegateApp.androidPackage
                  : delegateApp.iosBundleId
              }
              backgroundColor="surface"
              marginVertical="xl"
              style={{
                width: 150,
                height: 150,
                borderRadius: 75,
                paddingVertical: 53,
              }}
              onPress={handleAppSelection(delegateApp)}
            >
              <Text variant="h5" textAlign="center">
                Link with
              </Text>
              <Text variant="h5" textAlign="center">
                {delegateApp.name}
              </Text>
            </TouchableOpacityBox>
          </Box>
          <Box flexDirection="row" justifyContent="center">
            <Text
              variant="h6"
              textAlign="center"
              color="primaryText"
              onPress={enterExplorationCode}
            >
              Sign-in as a watcher
            </Text>
            <Text
              variant="h6"
              marginHorizontal="m"
              color="grayLightText"
              textAlign="center"
            >
              |
            </Text>
            <Text
              variant="h6"
              textAlign="center"
              color="primaryText"
              onPress={createAccount}
            >
              Create helium account
            </Text>
          </Box>
        </Box>
      </Box>
    </SafeAreaBox>
  )
}

export default WelcomeScreen

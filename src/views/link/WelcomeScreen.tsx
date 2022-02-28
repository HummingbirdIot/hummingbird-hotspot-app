import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { WalletLink } from '@helium/react-native-sdk'
import { Linking, Platform } from 'react-native'
import { getBundleId } from 'react-native-device-info'
import { useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Text from '../../components/Text'
import { OnboardingNavigationProp } from './onboardingTypes'
import Box from '../../components/Box'
import TextTransform from '../../components/TextTransform'
import SafeAreaBox from '../../components/SafeAreaBox'
import TouchableOpacityBox from '../../components/TouchableOpacityBox'
import { useAppDispatch } from '../../store/store'
import appSlice from '../../store/app/appSlice'

const WelcomeScreen = () => {
  const { t } = useTranslation()
  const { delegateApps } = WalletLink
  const [delegateApp] = delegateApps
  const insets = useSafeAreaInsets()
  const navigation = useNavigation<OnboardingNavigationProp>()
  const dispatch = useAppDispatch()

  const handlePreview = useCallback(
    () => async () => {
      dispatch(
        appSlice.actions.storeWalletLinkToken(
          'eyJ0aW1lIjoxNjQ1MDAwNDE5LCJhZGRyZXNzIjoiMTN1TTdndFZ4UFI1N1AzdWU5azVtS2ZlWURmZmZlc1o4b25naURBZGtFTHlXODN6bkJlIiwicmVxdWVzdEFwcElkIjoib3JnLm1ha2VyLmh1bW1pbmdiaXJkIiwic2lnbmluZ0FwcElkIjoiY29tLmhlbGl1bS5tb2JpbGUud2FsbGV0IiwiY2FsbGJhY2tVcmwiOiJodW1taW5nYmlyZHNjaGVtZTovLyIsImFwcE5hbWUiOiJIdW1taW5nYmlyZCIsInNpZ25hdHVyZSI6ImwxNWh2b0s4VkxkclE5Nko0YjZqWHNZWVBxTW8vVDY5TVlld1VSMFAvT0NkSzhXNm13bG96TEk0dXEvMTRDa1ZyN1RZVEx5UWwzS0Y1L3VBZ2QvM0J3PT0ifQ==',
        ),
      )
    },
    [dispatch],
  )

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

  const createAccount = useCallback(
    () => navigation.push('CreateAccount'),
    [navigation],
  )

  return (
    <SafeAreaBox flex={1}>
      <Box flex={1} alignItems="center">
        <Box
          backgroundColor="surface"
          style={{
            width: 1000,
            height: 1000,
            borderRadius: 500,
            marginTop: -800 + insets.top * 2,
            paddingTop: 820,
          }}
        >
          <Text variant="h1" textAlign="center" textTransform="uppercase">
            {t('account_setup.welcome.title')}
          </Text>

          <TextTransform
            variant="subtitle1"
            marginVertical="xl"
            i18nKey="account_setup.welcome.subtitle"
          />
        </Box>
        <Box flex={1} width="100%" padding="xl">
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
              color="white"
              onPress={handlePreview}
            >
              Type in Exploration Code
            </Text>
            <Text
              variant="h6"
              marginHorizontal="m"
              color="gray"
              textAlign="center"
            >
              |
            </Text>
            <Text
              variant="h6"
              textAlign="center"
              color="white"
              onPress={createAccount}
            >
              Instructions
            </Text>
          </Box>
        </Box>
      </Box>
    </SafeAreaBox>
  )
}

export default WelcomeScreen

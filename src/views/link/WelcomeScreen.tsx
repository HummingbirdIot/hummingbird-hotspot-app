import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { WalletLink } from '@helium/react-native-sdk'
import { Linking, Platform } from 'react-native'
import { getBundleId } from 'react-native-device-info'
import { useNavigation } from '@react-navigation/native'
import Text from '../../components/Text'
import { OnboardingNavigationProp } from './onboardingTypes'
import Box from '../../components/Box'
// import TextTransform from '../../../components/TextTransform'
import SafeAreaBox from '../../components/SafeAreaBox'
import TouchableOpacityBox from '../../components/TouchableOpacityBox'
import { useAppDispatch } from '../../store/store'
import appSlice from '../../store/user/appSlice'

const usingSimulator = true

const WelcomeScreen = () => {
  const { t } = useTranslation()
  const { delegateApps } = WalletLink
  const navigation = useNavigation<OnboardingNavigationProp>()
  const dispatch = useAppDispatch()

  const handleAppSelection = useCallback(
    (app: WalletLink.DelegateApp) => async () => {
      if (usingSimulator) {
        dispatch(
          appSlice.actions.storeWalletLinkToken(
            'eyJ0aW1lIjoxNjQ1MDAwNDE5LCJhZGRyZXNzIjoiMTN1TTdndFZ4UFI1N1AzdWU5azVtS2ZlWURmZmZlc1o4b25naURBZGtFTHlXODN6bkJlIiwicmVxdWVzdEFwcElkIjoib3JnLm1ha2VyLmh1bW1pbmdiaXJkIiwic2lnbmluZ0FwcElkIjoiY29tLmhlbGl1bS5tb2JpbGUud2FsbGV0IiwiY2FsbGJhY2tVcmwiOiJodW1taW5nYmlyZHNjaGVtZTovLyIsImFwcE5hbWUiOiJIdW1taW5nYmlyZCIsInNpZ25hdHVyZSI6ImwxNWh2b0s4VkxkclE5Nko0YjZqWHNZWVBxTW8vVDY5TVlld1VSMFAvT0NkSzhXNm13bG96TEk0dXEvMTRDa1ZyN1RZVEx5UWwzS0Y1L3VBZ2QvM0J3PT0ifQ==',
          ),
        )
      } else {
        try {
          const url = WalletLink.createWalletLinkUrl({
            universalLink: app.universalLink,
            requestAppId: getBundleId(),
            callbackUrl: 'hummingbirdscheme://',
            appName: 'Hummingbird',
          })

          Linking.openURL(url)
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(error)
        }
      }
    },
    [dispatch],
  )

  const createAccount = useCallback(
    () => navigation.push('CreateAccount'),
    [navigation],
  )

  return (
    <SafeAreaBox
      backgroundColor="primaryBackground"
      flex={1}
      paddingHorizontal="l"
      alignItems="center"
      paddingTop="xxxl"
    >
      <Box>
        <Text variant="h1" alignContent="center">
          {t('account_setup.welcome.title')}
        </Text>
        {/* <TextTransform
          variant="subtitle1"
          marginVertical="xxl"
          i18nKey="account_setup.welcome.subtitle"
        /> */}
        <Box flex={1} />

        <Box flex={2} width="100%" padding="l">
          <Text variant="body1">
            {t('account_setup.welcome.login_with_helium')}
          </Text>
          <Box flexDirection="row" marginBottom="l">
            {delegateApps.map((app) => (
              <TouchableOpacityBox
                key={
                  Platform.OS === 'android'
                    ? app.androidPackage
                    : app.iosBundleId
                }
                backgroundColor="surface"
                padding="s"
                paddingHorizontal="m"
                borderRadius="l"
                onPress={handleAppSelection(app)}
              >
                <Text variant="h4">{app.name}</Text>
              </TouchableOpacityBox>
            ))}
          </Box>
        </Box>

        <TouchableOpacityBox onPress={createAccount} width="100%" padding="l">
          <Text variant="body1">
            {t('account_setup.welcome.create_account')}
          </Text>
        </TouchableOpacityBox>
      </Box>
    </SafeAreaBox>
  )
}

export default WelcomeScreen

import React, { memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { WalletLink } from '@helium/react-native-sdk'
import { Linking, Platform } from 'react-native'
import { useNavigation } from '@react-navigation/native'
// import SafeAreaBox from '../../components/SafeAreaBox'
import Text from '../../../components/texts/Text'
import Box from '../../../components/boxes/Box'
import TouchableOpacityBox from '../../../components/boxes/TouchableOpacityBox'
import { locale } from '../../../utils/i18n'
import BackScreen from '../../../components/containers/BackScreenContainer'
import { RootNavigationProp } from '../../navigation/naviTypes'

const CreateAccount = () => {
  const { t } = useTranslation()
  const { delegateApps } = WalletLink
  const [delegateApp] = delegateApps
  const nav = useNavigation<RootNavigationProp>()

  const handleAppSelection = useCallback(
    (app: WalletLink.DelegateApp) => async () => {
      if (Platform.OS === 'android') {
        Linking.openURL(`market://details?id=${app.androidPackage}`)
      } else if (Platform.OS === 'ios') {
        Linking.openURL(
          `https://apps.apple.com/${locale}/app/${app.name}/id${app.appStoreId}`,
        )
      }
      if (nav.canGoBack()) {
        nav.goBack()
      }
    },
    [nav],
  )

  const handleClose = useCallback(() => {
    nav.pop()
  }, [nav])

  return (
    <BackScreen
      flex={1}
      backgroundColor="primaryBackground"
      padding="xl"
      onClose={handleClose}
    >
      <Text variant="subtitle1" marginBottom="l">
        {t('account_setup.linkAccount.stepOne')}
      </Text>

      <Box flexDirection="row" marginBottom="l">
        <TouchableOpacityBox
          // key={delegateApp.name}
          backgroundColor="surface"
          padding="s"
          paddingHorizontal="m"
          borderRadius="l"
          onPress={handleAppSelection(delegateApp)}
        >
          <Text variant="h4">{delegateApp.name}</Text>
        </TouchableOpacityBox>
      </Box>

      <Text variant="subtitle1" marginBottom="l">
        {t('account_setup.linkAccount.stepTwo')}
      </Text>
      <Text variant="subtitle1" marginBottom="l">
        {t('account_setup.linkAccount.stepThree')}
      </Text>
    </BackScreen>
  )
}

export default memo(CreateAccount)

import React, { useCallback, useMemo } from 'react'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import Box from '../../../components/boxes/Box'
import { DebouncedButton } from '../../../components/buttons/Button'
import SafeAreaBox from '../../../components/boxes/SafeAreaBox'
import Text from '../../../components/texts/Text'
import { RootNavigationProp } from '../../navigation/rootNavigationTypes'
import { FeaturesStackParamList } from '../../navigation/features/featuresNavigationTypes'

type Route = RouteProp<FeaturesStackParamList, 'OnboardingErrorScreen'>
const OnboardingErrorScreen = () => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation<RootNavigationProp>()
  const {
    params: { connectStatus },
  } = useRoute<Route>()
  const navNext = useCallback(() => {
    navigation.navigate('MainTabs')
  }, [navigation])

  const subtitle = useMemo(() => {
    let subtitleKey = `hotspot_setup.onboarding_error.subtitle.${connectStatus}`

    if (!i18n.exists(subtitleKey)) {
      subtitleKey =
        'hotspot_setup.onboarding_error.subtitle.something_went_wrong'
    }
    return t(subtitleKey)
  }, [connectStatus, i18n, t])

  return (
    <SafeAreaBox backgroundColor="primaryBackground" flex={1} padding="l">
      <Box flex={1} justifyContent="center" paddingBottom="xxl">
        <Text variant="h1">{t('hotspot_setup.onboarding_error.title')}</Text>
        <Text variant="body1" marginVertical="l">
          {subtitle}
        </Text>
        <Text variant="body2" marginVertical="l">
          {connectStatus}
        </Text>
      </Box>
      <Box>
        <DebouncedButton
          mode="contained"
          variant="primary"
          title={t('hotspot_setup.onboarding_error.next')}
          onPress={navNext}
        />
      </Box>
    </SafeAreaBox>
  )
}

export default OnboardingErrorScreen

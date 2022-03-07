import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import {
  FeaturesNavigationProp,
  FeaturesStackParamList,
} from '../../navigation/features/featuresNavigationTypes'
import BackScreenContainer from '../../../components/containers/BackScreenContainer'
import Box from '../../../components/boxes/Box'
import { DebouncedButton } from '../../../components/buttons/Button'
import Text from '../../../components/texts/Text'
import { RootNavigationProp } from '../../navigation/rootNavigationTypes'

type Route = RouteProp<FeaturesStackParamList, 'HotspotSetupSkipLocationScreen'>

const HotspotSetupSkipLocationScreen = () => {
  const { t } = useTranslation()
  const navigation = useNavigation<FeaturesNavigationProp>()
  const rootNav = useNavigation<RootNavigationProp>()

  const { params } = useRoute<Route>()

  const handleClose = useCallback(() => rootNav.navigate('MainTabs'), [rootNav])

  const navNext = useCallback(async () => {
    navigation.replace('HotspotTxnsProgressScreen', params)
  }, [navigation, params])

  return (
    <BackScreenContainer onClose={handleClose}>
      <Box flex={1} justifyContent="center" paddingBottom="xxl">
        <Text variant="h1" marginBottom="l" maxFontSizeMultiplier={1}>
          {t('hotspot_setup.skip_location.title')}
        </Text>
        <Text
          variant="subtitle1"
          color="secondary"
          marginBottom={{ phone: 'l', smallPhone: 'ms' }}
        >
          {t('hotspot_setup.skip_location.subtitle_1')}
        </Text>
        <Text
          variant="subtitle2"
          marginBottom={{ phone: 'xl', smallPhone: 'ms' }}
          numberOfLines={2}
          adjustsFontSizeToFit
          maxFontSizeMultiplier={1.3}
        >
          {t('hotspot_setup.skip_location.subtitle_2')}
        </Text>
      </Box>
      <Box>
        <DebouncedButton
          title={t('hotspot_setup.skip_location.next')}
          mode="contained"
          variant="secondary"
          onPress={navNext}
        />
      </Box>
    </BackScreenContainer>
  )
}

export default HotspotSetupSkipLocationScreen

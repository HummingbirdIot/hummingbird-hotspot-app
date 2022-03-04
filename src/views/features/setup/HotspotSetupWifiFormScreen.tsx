import React, { useState, useCallback } from 'react'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import { KeyboardAvoidingView, StyleSheet } from 'react-native'
import BackScreen from '../../../components/containers/BackScreenContainer'
import Text from '../../../components/texts/Text'
import {
  FeaturesNavigationProp,
  FeaturesStackParamList,
} from '../../navigation/features/featuresNavigationTypes'
import TextInput from '../../../components/texts/TextInput'
import Button, { DebouncedButton } from '../../../components/buttons/Button'
import Box from '../../../components/boxes/Box'
import { RootNavigationProp } from '../../navigation/rootNavigationTypes'

type Route = RouteProp<FeaturesStackParamList, 'HotspotSetupWifiFormScreen'>
const HotspotSetupWifiFormScreen = () => {
  const { t } = useTranslation()
  const navigation = useNavigation<FeaturesNavigationProp>()
  const rootNav = useNavigation<RootNavigationProp>()

  const {
    params: {
      network,
      hotspotAddress,
      addGatewayTxn,
      hotspotType,
      gatewayAction,
    },
  } = useRoute<Route>()
  const [password, setPassword] = useState('')
  const [secureTextEntry, setSecureTextEntry] = useState(true)

  const toggleSecureEntry = useCallback(() => {
    setSecureTextEntry(!secureTextEntry)
  }, [secureTextEntry])

  const handleClose = useCallback(() => {
    // console.log(
    //   'gatewayActiongatewayActiongatewayActiongatewayAction',
    //   gatewayAction,
    // )
    // if (gatewayAction === 'addGateway') {
    //   rootNav.navigate('MainTabs')
    // } else {
    //   rootNav.pop()
    // }
    rootNav.pop()
  }, [rootNav])

  const navNext = async () => {
    navigation.replace('HotspotSetupWifiConnectingScreen', {
      network,
      password,
      hotspotAddress,
      addGatewayTxn,
      hotspotType,
      gatewayAction,
    })
  }

  return (
    <BackScreen onClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior="padding"
      >
        <Box flex={1} justifyContent="center" paddingBottom="xxl">
          <Box>
            <Text
              variant="h1"
              textAlign="center"
              marginBottom="m"
              maxFontSizeMultiplier={1}
            >
              {t('hotspot_setup.wifi_password.join_title')}
            </Text>
            <Text
              variant="subtitle2"
              textAlign="center"
              marginBottom="xl"
              maxFontSizeMultiplier={1.2}
            >
              {t('hotspot_setup.wifi_password.subtitle')}
            </Text>
            <Text variant="body1" marginBottom="s">
              {network}
            </Text>
          </Box>
          <TextInput
            padding="m"
            variant="regular"
            placeholder={t('hotspot_setup.wifi_password.placeholder')}
            onChangeText={setPassword}
            value={password}
            keyboardAppearance="dark"
            autoCorrect={false}
            placeholderTextColor="secondaryText"
            autoCompleteType="off"
            autoCapitalize="none"
            blurOnSubmit={false}
            returnKeyType="done"
            onSubmitEditing={navNext}
            secureTextEntry={secureTextEntry}
            autoFocus
          />
          <Button
            marginTop="s"
            onPress={toggleSecureEntry}
            variant="primary"
            mode="text"
            title={
              secureTextEntry
                ? t('hotspot_settings.wifi.show_password')
                : t('hotspot_settings.wifi.hide_password')
            }
          />
        </Box>
      </KeyboardAvoidingView>
      <Box>
        <DebouncedButton
          onPress={navNext}
          variant="primary"
          mode="contained"
          title={t('generic.connect')}
        />
      </Box>
    </BackScreen>
  )
}

export default HotspotSetupWifiFormScreen

const styles = StyleSheet.create({ keyboardAvoidingView: { flex: 1 } })

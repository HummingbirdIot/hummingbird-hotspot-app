import React, { useState, useCallback } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import { KeyboardAvoidingView, StyleSheet } from 'react-native'
import BackScreen from '../../../components/BackScreen'
import Text from '../../../components/Text'
import TextInput from '../../../components/TextInput'
import { DebouncedButton } from '../../../components/Button'
import Box from '../../../components/Box'
import { RootNavigationProp } from '../../navigation/naviTypes'
import { useAppDispatch } from '../../../store/store'
import appSlice from '../../../store/app/appSlice'
import addressMap from '../../../store/app/addressMap'
import useAlert from '../../../utils/hooks/useAlert'

const EnterExplorationCodeScreen = () => {
  const { t } = useTranslation()
  const nav = useNavigation<RootNavigationProp>()
  const { showOKAlert } = useAlert()
  const dispatch = useAppDispatch()
  const [xpCode, setXPCode] = useState('')

  const handleClose = useCallback(() => {
    nav.pop()
  }, [nav])

  const navNext = useCallback(async () => {
    if (xpCode) {
      const code = xpCode.toUpperCase()
      if (addressMap[code]) {
        dispatch(appSlice.actions.enableWatchMode(code))
      } else {
        await showOKAlert({
          titleKey: 'Exploration Code Invalid',
          messageKey:
            'The exploration code you entered is invalid, please check it carefully or contace with your agent.',
        })
        return false
      }
    }
  }, [dispatch, showOKAlert, xpCode])

  return (
    <BackScreen onClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior="padding"
      >
        <Box flex={1} justifyContent="center" paddingBottom="xxxl">
          <Box>
            <Text
              variant="h2"
              textAlign="center"
              marginBottom="m"
              maxFontSizeMultiplier={1}
            >
              Enter Your Exploration Code
            </Text>
            <Text
              variant="body3"
              textAlign="center"
              maxFontSizeMultiplier={1.2}
            >
              {t(
                'Type in the Exploration Code you got from Hummingbird or its agent, you would be able to watch the data pages of this app without signing-in a helium wallet account.',
              )}
            </Text>
            <Text
              variant="body3"
              textAlign="center"
              marginBottom="xl"
              maxFontSizeMultiplier={1.2}
            >
              {t(
                'You will, however, be only allowed to watch data under WATCH MODE, in which status you cannot sumbit transactions.',
              )}
            </Text>
          </Box>
          <TextInput
            padding="m"
            variant="regular"
            placeholder="Exploration Code"
            onChangeText={setXPCode}
            value={xpCode}
            keyboardAppearance="dark"
            autoCorrect={false}
            placeholderTextColor="secondaryText"
            autoCompleteType="off"
            autoCapitalize="none"
            blurOnSubmit={false}
            returnKeyType="done"
            onSubmitEditing={navNext}
            secureTextEntry={false}
            autoFocus
          />
        </Box>
      </KeyboardAvoidingView>
      <Box>
        <DebouncedButton
          onPress={navNext}
          variant="primary"
          mode="contained"
          title="Start Exploration"
          disabled={!xpCode}
        />
      </Box>
    </BackScreen>
  )
}

export default EnterExplorationCodeScreen

const styles = StyleSheet.create({ keyboardAvoidingView: { flex: 1 } })

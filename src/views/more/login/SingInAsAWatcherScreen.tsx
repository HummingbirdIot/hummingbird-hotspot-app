import React, { useState, useCallback } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import { KeyboardAvoidingView, StyleSheet } from 'react-native'
import { Icon } from 'react-native-elements'
import BackScreen from '../../../components/containers/BackScreenContainer'
import Text from '../../../components/texts/Text'
import TextInput from '../../../components/texts/TextInput'
import { DebouncedButton } from '../../../components/buttons/Button'
import Box from '../../../components/boxes/Box'
import { RootNavigationProp } from '../../navigation/rootNavigationTypes'
import { useAppDispatch } from '../../../store/store'
import appSlice from '../../../store/app/appSlice'
import useAlert from '../../../utils/hooks/useAlert'
import TouchableOpacityBox from '../../../components/boxes/TouchableOpacityBox'
import { useColors } from '../../../theme/themeHooks'
import { getAccount } from '../../../utils/clients/appDataClient'

const SingInAsAWatcherScreen = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { t } = useTranslation()
  const nav = useNavigation<RootNavigationProp>()
  const { showOKAlert } = useAlert()
  const dispatch = useAppDispatch()
  const [loading, setLoading] = useState(false)
  const [address, setAddress] = useState('')
  const { primaryText } = useColors()

  const handleClose = useCallback(() => {
    nav.pop()
  }, [nav])

  const navNext = useCallback(async () => {
    if (address) {
      try {
        setLoading(true)
        const account = await getAccount(address)
        if (!account) throw new Error('Account not found')
        // console.log('SingInAsAWatcherScreen::account:', account)
        nav.pop()
        dispatch(appSlice.actions.enableWatchMode(account?.address))
      } catch (error) {
        await showOKAlert({
          titleKey: 'Address Invalid',
          messageKey:
            'The address you entered is invalid, please check it carefully.',
        })
        return false
      } finally {
        setLoading(false)
      }
    }
  }, [address, nav, dispatch, showOKAlert])

  return (
    <BackScreen onClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior="padding"
      >
        <Box flex={1} justifyContent="center" paddingBottom="xxxl">
          <Box>
            <Text
              variant="h3"
              textAlign="center"
              marginBottom="l"
              maxFontSizeMultiplier={1}
            >
              Address to Watch
            </Text>
            <Text
              variant="body3"
              textAlign="center"
              maxFontSizeMultiplier={1.2}
            >
              {t(
                'Sign in as watch by typing in an address of a helium account, you would be able to watch the data of this account.',
              )}
            </Text>
            <Text
              variant="body3"
              textAlign="center"
              marginBottom="xl"
              maxFontSizeMultiplier={1.2}
            >
              {t(
                'Under the WATCHING MODE, however, you will not be able to sumbit transactions.',
              )}
            </Text>
          </Box>
          <Box>
            <TextInput
              padding="m"
              variant="regular"
              placeholder="helium account address"
              onChangeText={setAddress}
              value={address}
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
              multiline
              numberOfLines={3} // Android only
              maxLength={51}
              opacity={loading ? 0.6 : 1}
              editable={!loading}
            />
          </Box>
          <Box
            flexDirection="row"
            marginVertical="m"
            marginHorizontal="n_s"
            justifyContent="space-between"
          >
            <TouchableOpacityBox
              flex={2}
              height={50}
              backgroundColor="surface"
              margin="s"
              borderRadius="s"
              justifyContent="center"
              onPress={() =>
                loading ||
                setAddress(
                  '13YxjCpiGrbDtbthrPAH2zrJKCk5UajQHJRfqtSSmqTE8924Q65',
                )
              }
            >
              <Text color="surfaceText" textAlign="center">
                Address 4Q65
              </Text>
            </TouchableOpacityBox>
            <TouchableOpacityBox
              flex={2}
              height={50}
              backgroundColor="surface"
              margin="s"
              borderRadius="s"
              justifyContent="center"
              onPress={() =>
                loading ||
                setAddress(
                  '13uM7gtVxPR57P3ue9k5mKfeYDfffesZ8ongiDAdkELyW83znBe',
                )
              }
            >
              <Text color="surfaceText" textAlign="center">
                Address znBe
              </Text>
            </TouchableOpacityBox>
            <TouchableOpacityBox
              flex={1}
              height={50}
              backgroundColor="surface"
              margin="s"
              borderRadius="s"
              justifyContent="center"
              onPress={() =>
                loading ||
                setAddress(
                  '13uM7gtVxPR57P3ue9k5mKfeYDfffesZ8ongiDAdkELyW83znBe',
                )
              }
            >
              <Icon
                name="qr-code-scanner"
                color={primaryText}
                size={24}
                tvParallaxProperties={undefined}
              />
            </TouchableOpacityBox>
          </Box>
          <Text variant="body3" textAlign="justify" maxFontSizeMultiplier={1.2}>
            {t(
              'You can fastly sign-in with the above two addresses, which we provide to new users to experience this app before they getting an address.',
            )}
          </Text>
        </Box>
      </KeyboardAvoidingView>
      <Box>
        <DebouncedButton
          onPress={navNext}
          variant="primary"
          mode="contained"
          title={loading ? 'Checking Address' : 'Start Watching'}
          disabled={loading || !address}
        />
      </Box>
    </BackScreen>
  )
}

export default SingInAsAWatcherScreen

const styles = StyleSheet.create({ keyboardAvoidingView: { flex: 1 } })

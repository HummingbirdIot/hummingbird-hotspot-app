import React, { useState, useCallback, useEffect } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import { KeyboardAvoidingView, StyleSheet } from 'react-native'
import { Icon } from 'react-native-elements'
import { useSelector } from 'react-redux'
import BackScreenContainer from '../../../components/containers/BackScreenContainer'
import Text from '../../../components/texts/Text'
import TextInput from '../../../components/texts/TextInput'
import { DebouncedButton } from '../../../components/buttons/Button'
import Box from '../../../components/boxes/Box'
import { RootNavigationProp } from '../../navigation/rootNavigationTypes'
import { useAppDispatch } from '../../../store/store'
import appSlice from '../../../store/app/appSlice'
import accountSlice, { fetchAccount } from '../../../store/data/accountSlice'
import hotspotsSlice from '../../../store/data/hotspotsSlice'
import useAlert from '../../../utils/hooks/useAlert'
import TouchableOpacityBox from '../../../components/boxes/TouchableOpacityBox'
import { useColors } from '../../../theme/themeHooks'
import { B58Address } from '../../../store/txns/txnsTypes'
import { RootState } from '../../../store/rootReducer'

const addresses = [
  '13dSn1UkygFggDtaq7ePn1UbhxFDh41zAJkS7whhKec2Df24Beg',
  '13YxjCpiGrbDtbthrPAH2zrJKCk5UajQHJRfqtSSmqTE8924Q65',
]

const SingInAsAWatcherScreen = () => {
  const { t } = useTranslation()
  const nav = useNavigation<RootNavigationProp>()
  const { showOKAlert } = useAlert()
  const dispatch = useAppDispatch()
  const [checking, setCheckState] = useState(false)
  const [address, setAddress] = useState<B58Address>('')
  const { primaryText } = useColors()
  const { fetchAccountStatus, account } = useSelector(
    (state: RootState) => state.account,
  )

  const handleClose = useCallback(() => {
    nav.pop()
  }, [nav])

  useEffect(() => {
    if (checking) {
      if (fetchAccountStatus === 'pending' || fetchAccountStatus === 'idle')
        return
      setCheckState(false)
      if (fetchAccountStatus === 'fulfilled') {
        if (account?.address === address) {
          if (account.balance) {
            nav.pop()
            dispatch(hotspotsSlice.actions.signOut())
            dispatch(accountSlice.actions.reset())
            dispatch(appSlice.actions.enableWatchMode(account?.address))
          } else {
            // console.log('fetchAccountFulfilled', account)
            showOKAlert({
              titleKey: 'Address Invalid',
              messageKey: 'The address you entered is not an account address.',
            })
          }
        } else {
          showOKAlert({
            titleKey: 'Address Invalid',
            messageKey:
              'The address you entered is invalid, please check it carefully.',
          })
        }
      } else if (fetchAccountStatus === 'rejected') {
        showOKAlert({
          titleKey: 'Address Invalid',
          messageKey:
            'The address you entered is invalid, please check it carefully.',
        })
      }
    }
  }, [
    account,
    account?.address,
    address,
    checking,
    dispatch,
    fetchAccountStatus,
    nav,
    showOKAlert,
  ])

  const navNext = useCallback(async () => {
    if (address) {
      setCheckState(true)
      dispatch(fetchAccount({ address }))
    }
  }, [address, dispatch])

  return (
    <BackScreenContainer onClose={handleClose}>
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
                'Sign in as a watcher by typing in an address of a helium account, you will be able to watch the data of this account.',
              )}
            </Text>
            <Text
              variant="body3"
              textAlign="center"
              marginBottom="xl"
              maxFontSizeMultiplier={1.2}
            >
              {t(
                'Under the WATCHING MODE, however, you will not be allowed to sumbit transactions.',
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
              opacity={fetchAccountStatus === 'pending' ? 0.6 : 1}
              editable={fetchAccountStatus !== 'pending'}
            />
          </Box>
          <Box
            flexDirection="row"
            marginVertical="m"
            marginHorizontal="n_s"
            justifyContent="space-between"
          >
            {addresses.map((addr: B58Address) => (
              <TouchableOpacityBox
                key={addr}
                flex={2}
                height={50}
                backgroundColor="surface"
                margin="s"
                borderRadius="s"
                justifyContent="center"
                onPress={() =>
                  fetchAccountStatus === 'pending' || setAddress(addr)
                }
              >
                <Text color="surfaceText" textAlign="center">
                  Address {addr.slice(addr.length - 4).toUpperCase()}
                </Text>
              </TouchableOpacityBox>
            ))}
            <TouchableOpacityBox
              flex={1}
              height={50}
              backgroundColor="surface"
              margin="s"
              borderRadius="s"
              justifyContent="center"
              onPress={() =>
                nav.push('ScanQRCode', {
                  title: t('Scan Account Address'),
                  pattern: /[A-z0-9]{51}/i,
                  callback: setAddress,
                })
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
          title={
            fetchAccountStatus === 'pending'
              ? 'Checking Address'
              : 'Start Watching'
          }
          disabled={fetchAccountStatus === 'pending' || !address}
        />
      </Box>
    </BackScreenContainer>
  )
}

export default SingInAsAWatcherScreen

const styles = StyleSheet.create({ keyboardAvoidingView: { flex: 1 } })

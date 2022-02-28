import React, { useState, useCallback } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import { KeyboardAvoidingView, StyleSheet } from 'react-native'
import BackScreen from '../../components/BackScreen'
import Text from '../../components/Text'
import TextInput from '../../components/TextInput'
import { DebouncedButton } from '../../components/Button'
import Box from '../../components/Box'
import { RootNavigationProp } from '../navigation/naviTypes'
import { useAppDispatch } from '../../store/store'
import appSlice from '../../store/app/appSlice'

// type Route = RouteProp<HotspotSetupStackParamList, 'EnterExplorationCodeScreen'>
const EnterExplorationCodeScreen = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { t } = useTranslation()
  const nav = useNavigation<RootNavigationProp>()
  const dispatch = useAppDispatch()
  const [xpcode, setXPCode] = useState('')

  const handleClose = useCallback(() => {
    nav.pop()
  }, [nav])

  const navNext = useCallback(async () => {
    dispatch(
      appSlice.actions.storeWalletLinkToken(
        'eyJ0aW1lIjoxNjQ1MDAwNDE5LCJhZGRyZXNzIjoiMTN1TTdndFZ4UFI1N1AzdWU5azVtS2ZlWURmZmZlc1o4b25naURBZGtFTHlXODN6bkJlIiwicmVxdWVzdEFwcElkIjoib3JnLm1ha2VyLmh1bW1pbmdiaXJkIiwic2lnbmluZ0FwcElkIjoiY29tLmhlbGl1bS5tb2JpbGUud2FsbGV0IiwiY2FsbGJhY2tVcmwiOiJodW1taW5nYmlyZHNjaGVtZTovLyIsImFwcE5hbWUiOiJIdW1taW5nYmlyZCIsInNpZ25hdHVyZSI6ImwxNWh2b0s4VkxkclE5Nko0YjZqWHNZWVBxTW8vVDY5TVlld1VSMFAvT0NkSzhXNm13bG96TEk0dXEvMTRDa1ZyN1RZVEx5UWwzS0Y1L3VBZ2QvM0J3PT0ifQ==',
      ),
    )
  }, [dispatch])

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
              variant="body2"
              textAlign="center"
              maxFontSizeMultiplier={1.2}
            >
              Type in the Exploration Code you got from Hummingbird or its
              agent, you would be able to browser the views of this app without
              a helium wallet account.
            </Text>
            <Text
              variant="body2"
              textAlign="center"
              marginBottom="xl"
              maxFontSizeMultiplier={1.2}
            >
              You will, however, only be allowed visiting under the VIEWONLY
              MODE, in which you cannot sumbit any transaction.
            </Text>
          </Box>
          <TextInput
            padding="m"
            variant="regular"
            placeholder="Exploration Code"
            onChangeText={setXPCode}
            value={xpcode}
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
        />
      </Box>
    </BackScreen>
  )
}

export default EnterExplorationCodeScreen

const styles = StyleSheet.create({ keyboardAvoidingView: { flex: 1 } })

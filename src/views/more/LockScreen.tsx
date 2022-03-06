import React, { memo, useCallback, useEffect } from 'react'
import { Alert } from 'react-native'
import { useTranslation } from 'react-i18next'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { useAsync } from 'react-async-hook'
import { useStateWithCallbackLazy } from 'use-state-with-callback'
import * as LocalAuthentication from 'expo-local-authentication'
import {
  RootNavigationProp,
  RootStackParamList,
} from '../navigation/rootNavigationTypes'
import { getSecureItem } from '../../utils/secureData'
import ConfirmPinView from '../../components/pads/ConfirmPinView'
import { SettingsNavigationProp } from '../main/settings/settingsNavigationTypes'
import { useAppDispatch } from '../../store/store'
import appSlice from '../../store/app/appSlice'
import SafeAreaBox from '../../components/boxes/SafeAreaBox'

type Route = RouteProp<RootStackParamList, 'LockScreen'>

const LockScreen = () => {
  const { t } = useTranslation()
  const {
    params: { lock: shouldLock, requestType },
  } = useRoute<Route>()
  const rootNav = useNavigation<RootNavigationProp>()
  const moreNav = useNavigation<SettingsNavigationProp>()
  const [locked, setLocked] = useStateWithCallbackLazy(shouldLock)
  const dispatch = useAppDispatch()

  const { result: pin } = useAsync(getSecureItem, ['settings.userPin'])

  const handleSuccess = useCallback(() => {
    if (shouldLock) {
      setLocked(false, () => {
        dispatch(appSlice.actions.lock(false))
        if (rootNav.canGoBack()) {
          rootNav.goBack()
        }
      })
    } else {
      moreNav.navigate('SettingsScreen', {
        pinVerifiedFor: requestType,
      })
    }
  }, [shouldLock, requestType, setLocked, dispatch, rootNav, moreNav])

  const handleSignOut = useCallback(() => {
    Alert.alert(
      t('more.sections.app.signOutAlert.title'),
      t('more.sections.app.signOutAlert.body'),
      [
        {
          text: t('more.sections.app.signOut'),
          style: 'destructive',
          onPress: () => {
            dispatch(appSlice.actions.unlinkAccount())
          },
        },
        {
          text: t('generic.cancel'),
          style: 'cancel',
        },
      ],
    )
  }, [t, dispatch])

  const handleCancel = useCallback(() => {
    if (shouldLock) {
      handleSignOut()
    } else if (rootNav.canGoBack()) {
      rootNav.goBack()
    }
  }, [handleSignOut, rootNav, shouldLock])

  useEffect(() => {
    const unsubscribe = rootNav.addListener('beforeRemove', (e) => {
      if (locked) e.preventDefault()
    })

    return unsubscribe
  }, [rootNav, locked])

  useEffect(() => {
    const localAuth = async () => {
      const hasHardware = await LocalAuthentication.hasHardwareAsync()
      const isEnrolled = await LocalAuthentication.isEnrolledAsync()
      if (!isEnrolled || !hasHardware) return

      const { success } = await LocalAuthentication.authenticateAsync()
      if (success) handleSuccess()
    }

    localAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <SafeAreaBox backgroundColor="primaryBackground" flex={1}>
      <ConfirmPinView
        originalPin={pin || ''}
        title={t('auth.title')}
        subtitle={t('auth.enter_current')}
        pinSuccess={handleSuccess}
        onCancel={handleCancel}
        clearable={requestType === 'unlock'}
      />
    </SafeAreaBox>
  )
}

export default memo(LockScreen)

import { useCallback } from 'react'
import { Linking, Platform } from 'react-native'
import { useSelector } from 'react-redux'
import { WalletLink } from '@helium/react-native-sdk'
import { getBundleId } from 'react-native-device-info'
import { RootState } from '../../store/rootReducer'
import hotspotsSlice from '../../store/data/hotspotsSlice'
import accountSlice from '../../store/data/accountSlice'
import appSlice from '../../store/app/appSlice'
import { B58Address } from '../../store/txns/txnsTypes'
import { useAppDispatch } from '../../store/store'

import viewSlice from '../../store/view/viewSlice'

const useAccountsMgr = () => {
  const dispatch = useAppDispatch()
  const { accountAddress } = useSelector((state: RootState) => state.app.user)

  const closeAccountsBar = useCallback(
    () => dispatch(viewSlice.actions.setAccountsBarVisible(false)),
    [dispatch],
  )
  const linkWallet = useCallback(
    (app: WalletLink.DelegateApp) => async () => {
      closeAccountsBar()
      try {
        const url = WalletLink.createWalletLinkUrl({
          universalLink:
            Platform.OS === 'android' ? app.urlScheme : app.universalLink,
          requestAppId: getBundleId(),
          callbackUrl: 'hummingbirdscheme://',
          appName: 'Hummingbird',
        })

        Linking.openURL(url)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error)
      }
    },
    [closeAccountsBar],
  )

  const watchAccount = useCallback(
    (address: B58Address) => {
      if (address === accountAddress) {
        closeAccountsBar()
      } else {
        dispatch(hotspotsSlice.actions.signOut())
        dispatch(accountSlice.actions.reset())
        dispatch(appSlice.actions.enableWatchMode(address))
        closeAccountsBar()
      }
    },
    [accountAddress, dispatch, closeAccountsBar],
  )

  const asOwner = useCallback(() => {
    dispatch(hotspotsSlice.actions.signOut())
    dispatch(accountSlice.actions.reset())
    dispatch(appSlice.actions.asOwner())
    closeAccountsBar()
  }, [dispatch, closeAccountsBar])

  return {
    closeAccountsBar,
    linkWallet,
    asOwner,
    watchAccount,
  }
}

export default useAccountsMgr

import React, { memo, useCallback, useState } from 'react'
import { Linking, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { FlatList } from 'react-native-gesture-handler'
import { useSelector } from 'react-redux'
import { useNavigation } from '@react-navigation/native'
import { useAsync } from 'react-async-hook'
import { WalletLink } from '@helium/react-native-sdk'
import { getBundleId } from 'react-native-device-info'
import Box from '../boxes/Box'
import { RootState } from '../../store/rootReducer'
import { RootNavigationProp } from '../../views/navigation/rootNavigationTypes'
import hotspotsSlice from '../../store/data/hotspotsSlice'
import accountSlice from '../../store/data/accountSlice'
import appSlice, { WatchingAddress } from '../../store/app/appSlice'
import { getLinkedAddress } from '../../utils/secureData'
import { B58Address } from '../../store/txns/txnsTypes'
import { useAppDispatch } from '../../store/store'

import AccountsListItem from '../lists/AccountsListItem'
import AccountCard from '../cards/AccountCard'
import AccountListHeader from './AccountListHeader'

const AccountsView = ({ handleClose }: { handleClose: () => void }) => {
  const { t } = useTranslation()
  const navigation = useNavigation<RootNavigationProp>()
  const dispatch = useAppDispatch()
  const [ownedAddress, setOwnedAddress] = useState('')
  const [addresses, setAddresses] = useState<WatchingAddress[]>([])
  const { bottom } = useSafeAreaInsets()

  const { walletLinkToken, watchingAddresses, accountAddress } = useSelector(
    (state: RootState) => state.app.user,
  )
  const [delegateApp] = WalletLink.delegateApps

  useAsync(async () => {
    if (walletLinkToken) {
      const address = await getLinkedAddress()
      if (address) {
        setOwnedAddress(address)
        setAddresses(
          watchingAddresses.filter((addr) => addr.address !== address),
        )
      }
    } else {
      setAddresses(watchingAddresses)
    }
  }, [walletLinkToken, watchingAddresses])

  const handleAppSelection = useCallback(
    (app: WalletLink.DelegateApp) => async () => {
      try {
        const url = WalletLink.createWalletLinkUrl({
          universalLink:
            Platform.OS === 'android' ? app.urlScheme : app.universalLink,
          requestAppId: getBundleId(),
          callbackUrl: 'hummingbirdscheme://',
          appName: 'Hummingbird',
        })
        handleClose()
        Linking.openURL(url)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error)
      }
    },
    [handleClose],
  )

  const switchWatchingAccount = useCallback(
    (address: B58Address) => {
      if (address === accountAddress) {
        handleClose()
      } else {
        dispatch(hotspotsSlice.actions.signOut())
        dispatch(accountSlice.actions.reset())
        dispatch(appSlice.actions.enableWatchMode(address))
        handleClose()
      }
    },
    [accountAddress, dispatch, handleClose],
  )

  const asOwner = useCallback(() => {
    dispatch(hotspotsSlice.actions.signOut())
    dispatch(accountSlice.actions.reset())
    dispatch(appSlice.actions.asOwner())
    handleClose()
  }, [dispatch, handleClose])

  const renderItem = ({ item }: { item: WatchingAddress }) => (
    <AccountsListItem
      data={item}
      isCurrent={item.address === accountAddress}
      onSelect={switchWatchingAccount}
    />
  )

  return (
    <>
      <AccountListHeader
        icon="payment"
        action={
          ownedAddress
            ? {
                icon: 'swap-vertical-circle',
                handler: handleAppSelection(delegateApp),
              }
            : undefined
        }
      >
        {t('My Account')}
      </AccountListHeader>
      <Box>
        {ownedAddress ? (
          <>
            <AccountCard.Collapsed
              data={{
                alias: 'Linked as:',
                address: ownedAddress,
              }}
              isCurrent={ownedAddress === accountAddress}
              icon={ownedAddress === accountAddress ? 'verified' : 'bedtime'}
              onPress={asOwner}
            />
            <AccountCard.SingOut />
          </>
        ) : (
          <AccountCard.LinkButton onPress={handleAppSelection(delegateApp)} />
        )}
      </Box>
      <AccountListHeader
        icon="visibility"
        action={{
          icon: 'add-circle',
          handler: () => {
            handleClose()
            navigation.navigate('AddWatchingAccount')
          },
        }}
      >
        {t('Watching')}
      </AccountListHeader>
      <FlatList
        data={addresses}
        renderItem={renderItem}
        contentContainerStyle={{
          paddingBottom: bottom,
        }}
      />
    </>
  )
}

export default memo(AccountsView)

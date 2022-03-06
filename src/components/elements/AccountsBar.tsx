import React, { memo, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { FlatList } from 'react-native-gesture-handler'
import { useSelector } from 'react-redux'
import { useNavigation } from '@react-navigation/native'
import { useAsync } from 'react-async-hook'
import { WalletLink } from '@helium/react-native-sdk'
import Box from '../boxes/Box'
import { RootState } from '../../store/rootReducer'
import { RootNavigationProp } from '../../views/navigation/rootNavigationTypes'
import { WatchingAddress } from '../../store/app/appSlice'
import { getLinkedAddress } from '../../utils/secureData'

import AccountsListItem from '../lists/AccountsListItem'
import AccountCard from '../cards/AccountCard'
import AccountListHeader from './AccountListHeader'
import useAccountsMgr from '../../utils/hooks/useAccountsMgr'

const AccountsView = () => {
  const { t } = useTranslation()
  const navigation = useNavigation<RootNavigationProp>()
  const [ownedAddress, setOwnedAddress] = useState('')
  const [addresses, setAddresses] = useState<WatchingAddress[]>([])
  const { bottom } = useSafeAreaInsets()

  const { walletLinkToken, watchingAddresses, accountAddress } = useSelector(
    (state: RootState) => state.app.user,
  )

  const [delegateApp] = WalletLink.delegateApps

  const { closeAccountsBar, linkWallet, asOwner } = useAccountsMgr()

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

  const renderItem = ({ item }: { item: WatchingAddress }) => (
    <AccountsListItem data={item} isCurrent={item.address === accountAddress} />
  )

  return (
    <>
      <AccountListHeader
        icon="payment"
        action={
          ownedAddress
            ? {
                icon: 'swap-vertical-circle',
                handler: linkWallet(delegateApp),
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
              onPress={() => asOwner(ownedAddress)}
            />
            <AccountCard.SingOut />
          </>
        ) : (
          <AccountCard.LinkButton onPress={linkWallet(delegateApp)} />
        )}
      </Box>
      <AccountListHeader
        icon="visibility"
        action={{
          icon: 'add-circle',
          handler: () => {
            closeAccountsBar()
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

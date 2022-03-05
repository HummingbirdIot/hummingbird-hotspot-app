import React, { memo, useCallback, useState } from 'react'
import { Linking, Platform } from 'react-native'
import { Icon } from 'react-native-elements'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { FlatList } from 'react-native-gesture-handler'
import { useSelector } from 'react-redux'
import { useNavigation } from '@react-navigation/native'
import { useAsync } from 'react-async-hook'
import { WalletLink } from '@helium/react-native-sdk'
import { getBundleId } from 'react-native-device-info'
import { useColors } from '../../theme/themeHooks'
import Box from '../boxes/Box'
import Text from '../texts/Text'
import { RootState } from '../../store/rootReducer'
import { RootNavigationProp } from '../../views/navigation/rootNavigationTypes'
import appSlice, { WatchingAddress } from '../../store/app/appSlice'
import { getLinkedAddress } from '../../store/app/secureData'
import TouchableOpacityBox from '../boxes/TouchableOpacityBox'
import { B58Address } from '../../store/txns/txnsTypes'
import { useAppDispatch } from '../../store/store'
import hotspotsSlice from '../../store/data/hotspotsSlice'
import { truncateAddress } from '../../utils/formatter'
import AccountsListItem from '../lists/AccountsListItem'

const AccountsView = ({ handleClose }: { handleClose: () => void }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { t } = useTranslation()
  const navigation = useNavigation<RootNavigationProp>()
  const dispatch = useAppDispatch()
  const [ownedAddress, setOwnedAddress] = useState('')
  const [addresses, setAddresses] = useState<WatchingAddress[]>([])
  const { bottom } = useSafeAreaInsets()

  const { primaryText } = useColors()

  const { walletLinkToken, watchingAddresses, accountAddress } = useSelector(
    (state: RootState) => state.app.user,
  )
  const [delegateApp] = WalletLink.delegateApps
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

        Linking.openURL(url)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error)
      }
    },
    [],
  )

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

  const switchWatchingAccount = (address: B58Address) => {
    if (address === accountAddress) {
      handleClose()
    } else {
      dispatch(hotspotsSlice.actions.signOut())
      dispatch(appSlice.actions.enableWatchMode(address))
      handleClose()
    }
  }

  const renderItem = ({ item }: { item: WatchingAddress }) => (
    <AccountsListItem
      data={item}
      isCurrent={item.address === accountAddress}
      onSelect={switchWatchingAccount}
    />
  )

  return (
    <>
      <Box
        margin="m"
        padding="s"
        backgroundColor="primaryBackground"
        borderRadius="m"
      >
        <Text variant="h4">My Account</Text>
      </Box>
      <Box padding="m">
        {ownedAddress ? (
          <Text variant="body1">
            Linked as: {truncateAddress(ownedAddress, 4, 4)}
          </Text>
        ) : (
          <TouchableOpacityBox>
            <Text variant="body1">Link now</Text>
            <Icon
              name="link"
              color={primaryText}
              tvParallaxProperties={undefined}
              onPress={handleAppSelection(delegateApp)}
            />
          </TouchableOpacityBox>
        )}
      </Box>
      <Box
        margin="m"
        padding="s"
        backgroundColor="primaryBackground"
        borderRadius="m"
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Text variant="h4">Watching</Text>
        <Icon
          name="add"
          color={primaryText}
          tvParallaxProperties={undefined}
          onPress={() => {
            handleClose()
            navigation.navigate('AddWatchingAccount')
          }}
        />
      </Box>
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

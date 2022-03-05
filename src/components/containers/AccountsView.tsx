/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { GestureResponderEvent, Linking, Platform } from 'react-native'
import { ColorSchemeName, useColorScheme } from 'react-native-appearance'
import { Icon } from 'react-native-elements'
import { Edge, useSafeAreaInsets } from 'react-native-safe-area-context'
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

const AccountsView = ({ handleClose }: { handleClose: () => void }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { t } = useTranslation()
  const navigation = useNavigation<RootNavigationProp>()
  const colorScheme: ColorSchemeName = useColorScheme()
  const dispatch = useAppDispatch()
  const [modalVisible, setModalVisible] = useState(false)
  const [ownedAddress, setOwnedAddress] = useState('')
  const [addresses, setAddresses] = useState<WatchingAddress[]>([])
  const { bottom } = useSafeAreaInsets()

  const { primaryText } = useColors()

  const { isWatcher, walletLinkToken, watchingAddresses, accountAddress } =
    useSelector((state: RootState) => state.app.user)
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
    if (address !== accountAddress) {
      dispatch(hotspotsSlice.actions.signOut())
      dispatch(appSlice.actions.enableWatchMode(address))
      handleClose()
    }
  }

  const renderItem = ({ item }: { item: WatchingAddress }) => {
    return (
      <Box>
        <TouchableOpacityBox
          padding="m"
          onPress={() => switchWatchingAccount(item.address)}
        >
          <Text variant="body1">{item.alias}</Text>
          <Text variant="body3">{item.address}</Text>
        </TouchableOpacityBox>
      </Box>
    )
  }

  return (
    <>
      <Box padding="m">
        <Text variant="h4">Linked</Text>
      </Box>
      <Box padding="m">
        {ownedAddress ? (
          <Text variant="body1">Linked as: {ownedAddress}</Text>
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
      <Box padding="m">
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

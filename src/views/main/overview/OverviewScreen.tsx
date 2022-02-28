import React, { memo, useEffect, useMemo, useState } from 'react'
import QRCode from 'react-qr-code'
import { useAsync } from 'react-async-hook'
import { Account } from '@helium/http'
import { useDebouncedCallback } from 'use-debounce/lib'
import { Button } from 'react-native-elements/dist/buttons/Button'
import { getAddress } from '../../../utils/secureAccount'
import { useSpacing } from '../../../theme/themeHooks'
import { Spacing } from '../../../theme/theme'
import Box from '../../../components/Box'
import { getAccount } from '../../../utils/clients/appDataClient'
import Text from '../../../components/Text'
import useCurrency from '../../../utils/hooks/useCurrency'
import { fetchCurrentPrices } from '../../../store/helium/heliumSlice'
import { useAppDispatch } from '../../../store/store'
import { fetchTxnsPending } from '../../../store/txns/txnsHelper'
import RewardsStatistics from '../../../widgets/main/RewardsStatistics'

import TabViewContainer from '../../../widgets/main/TabViewContainer'

const QR_CONTAINER_SIZE = 146

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const OverviewScreen = ({ navigation }: any) => {
  const spacing = useSpacing()
  const padding = useMemo(() => 'm' as Spacing, [])
  const [address, setAccountAddress] = useState('')
  const [account, setAccount] = useState<Account>()
  const [fiat, setFiat] = useState<string>('loading...')
  const dispatch = useAppDispatch()

  const {
    hntBalanceToDisplayVal,
    // hntToDisplayVal,
    // networkTokensToDataCredits,
    // toggleConvertHntToCurrency,
  } = useCurrency()

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // const currentPrices = useSelector(
  //   (state: RootState) => state.helium.currentPrices,
  // )

  // const pendingTransactions = useSelector(
  //   (state: RootState) => state.txns.pendingAndFailded,
  // )

  useAsync(async () => {
    // console.log('OverviewScreen::account:', account)
    if (account?.balance) {
      // console.log(
      //   'OverviewScreen::currency::funcs:',
      //   await hntToDisplayVal(account.balance.floatBalance),
      //   await hntBalanceToDisplayVal(account.balance),
      //   await networkTokensToDataCredits(account.balance),
      //   (await networkTokensToDataCredits(account.balance)).toString(),
      //   (
      //     (await networkTokensToDataCredits(account.balance)).floatBalance /
      //     100000
      //   ).toFixed(2),
      // )
      setFiat((await hntBalanceToDisplayVal(account.balance)).toString())
    }
  }, [account])

  useEffect(() => {
    getAccount(address)
      .then(setAccount)
      .then(() => dispatch(fetchCurrentPrices()))
    // .then(() =>
    //   dispatch(
    //     updateSetting({
    //       key: 'currencyType',
    //       value: 'CNY',
    //     }),
    //   ),
    // )
  }, [address, dispatch])

  useEffect(() => {
    dispatch(fetchTxnsPending(address)).catch((error) => console.error(error))
  }, [address, dispatch])

  // useEffect(() => {
  //   console.log('pendingTransactions', pendingTransactions)
  // }, [pendingTransactions])

  useAsync(async () => {
    const aacc = await getAddress()
    // console.log('OverviewScreen::address:', aacc)
    setAccountAddress(aacc || '')
  }, [])

  const naviToActivityScreen = () => navigation.navigate('ActvityScreen')
  const gotoActivityScreen = useDebouncedCallback(naviToActivityScreen, 700, {})

  return (
    <TabViewContainer title="Account">
      <Box flex={1} padding="l">
        <Text>address: {address}</Text>
        <Text>
          balance: {account?.balance?.floatBalance || '0'}{' '}
          {account?.balance?.type.ticker}({fiat})
        </Text>
        <Text>
          dcBalance: {account?.dcBalance?.floatBalance || 0}{' '}
          {account?.dcBalance?.type.ticker}
        </Text>
        <Text>
          stakedBalance: {account?.stakedBalance?.floatBalance || 0}{' '}
          {account?.stakedBalance?.type.ticker}
        </Text>
        <Text>hotspotCount: {account?.hotspotCount || 0}</Text>
        <Text>validatorCount: {account?.validatorCount || 0}</Text>
      </Box>
      <Box flex={1} flexDirection="row" justifyContent="center">
        <QRCode
          size={QR_CONTAINER_SIZE - 2 * spacing[padding]}
          value={address}
        />
      </Box>
      <Box flex={2} padding="l">
        <Button
          onPress={gotoActivityScreen.callback}
          buttonStyle={{
            backgroundColor: 'blue',
            marginBottom: 10,
          }}
          title="View Activity"
        />
        <Box flex={1} backgroundColor="grayBoxLight" borderRadius="l">
          {address ? (
            <RewardsStatistics address={address} resource="accounts" />
          ) : null}
        </Box>
      </Box>
    </TabViewContainer>
  )
}

export default memo(OverviewScreen)

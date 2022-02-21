import React, { memo, useEffect, useMemo, useState } from 'react'
import QRCode from 'react-qr-code'
import { useAsync } from 'react-async-hook'
import { Account } from '@helium/http'
import { SafeAreaView } from 'react-native-safe-area-context'
// import { useSelector } from 'react-redux'
import { getAddress } from '../../../utils/secureAccount'
import { useSpacing } from '../../../theme/themeHooks'
import { Spacing } from '../../../theme/theme'
import Box from '../../../components/Box'
import { getAccount } from '../../../utils/clients/appDataClient'
import Text from '../../../components/Text'
import useCurrency from '../../../utils/hooks/useCurrency'
// import { RootState } from '../../../store/rootReducer'
import { fetchCurrentPrices } from '../../../store/helium/heliumSlice'
import { useAppDispatch } from '../../../store/store'
import { updateSetting } from '../../../store/app/appSlice'
import { fetchTxnsPending } from '../../../store/txns/txnsHelper'
import RewardsStatistics from '../../../widgets/main/RewardsStatistics'

const QR_CONTAINER_SIZE = 146

const OverviewScreen = () => {
  const spacing = useSpacing()
  const padding = useMemo(() => 'm' as Spacing, [])
  const [accountAddress, setAccountAddress] = useState('')
  const [account, setAccount] = useState<Account>()
  const dispatch = useAppDispatch()

  const {
    hntBalanceToDisplayVal,
    hntToDisplayVal,
    networkTokensToDataCredits,
    toggleConvertHntToCurrency,
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
      console.log(
        'OverviewScreen::currency::funcs:',
        await hntToDisplayVal(account.balance.floatBalance),
        await hntBalanceToDisplayVal(account.balance),
        await networkTokensToDataCredits(account.balance),
        (await networkTokensToDataCredits(account.balance)).toString(),
        (
          (await networkTokensToDataCredits(account.balance)).floatBalance /
          100000
        ).toFixed(2),
      )
    }
  }, [account])

  useEffect(() => {
    getAccount(accountAddress)
      .then(setAccount)
      .then(() => dispatch(fetchCurrentPrices()))
      .then(toggleConvertHntToCurrency)
      .then(toggleConvertHntToCurrency)
      .then(() =>
        dispatch(
          updateSetting({
            key: 'currencyType',
            value: 'CNY',
          }),
        ),
      )
  }, [accountAddress, dispatch, toggleConvertHntToCurrency])

  useEffect(() => {
    dispatch(fetchTxnsPending(accountAddress)).catch((error) =>
      console.error(error),
    )
  }, [accountAddress, dispatch])

  // useEffect(() => {
  //   console.log('pendingTransactions', pendingTransactions)
  // }, [pendingTransactions])

  useAsync(async () => {
    const aacc = await getAddress()
    // console.log('OverviewScreen::accountAddress:', aacc)
    setAccountAddress(aacc || '')
  }, [])

  return (
    <Box flex={1}>
      <SafeAreaView style={{ flex: 1 }}>
        <Box flex={1} padding="l">
          <Text>address: {accountAddress}</Text>
          <Text>
            balance: {account?.balance?.floatBalance || '0'}{' '}
            {account?.balance?.type.ticker}
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
            value={accountAddress}
          />
        </Box>
        <Box flex={2} padding="l">
          <Box flex={1} backgroundColor="grayBoxLight" borderRadius="l">
            {accountAddress ? (
              <RewardsStatistics address={accountAddress} resource="accounts" />
            ) : null}
          </Box>
          <Text>hotspotCount: {account?.hotspotCount || 0}</Text>
        </Box>
      </SafeAreaView>
    </Box>
  )
}

export default memo(OverviewScreen)

import React, { memo, useEffect, useMemo, useState } from 'react'
import QRCode from 'react-qr-code'
import { useAsync } from 'react-async-hook'
import { Account } from '@helium/http'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useSelector } from 'react-redux'
import { getAddress } from '../../../utils/secureAccount'
import { useSpacing } from '../../../theme/themeHooks'
import { Spacing } from '../../../theme/theme'
import Box from '../../../components/Box'
import { getAccount } from '../../../utils/clients/appDataClient'
import Text from '../../../components/Text'
import useCurrency from '../../../utils/hooks/useCurrency'
import { RootState } from '../../../store/rootReducer'
import { fetchCurrentPrices } from '../../../store/helium/heliumDataSlice'
import { useAppDispatch } from '../../../store/store'
import { updateSetting } from '../../../store/account/accountSlice'

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

  const currentPrices = useSelector(
    (state: RootState) => state.heliumData.currentPrices,
  )

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
    getAccount(accountAddress).then(setAccount)
    dispatch(fetchCurrentPrices()).then(() => {
      toggleConvertHntToCurrency().then(() => {
        toggleConvertHntToCurrency()
        dispatch(
          updateSetting({
            key: 'currencyType',
            value: 'CNY',
          }),
        )
      })
    })
  }, [accountAddress, dispatch, toggleConvertHntToCurrency])

  useEffect(() => {
    // console.log('OverviewScreen::currentPrices:', currentPrices)
  }, [currentPrices])

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
        <Box flex={2} justifyContent="center" alignItems="center" padding="l" />
      </SafeAreaView>
    </Box>
  )
}

export default memo(OverviewScreen)

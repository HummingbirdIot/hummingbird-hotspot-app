import React, { memo, useEffect, useState } from 'react'
import { useAsync } from 'react-async-hook'
import { Account } from '@helium/http'
import { useDebouncedCallback } from 'use-debounce/lib'
import { ScrollView } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { getAddress } from '../../../store/app/secureData'
import Box from '../../../components/Box'
import { getAccount } from '../../../utils/clients/appDataClient'
import { fetchCurrentPrices } from '../../../store/hnt/hntSlice'
import { useAppDispatch } from '../../../store/store'
import { fetchTxnsPending } from '../../../store/txns/txnsHelper'
import RewardsStatistics from '../../../widgets/main/RewardsStatistics'

import TabViewContainer from '../../../widgets/main/TabViewContainer'
import appSlice from '../../../store/app/appSlice'
import AssetsBoard from '../../../widgets/main/assets/AssetsBoard'
import Dashboard from '../../../widgets/main/assets/Dashboard'
import { RootNavigationProp } from '../../navigation/naviTypes'

const OverviewScreen = () => {
  const navigation = useNavigation<RootNavigationProp>()
  const [address, setAccountAddress] = useState('')
  const [account, setAccount] = useState<Account>()
  const dispatch = useAppDispatch()

  useEffect(() => {
    getAccount(address).then(setAccount)
  }, [address])

  useEffect(() => {
    if (account?.balance) {
      dispatch(
        appSlice.actions.updateBlance(
          account.balance.floatBalance.toString() || '0.00000',
        ),
      )
      dispatch(fetchCurrentPrices())
    }
  }, [account?.balance, address, dispatch])

  useEffect(() => {
    dispatch(fetchTxnsPending(address)).catch((error) => console.error(error))
  }, [address, dispatch])

  useAsync(async () => {
    const aacc = await getAddress()
    // console.log('OverviewScreen::address:', aacc)
    setAccountAddress(aacc || '')
  }, [])

  const naviToActivityScreen = () => navigation.navigate('ActivityScreen')
  const gotoActivityScreen = useDebouncedCallback(naviToActivityScreen, 700, {})

  return (
    <TabViewContainer
      title="Account"
      icons={[
        {
          name: 'insights',
          onPress: gotoActivityScreen.callback,
        },
      ]}
    >
      <Box flex={1}>
        <ScrollView style={{ height: '100%' }}>
          <Box paddingBottom="m">
            <AssetsBoard account={account} />
            <Dashboard account={account} />
          </Box>
          <Box
            backgroundColor="white"
            height={300}
            marginHorizontal="l"
            borderRadius="l"
          >
            {address ? (
              <RewardsStatistics address={address} resource="accounts" />
            ) : null}
          </Box>
        </ScrollView>
      </Box>
    </TabViewContainer>
  )
}

export default memo(OverviewScreen)

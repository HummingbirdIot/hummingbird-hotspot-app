import React, { memo, useEffect } from 'react'
import { useDebouncedCallback } from 'use-debounce/lib'
import { ScrollView } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useSelector } from 'react-redux'
import Box from '../../../components/boxes/Box'
import { fetchCurrentPrices } from '../../../store/hnt/hntSlice'
import { useAppDispatch } from '../../../store/store'
import { fetchTxnsPending } from '../../../store/txns/txnsHelper'
import RewardsStatistics from '../../../components/charts/BarChart/RewardsStatistics'

import TabViewContainer from '../../../components/containers/TabViewContainer'
import appSlice, { fetchAccount } from '../../../store/app/appSlice'
import AssetsBoard from '../../../components/boards/AssetsBoard'
import Dashboard from '../../../components/boards/Dashboard'
import { RootNavigationProp } from '../../navigation/rootNavigationTypes'
import { RootState } from '../../../store/rootReducer'

const AccountScreen = () => {
  const navigation = useNavigation<RootNavigationProp>()
  const { accountAddress: address, account } = useSelector(
    (state: RootState) => state.app.user,
  )
  const dispatch = useAppDispatch()

  useEffect(() => {
    // getAccount(address).then(setAccount)
    if (address) dispatch(fetchAccount({ address }))
  }, [address, dispatch])

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
    if (address)
      dispatch(fetchTxnsPending(address)).catch((error) => console.error(error))
  }, [address, dispatch])

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

export default memo(AccountScreen)

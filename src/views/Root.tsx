import React, { useCallback, useEffect, useMemo, useState } from 'react'
// import { Text } from 'react-native'
import { View, Text } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FullTheme, Header, ThemeProps, withTheme } from 'react-native-elements'
import QRCode from 'react-qr-code'

import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAsync } from 'react-async-hook'
import { useSelector } from 'react-redux'
// import { t } from 'i18n-js'
import { useTranslation } from 'react-i18next'
import { Account } from '@helium/http'
import { useSpacing } from '../theme/themeHooks'
import { Spacing } from '../theme/theme'

import { getAddress } from '../utils/secureAccount'
import HotspotDetailChart from './overview/details/HotspotDetailChart'
import { RootState } from '../store/rootReducer'
import { getRewardChartData } from './overview/details/RewardsHelper'
import {
  fetchChartData,
  fetchNetworkHotspotEarnings,
} from '../store/rewards/rewardsSlice'
import { useAppDispatch } from '../store/store'
import { fetchHotspotData } from '../store/hotspotDetails/hotspotDetailsSlice'
import usePrevious from '../utils/usePrevious'
import { getAccount } from '../utils/appDataClient'

// const Root = () => {
//   // const { theme /* , updateTheme, replaceTheme */ } = props
//   const insets = useSafeAreaInsets()
//   console.log('Root::SafeAreaInsets:', insets)

//   return <></>
// }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const HomeScreen = ({ navigation }: any) => {
  const spacing = useSpacing()
  const padding = useMemo(() => 'm' as Spacing, [])
  const [accountAddress, setAccountAddress] = useState('')
  useAsync(async () => {
    const account = await getAddress()
    // console.log('MyLOG::accountAddress:', typeof account, account)
    setAccountAddress(
      account || '13YxjCpiGrbDtbthrPAH2zrJKCk5UajQHJRfqtSSmqTE8924Q65',
    )
  }, [])

  return (
    <View>
      <Header
        // leftComponent={{
        //   icon: 'menu',
        //   color: '#fff',
        //   iconStyle: { color: '#fff' },
        // }}
        centerComponent={{ text: 'Hostpots', style: { color: '#fff' } }}
        rightComponent={{
          icon: 'add',
          color: '#fff',
          onPress: () => navigation.navigate('Details'),
        }}
      />
      <QRCode
        size={QR_CONTAINER_SIZE - 2 * spacing[padding]}
        value={accountAddress}
      />
    </View>
  )
}

const DetailsScreen = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const address = '11YPyV6YZQ2MJ3R8dRpUxSWFwwNkYMXHJNkWBhZSccjaCDVgV2e'
  const hotspotChartData =
    useSelector((state: RootState) => state.rewards.chartData[address]) || {}
  const [timelineValue, setTimelineValue] = useState(7)
  const [timelineIndex, setTimelineIndex] = useState(2)
  const {
    rewards,
    rewardSum,
    rewardsChange,
    loading = true,
  } = hotspotChartData[timelineValue] || {}
  const rewardChartData = useMemo(() => {
    // if (!visible) return []

    const data = getRewardChartData(rewards, timelineValue)
    return data || []
  }, [timelineValue, rewards])

  const networkHotspotEarnings = useSelector(
    (state: RootState) => state.rewards.networkHotspotEarnings.data,
  )
  const networkHotspotEarningsLoaded = useSelector(
    (state: RootState) => state.rewards.networkHotspotEarningsLoaded,
  )
  const onTimelineChanged = useCallback(
    (value, index) => {
      setTimelineValue(value)
      setTimelineIndex(index)

      dispatch(
        fetchChartData({
          address,
          numDays: value,
          resource: 'accounts',
        }),
      )
    },
    [address, dispatch],
  )

  const [account, setAccount] = useState<Account>()

  useEffect(() => {
    getAccount('13YxjCpiGrbDtbthrPAH2zrJKCk5UajQHJRfqtSSmqTE8924Q65').then(
      setAccount,
    )
  }, [address])

  console.log('Root::account:', account)
  console.log('Root::rewardChartData:', rewardChartData)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [listIndex, setListIndex] = useState(-1)
  const prevListIndex = usePrevious(listIndex)
  // load hotspot data
  useEffect(() => {
    if (
      !address ||
      listIndex === 0 ||
      (listIndex === 1 && prevListIndex === 1) ||
      (listIndex === -1 && prevListIndex === -1)
    ) {
      return
    }
    dispatch(fetchHotspotData(address))
    dispatch(fetchNetworkHotspotEarnings())

    dispatch(
      fetchChartData({
        address,
        numDays: timelineValue,
        resource: 'accounts',
      }),
    )
  }, [address, dispatch, listIndex, prevListIndex, timelineValue])

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Details Screen</Text>
      <HotspotDetailChart
        title={t('hotspot_details.reward_title')}
        number={rewardSum?.floatBalance.toFixed(2)}
        change={rewardsChange}
        data={rewardChartData}
        networkHotspotEarnings={networkHotspotEarnings}
        loading={loading || !networkHotspotEarningsLoaded}
        onTimelineChanged={onTimelineChanged}
        timelineIndex={timelineIndex}
        timelineValue={timelineValue}
      />
    </View>
  )
}

const Stack = createNativeStackNavigator()

const QR_CONTAINER_SIZE = 146

const RootNavigator = () => {
  const insets = useSafeAreaInsets()
  console.log('Root::SafeAreaInsets:', insets)

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          options={{ headerShown: false }}
          component={HomeScreen}
        />
        <Stack.Screen name="Details" component={DetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default RootNavigator

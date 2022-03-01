import React, { memo, useEffect, useState } from 'react'
// import QRCode from 'react-qr-code'
import { useAsync } from 'react-async-hook'
import { Account } from '@helium/http'
import { useDebouncedCallback } from 'use-debounce/lib'
import { useSelector } from 'react-redux'
import { isEqual } from 'lodash'
import { Tooltip, Icon } from 'react-native-elements'
import { ScrollView } from 'react-native'
import { getAddress } from '../../../store/app/secureData'
import { useColors } from '../../../theme/themeHooks'
import Box from '../../../components/Box'
import { getAccount } from '../../../utils/clients/appDataClient'
import Text from '../../../components/Text'
import useCurrency from '../../../utils/hooks/useCurrency'
import { fetchCurrentPrices } from '../../../store/hnt/hntSlice'
import { useAppDispatch } from '../../../store/store'
import { fetchTxnsPending } from '../../../store/txns/txnsHelper'
import RewardsStatistics from '../../../widgets/main/RewardsStatistics'

import TabViewContainer from '../../../widgets/main/TabViewContainer'
import { RootState } from '../../../store/rootReducer'
import DashboardItem from './DashboardItem'
import appSlice from '../../../store/app/appSlice'

// const QR_CONTAINER_SIZE = 146

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const OverviewScreen = ({ navigation }: any) => {
  // const spacing = useSpacing()
  // const padding = useMemo(() => 'm' as Spacing, [])
  const currentPrices = useSelector(
    (state: RootState) => state.hnt.currentPrices,
    isEqual,
  )
  const { lastHNTBlance, lastFiatBlance } = useSelector(
    (state: RootState) => state.app.user,
  )
  const { currencyType } = useSelector((state: RootState) => state.app.settings)
  const [address, setAccountAddress] = useState('')
  const [account, setAccount] = useState<Account>()
  const [fiat, setFiat] = useState<string>(lastFiatBlance)
  const dispatch = useAppDispatch()
  const { primaryText, surfaceContrast, surfaceContrastText } = useColors()

  const { hntBalanceToFiatBlance } = useCurrency()

  useAsync(async () => {
    if (account?.balance) {
      setFiat((await hntBalanceToFiatBlance(account.balance)).toString())
    }
  }, [account, currentPrices, currencyType])

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ELTooltip = Tooltip as unknown as any

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
      {/* <Box flex={1} flexDirection="row" justifyContent="center">
        <QRCode
          size={QR_CONTAINER_SIZE - 2 * spacing[padding]}
          value={address}
        />
      </Box> */}
      <Box flex={1}>
        <ScrollView style={{ flex: 1 }}>
          <Box paddingBottom="m">
            <Box paddingTop="l">
              <Box paddingTop="l">
                <Text variant="h1" textAlign="center">
                  {fiat}
                </Text>
                <Text variant="body1" paddingVertical="s" textAlign="center">
                  {lastHNTBlance || '0'} HNT
                </Text>
              </Box>
              <Box
                style={{
                  position: 'absolute',
                  top: 20,
                  right: 20,
                }}
              >
                <ELTooltip
                  popover={
                    <Text
                      variant="body3"
                      style={{ color: surfaceContrastText }}
                    >
                      Prices data source from CoinGecko, please make sure that
                      your mobile could connect to coingecko.com.
                    </Text>
                  }
                  width={240}
                  height={60}
                  backgroundColor={surfaceContrast}
                  withOverlay={false}
                  highlightColor="transparent"
                >
                  <Icon
                    name="help"
                    color={primaryText}
                    size={20}
                    tvParallaxProperties={undefined}
                  />
                </ELTooltip>
              </Box>
            </Box>
            <Box>
              <Box
                padding="m"
                paddingBottom="s"
                flexDirection="row"
                justifyContent="space-around"
              >
                <DashboardItem.Number
                  item="DC Balance"
                  value={account?.dcBalance?.floatBalance.toFixed(4) || '0'}
                />
                <DashboardItem.Number
                  item="Staked Balance"
                  value={account?.stakedBalance?.floatBalance.toFixed(4) || '0'}
                />
              </Box>
              <Box
                flex={1}
                padding="m"
                paddingTop="s"
                flexDirection="row"
                justifyContent="space-around"
              >
                <DashboardItem.Number
                  item="Hotspots"
                  value={(account?.hotspotCount || 0).toString()}
                  onPress={() => navigation.navigate('Hotspots')}
                />
                <DashboardItem.Number
                  item="Validators"
                  value={(account?.validatorCount || 0).toString()}
                />
                <DashboardItem.Icon name="qr-code" onPress={() => {}} />
                <DashboardItem.Icon
                  name="add"
                  onPress={() => navigation.navigate('HotspotSetup')}
                />
              </Box>
            </Box>
          </Box>
          <Box
            flex={1}
            backgroundColor="white"
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

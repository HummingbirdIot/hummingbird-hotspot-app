import React, { memo, useEffect, useMemo, useState } from 'react'
import QRCode from 'react-qr-code'
import { useAsync } from 'react-async-hook'
import { Account } from '@helium/http'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getAddress } from '../../../utils/secureAccount'
import { useSpacing } from '../../../theme/themeHooks'
import { Spacing } from '../../../theme/theme'
import Box from '../../../components/Box'
import { getAccount } from '../../../utils/appDataClient'
import Text from '../../../components/Text'

const QR_CONTAINER_SIZE = 146

const OverviewScreen = () => {
  const spacing = useSpacing()
  const padding = useMemo(() => 'm' as Spacing, [])
  const [accountAddress, setAccountAddress] = useState('')
  const [account, setAccount] = useState<Account>()

  // console.log('Root::account:', account)

  useEffect(() => {
    getAccount(accountAddress).then(setAccount)
  }, [accountAddress])

  useAsync(async () => {
    const aa = await getAddress()
    // console.log('MyLOG::accountAddress:', typeof account, account)
    setAccountAddress(aa || '')
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

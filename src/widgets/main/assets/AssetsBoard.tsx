import React, { memo, useState } from 'react'
import { useAsync } from 'react-async-hook'
import { Account } from '@helium/http'
import { useSelector } from 'react-redux'
import { isEqual } from 'lodash'
import { Tooltip, Icon } from 'react-native-elements'
import { useColors } from '../../../theme/themeHooks'
import Box from '../../../components/Box'
import Text from '../../../components/Text'
import useCurrency from '../../../utils/hooks/useCurrency'
import { RootState } from '../../../store/rootReducer'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ELTooltip = Tooltip as unknown as any

const AssetsBoard = ({ account }: { account?: Account }) => {
  const { primaryText, surfaceContrast, surfaceContrastText } = useColors()
  const { hntBalanceToFiatBlance } = useCurrency()
  const currentPrices = useSelector(
    (state: RootState) => state.hnt.currentPrices,
    isEqual,
  )
  const { lastHNTBlance, lastFiatBlance } = useSelector(
    (state: RootState) => state.app.user,
  )
  const { currencyType } = useSelector((state: RootState) => state.app.settings)
  const [fiat, setFiat] = useState<string>(lastFiatBlance)

  useAsync(async () => {
    if (account?.balance) {
      setFiat((await hntBalanceToFiatBlance(account.balance)).toString())
    }
  }, [account, currentPrices, currencyType])

  return (
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
            <Text variant="body3" style={{ color: surfaceContrastText }}>
              Prices data source from CoinGecko, please make sure that your
              mobile could connect to coingecko.com.
            </Text>
          }
          width={240}
          height={68}
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
  )
}

export default memo(AssetsBoard)

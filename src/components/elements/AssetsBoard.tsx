import React, { memo, useEffect, useState } from 'react'
import { Account } from '@helium/http'
import { useSelector } from 'react-redux'
import { isEqual } from 'lodash'
import { Tooltip, Icon } from 'react-native-elements'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'
import { useAsync } from 'react-async-hook'
import { useColors, useSpacing } from '../../theme/themeHooks'
import Box from '../boxes/Box'
import Text from '../texts/Text'
import useCurrency from '../../utils/hooks/useCurrency'
import { RootState } from '../../store/rootReducer'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ELTooltip = Tooltip as unknown as any

const AssetsBoard = ({ account }: { account?: Account }) => {
  const { primaryText, surfaceContrast, surfaceContrastText } = useColors()
  const spacing = useSpacing()
  const { updateFiatBlance, hntBalanceToFiatBlance } = useCurrency()
  const currentPrices = useSelector(
    (state: RootState) => state.hnt.currentPrices,
    isEqual,
  )
  const { lastHNTBlance, lastFiatBlance } = useSelector(
    (state: RootState) => state.account,
  )
  const earnings =
    useSelector(
      (state: RootState) => state.rewards.earnings[account?.address || ''],
    ) || {}
  const [yesterday] =
    (earnings['7'] || earnings['14'] || earnings['30'])?.rewards || []
  const { currencyType } = useSelector((state: RootState) => state.app.settings)
  const [fiat, setFiat] = useState<string>(lastFiatBlance)
  const [earnedFiat, setEarnedFiat] = useState<string>(lastFiatBlance)

  useEffect(() => {
    if (account?.balance) {
      updateFiatBlance(account.balance)
    }
  }, [currentPrices, currencyType, account?.balance, updateFiatBlance])

  useEffect(() => setFiat(lastFiatBlance), [lastFiatBlance])

  useAsync(async () => {
    const ef = await hntBalanceToFiatBlance(yesterday?.balanceTotal, false, 2)
    setEarnedFiat(ef || `0 ${currencyType || 'USD'}`)
  }, [lastFiatBlance])

  return (
    <Box paddingTop="l">
      <Box paddingTop="l">
        {account ? (
          <Box justifyContent="center">
            <Text variant="h1" textAlign="center">
              {fiat}
            </Text>
            <Text variant="body1" paddingVertical="xs" textAlign="center">
              {lastHNTBlance || '0'} HNT
            </Text>
            <Text variant="body3" paddingBottom="s" textAlign="center">
              + {yesterday?.total || '0'} HNT{' ≈ '}
              {earnedFiat}
            </Text>
          </Box>
        ) : (
          <SkeletonPlaceholder>
            <SkeletonPlaceholder.Item
              width="60%"
              height={40}
              borderRadius={5}
              marginHorizontal="20%"
            />
            <SkeletonPlaceholder.Item
              width="40%"
              height={17}
              borderRadius={5}
              marginVertical={spacing.xs}
              marginHorizontal="30%"
            />
            <SkeletonPlaceholder.Item
              width="50%"
              height={11}
              borderRadius={5}
              marginBottom={spacing.s}
              marginHorizontal="25%"
            />
          </SkeletonPlaceholder>
        )}
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

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/jsx-props-no-spreading */
import React, { memo, useState } from 'react'
import { Icon } from 'react-native-elements'
import { useSelector } from 'react-redux'
import { useAsync } from 'react-async-hook'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'
import { useColors } from '../../theme/themeHooks'
import Box from '../boxes/Box'
import Text from '../texts/Text'
import { RootState } from '../../store/rootReducer'
import { WatchingAddress } from '../../store/app/appSlice'
import TouchableOpacityBox from '../boxes/TouchableOpacityBox'
import { useAppDispatch } from '../../store/store'
import { getAccount } from '../../utils/clients/appDataClient'
import { fetchChartData } from '../../store/data/rewardsSlice'
import { truncateAddress } from '../../utils/formatter'

import HNT from '../../assets/images/hnt.svg'

export const flexProps = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
} as unknown

export const boxProps = {
  paddingHorizontal: 's',
  paddingVertical: 'xs',
  borderLeftWidth: 4,
  backgroundColor: 'primaryBackground',
  borderRadius: 's',
} as unknown

const Collapsed = ({
  data,
  isCurrent,
  onPress,
}: {
  data: WatchingAddress
  isCurrent: boolean
  onPress: () => void
}) => {
  const { blueMain, primaryText } = useColors()
  return (
    <Box paddingVertical="s" padding="m">
      <TouchableOpacityBox
        {...flexProps}
        {...boxProps}
        borderLeftColor={isCurrent ? 'blueMain' : 'primaryText'}
        onPress={onPress}
      >
        <Box flex={1}>
          <Text variant="h5">{data.alias}</Text>
          <Text variant="body3" marginTop="s">
            {truncateAddress(data.address, 8, 16)}
          </Text>
        </Box>
        <Icon
          name={isCurrent ? 'chevron-right' : 'expand-more'}
          color={isCurrent ? blueMain : primaryText}
          tvParallaxProperties={undefined}
        />
      </TouchableOpacityBox>
    </Box>
  )
}

const Button = ({
  children,
  backgroundColor,
  borderColor,
  onPress,
}: {
  children: string
  backgroundColor: any
  borderColor?: any
  onPress: () => void
}) => (
  <TouchableOpacityBox
    backgroundColor={backgroundColor}
    paddingHorizontal="s"
    paddingVertical="xs"
    borderRadius="s"
    borderColor={borderColor || backgroundColor}
    borderWidth={1}
    onPress={onPress}
  >
    <Text variant="body2">{children}</Text>
  </TouchableOpacityBox>
)

const Expand = ({
  data,
  isCurrent,
  onCollapse,
  onWatch,
  onRename,
  onDelete,
}: {
  data: WatchingAddress
  isCurrent: boolean
  onCollapse: () => void
  onWatch: () => void
  onRename: () => void
  onDelete: () => void
}) => {
  const { primaryText } = useColors()
  const dispatch = useAppDispatch()
  const [balance, setBalance] = useState('')
  const chartData =
    useSelector((state: RootState) => state.rewards.chartData[data.address]) ||
    {}
  const [yesterday] =
    (chartData['7'] || chartData['14'] || chartData['30'])?.rewards || []

  useAsync(async () => {
    if (!isCurrent) {
      dispatch(
        fetchChartData({
          address: data.address,
          numDays: 7,
          resource: 'accounts',
        }),
      )
      try {
        const account = await getAccount(data.address)
        setBalance(account?.balance?.floatBalance.toString() || '0.00000')
      } catch (error) {
        setBalance('0.00000')
      }
    }
  }, [])

  if (isCurrent) return null

  return (
    <Box paddingVertical="s" padding="m">
      <Box {...boxProps} borderLeftColor="primaryText">
        <TouchableOpacityBox {...flexProps} onPress={onCollapse}>
          <Text flex={1} variant="h5">
            {data.alias}
          </Text>
          <Icon
            name="expand-less"
            color={primaryText}
            tvParallaxProperties={undefined}
          />
        </TouchableOpacityBox>
        <Box marginTop="s">
          <Text variant="body3">{data.address}</Text>
        </Box>
        <Box {...flexProps} marginTop="s">
          <Box flex={1} flexDirection="row" alignItems="center">
            <HNT width={11} height={11} />
            <Box flex={1} marginLeft="xs">
              {balance ? (
                <Text variant="body3">{balance} HNT</Text>
              ) : (
                <SkeletonPlaceholder>
                  <SkeletonPlaceholder.Item
                    height={11}
                    borderRadius={5}
                    marginRight="20"
                  />
                </SkeletonPlaceholder>
              )}
            </Box>
          </Box>
          <Box flex={1}>
            {balance && yesterday ? (
              <Text variant="body3" textAlign="right">
                + {yesterday.total || 0}
              </Text>
            ) : (
              <SkeletonPlaceholder>
                <SkeletonPlaceholder.Item
                  height={11}
                  borderRadius={5}
                  marginLeft={20}
                />
              </SkeletonPlaceholder>
            )}
          </Box>
        </Box>
        <Box {...flexProps} marginVertical="ms">
          <Button backgroundColor="blueMain" onPress={onWatch}>
            Watch
          </Button>
          <Button
            backgroundColor="primaryBackground"
            borderColor="gray"
            onPress={onRename}
          >
            Rename
          </Button>
          <Button backgroundColor="redMain" onPress={onDelete}>
            Delete
          </Button>
        </Box>
      </Box>
    </Box>
  )
}

export default {
  Collapsed: memo(Collapsed),
  Expand: memo(Expand),
}

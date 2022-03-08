/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/jsx-props-no-spreading */
import React, { memo, useCallback, useState } from 'react'
import { Icon } from 'react-native-elements'
import { useSelector } from 'react-redux'
import { useAsync } from 'react-async-hook'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'
import { Account } from '@helium/http'
import { Platform } from 'react-native'
import { useColors } from '../../theme/themeHooks'
import Box from '../boxes/Box'
import Text from '../texts/Text'
import { RootState } from '../../store/rootReducer'
import appSlice, { WatchingAddress } from '../../store/app/appSlice'
import TouchableOpacityBox from '../boxes/TouchableOpacityBox'
import { useAppDispatch } from '../../store/store'
import { getAccount } from '../../utils/clients/heliumDataClient'
import { fetchRewardsData } from '../../store/data/rewardsSlice'
import { truncateAddress } from '../../utils/formatter'
import HNT from '../../assets/images/hnt.svg'

export const flexProps = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
} as unknown

export const boxProps = {
  paddingHorizontal: 's',
  paddingVertical: 's',
  borderLeftWidth: 4,
  backgroundColor: 'primaryBackground',
  borderRadius: 's',
} as unknown

const Collapsed = ({
  data,
  isCurrent,
  onPress,
  icon,
  onRename,
  onDelete,
}: {
  data: WatchingAddress
  isCurrent: boolean
  onPress: () => void
  icon?: string
  onRename?: () => void
  onDelete?: () => void
}) => {
  const { blueMain, primaryText } = useColors()
  const { isWatcher } = useSelector((state: RootState) => state.app.user)

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
          {isCurrent && isWatcher && (
            <Box {...flexProps} marginTop="ms">
              <Button
                backgroundColor="primaryBackground"
                borderColor="gray"
                functionalDisable={Platform.OS === 'android'}
                onPress={onRename}
              >
                Rename
              </Button>
              <Button backgroundColor="redMain" onPress={onDelete}>
                Unwatch
              </Button>
            </Box>
          )}
        </Box>
        <Icon
          name={icon || (isCurrent ? 'chevron-right' : 'expand-more')}
          color={isCurrent ? blueMain : primaryText}
          tvParallaxProperties={undefined}
        />
      </TouchableOpacityBox>
    </Box>
  )
}

const LinkButton = ({ onPress }: { onPress: () => void }) => {
  const { primaryText } = useColors()
  return (
    <Box paddingVertical="s" padding="m">
      <TouchableOpacityBox
        {...flexProps}
        {...boxProps}
        borderLeftColor="primaryBackground"
        onPress={onPress}
      >
        <Box flex={1}>
          <Text variant="h5">Link Now</Text>
          <Text variant="body3" marginTop="s">
            Link in with Helium App
          </Text>
        </Box>
        <Icon
          name="link"
          color={primaryText}
          tvParallaxProperties={undefined}
          onPress={onPress}
        />
      </TouchableOpacityBox>
    </Box>
  )
}

const SingOutButton = () => {
  const dispatch = useAppDispatch()
  const onPress = useCallback(
    () => dispatch(appSlice.actions.unlinkAccount()),
    [dispatch],
  )
  return (
    <Box paddingVertical="s" padding="m">
      <TouchableOpacityBox
        {...boxProps}
        borderLeftColor="primaryBackground"
        onPress={onPress}
      >
        <Text variant="body2" color="redMain" textAlign="center">
          Sign Out
        </Text>
      </TouchableOpacityBox>
    </Box>
  )
}

const Button = ({
  children,
  backgroundColor,
  borderColor,
  onPress,
  disabled,
  functionalDisable,
}: {
  children: string
  backgroundColor: any
  borderColor?: any
  onPress?: () => void
  disabled?: boolean
  functionalDisable?: boolean
}) => (
  <TouchableOpacityBox
    flex={1}
    backgroundColor={backgroundColor}
    padding="xs"
    borderRadius="s"
    borderColor={borderColor || backgroundColor}
    borderWidth={1}
    disabled={disabled}
    opacity={disabled || functionalDisable ? 0.6 : 1}
    onPress={onPress}
    marginRight="s"
  >
    <Text variant="body2" textAlign="center">
      {children}
    </Text>
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
  onWatch: (account?: Account) => void
  onRename: () => void
  onDelete: () => void
}) => {
  const { primaryText } = useColors()
  const dispatch = useAppDispatch()
  const [account, setAccount] = useState<Account>()
  const [balance, setBalance] = useState('')
  const earnings =
    useSelector((state: RootState) => state.rewards.earnings[data.address]) ||
    {}
  const [yesterday] =
    (earnings['7'] || earnings['14'] || earnings['30'])?.rewards || []

  useAsync(async () => {
    if (!isCurrent) {
      dispatch(
        fetchRewardsData({
          address: data.address,
          numDays: 7,
          resource: 'accounts',
        }),
      )
      try {
        const acc = await getAccount(data.address)
        setAccount(acc || undefined)
        setBalance(acc?.balance?.floatBalance.toString() || '0.00000')
      } catch (error) {
        setAccount(undefined)
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
              {account ? (
                <Text variant="body3">{balance} HNT</Text>
              ) : (
                <SkeletonPlaceholder>
                  <SkeletonPlaceholder.Item
                    height={11}
                    borderRadius={5}
                    marginRight={20}
                  />
                </SkeletonPlaceholder>
              )}
            </Box>
          </Box>
          <Box flex={1}>
            {account && yesterday ? (
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
        <Box {...flexProps} marginTop="ms" marginBottom="xs">
          <Button
            backgroundColor="blueMain"
            disabled={!balance}
            onPress={() => onWatch(account)}
          >
            Watch
          </Button>
          <Button
            backgroundColor="primaryBackground"
            borderColor="gray"
            functionalDisable={Platform.OS === 'android'}
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
  LinkButton: memo(LinkButton),
  Expand: memo(Expand),
  SingOut: memo(SingOutButton),
}

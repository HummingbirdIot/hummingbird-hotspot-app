import React, { memo, useEffect, useState } from 'react'
import { ActivityIndicator, FlatList } from 'react-native'
import { PendingTransaction } from '@helium/http'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Box from '../../../components/Box'
import {
  AddressType,
  HttpTransaction,
  Loading,
} from '../../../store/txns/txnsTypes'
import PendingListItem from './PendingListItem'
import ListItem from './ListItem'
import Text from '../../../components/Text'

const ListContent = ({
  activities,
  status,
  address,
  addressType,
  lng,
  lat,
  initCount = 20,
}: {
  activities: Array<HttpTransaction & PendingTransaction>
  status: Loading
  address: string
  addressType: AddressType
  lng?: number
  lat?: number
  initCount?: number
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [count, setCount] = useState<number>(initCount || 20)
  const [activityList, setActivityList] = useState<
    Array<HttpTransaction & PendingTransaction>
  >(activities ? activities.slice(0, count) : [])
  const insets = useSafeAreaInsets()

  useEffect(() => {
    // console.log('ActivitiesList::ListContent::activityList:', activities.length)
    setActivityList(activities ? activities.slice(0, count) : [])
  }, [activities, count])

  if (activityList.length === 0) {
    if (status === 'pending') {
      return (
        <Box justifyContent="center">
          <ActivityIndicator
            color="#687A8C"
            size={activities.length ? 30 : 100}
          />
        </Box>
      )
    }
    return (
      <Box
        style={{
          backgroundColor: '#f6f6f6',
          paddingVertical: 20,
          borderRadius: 5,
        }}
      >
        <Text textAlign="center" color="gray">
          Empty
        </Text>
      </Box>
    )
  }

  const renderItem = ({
    item: activity,
  }: {
    item: HttpTransaction & PendingTransaction
  }) =>
    activity.status === 'pending' ? (
      <PendingListItem
        // key={activity.hash}
        activity={activity}
      />
    ) : (
      <ListItem
        // key={activity.hash}
        activity={activity}
        address={address}
        addressType={addressType}
        lng={lng}
        lat={lat}
      />
    )

  return (
    <FlatList
      data={activityList}
      renderItem={renderItem}
      keyExtractor={(activity) => activity.hash}
      style={{ overflow: 'hidden', paddingBottom: insets.bottom }}
    />
  )
}

export default memo(ListContent)

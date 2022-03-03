import React, { memo, useEffect, useState } from 'react'
import { FlatList } from 'react-native'
import { PendingTransaction } from '@helium/http'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  AddressType,
  HttpTransaction,
  Loading,
} from '../../../store/txns/txnsTypes'
import PendingListItem from './PendingListItem'
import ListItem from './ListItem'
import useListWidgets from '../../../utils/hooks/useListWidgets'
import Box from '../../../components/Box'

const ListContent = ({
  activities,
  status,
  address,
  addressType,
  lng,
  lat,
  initCount = 100,
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

  const { ActivityIndicator, Empty } = useListWidgets()

  if (activityList.length === 0) {
    if (status === 'pending') {
      return <ActivityIndicator length={activities.length} />
    }
    return (
      <Box paddingTop="ms">
        <Empty />
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

import React, { memo, useEffect, useState } from 'react'
// import { Avatar, ListItem, Text } from 'react-native-elements'
import { ActivityIndicator } from 'react-native'
import { PendingTransaction } from '@helium/http'
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
}: {
  activities: Array<HttpTransaction & PendingTransaction>
  status: Loading
  address: string
  addressType: AddressType
  lng?: number
  lat?: number
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [count, setCount] = useState<number>(20)
  const [activityList, setActivityList] = useState<
    Array<HttpTransaction & PendingTransaction>
  >(activities ? activities.slice(0, count) : [])

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

  return (
    <>
      {activityList.map((activity: HttpTransaction & PendingTransaction) => {
        if (activity.status === 'pending') {
          return <PendingListItem key={activity.hash} activity={activity} />
        }
        return (
          <ListItem
            key={activity.hash}
            activity={activity}
            address={address}
            addressType={addressType}
            lng={lng}
            lat={lat}
          />
        )
      })}
    </>
  )
}

export default memo(ListContent)

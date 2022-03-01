/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { ComponentClass, memo } from 'react'
import {
  Avatar,
  ListItem as ListItemComponent,
  Text,
} from 'react-native-elements'
import { PendingTransaction } from '@helium/http'
import { Image, Platform } from 'react-native'
import {
  getTxnIconPath,
  getTxnTypeColor,
  getTxnTypeName,
} from '../../../utils/txns'
import Box from '../../../components/Box'
import { AddressType, HttpTransaction } from '../../../store/txns/txnsTypes'
import { getDuration, useDescription } from './itemFormatter'
import icons from './icons'

const ListItem = ({
  address,
  activity,
  addressType,
  lng,
  lat,
}: {
  address: string
  activity: HttpTransaction & PendingTransaction
  addressType: AddressType
  lng: number | undefined
  lat: number | undefined
}) => {
  const icon = getTxnIconPath(activity)
  const color = getTxnTypeColor(activity.type)
  const { description, feeOrAmount } = useDescription(address, activity, {
    addressType,
    lng,
    lat,
  })

  return (
    <ListItemComponent bottomDivider>
      <Avatar
        rounded
        containerStyle={{
          width: 31,
          height: 31,
          backgroundColor: 'transparent',
        }}
        ImageComponent={icons[icon || ''] || null}
        avatarStyle={{ width: 40, height: 40 }}
        iconStyle={{ width: 40, height: 40 }}
      />

      <ListItemComponent.Content>
        <Box flexDirection="row">
          <Box flex={1}>
            <Text style={{ fontSize: 16, fontWeight: '500' }}>
              {getTxnTypeName(activity.type, 'hotspot')}
            </Text>
            {description ? (
              <Text style={{ fontSize: 12, color: 'gray' }}>{description}</Text>
            ) : null}
            {feeOrAmount ? (
              <Text style={{ fontSize: 12, color }}>{feeOrAmount}</Text>
            ) : null}
          </Box>
          <Box flexDirection="column" justifyContent="center">
            <Text style={{ fontSize: 14, color }}>
              {getDuration(activity.time)}
            </Text>
          </Box>
        </Box>
      </ListItemComponent.Content>
    </ListItemComponent>
  )
}

export default memo(ListItem)

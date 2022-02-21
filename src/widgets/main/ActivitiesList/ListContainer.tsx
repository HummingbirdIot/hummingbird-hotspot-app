import React, { memo, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { PendingTransaction } from '@helium/http'
import { RootState } from '../../../store/rootReducer'
import {
  AccountActivityRecord,
  AccountFilterType,
  AddressType,
  HttpTransaction,
  Loading,
} from '../../../store/txns/txnsTypes'
import { useAppDispatch } from '../../../store/store'
import { fetchMoreTxns, fetchTxnsHead } from '../../../store/txns/txnsHelper'
import ListContent from './ListContent'

const lastData: {
  key: string
  data: HttpTransaction[] | PendingTransaction[]
} = {
  key: '',
  data: [],
}

const ListContainer = ({
  address,
  filter = 'all',
  addressType = 'hotspot',
  lng,
  lat,
}: {
  address: string
  filter?: AccountFilterType
  addressType: AddressType
  lng?: number
  lat?: number
}) => {
  const state = useSelector((root: RootState) => root.txns)
  const dispatch = useAppDispatch()
  const [activities, setActivities] = useState<
    HttpTransaction[] | PendingTransaction[]
  >(lastData.key === `${addressType}/${address}/${filter}` ? lastData.data : [])
  const [cursor, setRequestCursor] = useState<string | null | undefined>()
  const [status, setLoadingStatus] = useState<Loading>('idle')

  useEffect(() => {
    if (lastData.key !== `${addressType}/${address}/${filter}`) {
      setActivities([])
      // setLoadingStatus('pending')
    }
    let list: HttpTransaction[] | PendingTransaction[] = []
    if (addressType === 'hotspot') {
      setRequestCursor(state.activities[address]?.txns.all.cursor)
      setLoadingStatus(state.activities[address]?.txns.all.status)
      if (state.activities[address]?.txns.all.data.length) {
        list = state.activities[address]?.txns.all.data
      } else return
    } else if (filter === 'pending') {
      setRequestCursor(state.pending.cursor)
      setLoadingStatus(state.pending.status)
      list = state.pending.data || []
    } else if (state.activities[address]) {
      const { txns } = state.activities[address] as AccountActivityRecord
      const filterType = filter as Exclude<AccountFilterType, 'pending'>
      setRequestCursor(txns[filterType].cursor)
      setLoadingStatus(txns[filterType].status)
      if (txns[filterType].data.length) {
        list = txns[filterType].data
      } else return
    } else return
    lastData.key = `${addressType}/${address}/${filter}`
    lastData.data = list
    // console.log('ActivitiesList::ListContainer::activities:', list)
    setActivities(list)
  }, [address, addressType, filter, state])

  useEffect(() => {
    dispatch(fetchTxnsHead({ address, filter, addressType }))
      .then(() => {
        if (filter === 'pending') return
        if (cursor) {
          const filterType = filter as Exclude<AccountFilterType, 'pending'>
          dispatch(
            fetchMoreTxns({ address, filter: filterType, addressType }),
          ).catch((error) =>
            console.error(
              'ActivitiesList::ListContainer::fetchMoreTxns::error:',
              error,
            ),
          )
        }
      })
      .catch((error) =>
        console.error(
          'ActivitiesList::ListContainer::fetchTxnsHead::error:',
          error,
        ),
      )
  }, [address, addressType, cursor, dispatch, filter])

  return (
    <ListContent
      activities={activities as Array<HttpTransaction & PendingTransaction>}
      status={status}
      address={address}
      addressType={addressType}
      lng={lng}
      lat={lat}
    />
  )
}

export default memo(ListContainer)

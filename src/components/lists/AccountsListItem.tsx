import React, { memo, useState, useCallback } from 'react'
import { Account } from '@helium/http'
import { useAppDispatch } from '../../store/store'
import appSlice, { WatchingAddress } from '../../store/app/appSlice'
import AccountCard from '../cards/AccountCard'
import useAccountsMgr from '../elements/useAccountsMgr'
import accountSlice from '../../store/data/accountSlice'
import useAlert from '../../utils/hooks/useAlert'

const AccountsListItem = ({
  data,
  isCurrent,
}: {
  data: WatchingAddress
  isCurrent: boolean
}) => {
  const dispatch = useAppDispatch()
  const { showInputAlert } = useAlert()
  const [collapsed, setCollapsed] = useState(true)

  const { watchAccount } = useAccountsMgr()

  const switchAccount = useCallback(
    (account?: Account) => {
      if (account) {
        watchAccount(account.address)
        dispatch(accountSlice.actions.updateAccount({ account }))
      }
    },
    [dispatch, watchAccount],
  )

  const rename = useCallback(async () => {
    const result = await showInputAlert({
      titleKey: 'Rename Account',
      messageKey: 'Enter a new name below',
    })
    if (result) {
      dispatch(
        appSlice.actions.renameAddress({
          address: data.address,
          alias: result,
        }),
      )
    }
  }, [data.address, dispatch, showInputAlert])

  const deleteAccount = useCallback(
    (account?: Account) => {
      if (account) {
        dispatch(appSlice.actions.deleteAddress({ address: data.address }))
      }
    },
    [data.address, dispatch],
  )

  if (isCurrent) {
    return (
      <AccountCard.Collapsed
        data={data}
        isCurrent
        onPress={() => watchAccount(data.address)}
      />
    )
  }

  if (collapsed) {
    return (
      <AccountCard.Collapsed
        data={data}
        isCurrent={false}
        onPress={() => setCollapsed(false)}
      />
    )
  }

  return (
    <AccountCard.Expand
      data={data}
      isCurrent={isCurrent}
      onCollapse={() => setCollapsed(true)}
      onWatch={switchAccount}
      onRename={rename}
      onDelete={deleteAccount}
    />
  )
}

export default memo(AccountsListItem)
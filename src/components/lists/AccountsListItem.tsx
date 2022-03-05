import React, { memo, useState } from 'react'
import { WatchingAddress } from '../../store/app/appSlice'
import { B58Address } from '../../store/txns/txnsTypes'
import AccountCard from '../cards/AccountCard'

const AccountsListItem = ({
  data,
  isCurrent,
  onSelect,
}: {
  data: WatchingAddress
  isCurrent: boolean
  onSelect: (address: B58Address) => void
}) => {
  const [collapsed, setCollapsed] = useState(true)

  if (isCurrent) {
    return (
      <AccountCard.Collapsed
        data={data}
        isCurrent
        onPress={() => onSelect(data.address)}
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
      onWatch={() => setCollapsed(true)}
      onRename={() => setCollapsed(true)}
      onDelete={() => setCollapsed(true)}
    />
  )
}

export default memo(AccountsListItem)

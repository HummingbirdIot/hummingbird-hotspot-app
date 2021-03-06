import React, { memo } from 'react'
import Cog from '@assets/images/cog.svg'
// import Hotspot from '@assets/images/placeholder.svg'
import Account from '@assets/images/accountIcon.svg'
import Hotspot from '@assets/images/hotspotIcon.svg'
import Search from '@assets/images/search.svg'
import Box from '../../../components/boxes/Box'
import { MainTabType, TabBarIconType } from '../rootNavigationTypes'
import { useColors } from '../../../theme/themeHooks'

type Props = {
  name: MainTabType
} & TabBarIconType

const Icon = ({
  size,
  color,
  name,
}: {
  color: string
  size: number
  name: MainTabType
}) => {
  if (name === 'Account') {
    return <Account height={size} width={size} color={color} />
  }
  if (name === 'Hotspots') {
    return <Hotspot height={size} width={size} color={color} />
  }
  if (name === 'Explorer') {
    return <Search height={size} width={size} color={color} />
  }
  return <Cog color={color} height={size} width={size} />
}

const TabBarIcon = ({ name, focused, size }: Props) => {
  const { secondaryText, yellow } = useColors()
  const color = focused ? yellow : secondaryText

  return (
    <Box
      alignItems="center"
      flex={1}
      justifyContent="center"
      padding="xxxs"
      paddingTop="s"
    >
      <Icon size={size} color={color} name={name} />
    </Box>
  )
}

export default memo(TabBarIcon)

import React from 'react'
import Box from '../boxes/Box'
import Text from '../texts/Text'
import MiniIcon from '../../assets/images/mini-icon.svg'
import { useColors } from '../../theme/themeHooks'

const AppInfoItem = ({ version }: { version: string }) => {
  const { primaryText } = useColors()
  return (
    <Box
      flexDirection="row"
      alignItems="center"
      height={48}
      // paddingHorizontal="ms"
      marginTop="l"
    >
      <MiniIcon color={primaryText} />
      <Box marginLeft="ms">
        <Text variant="body2" color="primaryText">
          {`v${version}`}
        </Text>
        <Text variant="body2" color="secondaryText">
          @ Hummingbird.
        </Text>
      </Box>
    </Box>
  )
}

export default AppInfoItem

import React, { memo } from 'react'
import { Icon } from 'react-native-elements'
import { useColors } from '../../theme/themeHooks'
import Box from '../boxes/Box'
import Text from '../texts/Text'

const AccountListHeader = ({
  icon,
  children,
  action,
}: {
  icon: string
  children: string
  action?: {
    icon: string
    handler: () => void
  }
}) => {
  const { primaryText } = useColors()

  return (
    <Box
      margin="m"
      marginBottom="none"
      padding="s"
      backgroundColor="primaryBackground"
      borderRadius="m"
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
    >
      <Box
        borderRadius="m"
        flexDirection="row"
        justifyContent="flex-start"
        alignItems="center"
      >
        <Icon
          name={icon}
          color={primaryText}
          tvParallaxProperties={undefined}
        />
        <Text variant="h4" marginLeft="xs">
          {children}
        </Text>
      </Box>
      {action && (
        <Icon
          name={action.icon}
          color={primaryText}
          tvParallaxProperties={undefined}
          onPress={action.handler}
        />
      )}
    </Box>
  )
}

export default memo(AccountListHeader)

import React, { useMemo } from 'react'
import { ActivityIndicator as AI } from 'react-native'
import Box from '../../components/Box'
import Text from '../../components/Text'

const useListWidgets = () => {
  const ActivityIndicator = useMemo(
    () =>
      ({ length }: { length?: number }) =>
        (
          <Box justifyContent="center">
            <AI color="#687A8C" size={length ? 30 : 100} />
          </Box>
        ),
    [],
  )

  const Empty = useMemo(
    () => () =>
      (
        <Box
          marginHorizontal="ms"
          borderRadius="s"
          backgroundColor="grayBoxLight"
          paddingVertical="l"
        >
          <Text textAlign="center" color="gray">
            Empty
          </Text>
        </Box>
      ),
    [],
  )
  return { ActivityIndicator, Empty }
}

export default useListWidgets

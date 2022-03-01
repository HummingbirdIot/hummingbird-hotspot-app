import React, { memo, useState } from 'react'
import { ButtonGroup } from 'react-native-elements'
import { useAsync } from 'react-async-hook'
import { ColorSchemeName, useColorScheme } from 'react-native-appearance'
import Box from '../../../components/Box'
import ActivitiesList from '../../../widgets/main/ActivitiesList/ListContainer'
import { useColors } from '../../../theme/themeHooks'
import { getAddress } from '../../../store/app/secureData'
import { AccountFilterKeys } from '../../../store/txns/txnsTypes'
import DetailViewContainer from '../../../widgets/main/DetailViewContainer'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ActivityScreen = ({ navigation }: any) => {
  const colorScheme: ColorSchemeName = useColorScheme()
  const [address, setAccountAddress] = useState('')

  const [selectedIndex, updateIndex] = useState(0)
  useAsync(async () => {
    const aacc = await getAddress()
    setAccountAddress(aacc || '')
  }, [])

  const [all, mining, payment, hotspot, pending] = AccountFilterKeys
  const buttons = [all, mining, payment, hotspot, pending]

  const { blueMain } = useColors()

  if (!address) {
    return <Box />
  }

  return (
    <DetailViewContainer
      title="Acitivity"
      goBack={() => {
        if (navigation.canGoBack()) {
          navigation.goBack()
        }
      }}
    >
      <Box
        flex={1}
        backgroundColor={
          colorScheme === 'light' ? 'surfaceContrast' : 'primaryBackground'
        }
      >
        <Box height={50}>
          <ButtonGroup
            onPress={updateIndex}
            selectedIndex={selectedIndex}
            buttons={buttons}
            containerStyle={{
              height: 36,
              backgroundColor: 'transparent',
              borderColor: blueMain,
            }}
            innerBorderStyle={{
              color: blueMain,
            }}
            selectedButtonStyle={{
              backgroundColor: blueMain,
              borderColor: blueMain,
            }}
            selectedTextStyle={{
              color: 'white',
            }}
            textStyle={{
              color: 'lightgray',
            }}
          />
        </Box>
        <Box
          flex={1}
          backgroundColor="white"
          borderTopStartRadius="l"
          borderTopEndRadius="l"
          style={{
            overflow: 'hidden',
          }}
        >
          <ActivitiesList
            address={address}
            filter={buttons[selectedIndex]}
            addressType="account"
          />
        </Box>
      </Box>
    </DetailViewContainer>
  )
}

export default memo(ActivityScreen)

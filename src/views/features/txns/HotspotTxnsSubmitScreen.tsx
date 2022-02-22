/* eslint-disable no-nested-ternary */
import React, { useState } from 'react'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import { useAsync } from 'react-async-hook'
import { AssertLocationV2 } from '@helium/transactions'
import { useOnboarding } from '@helium/react-native-sdk'
import { PendingTransaction } from '@helium/http'
import { ActivityIndicator } from 'react-native'
import Box from '../../../components/Box'
import { DebouncedButton } from '../../../components/Button'
import Text from '../../../components/Text'
import { RootNavigationProp } from '../../navigation/naviTypes'
import SafeAreaBox from '../../../components/SafeAreaBox'
import { HotspotSetupStackParamList } from '../../navigation/features/hotspotSetupTypes'
import { submitTxn } from '../../../utils/clients/appDataClient'
import { useColors } from '../../../theme/themeHooks'

type Route = RouteProp<HotspotSetupStackParamList, 'HotspotTxnsSubmitScreen'>

const HotspotTxnsSubmitScreen = () => {
  const { t } = useTranslation()
  const { params } = useRoute<Route>()
  const navigation = useNavigation<RootNavigationProp>()
  const { postPaymentTransaction } = useOnboarding()
  const [taskCount, setTaskCount] = useState<number>(0)
  const [results, setResults] = useState<Array<PendingTransaction>>([])
  const { primaryText } = useColors()

  /**
   * 0: 未初始化
   * 1: 检查参数
   * 2.1: post transaction (gateway txn)
   * 2.2: post transaction (assert txn)
   * 3: 广播
   * 4.1: 参数错误
   * 4.21: post transaction error (gateway txn)
   * 4.22: post transaction error (assert txn)
   * 4.3: 全部或部分广播失败
   * 5. 完成广播
   */
  const [status, setStatus] = useState<number>(0)
  const [errorInof, setErrorInof] =
    useState<{ msg: string; error: Error | null }>()

  useAsync(async () => {
    if (status > 0) return
    setStatus(1)
    setErrorInof(undefined)
    // console.log('HotspotTxnsSubmitScreen::useAsync::routeParams:', params)

    try {
      if (!params.gatewayAddress) {
        setStatus(4.1)
        throw new Error('Gateway address not found')
      }
      const tasks = []
      if (params.gatewayTxn) {
        // console.log(
        //   'HotspotTxnsSubmitScreen::params::gatewayTxn:',
        //   params.gatewayTxn,
        // )
        setStatus(2.1)
        const gatewayTxn = await postPaymentTransaction(
          params.gatewayAddress,
          params.gatewayTxn,
        )

        if (!gatewayTxn) {
          // console.log('HotspotTxnsSubmitScreen::!gatewayTxn:')
          setStatus(4.1)
          throw new Error('Post gateway transaction failed')
        }
        console.log('HotspotTxnsSubmitScreen::gatewayTxn:', gatewayTxn)
        // await
        tasks.push(submitTxn(gatewayTxn))
      }

      if (params.assertTxn) {
        let finalTxn = params.assertTxn
        const assertTxn = AssertLocationV2.fromString(finalTxn)

        const isFree = assertTxn.owner?.b58 !== assertTxn.payer?.b58 // Maker is paying
        if (isFree) {
          // If the maker is paying, post to onboarding
          setStatus(2.2)
          const onboardAssertTxn = await postPaymentTransaction(
            params.gatewayAddress,
            params.assertTxn,
          )
          if (!onboardAssertTxn) {
            setStatus(4.22)
            throw new Error('Post free assert transaction failed')
          }

          finalTxn = onboardAssertTxn
        }
        console.log('HotspotTxnsSubmitScreen::finalTxn:', isFree, finalTxn)
        tasks.push(submitTxn(finalTxn))
      }
      setStatus(3)
      setTaskCount(tasks.length)
      setResults(await Promise.all(tasks))
      setStatus(5)
      setErrorInof({
        error: null,
        msg: 'Submitted',
      })
    } catch (error) {
      // setResults({ length: -1 } as Array<PendingTransaction>)
      let msg = 'Thrown Error'
      if (status === 2.1) {
        msg = 'Network Error'
        setStatus(4.21)
      } else if (status === 2.2) {
        msg = 'Network Error'
        setStatus(4.22)
      } else if (status === 3) {
        msg = 'BlockChain Error'
        setStatus(4.3)
      }
      setErrorInof({
        error: error as Error,
        msg,
      })
      setResults([])
    }
  }, [params])

  // console.log('HotspotTxnsSubmitScreen::results', results?.length, results)
  let messageBox = (
    <Box flex={1} justifyContent="center">
      <ActivityIndicator color={primaryText} />
      <Text>Preparing for Sending Transactions (step: {status})</Text>
    </Box>
  )

  if (taskCount) {
    if (status === 5) {
      messageBox =
        results.length === taskCount ? (
          <Box>
            <Text>{taskCount} Transactions Sent</Text>
            {results.map((result) => (
              <Text key={result.hash}>{result.hash}</Text>
            ))}
          </Box>
        ) : (
          <Box flex={1} justifyContent="center">
            <Text>Unknow Sumbitting Error.</Text>
          </Box>
        )
    } else if (status > 4) {
      messageBox = (
        <Box flex={1} justifyContent="center">
          <Text>{errorInof?.msg}</Text>
          <Text>
            {errorInof?.error?.toString() ||
              'One or more Transactions sent failed.'}
          </Text>
        </Box>
      )
    } else {
      messageBox = (
        <Box flex={1} justifyContent="center">
          <ActivityIndicator color={primaryText} />
          <Text>Submitting {taskCount} Transactions</Text>
        </Box>
      )
    }
  }

  return (
    <SafeAreaBox
      flex={1}
      backgroundColor="primaryBackground"
      padding="lx"
      paddingTop="xxl"
    >
      <Box flex={2} alignItems="center" paddingTop="xxl">
        <Text variant="subtitle1" marginBottom="l">
          {t('hotspot_setup.progress.title')}
        </Text>
        <Box paddingHorizontal="l">
          <Text variant="body1" textAlign="center" marginBottom="l">
            {t('hotspot_setup.progress.subtitle')}
          </Text>
        </Box>
      </Box>
      <Box flex={1}>{messageBox}</Box>
      <DebouncedButton
        onPress={() => navigation.navigate('MainTabs')}
        variant="primary"
        width="100%"
        mode="contained"
        title={t('hotspot_setup.progress.next')}
      />
    </SafeAreaBox>
  )
}

export default HotspotTxnsSubmitScreen

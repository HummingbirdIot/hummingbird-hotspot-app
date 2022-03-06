import Balance, { NetworkTokens } from '@helium/currency'
import { isEqual } from 'lodash'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import CurrencyFormatter from 'react-native-currency-format'
import { OraclePrice } from '@helium/http'
import { fetchCurrentOraclePrice } from '../../store/data/hntSlice'
import { RootState } from '../../store/rootReducer'
import { useAppDispatch } from '../../store/store'
import { currencyType as defaultCurrencyType } from '../i18n'
import accountSlice from '../../store/data/accountSlice'

export const SUPPORTED_CURRENCIES = {
  // AED: 'United Arab Emirates Dirham',
  // ARS: 'Argentine Peso',
  // AUD: 'Australian Dollar',
  // BDT: 'Bangladeshi Taka',
  // BHD: 'Bahraini Dinar',
  // BMD: 'Bermudian Dollar',
  // BRL: 'Brazil Real',
  // CAD: 'Canadian Dollar',
  // CHF: 'Swiss Franc',
  // CLP: 'Chilean Peso',
  CNY: 'Chinese Yuan',
  // CZK: 'Czech Koruna',
  // DKK: 'Danish Krone',
  EUR: 'Euro',
  GBP: 'British Pound Sterling',
  HKD: 'Hong Kong Dollar',
  // HUF: 'Hungarian Forint',
  // ILS: 'Israeli New Shekel',
  // INR: 'Indian Rupee',
  // KWD: 'Kuwaiti Dinar',
  // LKR: 'Sri Lankan Rupee',
  // MMK: 'Burmese Kyat',
  // MXN: 'Mexican Peso',
  // MYR: 'Malaysian Ringgit',
  // NGN: 'Nigerian Naira',
  // NOK: 'Norwegian Krone',
  // NZD: 'New Zealand Dolloar',
  // PHP: 'Philippine Peso',
  // PKR: 'Pakistani Rupee',
  // PLN: 'Polish Zloty',
  // SAR: 'Saudi Riyal',
  // SEK: 'Swedish Krona',
  SGD: 'Singapore Dollar',
  // THB: 'Thai Baht',
  // TRY: 'Turkish Lira',
  // UAH: 'Ukrainian hryvnia',
  USD: 'United States Dollar',
  // VEF: 'Venezuelan bolívar fuerte',
  // VND: 'Vietnamese đồng',
  // XDR: 'IMF Special Drawing Rights',
  // ZAR: 'South African Rand',
} as Record<string, string>

const useCurrency = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const currentPrices = useSelector(
    (state: RootState) => state.hnt.currentPrices,
    isEqual,
  )
  const currencyType =
    useSelector((state: RootState) => state.app.settings.currencyType) ||
    defaultCurrencyType

  const formatCurrency = useCallback(
    async (value: number) => {
      const formattedCurrency = await CurrencyFormatter.format(
        value,
        currencyType,
      )
      return formattedCurrency
    },
    [currencyType],
  )

  const networkTokensToDataCredits = useCallback(
    async (amount: Balance<NetworkTokens>) => {
      const result = await dispatch(fetchCurrentOraclePrice())
      const currentOracle = result?.payload as OraclePrice
      return amount.toDataCredits(currentOracle.price)
    },
    [dispatch],
  )

  const hntToDisplayVal = useCallback(
    async (amount: number, _maxDecimalPlaces = 2) => {
      const multiplier = currentPrices?.[currencyType.toLowerCase()] || 0

      const convertedValue = multiplier * amount
      return formatCurrency(convertedValue)
    },
    [currencyType, currentPrices, formatCurrency],
  )

  type StringReturn = (
    balance: Balance<NetworkTokens>,
    split?: false | undefined,
    maxDecimalPlaces?: number,
  ) => Promise<string>
  type PartsReturn = (
    balance: Balance<NetworkTokens>,
    split?: true,
    maxDecimalPlaces?: number,
  ) => Promise<{ integerPart: string; decimalPart: string }>
  const hntBalanceToFiatBlance = useCallback(
    async (
      balance: Balance<NetworkTokens>,
      split?: boolean,
      // maxDecimalPlaces = 2,
    ) => {
      const multiplier = currentPrices?.[currencyType.toLowerCase()] || 0

      try {
        const convertedValue = multiplier * balance.floatBalance
        const formattedValue: string = await formatCurrency(convertedValue)

        if (split) {
          const decimalPart = t('generic.hnt_to_currency', { currencyType })
          return { integerPart: formattedValue, decimalPart }
        }
        dispatch(accountSlice.actions.updateFiat(formattedValue.toString()))
        return formattedValue
      } catch (e) {
        return ''
      }
    },
    [currencyType, currentPrices, dispatch, formatCurrency, t],
  ) as StringReturn & PartsReturn

  return {
    networkTokensToDataCredits,
    hntBalanceToFiatBlance,
    // toggleConvertHntToCurrency,
    hntToDisplayVal,
  }
}

export default useCurrency

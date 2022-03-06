import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type ViewState = {
  isAccountsBarVisible: boolean
}
const initialState: ViewState = {
  isAccountsBarVisible: false,
}

const viewSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    setAccountsBarVisible: (
      state,
      { payload: visible }: PayloadAction<boolean>,
    ) => {
      state.isAccountsBarVisible = visible
    },
  },
})

export default viewSlice

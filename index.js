import './src/utils/polyfill'
import React from 'react'
// import axios from 'axios'
import { AppRegistry } from 'react-native'
import { Provider } from 'react-redux'
import App from './src/App'
import { name as appName } from './app.json'
import store from './src/store/store'
import LanguageProvider from './src/providers/LanguageProvider'

const render = () => {
  return (
    <LanguageProvider>
      <Provider store={store}>
        <App />
      </Provider>
    </LanguageProvider>
  )
}

// axios.defaults.timeout = 1000 * 10
// AppRegistry.registerHeadlessTask('SomeTaskName', () => require('SomeTaskName'))
AppRegistry.registerComponent(appName, () => render)

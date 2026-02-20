import React from 'react'
import ReactDOM from 'react-dom/client'
import { MsalProvider } from '@azure/msal-react'
import App from './App.jsx'
import { getMsalInstance } from './auth/msalInstance'
import './index.css'

const root = ReactDOM.createRoot(document.getElementById('root'))

const init = async () => {
  const msalInstance = getMsalInstance()
  await msalInstance.initialize()
  root.render(
    <React.StrictMode>
      <MsalProvider instance={msalInstance}>
        <App />
      </MsalProvider>
    </React.StrictMode>,
  )
}

init()


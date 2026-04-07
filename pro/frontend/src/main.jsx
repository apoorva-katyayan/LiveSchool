import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
// Import axios setup (sets baseURL to VITE_API_BASE or fallback)
import './api'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

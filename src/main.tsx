
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/base.css'
import './styles/mobile.css'
import './styles/dashboard.css'
import './styles/dashboard-layout.css' 
import './styles/dashboard-sidebar.css'
import './styles/dashboard-z-index.css'
import './styles/mobile-menu.css'
import './styles/sidebar-mobile.css'
import './styles/responsive-layout.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

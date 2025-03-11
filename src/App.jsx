import React from 'react'
import { HashRouter } from 'react-router-dom'
import ScrollTopTop from './components/ScrollTopTop'
import AppRouter from './router/Index'

function App() {

  return (
    <HashRouter>
      <ScrollTopTop />
      <AppRouter />
    </HashRouter>
  )
}

export default App

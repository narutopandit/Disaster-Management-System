import React from 'react'
import { AuthProvider } from './contex/AuthContext'
import { BrowserRouter, Routes, Route} from "react-router-dom"
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AdminPanel from './pages/AdminPanel'


function App() {

  return (
    <AuthProvider>
      <BrowserRouter>
      <Routes>
        <Route path='/' element={<Login/>}/>
        <Route path='/dashboard' element={<Dashboard/>} />
        <Route path='/admin' element={<AdminPanel/>} />
      </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App

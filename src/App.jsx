import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Complaints from './pages/Complaints'
import Facility from './pages/Facility'
import Payments from './pages/Payments'
import Login from './pages/Login'

export default function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/complaints' element={<Complaints/>} />
        <Route path='/facility' element={<Facility/>} />
        <Route path='/payments' element={<Payments/>} />
        <Route path='/login' element={<Login/>} />
      </Routes>
    </BrowserRouter>
  )
}

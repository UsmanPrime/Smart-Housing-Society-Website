import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register' // <- add this import
import Complaints from './pages/Complaints'
import Facility from './pages/Facility'
import Payments from './pages/Payments'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Register />} /> {/* route for register */}
      <Route path='/complaints' element={<Complaints/>} />
      <Route path='/facility' element={<Facility/>} />
      <Route path='/payments' element={<Payments/>} />
    </Routes>
  )
}

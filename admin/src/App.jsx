import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Navbar from './components/Navbar/Navbar'
import PrivateRoute from './components/PrivateRoute'
import Sidebar from './components/Sidebar/Sidebar'
import Add from './pages/Add/Add'
import AddCoupon from './pages/Coupons/AddCoupon'
import ListCoupons from './pages/Coupons/ListCoupons'
import Dashboard from './pages/Dashboard/Dashboard'
import List from './pages/List/List'
import AdminLogin from './pages/Login/AdminLogin'
import Orders from './pages/Orders/Orders'

const App = () => {
  const url = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000"
  
  const DashboardLayout = () => (
    <>
      <Navbar />
      <hr />
      <div className="app-content">
        <Sidebar />
        <div className="main-content">
          <Routes>
            <Route path="add" element={<Add url={url}/>} />
            <Route path="list" element={<List url={url}/>} />
            <Route path="orders" element={<Orders url={url}/>} />
            <Route path="add-coupon" element={<AddCoupon url={url}/>} />
            <Route path="list-coupons" element={<ListCoupons url={url}/>} />
            <Route path="/" element={<Dashboard url={url}/>} />
          </Routes>
        </div>
      </div>
    </>
  )

  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/*" element={<PrivateRoute />}>
          <Route path="*" element={<DashboardLayout />} />
        </Route>
      </Routes>
    </>
  )
}

export default App

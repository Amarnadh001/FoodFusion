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
import Reviews from './pages/Reviews/Reviews'
import ComboManagement from './pages/ComboManagement/ComboManagement'
import CancellationRequests from './pages/CancellationRequests/CancellationRequests'
import './App.css'

const App = () => {
  const DashboardLayout = () => (
    <>
      <Navbar />
      <div className="app-content">
        <Sidebar />
        <div className="main-content">
          <Routes>
            <Route path="add" element={<Add />} />
            <Route path="list" element={<List />} />
            <Route path="orders" element={<Orders />} />
            <Route path="cancellation-requests" element={<CancellationRequests />} />
            <Route path="add-coupon" element={<AddCoupon />} />
            <Route path="list-coupons" element={<ListCoupons />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="combo-management" element={<ComboManagement />} />
            <Route path="/" element={<Dashboard />} />
          </Routes>
        </div>
      </div>
    </>
  )

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
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

import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Navbar from './components/Navbar/Navbar'
import Sidebar from './components/Sidebar/Sidebar'
import Add from './pages/Add/Add'
import List from './pages/List/List'
import Orders from './pages/Orders/Orders'
import AddCoupon from './pages/Coupons/AddCoupon'
import ListCoupons from './pages/Coupons/ListCoupons'

const App = () => {

  const url = "https://foodfusion-backend-lfj9.onrender.com"
  return (
    <div>
      <ToastContainer />
      <Navbar />
      <hr />
      <div className="app-content">
        <Sidebar />
        <Routes>
          <Route path="/add" element={<Add url={url}/>}/>
          <Route path="/list" element={<List url={url}/>}/>
          <Route path="/orders" element={<Orders url={url}/>}/>
          <Route path="/add-coupon" element={<AddCoupon url={url}/>} />
          <Route path="/list-coupons" element={<ListCoupons url={url}/>} />
        </Routes>
      </div>
    </div>
  )
}

export default App

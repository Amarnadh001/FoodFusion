import React from 'react'
import { NavLink } from 'react-router-dom'
import { assets } from '../../assets/assets'
import './Sidebar.css'

const Sidebar = () => {
  return (
    <div className='sidebar'>
        <div className="sidebar-options">
            <NavLink to='/' className="sidebar-option">
                <img src={assets.order_icon} alt="" />
                <p>Dashboard</p>
            </NavLink>
            <NavLink to='/add' className="sidebar-option">
                <img src={assets.add_icon} alt="" />
                <p>Add Items</p>
            </NavLink>
            <NavLink to='/list' className="sidebar-option">
                <img src={assets.order_icon} alt="" />
                <p>List Items</p>
            </NavLink>
            <NavLink to='/orders' className="sidebar-option">
                <img src={assets.order_icon} alt="" />
                <p>Orders</p>
            </NavLink>
            <NavLink to='/cancellation-requests' className="sidebar-option">
                <img src={assets.order_icon} alt="" />
                <p>Cancellation Requests</p>
            </NavLink>
            <NavLink to='/add-coupon' className="sidebar-option">
                <img src={assets.add_icon} alt="" />
                <p>Add Coupon</p>
            </NavLink>
            <NavLink to='/list-coupons' className="sidebar-option">
                <img src={assets.order_icon} alt="" />
                <p>List Coupons</p>
            </NavLink>
            <NavLink to='/reviews' className="sidebar-option">
                <img src={assets.order_icon} alt="" />
                <p>Reviews</p>
            </NavLink>
            <NavLink to='/combo-management' className="sidebar-option">
                <img src={assets.add_icon} alt="" />
                <p>Combo Management</p>
            </NavLink>
        </div>
      
    </div>
  )
}

export default Sidebar

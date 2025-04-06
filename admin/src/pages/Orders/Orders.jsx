import React from 'react'
import './Orders.css'
import { useState } from 'react'
import {toast} from "react-toastify"
import { useEffect } from 'react'
import {assets} from "../../assets/assets"
import api from '../../utils/api'

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: '',
    minPrice: '',
    maxPrice: '',
    search: ''
  });

  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/order/list");
      
      if (response.data.success) {
        setOrders(response.data.data);
        console.log("Orders loaded:", response.data.data.length);
      } else {
        toast.error(response.data.message || "Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error(error.response?.data?.message || "Error fetching orders");
    } finally {
      setLoading(false);
    }
  }

  const statusHandler = async (event, orderId) => {
    try {
      setLoading(true);
      const response = await api.post("/api/order/status", {
        orderId,
        status: event.target.value
      });
      
      if (response.data.success) {
        await fetchAllOrders();
        toast.success("Order status updated successfully");
      } else {
        toast.error(response.data.message || "Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error(error.response?.data?.message || "Error updating order status");
    } finally {
      setLoading(false);
    }
  }

  const applyFilters = () => {
    let filtered = [...orders];

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(order => order.status === filters.status);
    }

    // Date range filter
    if (filters.startDate && filters.endDate) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= new Date(filters.startDate) && orderDate <= new Date(filters.endDate);
      });
    }

    // Price range filter
    if (filters.minPrice) {
      filtered = filtered.filter(order => order.amount >= parseFloat(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(order => order.amount <= parseFloat(filters.maxPrice));
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(order => 
        order.address.firstName.toLowerCase().includes(searchLower) ||
        order.address.lastName.toLowerCase().includes(searchLower) ||
        order.address.phone.includes(filters.search)
      );
    }

    setFilteredOrders(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  useEffect(() => {
    setFilteredOrders(orders);
  }, [orders]);

  useEffect(() => {
    applyFilters();
  }, [filters]);

  // Format date for better readability
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (  
    <div className='order'>
      <h3>Orders Management</h3>
      <div className="order-filters">
        <select 
          name="status" 
          value={filters.status} 
          onChange={handleFilterChange}
          disabled={loading}
        >
          <option value="">All Status</option>
          <option value="Food Processing">Food Processing</option>
          <option value="Your food is prepared">Food Prepared</option>
          <option value="Out for delivery">Out for Delivery</option>
          <option value="Delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <input 
          type="date" 
          name="startDate" 
          value={filters.startDate} 
          onChange={handleFilterChange}
          placeholder="Start Date"
          disabled={loading}
        />

        <input 
          type="date" 
          name="endDate" 
          value={filters.endDate} 
          onChange={handleFilterChange}
          placeholder="End Date"
          disabled={loading}
        />

        <input 
          type="number" 
          name="minPrice" 
          value={filters.minPrice} 
          onChange={handleFilterChange}
          placeholder="Min Price"
          disabled={loading}
        />

        <input 
          type="number" 
          name="maxPrice" 
          value={filters.maxPrice} 
          onChange={handleFilterChange}
          placeholder="Max Price"
          disabled={loading}
        />

        <input 
          type="text" 
          name="search" 
          value={filters.search} 
          onChange={handleFilterChange}
          placeholder="Search by name or phone"
          disabled={loading}
        />
      </div>
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading orders...</p>
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="order-list">
          {filteredOrders.map((order, index) => (
            <div key={index} className="order-item">
              <img src={assets.parcel_icon} alt="Order" />
              <div>
                <p className="order-item-food">
                  {order.items.map((item, index) => {
                    if (index === order.items.length - 1) {
                      return item.name + " × " + item.quantity;
                    } else {
                      return item.name + " × " + item.quantity + ", ";
                    }
                  })}
                </p>
                <p className="order-item-name">
                  {order.address.firstName + " " + order.address.lastName}
                </p>
                <div className="order-item-address">
                  <p>{order.address.street + ", "}</p>
                  <p>{order.address.city + ", " + order.address.state + ", " + order.address.country + ", " + order.address.zipcode}</p>
                </div>
                <p className="order-item-phone">{order.address.phone}</p>
                <p className="order-date">{formatDate(order.createdAt)}</p>
              </div>
              <p className="item-count">Items: {order.items.length}</p>
              <p className="order-amount">₹{order.amount}</p>
              <select 
                onChange={(event) => statusHandler(event, order._id)} 
                value={order.status} 
                disabled={loading || order.status === 'cancelled'}
                className={order.status === 'cancelled' ? 'status-cancelled' : ''}
              >
                <option value="Food Processing">Food Processing</option>
                <option value="Your food is prepared">Food Prepared</option>
                <option value="Out for delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-orders">
          <p>No orders found matching your filters.</p>
        </div>
      )}
    </div>
  )
}

export default Orders

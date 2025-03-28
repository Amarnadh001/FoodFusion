// admin/src/pages/Coupons/ListCoupons.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "./Coupons.css";
import api from "../../utils/api";

const ListCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [filteredCoupons, setFilteredCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    active: "",
    minDiscount: "",
    maxDiscount: ""
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCoupons = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/api/coupon/list");
      if (response.data.success) {
        setCoupons(response.data.data);
        setFilteredCoupons(response.data.data);
        setTotalPages(Math.ceil(response.data.data.length / itemsPerPage));
      } else {
        toast.error(response.data.message || "Error fetching coupons");
      }
    } catch (error) {
      console.error("Error fetching coupons:", error);
      toast.error("Failed to fetch coupons");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCoupon = async (couponId) => {
    if (window.confirm("Are you sure you want to delete this coupon?")) {
      setIsLoading(true);
      try {
        const response = await api.delete(`/api/coupon/${couponId}`);
        if (response.data.success) {
          toast.success(response.data.message);
          fetchCoupons();
        } else {
          toast.error(response.data.message || "Error deleting coupon");
        }
      } catch (error) {
        console.error("Error deleting coupon:", error);
        toast.error("Failed to delete coupon");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Toggle coupon active status
  const toggleCouponStatus = async (couponId, currentStatus) => {
    setIsLoading(true);
    try {
      const response = await api.patch(`/api/coupon/${couponId}`, {
        active: !currentStatus
      });
      if (response.data.success) {
        toast.success(`Coupon ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        fetchCoupons();
      } else {
        toast.error(response.data.message || "Error updating coupon status");
      }
    } catch (error) {
      console.error("Error updating coupon status:", error);
      toast.error("Failed to update coupon status");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // Filter coupons based on search and filters
  useEffect(() => {
    let result = [...coupons];
    
    // Filter by search term (coupon code)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(coupon => 
        coupon.code.toLowerCase().includes(searchTerm)
      );
    }
    
    // Filter by active status
    if (filters.active !== "") {
      const isActive = filters.active === "active";
      result = result.filter(coupon => coupon.active === isActive);
    }
    
    // Filter by minimum discount
    if (filters.minDiscount) {
      result = result.filter(coupon => Number(coupon.discount) >= Number(filters.minDiscount));
    }
    
    // Filter by maximum discount
    if (filters.maxDiscount) {
      result = result.filter(coupon => Number(coupon.discount) <= Number(filters.maxDiscount));
    }
    
    setFilteredCoupons(result);
    setTotalPages(Math.ceil(result.length / itemsPerPage));
    setCurrentPage(1); // Reset to first page when filtering
  }, [filters, coupons, itemsPerPage]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      active: "",
      minDiscount: "",
      maxDiscount: ""
    });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e) => {
    const value = Number(e.target.value);
    setItemsPerPage(value);
    setTotalPages(Math.ceil(filteredCoupons.length / value));
    setCurrentPage(1); // Reset to first page
  };

  // Get current items for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCoupons.slice(indexOfFirstItem, indexOfLastItem);

  // Generate page numbers
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "No expiry";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="list-container">
      <div className="list-header">
        <h2>Coupons Management</h2>
        <p className="list-subtitle">Manage discount coupons for your restaurant</p>
      </div>
      
      <div className="filter-container">
        <div className="filter-row">
          <div className="filter-group">
            <label>Search by Code</label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Enter coupon code..."
              className="filter-input"
            />
          </div>
          
          <div className="filter-group">
            <label>Status</label>
            <select 
              name="active" 
              value={filters.active} 
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          
          <div className="filter-group price-range">
            <label>Discount Range (%)</label>
            <div className="price-inputs">
              <input
                type="number"
                name="minDiscount"
                value={filters.minDiscount}
                onChange={handleFilterChange}
                placeholder="Min"
                className="filter-input price-input"
                min="0"
                max="100"
              />
              <span>to</span>
              <input
                type="number"
                name="maxDiscount"
                value={filters.maxDiscount}
                onChange={handleFilterChange}
                placeholder="Max"
                className="filter-input price-input"
                min="0"
                max="100"
              />
            </div>
          </div>
          
          <button className="reset-btn" onClick={resetFilters}>
            Reset Filters
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading coupons...</p>
        </div>
      ) : (
        <>
          <div className="list-stats">
            <p>Showing {currentItems.length} of {filteredCoupons.length} coupons</p>
            <div className="items-per-page">
              <label>Items per page:</label>
              <select value={itemsPerPage} onChange={handleItemsPerPageChange}>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
          
          <div className="list-table">
            <div className="list-table-header">
              <div className="list-cell">Code</div>
              <div className="list-cell">Discount</div>
              <div className="list-cell">Expires At</div>
              <div className="list-cell">Status</div>
              <div className="list-cell">Actions</div>
            </div>
            
            {currentItems.length > 0 ? (
              currentItems.map((coupon, index) => (
                <div key={index} className="list-table-row">
                  <div className="list-cell">
                    <div className="coupon-code">{coupon.code}</div>
                  </div>
                  <div className="list-cell">
                    <span className="discount-badge">{coupon.discount}%</span>
                  </div>
                  <div className="list-cell">
                    <span className="expiry-date">{formatDate(coupon.expiresAt)}</span>
                  </div>
                  <div className="list-cell">
                    <span className={`status-badge ${coupon.active ? 'active' : 'inactive'}`}>
                      {coupon.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="list-cell actions-cell">
                    <button 
                      className={`action-btn ${coupon.active ? 'deactivate-btn' : 'activate-btn'}`}
                      onClick={() => toggleCouponStatus(coupon._id, coupon.active)}
                      title={coupon.active ? 'Deactivate coupon' : 'Activate coupon'}
                    >
                      {coupon.active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button 
                      className="action-btn delete-btn"
                      onClick={() => deleteCoupon(coupon._id)}
                      title="Delete coupon"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results">
                <p>No coupons found matching your filters</p>
                <button className="reset-btn" onClick={resetFilters}>
                  Reset Filters
                </button>
              </div>
            )}
          </div>
          
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                className="pagination-btn"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Previous
              </button>
              
              <div className="page-numbers">
                {pageNumbers.map(number => (
                  <button
                    key={number}
                    className={`page-number ${currentPage === number ? 'active' : ''}`}
                    onClick={() => handlePageChange(number)}
                  >
                    {number}
                  </button>
                ))}
              </div>
              
              <button 
                className="pagination-btn"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ListCoupons;
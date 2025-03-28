import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './Reviews.css';
import api from '../../utils/api';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    rating: '',
    status: '',
    search: '',
    startDate: '',
    endDate: ''
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/review/admin/all');
      
      if (response.data.success) {
        setReviews(response.data.data);
        setFilteredReviews(response.data.data);
        setTotalPages(Math.ceil(response.data.data.length / itemsPerPage));
      } else {
        toast.error("Error fetching reviews");
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to fetch reviews");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprovalChange = async (reviewId, isApproved) => {
    try {
      const response = await api.patch(`/api/review/admin/${reviewId}`, { isApproved });
      
      if (response.data.success) {
        toast.success(response.data.message);
        // Update the review in the state
        setReviews(reviews.map(review => 
          review._id === reviewId ? { ...review, isApproved } : review
        ));
        applyFilters(); // Reapply filters
      } else {
        toast.error(response.data.message || "Error updating review");
      }
    } catch (error) {
      console.error("Error updating review:", error);
      toast.error("Failed to update review status");
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        const response = await api.delete(`/api/review/admin/${reviewId}`);
        
        if (response.data.success) {
          toast.success(response.data.message);
          // Remove the deleted review from state
          setReviews(reviews.filter(review => review._id !== reviewId));
          applyFilters(); // Reapply filters
        } else {
          toast.error(response.data.message || "Error deleting review");
        }
      } catch (error) {
        console.error("Error deleting review:", error);
        toast.error("Failed to delete review");
      }
    }
  };

  const applyFilters = () => {
    let result = [...reviews];
    
    // Filter by rating
    if (filters.rating) {
      result = result.filter(review => review.rating === parseInt(filters.rating));
    }
    
    // Filter by approval status
    if (filters.status === 'approved') {
      result = result.filter(review => review.isApproved);
    } else if (filters.status === 'rejected') {
      result = result.filter(review => !review.isApproved);
    }
    
    // Filter by search (comment content)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(review => 
        review.comment.toLowerCase().includes(searchLower) || 
        review.userId?.name?.toLowerCase().includes(searchLower) ||
        review.foodId?.name?.toLowerCase().includes(searchLower)
      );
    }
    
    // Filter by date range
    if (filters.startDate && filters.endDate) {
      const startDate = new Date(filters.startDate);
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59); // Set to end of day
      
      result = result.filter(review => {
        const reviewDate = new Date(review.createdAt);
        return reviewDate >= startDate && reviewDate <= endDate;
      });
    }
    
    setFilteredReviews(result);
    setTotalPages(Math.ceil(result.length / itemsPerPage));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const resetFilters = () => {
    setFilters({
      rating: '',
      status: '',
      search: '',
      startDate: '',
      endDate: ''
    });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, reviews, itemsPerPage]);

  // Get current items for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredReviews.slice(indexOfFirstItem, indexOfLastItem);

  // Generate pagination buttons
  const renderPaginationButtons = () => {
    const pageButtons = [];
    
    for (let i = 1; i <= totalPages; i++) {
      pageButtons.push(
        <button
          key={i}
          className={`pagination-button ${currentPage === i ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }
    
    return pageButtons;
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="reviews-container">
      <div className="reviews-header">
        <h2>Review Management</h2>
        <p className="reviews-subtitle">Manage customer reviews and ratings</p>
      </div>
      
      <div className="filter-container">
        <div className="filter-row">
          <div className="filter-group">
            <label>Rating</label>
            <select
              name="rating"
              value={filters.rating}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">All Ratings</option>
              <option value="1">1 Star</option>
              <option value="2">2 Stars</option>
              <option value="3">3 Stars</option>
              <option value="4">4 Stars</option>
              <option value="5">5 Stars</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">All Status</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Search</label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search by content, user, or food item..."
              className="filter-input"
            />
          </div>
          
          <div className="filter-group">
            <label>Start Date</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="filter-input"
            />
          </div>
          
          <div className="filter-group">
            <label>End Date</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="filter-input"
            />
          </div>
          
          <button className="reset-btn" onClick={resetFilters}>
            Reset Filters
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading reviews...</p>
        </div>
      ) : (
        <>
          <div className="reviews-stats">
            <p>Showing {currentItems.length} of {filteredReviews.length} reviews</p>
            <div className="items-per-page">
              <label>Items per page:</label>
              <select 
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
          
          <div className="reviews-list">
            {currentItems.length > 0 ? (
              currentItems.map((review) => (
                <div key={review._id} className="review-card">
                  <div className="review-header">
                    <div className="review-user">
                      <span className="user-name">{review.userId?.name || 'Anonymous'}</span>
                      <span className="review-date">{formatDate(review.createdAt)}</span>
                    </div>
                    <div className="review-rating">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <span key={index} className={`star ${index < review.rating ? 'filled' : 'empty'}`}>
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="review-content">
                    <p className="review-text">{review.comment}</p>
                    <div className="review-item">
                      <span className="label">Food Item:</span>
                      <span className="value">{review.foodId?.name || 'Unknown'}</span>
                    </div>
                    {review.orderId && (
                      <div className="review-item">
                        <span className="label">Order ID:</span>
                        <span className="value">{review.orderId}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="review-actions">
                    <div className="review-status">
                      <span className={`status-badge ${review.isApproved ? 'approved' : 'rejected'}`}>
                        {review.isApproved ? 'Approved' : 'Rejected'}
                      </span>
                    </div>
                    <div className="action-buttons">
                      {review.isApproved ? (
                        <button
                          className="reject-btn"
                          onClick={() => handleApprovalChange(review._id, false)}
                        >
                          Reject
                        </button>
                      ) : (
                        <button
                          className="approve-btn"
                          onClick={() => handleApprovalChange(review._id, true)}
                        >
                          Approve
                        </button>
                      )}
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteReview(review._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-reviews">
                <p>No reviews found matching your filters</p>
                <button className="reset-btn" onClick={resetFilters}>
                  Reset Filters
                </button>
              </div>
            )}
          </div>
          
          {totalPages > 1 && (
            <div className="pagination-container">
              <button
                className="pagination-button nav"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                &laquo; Previous
              </button>
              {renderPaginationButtons()}
              <button
                className="pagination-button nav"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next &raquo;
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Reviews; 
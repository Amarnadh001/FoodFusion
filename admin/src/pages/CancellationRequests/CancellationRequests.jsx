import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import './CancellationRequests.css';

const CancellationRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminResponse, setAdminResponse] = useState('');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/order/cancellation-requests');
      if (response.data.success) {
        setRequests(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching cancellation requests:', error);
      toast.error('Failed to fetch cancellation requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (orderId, action) => {
    try {
      if (!window.confirm(`Are you sure you want to ${action} this cancellation request?`)) {
        return;
      }

      setLoading(true);
      const response = await api.post('/api/order/handle-cancellation', {
        orderId,
        action,
        adminResponse: adminResponse.trim() || null
      });

      if (response.data.success) {
        toast.success(`Cancellation request ${action} successfully`);
        setSelectedRequest(null);
        setAdminResponse('');
        fetchRequests();
      }
    } catch (error) {
      console.error('Error handling cancellation request:', error);
      if (error.response?.status === 400) {
        toast.error(error.response.data.message || 'Invalid request. Please check the order status.');
      } else if (error.response?.status === 404) {
        toast.error('Order not found. Please refresh the page.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to handle cancellation request. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading && requests.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading cancellation requests...</p>
      </div>
    );
  }

  return (
    <div className="cancellation-requests">
      <h2>Order Cancellation Requests</h2>
      
      {loading && requests.length === 0 ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading cancellation requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="no-requests">
          <p>No pending cancellation requests</p>
        </div>
      ) : (
        <div className="requests-list">
          {requests.map((request) => (
            <div key={request._id} className="request-card">
              <div className="request-header">
                <h3>Order #{request._id.slice(-6)}</h3>
                <span className="request-date">
                  Requested: {formatDate(request.cancellationRequest.requestedAt)}
                </span>
              </div>

              <div className="request-details">
                <div className="user-info">
                  <h4>Customer Information</h4>
                  <p>Name: {request.userId.name}</p>
                  <p>Email: {request.userId.email}</p>
                  <p>Phone: {request.userId.phone}</p>
                </div>

                <div className="order-info">
                  <h4>Order Details</h4>
                  <p>Amount: ₹{request.amount}</p>
                  <p>Status: {request.status}</p>
                  <div className="order-items">
                    <h5>Items:</h5>
                    {request.items.map((item, index) => (
                      <p key={index}>
                        {item.name} × {item.quantity}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="cancellation-info">
                  <h4>Cancellation Reason</h4>
                  <p>{request.cancellationRequest.reason}</p>
                </div>
              </div>

              {selectedRequest === request._id ? (
                <div className="action-form">
                  <textarea
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    placeholder="Enter your response (optional)"
                    rows={3}
                  />
                  <div className="action-buttons">
                    <button
                      className={`action-btn approve ${loading ? 'disabled' : ''}`}
                      onClick={() => handleAction(request._id, 'approved')}
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : 'Approve'}
                    </button>
                    <button
                      className={`action-btn reject ${loading ? 'disabled' : ''}`}
                      onClick={() => handleAction(request._id, 'rejected')}
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : 'Reject'}
                    </button>
                    <button
                      className="cancel-btn"
                      onClick={() => {
                        setSelectedRequest(null);
                        setAdminResponse('');
                      }}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="action-buttons">
                  <button
                    className="view-btn"
                    onClick={() => setSelectedRequest(request._id)}
                    disabled={loading}
                  >
                    Take Action
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CancellationRequests; 
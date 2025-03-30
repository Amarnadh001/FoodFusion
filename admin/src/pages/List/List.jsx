import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "./List.css";
import api from "../../utils/api";

// Get the API base URL from wherever it's defined in your app
const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

const List = () => {
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    priceRange: { min: "", max: "" }
  });
  
  // Modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    isAvailable: true
  });
  const [newImage, setNewImage] = useState(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  
  const categories = ["All", "Salad", "Rolls", "Deserts", "Sandwich", "Cake", "Pure Veg", "Pasta", "Noodles"];

  const fetchList = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/api/food/list");
      if (response.data.success) {
        setList(response.data.data);
        setFilteredList(response.data.data);
        setTotalPages(Math.ceil(response.data.data.length / itemsPerPage));
      } else {
        toast.error("Error fetching food items");
      }
    } catch (error) {
      console.error("Error fetching food items:", error);
      toast.error("Failed to fetch food items");
    } finally {
      setIsLoading(false);
    }
  };

  const removeFood = async (foodId) => {
    if (window.confirm("Are you sure you want to remove this item?")) {
      setIsLoading(true);
      try {
        const response = await api.post("/api/food/remove", { id: foodId });
        if (response.data.success) {
          toast.success(response.data.message);
          await fetchList();
        } else {
          toast.error(response.data.message || "Error removing item");
        }
      } catch (error) {
        console.error("Error removing food item:", error);
        toast.error("Failed to remove item");
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const openEditModal = (item) => {
    setEditItem(item);
    setEditForm({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      isAvailable: item.isAvailable !== false, // default to true if not defined
      isSpecial: item.isSpecial || false
    });
    setShowEditModal(true);
  };
  
  const closeEditModal = () => {
    setShowEditModal(false);
    setEditItem(null);
    setNewImage(null);
  };
  
  const handleEditFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm({
      ...editForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const toggleSpecial = async (foodId, currentStatus) => {
    setIsLoading(true);
    try {
      const response = await api.post("/api/food/toggle-special", { id: foodId, isSpecial: !currentStatus });
      if (response.data.success) {
        toast.success("Today's Special status updated successfully");
        await fetchList();
      } else {
        toast.error(response.data.message || "Error updating Today's Special status");
      }
    } catch (error) {
      console.error("Error updating Today's Special status:", error);
      toast.error("Failed to update Today's Special status");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setNewImage(e.target.files[0]);
    }
  };
  
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    setIsLoading(true);
    try {
      // Create a form data object
      const formData = new FormData();
      formData.append('id', editItem._id);
      formData.append('name', editForm.name);
      formData.append('description', editForm.description);
      formData.append('price', editForm.price);
      formData.append('category', editForm.category);
      formData.append('isAvailable', editForm.isAvailable);
      
      // Only append image if a new one was selected
      if (newImage) {
        formData.append('image', newImage);
      }
      
      // Make API call to update the food item
      const response = await api.post('/api/food/update', formData);
      
      if (response.data.success) {
        toast.success("Food item updated successfully");
        closeEditModal();
        fetchList(); // Refresh the list
      } else {
        toast.error(response.data.message || "Error updating food item");
      }
    } catch (error) {
      console.error("Error updating food item:", error);
      toast.error("Failed to update food item");
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleAvailability = async (item) => {
    try {
      const response = await api.post('/api/food/toggle-availability', { 
        id: item._id,
        isAvailable: !item.isAvailable
      });
      
      if (response.data.success) {
        toast.success(`${item.name} is now ${!item.isAvailable ? 'available' : 'unavailable'}`);
        fetchList(); // Refresh the list
      } else {
        toast.error(response.data.message || "Error updating availability");
      }
    } catch (error) {
      console.error("Error toggling availability:", error);
      toast.error("Failed to update availability");
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  // Filter items based on search, category, and price range
  useEffect(() => {
    let result = [...list];
    
    // Filter by search term
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(searchTerm) || 
        item.description?.toLowerCase().includes(searchTerm)
      );
    }
    
    // Filter by category
    if (filters.category && filters.category !== "All") {
      result = result.filter(item => item.category === filters.category);
    }
    
    // Filter by price range
    if (filters.priceRange.min) {
      result = result.filter(item => Number(item.price) >= Number(filters.priceRange.min));
    }
    if (filters.priceRange.max) {
      result = result.filter(item => Number(item.price) <= Number(filters.priceRange.max));
    }
    
    setFilteredList(result);
    setTotalPages(Math.ceil(result.length / itemsPerPage));
    setCurrentPage(1); // Reset to first page when filtering
  }, [filters, list, itemsPerPage]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "min" || name === "max") {
      setFilters({
        ...filters,
        priceRange: {
          ...filters.priceRange,
          [name]: value
        }
      });
    } else {
      setFilters({
        ...filters,
        [name]: value
      });
    }
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      category: "",
      priceRange: { min: "", max: "" }
    });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e) => {
    const value = Number(e.target.value);
    setItemsPerPage(value);
    setTotalPages(Math.ceil(filteredList.length / value));
    setCurrentPage(1); // Reset to first page
  };

  // Get current items for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredList.slice(indexOfFirstItem, indexOfLastItem);

  // Generate page numbers
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="list-container">
      <div className="list-header">
        <h2>Food Items Management</h2>
        <p className="list-subtitle">Manage your restaurant's menu items</p>
      </div>
      
      <div className="filter-container">
        <div className="filter-row">
          <div className="filter-group">
            <label>Search</label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search by name..."
              className="filter-input"
            />
          </div>
          
          <div className="filter-group">
            <label>Category</label>
            <select 
              name="category" 
              value={filters.category} 
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">All Categories</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group price-range">
            <label>Price Range (₹)</label>
            <div className="price-inputs">
              <input
                type="number"
                name="min"
                value={filters.priceRange.min}
                onChange={handleFilterChange}
                placeholder="Min"
                className="filter-input price-input"
              />
              <span>to</span>
              <input
                type="number"
                name="max"
                value={filters.priceRange.max}
                onChange={handleFilterChange}
                placeholder="Max"
                className="filter-input price-input"
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
          <p>Loading items...</p>
        </div>
      ) : (
        <>
          <div className="list-stats">
            <p>Showing {currentItems.length} of {filteredList.length} items</p>
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
              <div className="list-cell">Image</div>
              <div className="list-cell">Name</div>
              <div className="list-cell">Category</div>
              <div className="list-cell">Price</div>
              <div className="list-cell">Status</div>
              <div className="list-cell">Actions</div>
            </div>
            
            {currentItems.length > 0 ? (
              currentItems.map((item, index) => (
                <div key={index} className="list-table-row">
                  <div className="list-cell">
                    <img 
                      src={item.imageUrl ? `${API_URL}/uploads/${item.imageUrl}` : `${API_URL}/uploads/placeholder.jpg`} 
                      alt={item.name}
                      className="food-image"
                      onError={(e) => {
                        console.log(`Error loading image: ${e.target.src}`);
                        e.target.src = `${API_URL}/uploads/placeholder.jpg`;
                        // If placeholder is also not available, use a direct data URI
                        e.target.onerror = () => {
                          e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM5OTkiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==";
                          e.target.onerror = null; // Prevent infinite loop
                        };
                      }}
                    />
                  </div>
                  <div className="list-cell">
                    <div className="food-name">{item.name}</div>
                    {item.description && (
                      <div className="food-description">
                        {item.description.length > 80 
                          ? `${item.description.substring(0, 80)}...` 
                          : item.description}
                      </div>
                    )}
                  </div>
                  <div className="list-cell">
                    <span className="category-badge">{item.category}</span>
                  </div>
                  <div className="list-cell price-cell">₹{item.price}</div>
                  <div className="list-cell">
                    <span className={`status-badge ${item.isAvailable !== false ? 'available' : 'unavailable'}`}>
                      {item.isAvailable !== false ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                  <div className="list-cell actions-cell">
                    <button 
                      className="action-btn edit-btn"
                      onClick={() => openEditModal(item)}
                      title="Edit item"
                    >
                      <i className="fa fa-edit"></i> Edit
                    </button>
                    <button 
                      className="action-btn toggle-btn"
                      onClick={() => toggleAvailability(item)}
                      title={item.isAvailable !== false ? "Mark as unavailable" : "Mark as available"}
                    >
                      <i className={`fa fa-${item.isAvailable !== false ? 'times' : 'check'}`}></i> 
                      {item.isAvailable !== false ? 'Mark Unavailable' : 'Mark Available'}
                    </button>
                    <button 
                      className="action-btn delete-btn"
                      onClick={() => removeFood(item._id)}
                      title="Remove item"
                    >
                      <i className="fa fa-trash"></i> Remove
                    </button>
                    <button
                      onClick={() => toggleSpecial(item._id, item.isSpecial)}
                      className={`special-btn ${item.isSpecial ? 'active' : ''}`}
                    >
                      {item.isSpecial ? "Remove from Special" : "Add to Special"}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results">
                <p>No items found matching your filters</p>
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
      
      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="edit-modal">
            <div className="modal-header">
              <h3>Edit Food Item</h3>
              <button className="close-modal" onClick={closeEditModal}>×</button>
            </div>
            <form onSubmit={handleEditSubmit} className="edit-form">
              <div className="form-group">
                <label>Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={editForm.name} 
                  onChange={handleEditFormChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  name="description" 
                  value={editForm.description} 
                  onChange={handleEditFormChange}
                  required
                ></textarea>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select 
                    name="category" 
                    value={editForm.category} 
                    onChange={handleEditFormChange}
                    required
                  >
                    {categories.filter(c => c !== "All").map((category, index) => (
                      <option key={index} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Price (₹)</label>
                  <input 
                    type="number" 
                    name="price" 
                    value={editForm.price} 
                    onChange={handleEditFormChange}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Current Image</label>
                <div className="current-image-container">
                  <img 
                    src={`${API_URL}/uploads/${editItem.imageUrl}`} 
                    alt={editItem.name}
                    className="current-image"
                    onError={(e) => {
                      e.target.src = `${API_URL}/uploads/placeholder.jpg`;
                      e.target.onerror = () => {
                        e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM5OTkiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==";
                      };
                    }}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>New Image (optional)</label>
                <input 
                  type="file" 
                  name="image" 
                  onChange={handleImageChange}
                  accept="image/*"
                />
                {newImage && (
                  <div className="new-image-preview">
                    <img 
                      src={URL.createObjectURL(newImage)} 
                      alt="New image preview" 
                    />
                  </div>
                )}
              </div>
              
              <div className="form-group checkbox-group">
                <input 
                  type="checkbox" 
                  name="isAvailable" 
                  id="isAvailable"
                  checked={editForm.isAvailable} 
                  onChange={handleEditFormChange}
                />
                <label htmlFor="isAvailable">Item is available</label>
              </div>
              
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={closeEditModal}>Cancel</button>
                <button type="submit" className="save-btn" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default List;
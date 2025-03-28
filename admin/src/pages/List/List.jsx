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
                  <div className="list-cell actions-cell">
                    <button 
                      className="action-btn delete-btn"
                      onClick={() => removeFood(item._id)}
                      title="Remove item"
                    >
                      <i className="fa fa-trash"></i> Remove
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
    </div>
  );
};

export default List;
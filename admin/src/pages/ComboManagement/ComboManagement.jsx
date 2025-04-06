import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import './ComboManagement.css';

const ComboManagement = () => {
    const [foodItems, setFoodItems] = useState([]);
    const [combos, setCombos] = useState([]);
    const [filteredCombos, setFilteredCombos] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [filters, setFilters] = useState({
        status: 'all',
        priceRange: { min: '', max: '' },
        dateRange: { start: '', end: '' }
    });
    const [comboForm, setComboForm] = useState({
        name: '',
        description: '',
        price: '',
        coverImage: null
    });

    useEffect(() => {
        fetchFoodItems();
        fetchCombos();
    }, []);

    useEffect(() => {
        filterCombos();
    }, [combos, filters]);

    const filterCombos = () => {
        let filtered = [...combos];

        // Filter by price range
        if (filters.priceRange.min !== '') {
            filtered = filtered.filter(combo => combo.price >= Number(filters.priceRange.min));
        }
        if (filters.priceRange.max !== '') {
            filtered = filtered.filter(combo => combo.price <= Number(filters.priceRange.max));
        }

        // Filter by date range
        if (filters.dateRange.start) {
            const startDate = new Date(filters.dateRange.start);
            filtered = filtered.filter(combo => new Date(combo.createdAt) >= startDate);
        }
        if (filters.dateRange.end) {
            const endDate = new Date(filters.dateRange.end);
            filtered = filtered.filter(combo => new Date(combo.createdAt) <= endDate);
        }

        setFilteredCombos(filtered);
    };

    const handleFilterChange = (type, value) => {
        setFilters(prev => {
            if (type === 'priceMin' || type === 'priceMax') {
                return {
                    ...prev,
                    priceRange: {
                        ...prev.priceRange,
                        [type === 'priceMin' ? 'min' : 'max']: value
                    }
                };
            } else if (type === 'dateStart' || type === 'dateEnd') {
                return {
                    ...prev,
                    dateRange: {
                        ...prev.dateRange,
                        [type === 'dateStart' ? 'start' : 'end']: value
                    }
                };
            }
            return prev;
        });
    };

    const fetchFoodItems = async () => {
        try {
            const response = await api.get('/api/food/list');
            if (response.data.success) {
                // Process food items to include full image URL path
                const processedFoodItems = response.data.data.map(item => ({
                    ...item,
                    // Ensure imageUrl has the full path including the server URL and uploads directory
                    imageUrl: item.imageUrl ? (item.imageUrl.includes('http') ? item.imageUrl : `${api.defaults.baseURL}/uploads/${item.imageUrl}`) : ''
                }));
                setFoodItems(processedFoodItems);
            }
        } catch (error) {
            console.error('Error fetching food items:', error);
            toast.error('Failed to fetch food items');
        }
    };

    const fetchCombos = async () => {
        try {
            const response = await api.get('/api/combo/list');
            if (response.data.success) {
                setCombos(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching combos:', error);
            toast.error('Failed to fetch combos');
        }
    };

    const handleItemSelect = (item) => {
        setSelectedItems(prev => {
            const isSelected = prev.find(i => i._id === item._id);
            if (isSelected) {
                return prev.filter(i => i._id !== item._id);
            }
            return [...prev, item];
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setComboForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setComboForm(prev => ({
                ...prev,
                coverImage: file
            }));
        }
    };

    const handleCreateCombo = async (e) => {
        e.preventDefault();
        if (selectedItems.length < 2) {
            toast.warning('Please select at least 2 items for a combo');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('name', comboForm.name);
            formData.append('description', comboForm.description);
            formData.append('price', Number(comboForm.price));
            formData.append('coverImage', comboForm.coverImage);
            formData.append('foodItems', JSON.stringify(selectedItems.map(item => item._id)));


            const response = await api.post('/api/combo/create', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                toast.success('Combo created successfully');
                setComboForm({ name: '', description: '', price: '' });
                setSelectedItems([]);
                fetchCombos();
            }
        } catch (error) {
            console.error('Error creating combo:', error);
            toast.error('Failed to create combo');
        }
    };

    const handleDeleteCombo = async (comboId) => {
        if (window.confirm('Are you sure you want to delete this combo?')) {
            try {
                const response = await api.delete(`/api/combo/delete/${comboId}`);
                if (response.data.success) {
                    toast.success('Combo deleted successfully');
                    fetchCombos();
                }
            } catch (error) {
                console.error('Error deleting combo:', error);
                toast.error('Failed to delete combo');
            }
        }
    };

    return (
        <div className="combo-management">
            <div className="combo-creation">
                <h2>Create New Combo</h2>
                <form onSubmit={handleCreateCombo}>
                    <div className="form-group">
                        <input
                            type="text"
                            name="name"
                            value={comboForm.name}
                            onChange={handleInputChange}
                            placeholder="Combo Name"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <textarea
                            name="description"
                            value={comboForm.description}
                            onChange={handleInputChange}
                            placeholder="Combo Description"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="number"
                            name="price"
                            value={comboForm.price}
                            onChange={handleInputChange}
                            placeholder="Combo Price"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="coverImage">Cover Image:</label>
                        <input
                            type="file"
                            id="coverImage"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                    </div>
                    <button type="submit" className="create-combo-btn">
                        Create Combo
                    </button>
                </form>

                <div className="selected-items">
                    <h3>Selected Items ({selectedItems.length})</h3>
                    <div className="selected-items-list">
                        {selectedItems.map(item => (
                            <div key={item._id} className="selected-item">
                                <span>{item.name}</span>
                                <button onClick={() => handleItemSelect(item)}>Remove</button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="food-items-list">
                    <h3>Available Food Items</h3>
                    <div className="items-grid">
                        {foodItems.map(item => (
                            <div
                                key={item._id}
                                className={`food-item ${selectedItems.find(i => i._id === item._id) ? 'selected' : ''}`}
                                onClick={() => handleItemSelect(item)}
                            >
                                <img 
                                    src={item.imageUrl || ''} 
                                    alt={item.name} 
                                    onError={(e) => {
                                        e.target.onerror = null; 
                                        e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                                    }} 
                                />
                                <div className="item-details">
                                    <h4>{item.name}</h4>
                                    <p>₹{item.price}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="existing-combos">
                <h2>Existing Combos</h2>
                <div className="filter-section">
                    <div className="filter-group">
                        <label>Price Range:</label>
                        <input
                            type="number"
                            placeholder="Min Price"
                            value={filters.priceRange.min}
                            onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                        />
                        <input
                            type="number"
                            placeholder="Max Price"
                            value={filters.priceRange.max}
                            onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                        />
                    </div>
                    <div className="filter-group">
                        <label>Date Range:</label>
                        <input
                            type="date"
                            value={filters.dateRange.start}
                            onChange={(e) => handleFilterChange('dateStart', e.target.value)}
                        />
                        <input
                            type="date"
                            value={filters.dateRange.end}
                            onChange={(e) => handleFilterChange('dateEnd', e.target.value)}
                        />
                    </div>
                </div>
                <div className="combos-list">
                    {filteredCombos.map(combo => (
                        <div key={combo._id} className="combo-item">
                            <h3>{combo.name}</h3>
                            <p>{combo.description}</p>
                            <p className="price">₹{combo.price}</p>
                            <div className="combo-foods">
                                {combo.foodItems.map(food => (
                                    <span key={food._id}>{food.name}</span>
                                ))}
                            </div>
                            <button
                                onClick={() => handleDeleteCombo(combo._id)}
                                className="delete-btn"
                            >
                                Delete Combo
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ComboManagement;
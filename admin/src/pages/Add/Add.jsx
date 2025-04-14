import React, { useState } from "react";
import { toast } from "react-toastify";
import { assets } from "../../assets/assets";
import "./Add.css";
import api from "../../utils/api";

const Add = () => {
  const [image, setImage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Salad",
    ingredients: "", 
    Advantages: "",
    isVegetarian: false,
    isSpicy: false,
    preparationTime: "",
    calories: "",
  });
  const [errors, setErrors] = useState({});

  const categories = ["Salad", "Rolls", "Deserts", "Sandwich", "Cake", "Pure Veg", "Pure Non Veg", "Pasta", "Noodles", "Tiffins"];

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setData((data) => ({ ...data, [name]: value }));
    
    // Clear error for this field when user makes changes
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!data.name.trim()) newErrors.name = "Name is required";
    if (!data.description.trim()) newErrors.description = "Description is required";
    if (!data.price.trim()) newErrors.price = "Price is required";
    else if (isNaN(data.price) || Number(data.price) <= 0) newErrors.price = "Price must be a positive number";
    if (!image) newErrors.image = "Image is required";
    if (!data.ingredients.trim()) newErrors.ingredients = "Ingredients are required";
    
    // Optional validation
    if (data.preparationTime && (isNaN(data.preparationTime) || Number(data.preparationTime) <= 0)) {
      newErrors.preparationTime = "Preparation time must be a positive number";
    }
    
    if (data.calories && (isNaN(data.calories) || Number(data.calories) <= 0)) {
      newErrors.calories = "Calories must be a positive number";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("price", Number(data.price));
    formData.append("category", data.category);
    formData.append("ingredients", data.ingredients);
    formData.append("Advantages", data.Advantages);
    formData.append("image", image);
    formData.append("isVegetarian", data.isVegetarian);
    formData.append("isSpicy", data.isSpicy);
    
    if (data.preparationTime) {
      formData.append("preparationTime", Number(data.preparationTime));
    }
    
    if (data.calories) {
      formData.append("calories", Number(data.calories));
    }

    try {
      const response = await api.post("/api/food/add", formData);
      if (response.data.success) {
        setData({
          name: "",
          description: "",
          price: "",
          category: "Salad",
          ingredients: "",
          Advantages: "",
          isVegetarian: false,
          isSpicy: false,
          preparationTime: "",
          calories: "",
        });
        setImage(false);
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Error adding food item");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="add-container">
      <div className="add-header">
        <h2>Add New Food Item</h2>
        <p className="add-subtitle">Create a new food item for your menu</p>
      </div>
      
      <form className="add-form" onSubmit={onSubmitHandler}>
        <div className="form-grid">
          <div className="form-column">
            <div className="form-group">
              <label className="form-label">Item Name</label>
              <input 
                type="text" 
                name="name" 
                value={data.name} 
                onChange={onChangeHandler} 
                className={`form-input ${errors.name ? 'input-error' : ''}`}
                placeholder="Enter item name" 
              />
              {errors.name && <div className="error-message">{errors.name}</div>}
            </div>
            
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea 
                name="description" 
                value={data.description} 
                onChange={onChangeHandler} 
                rows="5" 
                className={`form-input ${errors.description ? 'input-error' : ''}`}
                placeholder="Describe the food item"
              ></textarea>
              {errors.description && <div className="error-message">{errors.description}</div>}
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select 
                  name="category" 
                  value={data.category} 
                  onChange={onChangeHandler}
                  className="form-input"
                >
                  {categories.map((category, index) => (
                    <option key={index} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Price (₹)</label>
                <input 
                  type="number" 
                  name="price" 
                  value={data.price} 
                  onChange={onChangeHandler}
                  className={`form-input ${errors.price ? 'input-error' : ''}`}
                  placeholder="Enter price" 
                  min="0"
                  step="0.01"
                />
                {errors.price && <div className="error-message">{errors.price}</div>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Preparation Time (mins)</label>
                <input 
                  type="number" 
                  name="preparationTime" 
                  value={data.preparationTime} 
                  onChange={onChangeHandler}
                  className={`form-input ${errors.preparationTime ? 'input-error' : ''}`}
                  placeholder="e.g., 15" 
                  min="0"
                />
                {errors.preparationTime && <div className="error-message">{errors.preparationTime}</div>}
              </div>
              
              <div className="form-group">
                <label className="form-label">Calories</label>
                <input 
                  type="number" 
                  name="calories" 
                  value={data.calories} 
                  onChange={onChangeHandler}
                  className={`form-input ${errors.calories ? 'input-error' : ''}`}
                  placeholder="e.g., 149" 
                  min="0"
                />
                {errors.calories && <div className="error-message">{errors.calories}</div>}
              </div>
              
              <div className="form-group">
                <label className="form-label">Protein (g)</label>
                <input 
                  type="number" 
                  name="protein" 
                  value={data.protein} 
                  onChange={onChangeHandler}
                  className={`form-input ${errors.protein ? 'input-error' : ''}`}
                  placeholder="e.g., 15" 
                  min="0"
                />
                {errors.protein && <div className="error-message">{errors.protein}</div>}
              </div>
              
              <div className="form-group">
                <label className="form-label">Carbs (g)</label>
                <input 
                  type="number" 
                  name="carbs" 
                  value={data.carbs} 
                  onChange={onChangeHandler}
                  className={`form-input ${errors.carbs ? 'input-error' : ''}`}
                  placeholder="e.g., 30" 
                  min="0"
                />
                {errors.carbs && <div className="error-message">{errors.carbs}</div>}
              </div>
              
              <div className="form-group">
                <label className="form-label">Fat (g)</label>
                <input 
                  type="number" 
                  name="fat" 
                  value={data.fat} 
                  onChange={onChangeHandler}
                  className={`form-input ${errors.fat ? 'input-error' : ''}`}
                  placeholder="e.g., 12" 
                  min="0"
                />
                {errors.fat && <div className="error-message">{errors.fat}</div>}
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Ingredients</label>
              <textarea 
                name="ingredients" 
                value={data.ingredients} 
                onChange={onChangeHandler} 
                rows="3" 
                className={`form-input ${errors.ingredients ? 'input-error' : ''}`}
                placeholder="Enter ingredients separated by commas"
              ></textarea>
              {errors.ingredients && <div className="error-message">{errors.ingredients}</div>}
            </div>
            
            <div className="form-group">
              <label className="form-label">Food Advantages</label>
              <textarea 
                name="Advantages" 
                value={data.Advantages} 
                onChange={onChangeHandler} 
                rows="3" 
                className="form-input"
                placeholder="Enter health benefits or unique selling points"
              ></textarea>
            </div>
            
            <div className="form-row checkbox-row">
              <div className="form-group checkbox-group">
                <input 
                  type="checkbox" 
                  id="isVegetarian" 
                  name="isVegetarian" 
                  checked={data.isVegetarian} 
                  onChange={onChangeHandler}
                  className="checkbox-input"
                />
                <label htmlFor="isVegetarian" className="checkbox-label">Vegetarian</label>
              </div>
              
              <div className="form-group checkbox-group">
                <input 
                  type="checkbox" 
                  id="isSpicy" 
                  name="isSpicy" 
                  checked={data.isSpicy} 
                  onChange={onChangeHandler}
                  className="checkbox-input"
                />
                <label htmlFor="isSpicy" className="checkbox-label">Spicy</label>
              </div>
            </div>
          </div>
          
          <div className="form-column image-column">
            <div className="form-group image-upload-container">
              <label className="form-label">Food Image</label>
              <div className={`image-upload-area ${errors.image ? 'upload-error' : ''}`}>
                <label htmlFor="image-upload" className="image-upload-label">
                  {image ? (
                    <img 
                      src={URL.createObjectURL(image)} 
                      alt="Food preview" 
                      className="uploaded-image-preview" 
                    />
                  ) : (
                    <>
                      <img src={assets.upload_area} alt="Upload" className="upload-icon" />
                      <p className="upload-text">Click to upload image</p>
                      <p className="upload-hint">JPG, PNG or GIF, Max 5MB</p>
                    </>
                  )}
                </label>
                <input 
                  type="file" 
                  id="image-upload" 
                  onChange={(e) => {
                    setImage(e.target.files[0]);
                    if (errors.image) {
                      setErrors((prev) => ({ ...prev, image: null }));
                    }
                  }} 
                  accept="image/*" 
                  className="image-input" 
                  hidden 
                />
              </div>
              {errors.image && <div className="error-message">{errors.image}</div>}
            </div>
            
            <div className="image-guidelines">
              <h4>Image Guidelines</h4>
              <ul>
                <li>Use high-quality images</li>
                <li>Square format works best</li>
                <li>Good lighting to showcase the food</li>
                <li>Minimum resolution 600x600px</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-button"
            onClick={() => {
              if (window.confirm("Are you sure you want to clear the form?")) {
                setData({
                  name: "",
                  description: "",
                  price: "",
                  category: "Salad",
                  ingredients: "",
                  Advantages: "",
                  isVegetarian: false,
                  isSpicy: false,
                  preparationTime: "",
                  calories: "",
                });
                setImage(false);
                setErrors({});
              }
            }}
          >
            Reset Form
          </button>
          <button 
            type="submit" 
            className="submit-button"
            disabled={isLoading}
          >
            {isLoading ? 'Adding Item...' : 'Add Food Item'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Add;
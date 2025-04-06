import React from 'react';
import './ComboDetails.css';

const ComboDetails = ({ combo, onClose }) => {
  if (!combo) return null;

  // Create a collage-style layout for food item images
  const renderImageCollage = () => {
    const foodItems = combo.foodItems || [];
    const imageCount = foodItems.length;
    
    if (imageCount === 0) return null;

    return (
      <div className={`image-collage items-${imageCount}`}>
        {foodItems.map((item, index) => (
          <div key={index} className="collage-item">
            <img 
              src={item.imageUrl ? (item.imageUrl.includes('http') ? item.imageUrl : `${combo.url}/uploads/${item.imageUrl}`) : `${combo.url}/uploads/placeholder.jpg`}
              alt={item.name}
              onError={(e) => {
                e.target.src = `${combo.url}/uploads/placeholder.jpg`;
                e.target.onerror = () => {
                  e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM5OTkiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==";
                };
              }}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="combo-details-overlay">
      <div className="combo-details-modal">
        <button className="close-button" onClick={onClose}>&times;</button>
        
        <h2>{combo.name}</h2>
        <p className="combo-price">₹{combo.price}</p>
        <p className="combo-description">{combo.description}</p>

        {renderImageCollage()}

        <div className="combo-items-list">
          <h3>Included Items:</h3>
          <ul>
            {(combo.foodItems || []).map((item, index) => (
              <li key={index}>
                <div className="item-image">
                  <img 
                    src={item.imageUrl ? (item.imageUrl.includes('http') ? item.imageUrl : `${combo.url}/uploads/${item.imageUrl}`) : `${combo.url}/uploads/placeholder.jpg`}
                    alt={item.name}
                    onError={(e) => {
                      e.target.src = `${combo.url}/uploads/placeholder.jpg`;
                      e.target.onerror = () => {
                        e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM5OTkiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==";
                      };
                    }}
                  />
                </div>
                <div className="item-details">
                  <h4>{item.name}</h4>
                  <p>{item.description}</p>
                  <p className="item-price">₹{item.price}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ComboDetails;
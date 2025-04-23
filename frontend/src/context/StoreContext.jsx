import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState({});
    const url = "https://foodfusion-backend-lfj9.onrender.com";
    const [token, setToken] = useState("");
    const [userId, setUserId] = useState("");
    const [food_list, setFoodList] = useState([]);
    const [combos, setCombos] = useState([]);
    const [discountedTotal, setDiscountedTotal] = useState(0); // Add discounted total state

    // Helper function to process image URLs
    const processImageUrl = (imageUrl) => {
        if (!imageUrl) return '/placeholder.jpg'; // Default placeholder
        if (imageUrl.startsWith('http')) return imageUrl; // Already a full URL
        if (imageUrl.startsWith('/uploads')) return `${url}${imageUrl}`; // Relative path starting with /uploads
        return `${url}/uploads/${imageUrl}`; // Regular relative path
    };

    // Cart operations with error handling
    const addToCart = async (itemId) => {
        const newCart = { ...cartItems };
        newCart[itemId] = (newCart[itemId] || 0) + 1;
        setCartItems(newCart);

        if (token && userId) {
            try {
                await axios.post(`${url}/api/cart/add`, 
                    { itemId, userId }, 
                    { headers: { token } }
                );
            } catch (error) {
                console.error("Add to cart error:", error.response?.data);

                if (error.response?.status === 401) {
                    handleInvalidToken();
                }
            }
        }
    };

    const removeFromCart = async (itemId) => {
        const newCart = { ...cartItems };
        if (newCart[itemId] > 0) {
            newCart[itemId] -= 1;
            setCartItems(newCart);

            if (token && userId) {
                try {
                    await axios.post(`${url}/api/cart/remove`, 
                        { itemId, userId }, 
                        { headers: { token } }
                    );
                } catch (error) {
                    console.error("Remove from cart error:", error.response?.data);
                }
            }
        }
    };

    // Calculate total with null safety, including both food items and combos
    const getTotalCartAmount = () => {
        let total = 0;
        
        // Calculate total for regular food items
        food_list.forEach(item => {
            const quantity = cartItems[item._id] || 0;
            total += (item.price || 0) * quantity;
        });

        // Calculate total for combo items
        combos.forEach(combo => {
            const quantity = cartItems[combo._id] || 0;
            total += (combo.price || 0) * quantity;
        });

        return total;
    };

    // Data fetching functions
    const fetchFoodList = async () => {
        try {
            const [foodResponse, comboResponse] = await Promise.all([
                axios.get(`${url}/api/food/list`),
                axios.get(`${url}/api/combo/list`)
            ]);

            // Process food data
            const processedFoodData = foodResponse.data.data.map(item => ({
                ...item,
                image: processImageUrl(item.image),
                imageUrl: processImageUrl(item.imageUrl),
                isCombo: false
            }));

            // Process combo data with food items
            const processedComboData = comboResponse.data.data.map(combo => ({
                ...combo,
                image: processImageUrl(combo.image),
                imageUrl: processImageUrl(combo.imageUrl),
                isCombo: true,
                foodItems: combo.foodItems.map(item => ({
                    ...item,
                    image: processImageUrl(item.image),
                    imageUrl: processImageUrl(item.imageUrl)
                }))
            }));

            setFoodList(processedFoodData);
            setCombos(processedComboData);
        } catch (error) {
            console.error("Food list fetch error:", error);
        }
    };

    const loadCartData = async () => {
        const currentToken = localStorage.getItem("token");
        const currentUserId = localStorage.getItem("userId");

        if (!currentToken || !currentUserId) {
            console.error("No token or userId found");
            setCartItems({});
            return;
        }

        try {
            const response = await axios.post(`${url}/api/cart/get`, 
                { userId: currentUserId },
                {
                    headers: { 
                        'Content-Type': 'application/json',
                        'token': currentToken
                    }
                }
            );
            
            if (response.data && response.data.success && response.data.cartData) {
                setCartItems(response.data.cartData);
            } else {
                console.error("Invalid cart data response:", response.data);
                setCartItems({});
            }
        } catch (error) {
            console.error("Cart load error:", error.response?.data || error.message);

            if (error.response?.status === 401) {
                handleInvalidToken();
            } else {
                setCartItems({});
            }
        }
    };

    // Token management
    const handleInvalidToken = () => {
        setToken("");
        setUserId("");
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        setCartItems({});
    };

    // Effect hooks
    useEffect(() => {
        fetchFoodList();
    }, []);

    useEffect(() => {
        const initializeAuth = async () => {
            const storedToken = localStorage.getItem("token");
            const storedUserId = localStorage.getItem("userId");
            if (storedToken && storedUserId) {
                setToken(storedToken);
                setUserId(storedUserId);
                await loadCartData();
            }
        };
        initializeAuth();
    }, []);

    useEffect(() => {
        if (token) {
            localStorage.setItem("token", token);
            loadCartData();
        }
    }, [token]);

    useEffect(() => {
        if (userId) {
            localStorage.setItem("userId", userId);
        }
    }, [userId]);

    // Context value
    const contextValue = {
        food_list,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        getTotalCartAmount,
        url,
        token,
        setToken,
        userId,
        setUserId,
        handleInvalidToken,
        discountedTotal,
        setDiscountedTotal,
        combos
    };

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    );
};

export default StoreContextProvider;
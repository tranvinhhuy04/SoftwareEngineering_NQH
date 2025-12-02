import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const CartContext = createContext();

// ==========================
// API GATEWAY URL
// ==========================
const API_BASE_URL = "http://localhost:8000/order";

// ==========================
// AUTH HEADERS
// ==========================
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // ==========================
  // FETCH CART
  // ==========================
  const loadCart = async () => {
    try {
      const headers = getAuthHeaders();
      const res = await axios.get(`${API_BASE_URL}/cart`, { headers });
      setCart(res.data.items || []);
    } catch (err) {
      console.error("LOAD CART ERROR:", err?.response?.data || err.message);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) loadCart();
  }, []);

  // ==========================
  // NORMALIZE ITEM
  // ==========================
  const normalizeItem = (item) => {
    return {
      menuId: item.menuId || item._id,

      name: item.name,
      price: Number(item.price) || 0,

      imageUrl:
        item.imageUrl ||
        item.image_url ||
        item.image ||
        item.img ||
        "",

      restaurantId:
        item.restaurantId ||
        item.restaurant?._id ||
        item.restaurant_id ||
        "",

      restaurantName:
        item.restaurantName ||
        item.restaurant?.name ||
        item.restaurant_name ||
        "",
    };
  };

  // ==========================
  // ADD ITEM
  // ==========================
  const addToCart = async (item) => {
    try {
      const headers = getAuthHeaders();
      const body = normalizeItem(item);

      const res = await axios.post(
        `${API_BASE_URL}/cart/add`,
        body,
        { headers }
      );

      setCart(res.data.items || []);
    } catch (err) {
      console.error("ADD TO CART ERROR:", err?.response?.data || err.message);
    }
  };

  // ==========================
  // REMOVE ITEM
  // ==========================
  const removeFromCart = async (menuId) => {
    try {
      const headers = getAuthHeaders();

      const res = await axios.delete(
        `${API_BASE_URL}/cart/remove/${menuId}`,
        { headers }
      );

      setCart(res.data.items || []);
    } catch (err) {
      console.error("REMOVE CART ERROR:", err?.response?.data || err.message);
    }
  };

  // ==========================
  // CLEAR CART
  // ==========================
  const clearCart = async () => {
    try {
      const headers = getAuthHeaders();
      await axios.delete(`${API_BASE_URL}/cart/clear`, { headers });
      setCart([]);
    } catch (err) {
      console.error("CLEAR CART ERROR:", err?.response?.data || err.message);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        loadCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;

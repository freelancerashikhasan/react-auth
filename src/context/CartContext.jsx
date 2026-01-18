// context/CartContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const CartContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCartCount();
  }, []);

  const loadCartCount = async () => {
    try {
      const localCart = JSON.parse(localStorage.getItem('cart')) || [];
      setCartCount(localCart.length);
    } catch (error) {
      console.error('Error loading cart count:', error);
    }
  };

  const addToCart = async (productId, type = 'book', quantity = 1) => {
    try {
      const localCart = JSON.parse(localStorage.getItem('cart')) || [];
      
      const existingItemIndex = localCart.findIndex(
        item => item.id == productId && item.type === type
      );
      
      if (existingItemIndex >= 0) {
        localCart[existingItemIndex].quantity += quantity;
      } else {
        localCart.push({
          id: productId,
          type: type,
          quantity: quantity
        });
      }
      
      localStorage.setItem('cart', JSON.stringify(localCart));
      setCartCount(localCart.length);
      
      // Update API
      await axios.post(`${API_URL}/cart/add`, {
        id: productId,
        type: type,
        quantity: quantity
      }, {
        withCredentials: true
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error adding to cart:', error);
      return { success: false, error: error.message };
    }
  };

  const removeFromCart = async (productId, type) => {
    try {
      const localCart = JSON.parse(localStorage.getItem('cart')) || [];
      const updatedCart = localCart.filter(
        item => !(item.id == productId && item.type === type)
      );
      
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      setCartCount(updatedCart.length);
      
      // Update API
      await axios.delete(`${API_URL}/cart/remove/${productId}`, {
        data: { type: type },
        withCredentials: true
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error removing from cart:', error);
      return { success: false, error: error.message };
    }
  };

  const updateCartItemQuantity = async (productId, type, quantity) => {
    try {
      const localCart = JSON.parse(localStorage.getItem('cart')) || [];
      const updatedCart = localCart.map(item => {
        if (item.id == productId && item.type === type) {
          return { ...item, quantity: quantity };
        }
        return item;
      });
      
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      
      // Update API
      await axios.put(`${API_URL}/cart/update/${productId}`, {
        quantity: quantity,
        type: type
      }, {
        withCredentials: true
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error updating cart:', error);
      return { success: false, error: error.message };
    }
  };

  const clearCart = () => {
    localStorage.removeItem('cart');
    setCartCount(0);
    setCartItems([]);
  };

  const value = {
    cartCount,
    cartItems,
    loading,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    loadCartCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
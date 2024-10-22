import React, { createContext, useState, useEffect } from 'react';
import { BASE_URL } from './config';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = () => {
    fetch(`${BASE_URL}/cart`, {
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log('Fetched cart items:', data);
        setCartItems(data);
      })
      .catch(error => console.error('Error fetching cart items:', error));
  };

  const addToCart = async (newItem) => {
    try {
      const response = await fetch(`${BASE_URL}/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        }, 

        
        body: JSON.stringify(newItem),
      });
      const data = await response.json();
      console.log('Response from adding to cart:', data);
      if (response.ok) {
        fetchCartItems();
      } else {
        console.error('Error adding to cart:', data.error);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const response = await fetch(`${BASE_URL}/cart/remove/${itemId}`, {
        method: 'DELETE',
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
      if (response.ok) {
        fetchCartItems();
      } else {
        const errorData = await response.json();
        console.error('Error removing from cart:', errorData.error);
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    try {
      const response = await fetch(`${BASE_URL}/cart/update/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });
      if (response.ok) {
        fetchCartItems();
      } else {
        console.error('Error updating cart');
      }
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  };

  // New clearCart function
  const clearCart = async () => {
    try {
      const response = await fetch(`${BASE_URL}/cart/clear`, {
        method: 'DELETE', 
          headers: {
            'ngrok-skip-browser-warning': 'true'
          }
        });
      if (response.ok) {
        setCartItems([]);
        localStorage.removeItem('cart');
      } else {
        console.error('Error clearing cart');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

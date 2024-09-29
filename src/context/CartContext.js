import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = () => {
    fetch('http://127.0.0.1:5001/api/cart')
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
      const response = await fetch('http://127.0.0.1:5001/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newItem),
      });
      const data = await response.json();
      console.log('Response from adding to cart:', data);
      if (response.ok) {
        // Fetch the updated cart items instead of updating the state directly
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
      const response = await fetch(`http://127.0.0.1:5001/api/cart/remove/${itemId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        // Fetch the updated cart items instead of updating the state directly
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
      const response = await fetch(`http://127.0.0.1:5001/api/cart/update/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });
      if (response.ok) {
        // Fetch the updated cart items instead of updating the state directly
        fetchCartItems();
      } else {
        console.error('Error updating cart');
      }
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity }}>
      {children}
    </CartContext.Provider>
  );
};
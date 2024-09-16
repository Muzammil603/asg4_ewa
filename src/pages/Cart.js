// src/pages/Cart.js
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import CartItem from '../components/CartItem';
import { CartContext } from '../context/CartContext';

function Cart() {
  const { cartItems, removeFromCart } = useContext(CartContext);
  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate('/checkout', { state: { cartItems } });
  };
  

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      // Ensure price and quantity are numbers
      const itemPrice = Number(item.price) || 0;
      const itemQuantity = Number(item.quantity) || 1;
  
      // Calculate warranty cost
      let warrantyCost = 0;
      if (item.warranty === '1year') warrantyCost = itemPrice / 10;
      if (item.warranty === '2year') warrantyCost = itemPrice / 5;
  
      // Calculate accessories total, ensuring prices are numbers
      const accessoriesPrice = item.accessories.reduce((acc, accessory) => {
        return acc + (Number(accessory.price) || 0);
      }, 0);
  
      // Return updated total
      return total + (itemPrice + warrantyCost + accessoriesPrice) * itemQuantity;
    }, 0);
  };
  

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
      {cartItems.length === 0 ? (
        <p className="text-lg text-gray-700">Your cart is empty.</p>
      ) : (
        <ul className="space-y-4">
          {cartItems.map(item => (
            <CartItem 
              key={item.id} 
              item={item} 
              removeFromCart={removeFromCart} 
            />
          ))}
        </ul>
      )}
      <div className="mt-8">
        <p className="text-xl font-semibold">Total: ${calculateTotal().toFixed(2)}</p>
        <button 
          onClick={handleCheckout} 
          className="mt-4 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition duration-300"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}

export default Cart;
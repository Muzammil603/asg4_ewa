// src/components/CartItem.js
import React from 'react';

function CartItem({ item, removeFromCart, updateQuantity }) {
  const getWarrantyCost = () => {
    if (item.warranty === '1year') return Number(item.price) / 10;
    if (item.warranty === '2year') return Number(item.price) / 5;
    return 0;
  };

  return (
    <li className="flex justify-between items-center">
      <div>
        <p>{item.name} - ${item.price}</p>
        {item.warranty !== 'none' && (
          <p>Warranty: {item.warranty === '1year' ? '1 Year' : '2 Years'} (+${getWarrantyCost().toFixed(2)})</p>
        )}
        <p>Quantity: {item.quantity}</p>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={() => updateQuantity(item.id, item.quantity - 1)} 
          className="bg-gray-300 hover:bg-gray-400 text-black px-2 py-1 rounded-md"
        >
          -
        </button>
        <button 
          onClick={() => updateQuantity(item.id, item.quantity + 1)} 
          className="bg-gray-300 hover:bg-gray-400 text-black px-2 py-1 rounded-md"
        >
          +
        </button>
        <button 
          onClick={() => removeFromCart(item.id)} 
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
        >
          Remove
        </button>
      </div>
    </li>
  );
}

export default CartItem;
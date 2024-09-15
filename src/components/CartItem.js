// src/components/CartItem.js
import React from 'react';

function CartItem({ item, removeFromCart }) {
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
          <p>Warranty: {item.warranty === '1year' ? '1 Year' : '2 Years'} (+${getWarrantyCost()})</p>
        )}
      </div>
      <button 
        onClick={() => removeFromCart(item.id)} 
        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
      >
        Remove
      </button>
    </li>
  );
}

export default CartItem;
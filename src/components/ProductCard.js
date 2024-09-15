// src/components/ProductCard.js
import React from 'react';

function ProductCard({ product }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden transition-transform transform hover:scale-105 hover:shadow-xl duration-300 flex items-center justify-center">
      <div className="w-full p-6 text-center bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-2">{product.name}</h3>
        <p className="text-white mb-4">{product.description}</p>
        <p className="text-lg font-bold text-white">Price: ${product.price}</p>
      </div>
    </div>
  );
}

export default ProductCard;

import React from 'react';
import { FaWifi, FaLightbulb, FaMobileAlt, FaCog } from 'react-icons/fa';

function ProductCard({ product }) {
  const getIcon = (category) => {
    switch (category) {
      case 'lighting': return <FaLightbulb className="text-yellow-400" />;
      case 'security': return <FaWifi className="text-blue-400" />;
      case 'control': return <FaMobileAlt className="text-green-400" />;
      default: return <FaCog className="text-gray-400" />;
    }
  };

  // Calculate final price after applying discounts and rebates
  const finalPrice = product.price - product.retailer_discount - product.manufacturer_rebate;

  return (
    <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 flex flex-col justify-between h-full">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">{product.name}</h3>
          <div className="text-2xl">
            {getIcon(product.category)}
          </div>
        </div>
        <p className="text-gray-600 mb-4">{product.description}</p>

        {/* Display original price, retailer discount, and manufacturer rebate */}
        <div className="mb-4">
          <p className="text-gray-800">Original Price: ${product.price.toFixed(2)}</p>
          {product.retailer_discount > 0 && (
            <p className="text-green-600">Retailer Discount: -${product.retailer_discount.toFixed(2)}</p>
          )}
          {product.manufacturer_rebate > 0 && (
            <p className="text-blue-600">Manufacturer Rebate: -${product.manufacturer_rebate.toFixed(2)}</p>
          )}
          <p className="text-indigo-600 font-semibold">Final Price: ${finalPrice.toFixed(2)}</p>
        </div>
      </div>
      <div className="bg-white p-4 flex justify-between items-center">
        <span className="text-lg font-semibold text-indigo-600">${finalPrice.toFixed(2)}</span>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 transition-colors duration-300">
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default ProductCard;

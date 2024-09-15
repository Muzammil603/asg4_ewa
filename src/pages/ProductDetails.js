// src/pages/ProductDetails.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function ProductDetails({ addToCart }) {
  const [product, setProduct] = useState(null);
  const [warranty, setWarranty] = useState('none');
  const { id } = useParams();

  useEffect(() => {
    const storedProducts = localStorage.getItem('products');
    if (storedProducts) {
      const products = JSON.parse(storedProducts);
      const selectedProduct = products.find((product) => product.id === id);
      setProduct(selectedProduct);
    }
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart({ ...product, warranty });
    }
  };

  if (!product) {
    return <div className="text-center text-gray-700">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">{product.name}</h1>
      <p className="text-lg text-gray-700 mb-4">{product.description}</p>
      <p className="text-xl font-semibold text-gray-900 mb-6">Price: ${product.price}</p>

      {product.accessories && (
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">Accessories</h2>
          <ul className="list-disc pl-5 space-y-2">
            {product.accessories.map((accessory) => (
              <li key={accessory.id} className="text-gray-700">{accessory.name}</li>
            ))}
          </ul>
        </div>
      )}

  <div className="mt-6">
    <label className="block text-gray-700 mb-2">Select Warranty:</label>
    <select 
      value={warranty} 
      onChange={(e) => setWarranty(e.target.value)} 
      className="block w-full p-2 border border-gray-300 rounded-md"
    >
      <option value="none">No Warranty</option>
      <option value="1year">1 Year Warranty (+${Number(product.price) / 10})</option>
      <option value="2year">2 Year Warranty (+${Number(product.price) / 5})</option>
    </select>
  </div>

      <button 
        onClick={handleAddToCart} 
        className="mt-6 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
      >
        Add to Cart
      </button>
    </div>
  );
}

export default ProductDetails;
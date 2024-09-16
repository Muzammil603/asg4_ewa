// src/pages/ProductDetails.js
import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { CartContext } from '../context/CartContext';

function ProductDetails() {
  const { id: productId } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedAccessories, setSelectedAccessories] = useState([]);
  const [warranty, setWarranty] = useState('none');
  const [quantity, setQuantity] = useState(1); // State for quantity
  const [loading, setLoading] = useState(true);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const storedProducts = JSON.parse(localStorage.getItem('products'));
    if (storedProducts) {
      const foundProduct = storedProducts.find(p => p.id === productId);
      setProduct(foundProduct);
      setLoading(false);
    } else {
      console.error('No products found in local storage');
      setLoading(false);
    }
  }, [productId]);

  const handleAccessoryChange = (accessoryId) => {
    setSelectedAccessories(prevSelected => {
      if (prevSelected.includes(accessoryId)) {
        return prevSelected.filter(id => id !== accessoryId);
      } else {
        return [...prevSelected, accessoryId];
      }
    });
  };

  const handleAddToCart = () => {
    const cartItem = {
      ...product,
      accessories: selectedAccessories.map(id => product.accessories.find(acc => acc.id === id)),
      warranty,
      quantity
    };
    addToCart(cartItem);
    alert('Product added to cart!');
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!product) {
    return <p>Product not found.</p>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
      <p className="mb-4">{product.description}</p>
      <p className="mb-4 text-lg font-semibold">${product.price}</p>
      <h2 className="text-2xl font-semibold mb-4">Accessories</h2>
      <div className="flex flex-wrap gap-4">
        {product.accessories.map(accessory => (
          <label key={accessory.id} className="flex items-center">
            <input
              type="checkbox"
              value={accessory.id}
              checked={selectedAccessories.includes(accessory.id)}
              onChange={() => handleAccessoryChange(accessory.id)}
              className="mr-2"
            />
            {accessory.name} (${accessory.price})
          </label>
        ))}
      </div>
      <h2 className="text-2xl font-semibold mb-4">Warranty</h2>
      <div className="flex flex-col gap-2">
        <label className="flex items-center">
          <input
            type="radio"
            name="warranty"
            value="none"
            checked={warranty === 'none'}
            onChange={() => setWarranty('none')}
            className="mr-2"
          />
          No Warranty
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            name="warranty"
            value="1year"
            checked={warranty === '1year'}
            onChange={() => setWarranty('1year')}
            className="mr-2"
          />
          1 Year Warranty (+${(product.price / 10).toFixed(2)})
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            name="warranty"
            value="2year"
            checked={warranty === '2year'}
            onChange={() => setWarranty('2year')}
            className="mr-2"
          />
          2 Year Warranty (+${(product.price / 5).toFixed(2)})
        </label>
      </div>
      <h2 className="text-2xl font-semibold mb-4">Quantity</h2>
      <div className="flex items-center gap-2">
        <button 
          onClick={() => setQuantity(quantity > 1 ? quantity - 1 : 1)} 
          className="bg-gray-300 hover:bg-gray-400 text-black px-2 py-1 rounded-md"
        >
          -
        </button>
        <span>{quantity}</span>
        <button 
          onClick={() => setQuantity(quantity + 1)} 
          className="bg-gray-300 hover:bg-gray-400 text-black px-2 py-1 rounded-md"
        >
          +
        </button>
      </div>
      <button
        onClick={handleAddToCart}
        className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Add to Cart
      </button>
    </div>
  );
}

export default ProductDetails;
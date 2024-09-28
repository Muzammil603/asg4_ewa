import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { CartContext } from '../context/CartContext';

function ProductDetails() {
  const { id: productId } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedAccessories, setSelectedAccessories] = useState([]);
  const [warranty, setWarranty] = useState('No Warranty');
  const [loading, setLoading] = useState(true);
  const { addToCart } = useContext(CartContext);
  const [review, setReview] = useState({ rating: '', text: '' });

  useEffect(() => {
    fetch(`http://127.0.0.1:5001/api/products/${productId}`)
      .then(response => response.json())
      .then(productData => {
        setProduct(productData);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching product:', error);
        setLoading(false);
      });
  }, [productId]);

  const calculateTotalPrice = () => {
    const accessoriesPrice = selectedAccessories.reduce((total, id) => {
      const accessory = product.accessories.find(acc => acc.id === id);
      return total + (accessory ? accessory.price : 0);
    }, 0);

    let warrantyCost = 0;
    if (warranty === '1 Year') warrantyCost = product.price * 0.1;
    if (warranty === '2 Years') warrantyCost = product.price * 0.2;

    return product.price + accessoriesPrice + warrantyCost;
  };

  const handleAddToCart = () => {
    const selectedAccessoriesData = selectedAccessories.map(id => {
      const accessory = product.accessories.find(acc => acc.id === id);
      return {
        id: accessory.id,
        name: accessory.name,
        price: accessory.price,
      };
    });

    const cartItem = {
      ...product,
      accessories: selectedAccessoriesData,
      warranty,
      quantity: 1,
      totalPrice: calculateTotalPrice(),
    };
    addToCart(cartItem);
    alert('Product added to cart!');
  };

  const handleAccessoryChange = (event) => {
    const { value, checked } = event.target;
    setSelectedAccessories(prev => 
      checked ? [...prev, value] : prev.filter(id => id !== value)
    );
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
      
      {/* Accessories */}
      <h2 className="text-2xl font-semibold mt-4 mb-2">Accessories</h2>
      {product.accessories.map((accessory) => (
        <div key={accessory.id}>
          <label>
            <input
              type="checkbox"
              value={accessory.id}
              onChange={handleAccessoryChange}
            />
            {accessory.name} (${accessory.price})
          </label>
        </div>
      ))}

      {/* Warranty */}
      <h2 className="text-2xl font-semibold mt-4 mb-2">Warranty</h2>
      <select
        value={warranty}
        onChange={(e) => setWarranty(e.target.value)}
        className="p-2 border rounded-md"
      >
        {product.warranty_options.map((option, index) => (
          <option key={index} value={option}>{option}</option>
        ))}
      </select>

      {/* Total Price */}
      <p className="mt-4 text-lg font-semibold">Total Price: ${calculateTotalPrice().toFixed(2)}</p>

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

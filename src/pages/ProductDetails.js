import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { CartContext } from '../context/CartContext';

function ProductDetails() {
  const { id: productId } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedAccessories, setSelectedAccessories] = useState([]);
  const [warranty, setWarranty] = useState('No Warranty');
  const [loading, setLoading] = useState(true);
  const { addToCart } = useContext(CartContext); // Ensure this line is present

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
    if (!product) {
      console.error('Product data is not loaded yet.');
      return 0;
    }

    const productPrice = Number(product.price);
    if (isNaN(productPrice)) {
      console.error('Product price is not a valid number:', product.price);
      return 0;
    }

    const accessoriesPrice = selectedAccessories.reduce((total, id) => {
      const accessory = product.accessories.find(acc => acc.id === id);
      return total + (accessory ? Number(accessory.price) : 0);
    }, 0);

    let warrantyCost = 0;
    if (warranty === '1 Year') warrantyCost = productPrice * 0.1;
    if (warranty === '2 Years') warrantyCost = productPrice * 0.2;

    const finalProductPrice = productPrice - product.retailer_discount - product.manufacturer_rebate;
    const totalPrice = finalProductPrice + accessoriesPrice + warrantyCost;
    console.log('Calculated total price:', totalPrice);
    return totalPrice;
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

    const totalPrice = calculateTotalPrice();

    if (isNaN(totalPrice) || totalPrice === null) {
      console.error('Total price calculation failed. Total price is:', totalPrice);
      alert('Failed to calculate total price. Please try again.');
      return;
    }

    const cartItem = {
      product_id: product.id,
      name: product.name,
      price: product.price,
      accessories: selectedAccessoriesData,
      warranty,
      quantity: 1,
      total_price: totalPrice,
    };

    console.log('Adding to cart:', cartItem);

    // Use the addToCart function from context here
    addToCart(cartItem);

    // fetch('http://127.0.0.1:5001/api/cart/add', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(cartItem),
    // })
    //   .then(response => {
    //     if (!response.ok) {
    //       throw new Error('Failed to add item to cart');
    //     }
    //     return response.json();
    //   })
    //   .then(data => {
    //     if (data.error) {
    //       console.error('Error adding to cart:', data.error);
    //       alert('Failed to add to cart');
    //     } else {
    //       alert('Product added to cart!');
    //     }
    //   })
    //   .catch(error => console.error('Error:', error));
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

      {product.retailer_discount > 0 ? (
        <p className="text-green-600 mb-2">Retailer Discount: -${product.retailer_discount.toFixed(2)}</p>
      ) : (
        <p className="text-gray-600 mb-2">No Retailer Discount</p>
      )}

      {product.manufacturer_rebate > 0 ? (
        <p className="text-blue-600 mb-2">Manufacturer Rebate: -${product.manufacturer_rebate.toFixed(2)}</p>
      ) : (
        <p className="text-gray-600 mb-2">No Manufacturer Rebate</p>
      )}

      {product.retailer_discount === 0 && product.manufacturer_rebate === 0 && (
        <p className="text-red-600 mb-2">No Offers Available</p>
      )}
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

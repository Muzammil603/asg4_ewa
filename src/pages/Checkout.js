import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';

function Checkout() {
  const { cartItems, clearCart } = useContext(CartContext);
  const [customerInfo, setCustomerInfo] = useState({
    name: localStorage.getItem('userName') || '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    creditCard: '',
    deliveryOption: '',
    pickupLocation: '',
  });
  const [storeLocations, setStoreLocations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStoreLocations();
    console.log('Cart Items:', JSON.stringify(cartItems, null, 2));
  }, [cartItems]);

  const fetchStoreLocations = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5001/api/store-locations');
      if (!response.ok) {
        throw new Error('Failed to fetch store locations');
      }
      const data = await response.json();
      setStoreLocations(data);
    } catch (error) {
      console.error('Error fetching store locations:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo((prevState) => ({ ...prevState, [name]: value }));
  };

  const generateConfirmationNumber = () => {
    return Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  };

  const generateDeliveryDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 14); // 2 weeks from now
    return date.toDateString();
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = typeof item.total_price === 'number' ? item.total_price : 0;
      const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
      const itemTotal = price * quantity;
      console.log(`Item total for ${item.product_name || 'Unknown Product'}:`, itemTotal);
      return total + itemTotal;
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const confirmationNumber = generateConfirmationNumber();
    const deliveryDate = generateDeliveryDate();
    const totalAmount = calculateTotal();

    const orderData = {
      ...customerInfo,
      cartItems: cartItems.map(item => ({
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        total_price: item.total_price,
        warranty: item.warranty,
        accessories: item.accessories
      })),
      confirmationNumber,
      deliveryDate,
      totalAmount
    };

    console.log('Sending order data:', JSON.stringify(orderData, null, 2));

    try {
      const response = await fetch('http://127.0.0.1:5001/api/place-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to place order: ${errorData.error || 'Unknown error'}`);
      }

      const result = await response.json();
      console.log('Order placed successfully:', result);
      alert('Order placed successfully!');
      clearCart();
      localStorage.removeItem('cart');

      navigate('/order-confirmation', { state: { order: orderData } });
    } catch (error) {
      console.error('Error placing order:', error);
      alert(`Failed to place order. ${error.message}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-4">Checkout</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Name</label>
          <input
            type="text"
            name="name"
            value={customerInfo.name}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
            readOnly
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Street</label>
          <input
            type="text"
            name="street"
            value={customerInfo.street}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">City</label>
          <input
            type="text"
            name="city"
            value={customerInfo.city}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">State</label>
          <input
            type="text"
            name="state"
            value={customerInfo.state}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Zip Code</label>
          <input
            type="text"
            name="zipCode"
            value={customerInfo.zipCode}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Credit Card</label>
          <input
            type="text"
            name="creditCard"
            value={customerInfo.creditCard}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Delivery Option</label>
          <select
            name="deliveryOption"
            value={customerInfo.deliveryOption}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          >
            <option value="">Select an option</option>
            <option value="delivery">Delivery</option>
            <option value="pickup">Pickup</option>
          </select>
        </div>
        {customerInfo.deliveryOption === 'pickup' && (
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Pickup Location</label>
            <select
              name="pickupLocation"
              value={customerInfo.pickupLocation}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">Select a location</option>
              {storeLocations.map((location) => (
                <option key={location.id} value={location.street}>
                  {location.street}, {location.city}, {location.state} {location.zip_code}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-2">Order Summary</h2>
          <ul className="space-y-2">
            {cartItems.map((item, index) => (
              <li key={index} className="border-b pb-2">
                <div className="font-semibold">
                  {item.product_name || 'Unknown Product'} - $
                  {typeof item.total_price === 'number' ? item.total_price.toFixed(2) : 'N/A'}
                </div>
                <div>Quantity: {typeof item.quantity === 'number' ? item.quantity : 0}</div>
                <div>Warranty: {item.warranty || 'No Warranty'}</div>
                {Array.isArray(item.accessories) && item.accessories.length > 0 && (
                  <div>
                    Accessories: {item.accessories.map(acc => 
                      `${acc.name || 'Unknown Accessory'} (+$${typeof acc.price === 'number' ? acc.price.toFixed(2) : 'N/A'})`
                    ).join(', ')}
                  </div>
                )}
              </li>
            ))}
          </ul>
          <p className="text-xl font-semibold mt-4">Total: ${calculateTotal().toFixed(2)}</p>
        </div>
        <button
          type="submit"
          className="mt-4 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
        >
          Place Order
        </button>
      </form>
    </div>
  );
}

export default Checkout;
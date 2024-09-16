import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { CartContext } from '../context/CartContext'; // Import CartContext

function Checkout() {
  const location = useLocation();
  const cartItems = location.state?.cartItems || [];
  const { setCartItems } = useContext(CartContext); // Destructure setCartItems from context
  const [customerInfo, setCustomerInfo] = useState({
    name: localStorage.getItem('userName'),
    street: '',
    city: '',
    state: '',
    zipCode: '',
    creditCard: '',
    deliveryOption: '',
    pickupLocation: '',
  });

  const navigate = useNavigate();

  const pickupLocations = [
    { area: 'Downtown', zip: '60601' },
    { area: 'Loop', zip: '60602' },
    { area: 'Near North Side', zip: '60603' },
    { area: 'Near South Side', zip: '60604' },
    { area: 'South Loop', zip: '60605' },
    { area: 'West Loop', zip: '60606' },
    { area: 'Greektown', zip: '60607' },
    { area: 'Little Italy', zip: '60608' },
    { area: 'Bridgeport', zip: '60609' },
    { area: 'Old Town', zip: '60610' },
  ];

  useEffect(() => {
    const loggedInUserName = localStorage.getItem('userName');
    console.log(loggedInUserName);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo((prevState) => ({ ...prevState, [name]: value }));
  };

  const generateConfirmationNumber = () => {
    return Math.floor(Math.random() * 1000000);
  };

  const generateDeliveryDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 14); // 2 weeks from now
    return date.toDateString();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const confirmationNumber = generateConfirmationNumber();
    const deliveryDate = generateDeliveryDate();
    const order = {
      ...customerInfo,
      cartItems,
      confirmationNumber,
      deliveryDate,
    };

    // Save order to localStorage or send to server
    const storedOrders = JSON.parse(localStorage.getItem('orders')) || [];
    storedOrders.push(order);
    localStorage.setItem('orders', JSON.stringify(storedOrders));

    // Clear the cart after order is placed
    setCartItems([]); // Clear cart items from context
    localStorage.removeItem('cart'); // Clear cart from localStorage

    // Redirect to order confirmation page with the order details
    navigate('/order-confirmation', { state: { order } });
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = Number(item.price) || 0; // Ensure the price is a number, default to 0 if undefined
      let warrantyCost = 0;

      // Calculate warranty cost if applicable
      if (item.warranty === '1year') {
        warrantyCost = price / 10;
      } else if (item.warranty === '2year') {
        warrantyCost = price / 5;
      }

      // Calculate the total cost of accessories if applicable
      const accessoryTotal =
        item.accessories?.reduce((accTotal, acc) => {
          return accTotal + (Number(acc.price) || 0); // Ensure accessory price is a number
        }, 0) || 0;

      const itemTotal =
        (price + warrantyCost + accessoryTotal) * (Number(item.quantity) || 1); // Multiply by quantity, default to 1 if missing
      return total + itemTotal;
    }, 0);
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
            readOnly // Make the name field read-only
            required
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
              {pickupLocations.map((location, index) => (
                <option key={index} value={`${location.area}, ${location.zip}`}>
                  {location.area}, {location.zip}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-2">Order Summary</h2>
          <ul className="space-y-2">
            {cartItems.map((item) => (
              <li key={item.id}>
                {item.name} - ${item.price}
                {item.warranty !== 'none' && (
                  <p>
                    Warranty: {item.warranty === '1year' ? '1 Year' : '2 Years'} (+$
                    {item.warranty === '1year'
                      ? Number(item.price) / 10
                      : Number(item.price) / 5}
                    )
                  </p>
                )}
              </li>
            ))}
          </ul>
          <p className="text-xl font-semibold mt-4">Total: ${calculateTotal()}</p>
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

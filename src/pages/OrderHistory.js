// src/pages/OrderHistory.js
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

function OrderHistory({ customerId }) {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const storedOrders = JSON.parse(localStorage.getItem('orders')) || [];
    // Filter orders by customerId
    const customerOrders = storedOrders.filter(order => order.customerId === customerId);
    setOrders(customerOrders);
  }, [customerId]);

  const handleCancelOrder = (confirmationNumber) => {
    const updatedOrders = orders.filter(order => order.confirmationNumber !== confirmationNumber);
    setOrders(updatedOrders);
    const allOrders = JSON.parse(localStorage.getItem('orders')) || [];
    const updatedAllOrders = allOrders.filter(order => order.confirmationNumber !== confirmationNumber);
    localStorage.setItem('orders', JSON.stringify(updatedAllOrders));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Order History</h1>
      {orders.length === 0 ? (
        <p className="text-lg text-gray-700">No orders found.</p>
      ) : (
        <ul className="space-y-4">
          {orders.map(order => (
            <li key={order.confirmationNumber} className="bg-white p-4 rounded-lg shadow-md">
              <p><strong>Name:</strong> {order.name}</p>
              <p><strong>Address:</strong> {order.street}, {order.city}, {order.state}, {order.zipCode}</p>
              <p><strong>Confirmation Number:</strong> {order.confirmationNumber}</p>
              <p><strong>Delivery/Pickup Date:</strong> {order.deliveryDate}</p>
              <p><strong>Items:</strong></p>
              <ul className="list-disc pl-5">
                {order.cartItems.map(item => (
                  <li key={item.id}>{item.name} - ${item.price}</li>
                ))}
              </ul>
              <button 
                onClick={() => handleCancelOrder(order.confirmationNumber)} 
                className="mt-4 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition duration-300"
              >
                Cancel Order
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

OrderHistory.propTypes = {
  customerId: PropTypes.string.isRequired
};

export default OrderHistory;

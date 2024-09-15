import React, { useState, useEffect } from 'react';

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const currentUsername = localStorage.getItem('userName'); // Replace with actual logged-in username (from auth system or localStorage)

  useEffect(() => {
    // Fetch order history from local storage (replace with API call to fetch orders from database)
    const storedOrders = JSON.parse(localStorage.getItem('orders')) || [];
    
    // Filter orders by the current logged-in username
    const filteredOrders = storedOrders.filter(order => order.name === currentUsername);
    setOrders(filteredOrders);
  }, []);

  const handleCancelOrder = (confirmationNumber) => {
    const updatedOrders = orders.filter(order => order.confirmationNumber !== confirmationNumber);
    setOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
  };

  const isCancellationAllowed = (deliveryDate) => {
    const delivery = new Date(deliveryDate);
    const today = new Date();
    const timeDiff = delivery.getTime() - today.getTime();
    const dayDiff = timeDiff / (1000 * 3600 * 24);
    const businessDaysDiff = Math.floor(dayDiff / 7) * 5 + Math.min(dayDiff % 7, 5);
    return businessDaysDiff >= 5;
  };

  return (
    <div>
      <h2>Order History</h2>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <ul>
          {orders.map((order, index) => (
            <li key={index}>
              <p>Confirmation Number: {order.confirmationNumber}</p>
              <p>Name: {order.name}</p>
              <p>Address: {order.street}, {order.city}, {order.state}, {order.zipCode}</p>
              <p>Delivery Date: {order.deliveryDate}</p>
              {/* Display other order details */}
              {isCancellationAllowed(order.deliveryDate) ? (
                <button onClick={() => handleCancelOrder(order.confirmationNumber)}>Cancel Order</button>
              ) : (
                <p>Cancellation not allowed within 5 business days of delivery.</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default OrderHistory;
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
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Order History</h2>
      {orders.length === 0 ? (
        <p className="text-gray-600">No orders found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2">Confirmation Number</th>
                <th className="border px-4 py-2">Name</th>
                <th className="border px-4 py-2">Address</th>
                <th className="border px-4 py-2">Delivery Date</th>
                <th className="border px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={index} className="text-center">
                  <td className="border px-4 py-2">{order.confirmationNumber}</td>
                  <td className="border px-4 py-2">{order.name}</td>
                  <td className="border px-4 py-2">
                    {order.street}, {order.city}, {order.state}, {order.zipCode}
                  </td>
                  <td className="border px-4 py-2">{order.deliveryDate}</td>
                  <td className="border px-4 py-2">
                    {isCancellationAllowed(order.deliveryDate) ? (
                      <button 
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700" 
                        onClick={() => handleCancelOrder(order.confirmationNumber)}>
                        Cancel Order
                      </button>
                    ) : (
                      <p className="text-gray-600">Cancellation not allowed within 5 business days of delivery.</p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default OrderHistory;

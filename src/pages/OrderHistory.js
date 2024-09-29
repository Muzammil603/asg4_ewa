import React, { useState, useEffect } from 'react';

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const currentUsername = localStorage.getItem('userName'); // Retrieve the logged-in username

  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5001/api/orderhistory/${currentUsername}`);
        if (!response.ok) {
          throw new Error('Failed to fetch order history.');
        }
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchOrderHistory();
  }, [currentUsername]);

  const handleCancelOrder = async (confirmationNumber) => {
    try {
      const response = await fetch(`http://127.0.0.1:5001/api/orders/cancel/${confirmationNumber}`, {
        method: 'PUT',
      });
      if (response.ok) {
        // Update the status of the order to "Cancelled" in the local state
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.confirmation_number === confirmationNumber
              ? { ...order, status: 'Cancelled' }
              : order
          )
        );
      } else {
        throw new Error('Failed to cancel order.');
      }
    } catch (error) {
      setError(error.message);
    }
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
      {error && <p className="text-red-500">{error}</p>}
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
                <th className="border px-4 py-2">Status</th>
                <th className="border px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={index} className="text-center">
                  <td className="border px-4 py-2">{order.confirmation_number}</td>
                  <td className="border px-4 py-2">{order.name}</td>
                  <td className="border px-4 py-2">
                    {order.street}, {order.city}, {order.state}, {order.zip_code}
                  </td>
                  <td className="border px-4 py-2">{order.delivery_date}</td>
                  <td className="border px-4 py-2">{order.status}</td> {/* Show order status */}
                  <td className="border px-4 py-2">
                    {order.status === 'Cancelled' ? (
                      <p className="text-gray-600">Order Cancelled</p>
                    ) : isCancellationAllowed(order.delivery_date) ? (
                      <button 
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700" 
                        onClick={() => handleCancelOrder(order.confirmation_number)}>
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

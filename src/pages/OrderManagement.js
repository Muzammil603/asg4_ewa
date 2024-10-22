import React, { useState, useEffect } from 'react';
import { BASE_URL } from './config';

function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [storeLocations, setStoreLocations] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderFormData, setOrderFormData] = useState({
    id: '',
    name: '',
    street: '',
    city: '',
    state: '',
    zip_code: '',
    credit_card: '',
    delivery_option: 'delivery',
    pickup_location: '',
    total_amount: '',
    order_date: '',
    confirmation_number: '',
    delivery_date: '',
    order_items: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [ordersRes, usersRes, productsRes, locationsRes] = await Promise.all([
        fetch(`${BASE_URL}/orders`, {
          headers: {
            'ngrok-skip-browser-warning': 'true'
          }
        }),
        fetch(`${BASE_URL}/customers`, {
          headers: {
            'ngrok-skip-browser-warning': 'true'
          }
        }),
        fetch(`${BASE_URL}/products`, {
          headers: {
            'ngrok-skip-browser-warning': 'true'
          }
        }),
        fetch(`${BASE_URL}/store-locations`, {
          headers: {
            'ngrok-skip-browser-warning': 'true'
          }
        })
      ]);

      const [ordersData, usersData, productsData, locationsData] = await Promise.all([
        ordersRes.json(),
        usersRes.json(),
        productsRes.json(),
        locationsRes.json()
      ]);

      setOrders(ordersData);
      setUsers(usersData);
      setProducts(productsData);
      setStoreLocations(locationsData);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserFilter = (e) => {
    setSelectedUser(e.target.value);
  };

  const handleAddItem = () => {
    setOrderFormData(prevData => ({
      ...prevData,
      items: [...prevData.items, { id: '', quantity: 1, accessories: [], warranty: '' }],
    }));
  };

  const handleRemoveItem = (index) => {
    setOrderFormData(prevData => ({
      ...prevData,
      items: prevData.items.filter((_, i) => i !== index),
    }));
  };

  const handleItemChange = (index, field, value) => {
    setOrderFormData(prevData => {
      const updatedItems = [...prevData.items];
      updatedItems[index] = { 
        ...updatedItems[index], 
        [field]: value,
      };
      return { 
        ...prevData, 
        items: updatedItems
      };
    });
  };

  const handleAccessoryChange = (itemIndex, accIndex, value) => {
    setOrderFormData(prevData => {
      const updatedItems = [...prevData.items];
      const updatedAccessories = [...(updatedItems[itemIndex].accessories || [])];
      updatedAccessories[accIndex] = value;
      updatedItems[itemIndex] = { 
        ...updatedItems[itemIndex], 
        accessories: updatedAccessories
      };
      return { 
        ...prevData, 
        items: updatedItems
      };
    });
  };

  const handleAddAccessory = (itemIndex) => {
    setOrderFormData(prevData => {
      const updatedItems = [...prevData.items];
      updatedItems[itemIndex] = { 
        ...updatedItems[itemIndex], 
        accessories: [...(updatedItems[itemIndex].accessories || []), '']
      };
      return { 
        ...prevData, 
        items: updatedItems
      };
    });
  };

  const handleWarrantyChange = (itemIndex, value) => {
    setOrderFormData(prevData => {
      const updatedItems = [...prevData.items];
      updatedItems[itemIndex] = { 
        ...updatedItems[itemIndex], 
        warranty: value
      };
      return { 
        ...prevData, 
        items: updatedItems
      };
    });
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = selectedOrder ? 'PUT' : 'POST';
      const endpoint = selectedOrder 
        ? `${BASE_URL}/orders/update/${selectedOrder.id}` 
        : `${BASE_URL}/orders/add`;
      
      const response = await fetch(endpoint, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(orderFormData),
      });
      
      if (response.ok) {
        loadData();
        clearOrderForm();
        setSelectedOrder(null);
      } else {
        const data = await response.json();
        setError(`Error submitting order: ${data.error}`);
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      setError('Failed to submit order. Please try again.');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      const response = await fetch(`${BASE_URL}/orders/delete/${orderId}`, {
        method: 'DELETE', 
          headers: {
            'ngrok-skip-browser-warning': 'true'
          }
        
      });
      if (response.ok) {
        loadData();
      } else {
        const data = await response.json();
        setError(`Error deleting order: ${data.error}`);
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      setError('Failed to delete order. Please try again.');
    }
  };

  const handleSelectOrder = (order) => {
    console.log('Selected Order:', order);
    setSelectedOrder(order);
    
    // Parse items if it's a string
    let parsedItems = order.items;
    if (typeof order.items === 'string') {
      try {
        parsedItems = JSON.parse(order.items);
      } catch (error) {
        console.error('Error parsing order items:', error);
        parsedItems = [];
      }
    }

    setOrderFormData({
      id: order.id,
      name: order.name,
      street: order.street,
      city: order.city,
      state: order.state,
      zip_code: order.zip_code,
      credit_card: order.credit_card,
      delivery_option: order.delivery_option,
      pickup_location: order.pickup_location || '',
      total_amount: order.total_amount,
      order_date: order.order_date.split(' ')[0],
      confirmation_number: order.confirmation_number,
      delivery_date: order.delivery_date,
      order_items: Array.isArray(parsedItems) ? parsedItems : []
    });
  };

  const clearOrderForm = () => {
    setOrderFormData({
      id: '',
      name: '',
      street: '',
      city: '',
      state: '',
      zip_code: '',
      credit_card: '',
      delivery_option: 'delivery',
      pickup_location: '',
      total_amount: '',
      order_date: '',
      confirmation_number: '',
      delivery_date: '',
      order_items: []
    });
  };

  const filteredOrders = selectedUser
    ? orders.filter(order => order.name === selectedUser)
    : orders;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Order Management</h2>

      {/* User Filter */}
      <div className="mb-4">
        <label htmlFor="userFilter" className="block text-lg font-medium mb-2">Filter by User:</label>
        <select
          id="userFilter"
          value={selectedUser}
          onChange={handleUserFilter}
          className="p-2 border border-gray-300 rounded-md"
        >
          <option value="">All Users</option>
          {users && users.map((user) => (
            <option key={user.id} value={user.name}>{user.name}</option>
          ))}
        </select>
      </div>

      {/* Order Form */}
      <form onSubmit={handleOrderSubmit} className="bg-white p-4 border border-gray-300 rounded-md shadow-md mb-6">
        <h3 className="text-xl font-semibold mb-4">
          {selectedOrder ? `Edit Order for ${orderFormData.name}` : 'Add New Order'}
        </h3>

        {/* Customer Name */}
        <div className="mb-4">
          <label htmlFor="userName" className="block text-lg font-medium mb-2">Customer Name:</label>
          <input
            type="text"
            id="userName"
            name="name"
            value={orderFormData.name}
            onChange={(e) => setOrderFormData(prevData => ({...prevData, name: e.target.value}))}
            required
            className="p-2 border border-gray-300 rounded-md w-full"
          />
        </div>

        {/* Address Fields */}
        <div className="mb-4">
          <label htmlFor="street" className="block text-lg font-medium mb-2">Street:</label>
          <input
            type="text"
            id="street"
            name="street"
            value={orderFormData.street}
            onChange={(e) => setOrderFormData(prevData => ({...prevData, street: e.target.value}))}
            required
            className="p-2 border border-gray-300 rounded-md w-full"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="city" className="block text-lg font-medium mb-2">City:</label>
          <input
            type="text"
            id="city"
            name="city"
            value={orderFormData.city}
            onChange={(e) => setOrderFormData(prevData => ({...prevData, city: e.target.value}))}
            required
            className="p-2 border border-gray-300 rounded-md w-full"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="state" className="block text-lg font-medium mb-2">State:</label>
          <input
            type="text"
            id="state"
            name="state"
            value={orderFormData.state}
            onChange={(e) => setOrderFormData(prevData => ({...prevData, state: e.target.value}))}
            required
            className="p-2 border border-gray-300 rounded-md w-full"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="zip_code" className="block text-lg font-medium mb-2">Zip Code:</label>
          <input
            type="text"
            id="zip_code"
            name="zip_code"
            value={orderFormData.zip_code}
            onChange={(e) => setOrderFormData(prevData => ({ ...prevData, zip_code: e.target.value }))}
            required
            className="p-2 border border-gray-300 rounded-md w-full"
          />
        </div>

        {/* Credit Card */}
        <div className="mb-4">
          <label htmlFor="creditCard" className="block text-lg font-medium mb-2">Credit Card:</label>
          <input
            type="text"
            id="creditCard"
            name="credit_card"
            value={orderFormData.credit_card}
            onChange={(e) => setOrderFormData(prevData => ({...prevData, credit_card: e.target.value}))}
            required
            className="p-2 border border-gray-300 rounded-md w-full"
          />
        </div>

        {/* Delivery Option */}
        <div className="mb-4">
          <label htmlFor="deliveryOption" className="block text-lg font-medium mb-2">Delivery Option:</label>
          <select
            id="deliveryOption"
            name="delivery_option"
            value={orderFormData.delivery_option}
            onChange={(e) => setOrderFormData(prevData => ({...prevData, delivery_option: e.target.value, pickup_location: ''}))}
            className="p-2 border border-gray-300 rounded-md w-full"
          >
            <option value="delivery">Delivery</option>
            <option value="pickup">Pickup</option>
          </select>
        </div>

        {/* Pickup Location */}
        {orderFormData.delivery_option === 'pickup' && (
          <div className="mb-4">
            <label htmlFor="pickupLocation" className="block text-lg font-medium mb-2">Pickup Location:</label>
            <select
              id="pickupLocation"
              name="pickup_location"
              value={orderFormData.pickup_location}
              onChange={(e) => setOrderFormData(prevData => ({...prevData, pickup_location: e.target.value}))}
              className="p-2 border border-gray-300 rounded-md w-full"
            >
              <option value="">Select Pickup Location</option>
              {storeLocations && storeLocations.map((location) => (
                <option key={location.id} value={location.street}>
                  {`${location.street}, ${location.city}, ${location.state} ${location.zip_code}`}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Total Amount */}
        <div className="mb-4">
          <label htmlFor="totalAmount" className="block text-lg font-medium mb-2">Total Amount:</label>
          <input
            type="number"
            id="totalAmount"
            name="total_amount"
            value={orderFormData.total_amount}
            onChange={(e) => setOrderFormData(prevData => ({...prevData, total_amount: e.target.value}))}
            required
            className="p-2 border border-gray-300 rounded-md w-full"
          />
        </div>

        {/* Order Date */}
        <div className="mb-4">
          <label htmlFor="orderDate" className="block text-lg font-medium mb-2">Order Date:</label>
          <input
            type="date"
            id="orderDate"
            name="order_date"
            value={orderFormData.order_date}
            onChange={(e) => setOrderFormData(prevData => ({...prevData, order_date: e.target.value}))}
            required
            className="p-2 border border-gray-300 rounded-md w-full"
          />
          </div>

{/* Confirmation Number */}
<div className="mb-4">
  <label htmlFor="confirmationNumber" className="block text-lg font-medium mb-2">Confirmation Number:</label>
  <input
    type="text"
    id="confirmationNumber"
    name="confirmation_number"
    value={orderFormData.confirmation_number}
    onChange={(e) => setOrderFormData(prevData => ({...prevData, confirmation_number: e.target.value}))}
    required
    className="p-2 border border-gray-300 rounded-md w-full"
  />
</div>

{/* Delivery Date */}
<div className="mb-4">
  <label htmlFor="deliveryDate" className="block text-lg font-medium mb-2">Delivery Date:</label>
  <input
    type="date"
    id="deliveryDate"
    name="delivery_date"
    value={orderFormData.delivery_date}
    onChange={(e) => setOrderFormData(prevData => ({...prevData, delivery_date: e.target.value}))}
    required
    className="p-2 border border-gray-300 rounded-md w-full"
  />
</div>

{/* Order Items */}
<div className="mb-4">
  <label className="block text-lg font-medium mb-2">Order Items:</label>
  {orderFormData.order_items.map((item, index) => (
    <div key={index} className="border p-4 mb-4 rounded-md">
      <select
        value={item.id}
        onChange={(e) => handleItemChange(index, 'id', e.target.value)}
        required
        className="p-2 border border-gray-300 rounded-md mr-2"
      >
        <option value="">Select a product</option>
        {products && products.map((product) => (
          <option key={product.id} value={product.id}>{product.name}</option>
        ))}
      </select>
      <input
        type="number"
        value={item.quantity}
        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
        placeholder="Quantity"
        required
        className="p-2 border border-gray-300 rounded-md w-20 mr-2"
      />
      <div className="mt-2">
        <label className="block text-sm font-medium mb-1">Accessories:</label>
        {item.accessories && item.accessories.map((acc, accIndex) => (
          <input
            key={accIndex}
            type="text"
            value={acc}
            onChange={(e) => handleAccessoryChange(index, accIndex, e.target.value)}
            className="p-2 border border-gray-300 rounded-md mr-2 mb-2"
            placeholder="Accessory"
          />
        ))}
        <button
          type="button"
          onClick={() => handleAddAccessory(index)}
          className="bg-blue-500 text-white px-2 py-1 rounded-md text-sm"
        >
          Add Accessory
        </button>
      </div>
      <div className="mt-2">
        <label className="block text-sm font-medium mb-1">Warranty:</label>
        <input
          type="text"
          value={item.warranty || ''}
          onChange={(e) => handleWarrantyChange(index, e.target.value)}
          className="p-2 border border-gray-300 rounded-md mr-2"
          placeholder="Warranty"
        />
      </div>
      <button
        type="button"
        onClick={() => handleRemoveItem(index)}
        className="mt-2 bg-red-500 text-white px-3 py-1 rounded-md"
      >
        Remove Item
      </button>
    </div>
  ))}
  <button
    type="button"
    onClick={handleAddItem}
    className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md"
  >
    Add Item
  </button>
</div>

<button
  type="submit"
  className="bg-green-500 text-white px-4 py-2 rounded-md"
>
  {selectedOrder ? 'Update Order' : 'Submit Order'}
</button>
</form>

{/* Order List */}
<div className="mt-6">
<h3 className="text-xl font-semibold mb-4">Order List</h3>
{filteredOrders && filteredOrders.length > 0 ? (
  <table className="min-w-full bg-white border border-gray-300 rounded-md shadow-md">
    <thead>
      <tr className="bg-gray-100 border-b">
        <th className="p-2">ID</th>
        <th className="p-2">Customer</th>
        <th className="p-2">Address</th>
        <th className="p-2">Credit Card</th>
        <th className="p-2">Delivery Option</th>
        <th className="p-2">Pickup Location</th>
        <th className="p-2">Total Amount</th>
        <th className="p-2">Order Date</th>
        <th className="p-2">Confirmation #</th>
        <th className="p-2">Delivery Date</th>
        <th className="p-2">Items</th>
        <th className="p-2">Actions</th>
      </tr>
    </thead>
    <tbody>
      {filteredOrders.map((order) => (
        <tr key={order.id} className="border-b">
          <td className="p-2">{order.id}</td>
          <td className="p-2">{order.name}</td>
          <td className="p-2">{order.street}, {order.city}, {order.state} {order.zip_code}</td>
          <td className="p-2">{order.credit_card}</td>
          <td className="p-2">{order.delivery_option}</td>
          <td className="p-2">{order.pickup_location || 'N/A'}</td>
          <td className="p-2">${order.total_amount}</td>
          <td className="p-2">{order.order_date}</td>
          <td className="p-2">{order.confirmation_number}</td>
          <td className="p-2">{order.delivery_date}</td>
          <td className="p-2">
            {order.order_items && JSON.parse(order.items).map((item, idx) => (
              <div key={idx}>
                {products && products.find(p => p.id === item.id)?.name} x {item.quantity}
                <br />
                Accessories: {item.accessories && item.accessories.join(', ')}
                <br />
                Warranty: {item.warranty || 'N/A'}
              </div>
            ))}
          </td>
          <td className="p-2">
            <button
              onClick={() => handleSelectOrder(order)}
              className="bg-yellow-500 text-white px-2 py-1 rounded-md mr-2"
            >
              Edit
            </button>
            <button
              onClick={() => handleDeleteOrder(order.id)}
              className="bg-red-500 text-white px-2 py-1 rounded-md"
            >
              Delete
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
) : (
  <p>No orders found.</p>
)}
</div>
</div>
);
}

export default OrderManagement;
import React, { useState, useEffect } from 'react';

function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderFormData, setOrderFormData] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    creditCard: '',
    items: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const storedOrders = JSON.parse(localStorage.getItem('orders')) || [];
    const storedUsers = JSON.parse(localStorage.getItem('users')) || [];
    const storedProducts = JSON.parse(localStorage.getItem('products')) || [];

    setOrders(storedOrders);
    setUsers(storedUsers);
    setProducts(storedProducts);
  };

  const saveData = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const handleUserFilter = (e) => {
    setSelectedUser(e.target.value);
  };

  const handleAddItem = () => {
    setOrderFormData(prevData => ({
      ...prevData,
      items: [...prevData.items, { id: '', quantity: 1 }],
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
      updatedItems[index] = { ...updatedItems[index], [field]: value };
      return { 
        ...prevData, 
        items: updatedItems
      };
    });
  };

  const handleOrderSubmit = (e) => {
    e.preventDefault();
    if (selectedOrder) {
      const updatedOrders = orders.map((order) =>
        order.name === selectedOrder.name ? { ...order, ...orderFormData } : order
      );
      saveData('orders', updatedOrders);
      setOrders(updatedOrders);
    } else {
      const newOrder = {
        ...orderFormData,
        name: selectedUser,
      };
      const updatedOrders = [...orders, newOrder];
      saveData('orders', updatedOrders);
      setOrders(updatedOrders);
    }
    clearOrderForm();
    setSelectedOrder(null);
  };

  const handleDeleteOrder = (orderName) => {
    const updatedOrders = orders.filter((order) => order.name !== orderName);
    saveData('orders', updatedOrders);
    setOrders(updatedOrders);
    setSelectedOrder(null);
    clearOrderForm();
  };

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
    setOrderFormData(order);
  };

  const clearOrderForm = () => {
    setOrderFormData({
      name: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      creditCard: '',
      items: []
    });
  };

  const filteredOrders = selectedUser
    ? orders.filter(order => order.name === selectedUser)
    : orders;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Order Management</h2>
      <div className="mb-4">
        <label htmlFor="userFilter" className="block text-lg font-medium mb-2">Filter by User:</label>
        <select
          id="userFilter"
          value={selectedUser}
          onChange={handleUserFilter}
          className="p-2 border border-gray-300 rounded-md"
        >
          <option value="">All Users</option>
          {users.map((user) => (
            <option key={user.id} value={user.name}>{user.name}</option>
          ))}
        </select>
      </div>

      <form onSubmit={handleOrderSubmit} className="bg-white p-4 border border-gray-300 rounded-md shadow-md">
        <h3 className="text-xl font-semibold mb-4">{selectedOrder ? 'Edit Order' : 'Add New Order'}</h3>
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
          <label htmlFor="zipCode" className="block text-lg font-medium mb-2">Zip Code:</label>
          <input
            type="text"
            id="zipCode"
            name="zipCode"
            value={orderFormData.zipCode}
            onChange={(e) => setOrderFormData(prevData => ({...prevData, zipCode: e.target.value}))}
            required
            className="p-2 border border-gray-300 rounded-md w-full"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="creditCard" className="block text-lg font-medium mb-2">Credit Card:</label>
          <input
            type="text"
            id="creditCard"
            name="creditCard"
            value={orderFormData.creditCard}
            onChange={(e) => setOrderFormData(prevData => ({...prevData, creditCard: e.target.value}))}
            required
            className="p-2 border border-gray-300 rounded-md w-full"
          />
        </div>
        {orderFormData.items.map((item, index) => (
          <div key={index} className="flex items-center mb-2">
            <select
              value={item.id}
              onChange={(e) => handleItemChange(index, 'id', e.target.value)}
              required
              className="p-2 border border-gray-300 rounded-md mr-2"
            >
              <option value="">Select a product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>{product.name}</option>
              ))}
            </select>
            <input
              type="number"
              value={item.quantity}
              onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
              placeholder="Quantity"
              required
              className="p-2 border border-gray-300 rounded-md w-20 mr-2"
            />
            <button
              type="button"
              onClick={() => handleRemoveItem(index)}
              className="ml-2 bg-red-500 text-white px-3 py-1 rounded-md"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddItem}
          className="mb-4 bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          Add Item
        </button>
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded-md"
        >
          {selectedOrder ? 'Update Order' : 'Submit Order'}
        </button>
      </form>

      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-4">Order List</h3>
        <table className="min-w-full bg-white border border-gray-300 rounded-md shadow-md">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-2">Customer</th>
              <th className="p-2">Address</th>
              <th className="p-2">Items</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
  {filteredOrders.map((order) => (
    <tr key={order.confirmationNumber} className="border-b">
      <td className="p-2">{order.name}</td>
      <td className="p-2">{order.street}, {order.city}, {order.state} {order.zipCode}</td>
      <td className="p-2">
        {order.cartItems && Array.isArray(order.cartItems) ? (
          order.cartItems.map((item) => {
            const product = products.find((p) => p.id === item.id);
            return (
              <div key={item.id}>
                {product?.name} x {item.quantity}
              </div>
            );
          })
        ) : (
          <div>No items found</div>
        )}
      </td>
      <td className="p-2">
        <button
          onClick={() => handleSelectOrder(order)}
          className="bg-yellow-500 text-white px-2 py-1 rounded-md mr-2"
        >
          Edit
        </button>
        <button
          onClick={() => handleDeleteOrder(order.confirmationNumber)}
          className="bg-red-500 text-white px-2 py-1 rounded-md"
        >
          Delete
        </button>
      </td>
    </tr>
  ))}
</tbody>
        </table>
      </div>
    </div>
  );
}

export default OrderManagement;
import React, { useState, useEffect } from 'react';

function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderFormData, setOrderFormData] = useState({
    customerId: '',
    items: [],
    status: 'Pending',
    address: '',
    creditCard: '',
    subtotal: 0,
    tax: 0,
    total: 0
  });

  useEffect(() => {
    loadOrders();
    loadCustomers();
    loadProducts();
  }, []);

  const loadOrders = () => {
    const storedOrders = localStorage.getItem('orders');
    if (storedOrders) {
      try {
        const parsedOrders = JSON.parse(storedOrders);
        console.log('Loaded orders:', parsedOrders);
        setOrders(parsedOrders);
      } catch (error) {
        console.error('Error parsing orders:', error);
        setOrders([]);
      }
    } else {
      console.log('No orders found in localStorage');
      setOrders([]);
    }
  };

  const loadCustomers = () => {
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      try {
        const parsedUsers = JSON.parse(storedUsers);
        const customerUsers = parsedUsers.filter(user => user.role === 'customer');
        console.log('Loaded customers:', customerUsers);
        setCustomers(customerUsers);
      } catch (error) {
        console.error('Error parsing users:', error);
        setCustomers([]);
      }
    } else {
      console.log('No users found in localStorage');
      setCustomers([]);
    }
  };

  const loadProducts = () => {
    const storedProducts = localStorage.getItem('products');
    if (storedProducts) {
      try {
        const parsedProducts = JSON.parse(storedProducts);
        console.log('Loaded products:', parsedProducts);
        setProducts(parsedProducts);
      } catch (error) {
        console.error('Error parsing products:', error);
        setProducts([]);
      }
    } else {
      console.log('No products found in localStorage');
      setProducts([]);
    }
  };

  const saveOrders = (updatedOrders) => {
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    setOrders(updatedOrders);
  };

  const handleCustomerFilter = (e) => {
    setSelectedCustomer(e.target.value);
  };

  const handleAddItem = () => {
    setOrderFormData(prevData => ({
      ...prevData,
      items: [...prevData.items, { productId: '', quantity: 1, price: 0 }],
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
      
      if (field === 'productId') {
        const selectedProduct = products.find(p => p.id === value);
        if (selectedProduct) {
          updatedItems[index].price = selectedProduct.price;
        }
      }
      
      const subtotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const tax = subtotal * 0.125; // 12.5% tax
      const total = subtotal + tax;

      return { 
        ...prevData, 
        items: updatedItems,
        subtotal: subtotal,
        tax: tax,
        total: total
      };
    });
  };

  const handleOrderSubmit = (e) => {
    e.preventDefault();
    if (selectedOrder) {
      const updatedOrders = orders.map((order) =>
        order.id === selectedOrder.id ? { ...order, ...orderFormData } : order
      );
      saveOrders(updatedOrders);
    } else {
      const newOrder = {
        id: Date.now().toString(),
        ...orderFormData,
        customerId: selectedCustomer,
        date: new Date().toISOString(),
      };
      saveOrders([...orders, newOrder]);
    }
    clearOrderForm();
    setSelectedOrder(null);
  };

  const handleDeleteOrder = (orderId) => {
    const updatedOrders = orders.filter((order) => order.id !== orderId);
    saveOrders(updatedOrders);
    setSelectedOrder(null);
    clearOrderForm();
  };

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
    setOrderFormData({
      customerId: order.customerId,
      items: order.items || [],
      status: order.status || 'Pending',
      address: order.address || '',
      creditCard: order.creditCard || '',
      subtotal: order.subtotal || 0,
      tax: order.tax || 0,
      total: order.total || 0
    });
  };

  const clearOrderForm = () => {
    setOrderFormData({
      customerId: '',
      items: [],
      status: 'Pending',
      address: '',
      creditCard: '',
      subtotal: 0,
      tax: 0,
      total: 0
    });
  };

  const filteredOrders = selectedCustomer
    ? orders.filter(order => order.customerId === selectedCustomer)
    : orders;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Order Management</h2>
      <div className="mb-4">
        <label htmlFor="customerFilter" className="block text-lg font-medium mb-2">Filter by Customer:</label>
        <select
          id="customerFilter"
          value={selectedCustomer}
          onChange={handleCustomerFilter}
          className="p-2 border border-gray-300 rounded-md"
        >
          <option value="">All Customers</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>{customer.name}</option>
          ))}
        </select>
      </div>

      <form onSubmit={handleOrderSubmit} className="bg-white p-4 border border-gray-300 rounded-md shadow-md">
        <h3 className="text-xl font-semibold mb-4">{selectedOrder ? 'Edit Order' : 'Add New Order'}</h3>
        <div className="mb-4">
          <label htmlFor="status" className="block text-lg font-medium mb-2">Status:</label>
          <select
            id="status"
            name="status"
            value={orderFormData.status}
            onChange={(e) => setOrderFormData(prevData => ({...prevData, status: e.target.value}))}
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="address" className="block text-lg font-medium mb-2">Address:</label>
          <input
            type="text"
            id="address"
            name="address"
            value={orderFormData.address}
            onChange={(e) => setOrderFormData(prevData => ({...prevData, address: e.target.value}))}
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
              value={item.productId}
              onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
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
            <input
              type="number"
              value={item.price}
              onChange={(e) => handleItemChange(index, 'price', e.target.value)}
              placeholder="Price"
              required
              className="p-2 border border-gray-300 rounded-md w-20"
              disabled
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
        <div className="mb-4">
          <p className="font-medium">Subtotal: ${orderFormData.subtotal.toFixed(2)}</p>
          <p className="font-medium">Tax: ${orderFormData.tax.toFixed(2)}</p>
          <p className="font-medium">Total: ${orderFormData.total.toFixed(2)}</p>
        </div>
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
              <th className="p-2">ID</th>
              <th className="p-2">Customer</th>
              <th className="p-2">Status</th>
              <th className="p-2">Date</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id} className="border-b">
                <td className="p-2">{order.id}</td>
                <td className="p-2">{customers.find(c => c.id === order.customerId)?.name}</td>
                <td className="p-2">{order.status}</td>
                <td className="p-2">{new Date(order.date).toLocaleDateString()}</td>
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
      </div>
    </div>
  );
}

export default OrderManagement;

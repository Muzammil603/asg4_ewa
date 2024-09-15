import React, { useState, useEffect } from 'react';

function CustomerManagement() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = () => {
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      const parsedUsers = JSON.parse(storedUsers);
      const customerUsers = parsedUsers.filter(user => user.role === 'customer');
      setCustomers(customerUsers);
    }
  };

  const saveCustomers = (updatedCustomers) => {
    const storedUsers = localStorage.getItem('users');
    let allUsers = storedUsers ? JSON.parse(storedUsers) : [];
    
    updatedCustomers.forEach(customer => {
      const index = allUsers.findIndex(user => user.id === customer.id);
      if (index !== -1) {
        allUsers[index] = { ...allUsers[index], ...customer };
      } else {
        allUsers.push({ ...customer, role: 'customer' });
      }
    });

    localStorage.setItem('users', JSON.stringify(allUsers));
    setCustomers(updatedCustomers);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleDeleteCustomer = (customerId) => {
    const updatedCustomers = customers.filter((customer) => customer.id !== customerId);
    saveCustomers(updatedCustomers);
    setSelectedCustomer(null);
    clearForm();
  };

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      password: '',
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedCustomer) {
      const updatedCustomers = customers.map((customer) =>
        customer.id === selectedCustomer.id 
          ? { 
              ...customer, 
              ...formData, 
              password: formData.password ? formData.password : customer.password 
            } 
          : customer
      );
      saveCustomers(updatedCustomers);
    } else {
      const newCustomer = {
        id: Date.now().toString(),
        ...formData,
        role: 'customer'
      };
      saveCustomers([...customers, newCustomer]);
    }
    clearForm();
    setSelectedCustomer(null);
  };

  const clearForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
    });
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Customer Management</h2>
      
      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div className="flex flex-col space-y-2">
          <label htmlFor="name" className="text-sm font-medium">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col space-y-2">
          <label htmlFor="email" className="text-sm font-medium">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col space-y-2">
          <label htmlFor="password" className="text-sm font-medium">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required={!selectedCustomer}
            placeholder={selectedCustomer ? "Leave blank to keep current password" : ""}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div className="flex space-x-2">
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
            {selectedCustomer ? 'Update Customer' : 'Add Customer'}
          </button>
          {selectedCustomer && (
            <button 
              type="button" 
              onClick={() => {
                setSelectedCustomer(null);
                clearForm();
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <h3 className="text-xl font-semibold mb-2">Customer List</h3>
      {customers.length === 0 ? (
        <p className="text-gray-500">No customers found.</p>
      ) : (
        <ul className="space-y-2">
          {customers.map((customer) => (
            <li key={customer.id} className="flex items-center justify-between p-2 border border-gray-200 rounded-md">
              <div>
                <strong className="text-lg">{customer.name}</strong> - {customer.email}
              </div>
              <div>
                <button 
                  onClick={() => handleSelectCustomer(customer)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600 mr-2"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDeleteCustomer(customer.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CustomerManagement;

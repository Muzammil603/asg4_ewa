import React, { useState, useEffect } from 'react';
import { BASE_URL } from './config';

function CustomerManagement() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    street: '',
    city: '',
    state: '',
    zipCode: ''
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = () => {
    fetch(`${BASE_URL}/customers`, {
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    })
      .then(response => response.json())
      .then(data => setCustomers(data))
      .catch(error => console.error('Error fetching customers:', error));
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleDeleteCustomer = (customerId) => {
    fetch(`${BASE_URL}/user/delete/${customerId}`, {
      method: 'DELETE',
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          console.error('Error deleting customer:', data.error);
        } else {
          loadCustomers();
        }
      })
      .catch(error => console.error('Error:', error));
  };

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      street: customer.street,
      city: customer.city,
      state: customer.state,
      zipCode: customer.zip_code,
      password: ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedCustomer) {
      // Update existing customer
      fetch(`${BASE_URL}/user/update/${selectedCustomer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(formData),
      })
        .then(response => response.json())
        .then(data => {
          if (data.error) {
            console.error('Error updating customer:', data.error);
          } else {
            loadCustomers();
            setSelectedCustomer(null);
            clearForm();
          }
        })
        .catch(error => console.error('Error:', error));
    } else {
      // Add new customer
      fetch(`${BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(formData),
      })
        .then(response => response.json())
        .then(data => {
          if (data.error) {
            console.error('Error adding customer:', data.error);
          } else {
            loadCustomers();
            clearForm();
          }
        })
        .catch(error => console.error('Error:', error));
    }
  };

  const clearForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      street: '',
      city: '',
      state: '',
      zipCode: ''
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
        <div className="flex flex-col space-y-2">
          <label htmlFor="street" className="text-sm font-medium">Street:</label>
          <input
            type="text"
            id="street"
            name="street"
            value={formData.street}
            onChange={handleInputChange}
            required
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col space-y-2">
          <label htmlFor="city" className="text-sm font-medium">City:</label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            required
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col space-y-2">
          <label htmlFor="state" className="text-sm font-medium">State:</label>
          <input
            type="text"
            id="state"
            name="state"
            value={formData.state}
            onChange={handleInputChange}
            required
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col space-y-2">
          <label htmlFor="zipCode" className="text-sm font-medium">Zip Code:</label>
          <input
            type="text"
            id="zipCode"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleInputChange}
            required
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

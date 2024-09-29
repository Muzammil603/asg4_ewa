import React, { useState } from 'react';

function CustomerRegistration({ onSignUp }) {
  const [signUpData, setSignUpData] = useState({
    name: '',
    email: '',
    password: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
  });
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setSignUpData({
      ...signUpData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignUpSubmit = (e) => {
    e.preventDefault();
    fetch('http://127.0.0.1:5001/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(signUpData),
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setError('');
          onSignUp(); // Call onSignUp callback
          setSignUpData({
            name: '',
            email: '',
            password: '',
            street: '',
            city: '',
            state: '',
            zipCode: '',
          });
        }
      })
      .catch(error => console.error('Error:', error));
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 text-white">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-gray-900">
        <h1 className="text-4xl font-bold mb-6 text-center">Customer Registration</h1>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSignUpSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={signUpData.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={signUpData.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={signUpData.password}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="street" className="block text-sm font-medium text-gray-700">Street:</label>
            <input
              type="text"
              id="street"
              name="street"
              value={signUpData.street}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">City:</label>
            <input
              type="text"
              id="city"
              name="city"
              value={signUpData.city}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="state" className="block text-sm font-medium text-gray-700">State:</label>
            <input
              type="text"
              id="state"
              name="state"
              value={signUpData.state}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">Zip Code:</label>
            <input
              type="text"
              id="zipCode"
              name="zipCode"
              value={signUpData.zipCode}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-teal-400 to-blue-500 text-white py-2 rounded-md mt-4 hover:opacity-90 transition-opacity duration-300"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}

export default CustomerRegistration;

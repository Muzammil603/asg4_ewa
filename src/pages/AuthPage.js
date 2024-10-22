import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from './config';

function AuthPage({ setIsLoggedIn }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [role, setRole] = useState('customer');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAuth = () => {
    if (isLogin) {
      // Login logic
      fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({ email, password }),
      })
        .then(response => response.json())
        .then(data => {
          if (data.error) {
            setError(data.error);
          } else {
            localStorage.setItem('userRole', data.role);
            localStorage.setItem('userId', data.user_id);
            localStorage.setItem('userName', data.name);
            setIsLoggedIn(true);
            navigate('/');  // Redirect to home page after successful login
          }
        })
        .catch(error => console.error('Error:', error));
    } else {
      // Signup logic
      fetch(`${BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          
        },
        body: JSON.stringify({ name, email, password, street, city, state, zipCode, role }),
      })
        .then(response => response.json())
        .then(data => {
          if (data.error) {
            setError(data.error);
          } else {
            setError('');
            setIsLogin(true);  // Switch to login view
            setName('');
            setEmail('');
            setPassword('');
            setStreet('');
            setCity('');
            setState('');
            setZipCode('');
            setRole('customer');
          }
        })
        .catch(error => console.error('Error:', error));
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 text-white">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-gray-900">
        <h1 className="text-4xl font-bold mb-2 text-center">SmartHome</h1>
        <h2 className="text-2xl font-semibold mb-6 text-center">Shop Now in the Future</h2>
        <h2 className="text-3xl font-bold mb-6 text-center">{isLogin ? 'Login' : 'Sign Up'}</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {/* Signup Form */}
        {!isLogin && (
          <>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name:</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="street" className="block text-sm font-medium text-gray-700">Street:</label>
              <input
                type="text"
                id="street"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">City:</label>
              <input
                type="text"
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="state" className="block text-sm font-medium text-gray-700">State:</label>
              <input
                type="text"
                id="state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">Zip Code:</label>
              <input
                type="text"
                id="zipCode"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </>
        )}

        {/* Shared Fields for Login and Signup */}
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Role Selection for Signup */}
        {!isLogin && (
          <div className="mb-4">
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role:</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="customer">Customer</option>
              <option value="salesman">Salesman</option>
              <option value="storeManager">Store Manager</option>
            </select>
          </div>
        )}

        <button
          onClick={handleAuth}
          className="w-full bg-gradient-to-r from-teal-400 to-blue-500 text-white py-2 rounded-md mt-4 hover:opacity-90 transition-opacity duration-300"
        >
          {isLogin ? 'Login' : 'Sign Up'}
        </button>

        <p className="mt-4 text-center text-sm">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setName('');
              setEmail('');
              setPassword('');
              setStreet('');
              setCity('');
              setState('');
              setZipCode('');
              setRole('customer');
            }}
            className="text-blue-500 hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default AuthPage;

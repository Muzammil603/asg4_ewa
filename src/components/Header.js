// src/components/Header.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Header({ handleLogout, setIsLoggedIn }) {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');

  const handleLogoutClick = () => {
    handleLogout();
    setIsLoggedIn(false);  // Ensure this function is properly passed and used
    navigate('/logout');
  };

  return (
    <header className="bg-blue-600 p-4 text-white shadow-md">
      <nav className="container mx-auto flex justify-between items-center">
        <ul className="flex space-x-4">
          <li><Link to="/" className="font-bold hover:text-gray-200">Home</Link></li>
          <li><Link to="/products" className="font-bold hover:text-gray-200">Products</Link></li>
          <li><Link to="/cart" className="font-bold hover:text-gray-200">Cart</Link></li>
          {userRole === 'storeManager' && (
            <li><Link to="/admin" className="font-bold hover:text-gray-200">Admin Panel</Link></li>
          )}
          {userRole === 'salesman' && (
            <li><Link to="/salesman" className="font-bold hover:text-gray-200">Salesman</Link></li>
          )}
          {userRole === 'storeManager' && (
            <li><Link to="/salesman" className="font-bold hover:text-gray-200">Salesman</Link></li>
          )}
          <li><Link to="/order-history" className="font-bold hover:text-gray-200">Order History</Link></li>
          <li><Link to="/product-review-form" className="font-bold hover:text-gray-200">Submit Review</Link></li>
          <li><Link to="/product-reviews" className="font-bold hover:text-gray-200">View Reviews</Link></li>
        </ul>
        <button 
          onClick={handleLogoutClick} 
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md shadow-md"
        >
          Logout
        </button>
      </nav>
    </header>
  );
}

export default Header;
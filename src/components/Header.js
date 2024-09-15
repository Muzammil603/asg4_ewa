import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Header({ handleLogout, setIsLoggedIn }) {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    handleLogout();
    setIsLoggedIn(false);
    navigate('/logout');
  };

  return (
    <header className="bg-gray-800 p-4 shadow-md">
      <nav className="container mx-auto flex justify-between items-center">
        <ul className="flex space-x-4 text-white">
          <li><Link to="/" className="hover:text-gray-400">Home</Link></li>
          <li><Link to="/products" className="hover:text-gray-400">Products</Link></li>
          <li><Link to="/cart" className="hover:text-gray-400">Cart</Link></li>
          <li><Link to="/admin" className="hover:text-gray-400">Admin</Link></li>
          <li><Link to="/salesman" className="hover:text-gray-400">Salesman</Link></li>
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

import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart } from 'react-icons/fa'; // Import cart icon
import { CartContext } from '../context/CartContext'; // Import CartContext

function Header({ handleLogout, setIsLoggedIn }) {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');
  const { cartItems } = useContext(CartContext); // Use CartContext to get cartItems

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0); // Calculate total items in cart

  const handleLogoutClick = () => {
    handleLogout();
    setIsLoggedIn(false);
    navigate('/logout');
  };

  return (
    <header className="bg-blue-600 p-4 text-white shadow-md">
      <nav className="container mx-auto flex justify-between items-center">
        <ul className="flex space-x-4">
          <li><Link to="/" className="font-bold hover:text-gray-200">Home</Link></li>
          <li><Link to="/products" className="font-bold hover:text-gray-200">Products</Link></li>
          <li><Link to="/trending" className="font-bold hover:text-gray-200">Trending</Link></li>
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
          {userRole === 'storeManager' && (
          <li><Link to="/manager-dashboard" className="font-bold hover:text-gray-200">Manager Dashboard</Link></li>
          )}
        </ul>

        {/* Cart Icon and Logout Button */}
        <div className="flex items-center space-x-4">
          {/* Cart Icon with dynamic item count */}
          <Link to="/cart" className="relative text-white hover:text-gray-200">
            <FaShoppingCart size={24} />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full text-xs px-2 py-1">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Logout Button */}
          <button 
            onClick={handleLogoutClick} 
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md shadow-md"
          >
            Logout
          </button>
        </div>
      </nav>
    </header>
  );
}

export default Header;

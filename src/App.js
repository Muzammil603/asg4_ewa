import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import AdminPanel from './pages/AdminPanel';
import SalesmanPanel from './pages/SalesmanPanel';
import CustomerRegistration from './pages/CustomerRegistration';
import AuthPage from './pages/AuthPage';
import LogoutConfirmation from './pages/LogoutConfirmation'; // Make sure this is properly implemented
import OrderHistory from './pages/OrderHistory';
import ProductReviewForm from './pages/ProductReviewForm';
import ProductReviews from './pages/ProductReviews';
import Trending from './pages/Trending';
import ManagerDashboard from './pages/ManagerDashboard';
import ProtectedRoute from './components/ProtectedRoute';


function App() {
  const [cartItems, setCartItems] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    const id = localStorage.getItem('userId');
    const name = localStorage.getItem('userName');

    setIsLoggedIn(!!role);
    setUserRole(role || '');
    setCustomerId(id || '');
    setCustomerName(name || '');
  }, []);

  const addToCart = (product) => {
    setCartItems([...cartItems, product]);
  };

  const removeFromCart = (productId) => {
    const updatedCartItems = cartItems.filter((item) => item.id !== productId);
    setCartItems(updatedCartItems);
  };

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    setIsLoggedIn(false);
    setCartItems([]);
    setCustomerId('');
    setCustomerName('');
    setUserRole('');
  };

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        {isLoggedIn && <Header handleLogout={handleLogout} setIsLoggedIn={setIsLoggedIn} />}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={isLoggedIn ? <Home /> : <Navigate to="/auth" />} />
            <Route path="/auth" element={!isLoggedIn ? <AuthPage setIsLoggedIn={setIsLoggedIn} setCustomerName={setCustomerName} /> : <Navigate to="/" />} />
            
            {/* Define the logout route properly */}
            <Route path="/logout" element={<LogoutConfirmation />} />

            <Route path="/products" element={isLoggedIn ? <Products /> : <Navigate to="/auth" />} />
            <Route path="/products/:id" element={isLoggedIn ? <ProductDetails addToCart={addToCart} /> : <Navigate to="/auth" />} />
            <Route path="/cart" element={isLoggedIn ? <Cart cartItems={cartItems} removeFromCart={removeFromCart} /> : <Navigate to="/auth" />} />
            <Route path="/checkout" element={isLoggedIn ? <Checkout cartItems={cartItems} customerName={customerName} /> : <Navigate to="/auth" />} />

            {/* Role-based access control */}
            <Route path="/admin" element={isLoggedIn  ? <AdminPanel /> : <Navigate to="/" />} />
            <Route path="/salesman" element={isLoggedIn  ? <SalesmanPanel /> : <Navigate to="/" />} />
            <Route path="/register" element={isLoggedIn ? <CustomerRegistration /> : <Navigate to="/auth" />} />
            <Route path="/order-history" element={isLoggedIn ? <OrderHistory customerId={customerId} /> : <Navigate to="/auth" />} />

            <Route path="/product-review-form" element={isLoggedIn ? <ProductReviewForm /> : <Navigate to="/auth" />} />
            <Route path="/product-reviews" element={isLoggedIn ? <ProductReviews /> : <Navigate to="/auth" />} />
            <Route path="/trending" element={isLoggedIn ? <Trending /> : <Navigate to="/auth" />} />
            <Route
                path="/manager-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['storeManager']}>
                    <ManagerDashboard />
                  </ProtectedRoute>
                  }
              />

            {/* Redirect unknown routes */}
            <Route path="*" element={<Navigate to={isLoggedIn ? "/" : "/auth"} />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

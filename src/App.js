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
import LogoutConfirmation from './pages/LogoutConfirmation';
import OrderHistory from './pages/OrderHistory';

function App() {
  const [cartItems, setCartItems] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    const id = localStorage.getItem('userId');
    const name = localStorage.getItem('userName');

    setIsLoggedIn(!!userRole);
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
  };

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        {isLoggedIn && <Header handleLogout={handleLogout} setIsLoggedIn={setIsLoggedIn} />}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={isLoggedIn ? <Home /> : <Navigate to="/auth" />} />
            <Route path="/auth" element={!isLoggedIn ? <AuthPage setIsLoggedIn={setIsLoggedIn} setCustomerName={setCustomerName} /> : <Navigate to="/" />} />
            <Route path="/logout" element={<LogoutConfirmation />} />
            <Route path="/products" element={isLoggedIn ? <Products /> : <Navigate to="/auth" />} />
            <Route path="/products/:id" element={isLoggedIn ? <ProductDetails addToCart={addToCart} /> : <Navigate to="/auth" />} />
            <Route path="/cart" element={isLoggedIn ? <Cart cartItems={cartItems} removeFromCart={removeFromCart} /> : <Navigate to="/auth" />} />
            <Route path="/checkout" element={isLoggedIn ? <Checkout cartItems={cartItems} customerName={customerName} /> : <Navigate to="/auth" />} />
            <Route path="/admin" element={isLoggedIn ? <AdminPanel /> : <Navigate to="/auth" />} />
            <Route path="/salesman" element={isLoggedIn ? <SalesmanPanel /> : <Navigate to="/auth" />} />
            <Route path="/register" element={isLoggedIn ? <CustomerRegistration /> : <Navigate to="/auth" />} />
            <Route path="/order-history" element={isLoggedIn ? <OrderHistory customerId={customerId} /> : <Navigate to="/auth" />} />
            <Route path="*" element={<Navigate to={isLoggedIn ? "/" : "/auth"} />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

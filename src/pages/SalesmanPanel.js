import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import CustomerManagement from './CustomerManagement';
import OrderManagement from './OrderManagement';

function SalesmanPanel() {
  const [activeSection, setActiveSection] = useState('customers');

  const userRole = localStorage.getItem('userRole');
  if (userRole !== 'salesman' && userRole !== 'storeManager') {
    return <Navigate to="/login" />;
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Salesman Panel</h1>
      
      <div className="mb-4">
        <button 
          onClick={() => setActiveSection('customers')}
          className={`px-4 py-2 rounded-md text-sm font-medium mr-2 ${
            activeSection === 'customers' 
              ? 'bg-gray-300 text-gray-800' 
              : 'bg-gray-200 text-gray-600'
          } hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500`}
        >
          Manage Customers
        </button>
        <button 
          onClick={() => setActiveSection('orders')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            activeSection === 'orders' 
              ? 'bg-gray-300 text-gray-800' 
              : 'bg-gray-200 text-gray-600'
          } hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500`}
        >
          Manage Orders
        </button>
      </div>

      {activeSection === 'customers' ? <CustomerManagement /> : <OrderManagement />}
    </div>
  );
}

export default SalesmanPanel;

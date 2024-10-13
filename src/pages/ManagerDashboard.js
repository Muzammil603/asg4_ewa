import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import InventoryPage from './InventoryPage';
import SalesReport from './SalesReport';

function ManagerDashboard() {
  const [activeSection, setActiveSection] = useState('inventory');

  const userRole = localStorage.getItem('userRole');
  if (userRole !== 'storeManager') {
    return <Navigate to="/login" />;
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Store Manager Dashboard</h1>
      
      <div className="mb-4">
        <button 
          onClick={() => setActiveSection('inventory')}
          className={`px-4 py-2 rounded-md text-sm font-medium mr-2 ${
            activeSection === 'inventory' 
              ? 'bg-gray-300 text-gray-800' 
              : 'bg-gray-200 text-gray-600'
          } hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500`}
        >
          Inventory
        </button>
        <button 
          onClick={() => setActiveSection('sales')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            activeSection === 'sales' 
              ? 'bg-gray-300 text-gray-800' 
              : 'bg-gray-200 text-gray-600'
          } hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500`}
        >
          Sales Report
        </button>
      </div>

      {activeSection === 'inventory' ? <InventoryPage /> : <SalesReport />}
    </div>
  );
}

export default ManagerDashboard;
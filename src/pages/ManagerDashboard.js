import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState('inventory');
  const [inventoryData, setInventoryData] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [saleProducts, setSaleProducts] = useState([]);
  const [rebateProducts, setRebateProducts] = useState([]);
  const [dailySales, setDailySales] = useState([]);

  useEffect(() => {
    fetchInventoryData();
    fetchSalesData();
    fetchSaleProducts();
    fetchRebateProducts();
    fetchDailySales();
  }, []);

  const fetchInventoryData = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5001/api/inventory');
      setInventoryData(response.data);
    } catch (error) {
      console.error('Error fetching inventory data:', error);
    }
  };

  const fetchSalesData = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5001/api/sales');
      setSalesData(response.data);
    } catch (error) {
      console.error('Error fetching sales data:', error);
    }
  };

  const fetchSaleProducts = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5001/api/sale-products');
      setSaleProducts(response.data);
    } catch (error) {
      console.error('Error fetching sale products:', error);
    }
  };

  const fetchRebateProducts = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5001/api/rebate-products');
      setRebateProducts(response.data);
    } catch (error) {
      console.error('Error fetching rebate products:', error);
    }
  };

  const fetchDailySales = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5001/api/daily-sales');
      setDailySales(response.data);
    } catch (error) {
      console.error('Error fetching daily sales:', error);
    }
  };

  const renderInventoryTable = () => (
    <table className="min-w-full bg-white">
      <thead>
        <tr>
          <th className="py-2 px-4 border-b">Product Name</th>
          <th className="py-2 px-4 border-b">Price</th>
          <th className="py-2 px-4 border-b">Available Quantity</th>
        </tr>
      </thead>
      <tbody>
        {inventoryData.map((item, index) => (
          <tr key={index}>
            <td className="py-2 px-4 border-b">{item.name}</td>
            <td className="py-2 px-4 border-b">${item.price}</td>
            <td className="py-2 px-4 border-b">{item.quantity}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderInventoryChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={inventoryData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="quantity" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderSalesTable = () => (
    <table className="min-w-full bg-white">
      <thead>
        <tr>
          <th className="py-2 px-4 border-b">Product Name</th>
          <th className="py-2 px-4 border-b">Price</th>
          <th className="py-2 px-4 border-b">Quantity Sold</th>
          <th className="py-2 px-4 border-b">Total Sales</th>
        </tr>
      </thead>
      <tbody>
        {salesData.map((item, index) => (
          <tr key={index}>
            <td className="py-2 px-4 border-b">{item.name}</td>
            <td className="py-2 px-4 border-b">${item.price}</td>
            <td className="py-2 px-4 border-b">{item.quantity_sold}</td>
            <td className="py-2 px-4 border-b">${item.total_sales}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderSalesChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={salesData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="total_sales" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderSaleProductsTable = () => (
    <table className="min-w-full bg-white">
      <thead>
        <tr>
          <th className="py-2 px-4 border-b">Product Name</th>
          <th className="py-2 px-4 border-b">Original Price</th>
          <th className="py-2 px-4 border-b">Sale Price</th>
        </tr>
      </thead>
      <tbody>
        {saleProducts.map((item, index) => (
          <tr key={index}>
            <td className="py-2 px-4 border-b">{item.name}</td>
            <td className="py-2 px-4 border-b">${item.original_price}</td>
            <td className="py-2 px-4 border-b">${item.sale_price}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderRebateProductsTable = () => (
    <table className="min-w-full bg-white">
      <thead>
        <tr>
          <th className="py-2 px-4 border-b">Product Name</th>
          <th className="py-2 px-4 border-b">Price</th>
          <th className="py-2 px-4 border-b">Rebate Amount</th>
        </tr>
      </thead>
      <tbody>
        {rebateProducts.map((item, index) => (
          <tr key={index}>
            <td className="py-2 px-4 border-b">{item.name}</td>
            <td className="py-2 px-4 border-b">${item.price}</td>
            <td className="py-2 px-4 border-b">${item.rebate_amount}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderDailySalesTable = () => (
    <table className="min-w-full bg-white">
      <thead>
        <tr>
          <th className="py-2 px-4 border-b">Date</th>
          <th className="py-2 px-4 border-b">Total Sales</th>
        </tr>
      </thead>
      <tbody>
        {dailySales.map((item, index) => (
          <tr key={index}>
            <td className="py-2 px-4 border-b">{item.date}</td>
            <td className="py-2 px-4 border-b">${item.total_sales}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Store Manager Dashboard</h1>
      <div className="mb-4">
        <button
          className={`mr-2 px-4 py-2 ${activeTab === 'inventory' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('inventory')}
        >
          Inventory
        </button>
        <button
          className={`mr-2 px-4 py-2 ${activeTab === 'sales' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('sales')}
        >
          Sales Report
        </button>
      </div>
      
      {activeTab === 'inventory' && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Inventory</h2>
          {renderInventoryTable()}
          <h3 className="text-lg font-semibold mt-4 mb-2">Inventory Chart</h3>
          {renderInventoryChart()}
          <h3 className="text-lg font-semibold mt-4 mb-2">Products on Sale</h3>
          {renderSaleProductsTable()}
          <h3 className="text-lg font-semibold mt-4 mb-2">Products with Manufacturer Rebates</h3>
          {renderRebateProductsTable()}
        </div>
      )}
      
      {activeTab === 'sales' && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Sales Report</h2>
          {renderSalesTable()}
          <h3 className="text-lg font-semibold mt-4 mb-2">Sales Chart</h3>
          {renderSalesChart()}
          <h3 className="text-lg font-semibold mt-4 mb-2">Daily Sales Transactions</h3>
          {renderDailySalesTable()}
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;
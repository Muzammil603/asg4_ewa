import React, { useState, useEffect, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function SalesReport() {
  const [salesData, setSalesData] = useState([]);
  const [dailySales, setDailySales] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const chartRef = useRef(null);

  useEffect(() => {
    fetchSalesData();
    fetchDailySalesData();
  }, []);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.update();
    }
  }, [salesData]);

  const fetchSalesData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://127.0.0.1:5001/api/sales');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Sales data:', data);
      setSalesData(data);
    } catch (error) {
      console.error('Error fetching sales data:', error);
      setError('Failed to fetch sales data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDailySalesData = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5001/api/daily-sales');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Daily sales data:', data);
      setDailySales(data);
    } catch (error) {
      console.error('Error fetching daily sales:', error);
      setError('Failed to fetch daily sales data. Please try again later.');
    }
  };

  const calculateTotalSales = (product) => {
    return product.price * product.sold_items;
  };

  const salesChartData = {
    labels: salesData.map(product => product.name),
    datasets: [
      {
        label: 'Total Sales',
        data: salesData.map(product => calculateTotalSales(product)),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Total Sales per Product',
      },
    },
  };

  if (isLoading) {
    return <div>Loading sales data...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Sales Report</h2>
      {renderProductSalesTable()}
      {renderSalesChart()}
      {renderDailySales()}
    </div>
  );

  function renderProductSalesTable() {
    return (
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Product Sales Table</h3>
        <div className="overflow-x-auto shadow-lg border border-gray-200 rounded-lg">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-100 text-gray-600 text-left">
              <tr>
                <th className="px-4 py-2">Product Name</th>
                <th className="px-4 py-2 text-right">Price</th>
                <th className="px-4 py-2 text-right">Number of Items Sold</th>
                <th className="px-4 py-2 text-right">Total Sales</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {salesData.map((product) => (
                <tr key={product.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{product.name}</td>
                  <td className="px-4 py-2 text-right">${product.price.toFixed(2)}</td>
                  <td className="px-4 py-2 text-right">{product.sold_items}</td>
                  <td className="px-4 py-2 text-right">${calculateTotalSales(product).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  function renderDailySales() {
    return (
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Daily Sales Transactions</h3>
        <div className="overflow-x-auto shadow-lg border border-gray-200 rounded-lg">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-100 text-gray-600 text-left">
              <tr>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2 text-right">Total Sales</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {dailySales.map((sale) => (
                <tr key={sale.date} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{sale.date}</td>
                  <td className="px-4 py-2 text-right">${sale.total_sales.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  function renderSalesChart() {
    return (
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Sales Bar Chart</h3>
        <div className="h-96">
          <Bar ref={chartRef} data={salesChartData} options={chartOptions} />
        </div>
      </div>
    );
  }
}

export default SalesReport;
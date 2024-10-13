import React, { useEffect, useRef, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function InventoryPage() {
  const [products, setProducts] = useState([]);
  const chartRef = useRef(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.update();
    }
  }, [products]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5001/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const inventoryData = {
    labels: products.map(product => product.name),
    datasets: [
      {
        label: 'Available Items',
        data: products.map(product => product.available_items),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
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
        text: 'Product Inventory',
      },
    },
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Inventory Report</h2>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">All Products</h3>
        <div className="overflow-x-auto shadow-lg border border-gray-200 rounded-lg">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-100 text-gray-600 text-left">
              <tr>
                <th className="px-4 py-2">#</th>
                <th className="px-4 py-2">Product Name</th>
                <th className="px-4 py-2 text-right">Price</th>
                <th className="px-4 py-2 text-right">Available Items</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {products.map((product, index) => (
                <tr key={product.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">{product.name}</td>
                  <td className="px-4 py-2 text-right">${product.price.toFixed(2)}</td>
                  <td className="px-4 py-2 text-right">{product.available_items}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Inventory Bar Chart</h3>
        <div className="h-96">
          <Bar ref={chartRef} data={inventoryData} options={chartOptions} />
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Products on Sale</h3>
        <div className="overflow-x-auto shadow-lg border border-gray-200 rounded-lg">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-100 text-gray-600 text-left">
              <tr>
                <th className="px-4 py-2">#</th>
                <th className="px-4 py-2">Product Name</th>
                <th className="px-4 py-2 text-right">Price</th>
                <th className="px-4 py-2 text-right">Retailer Sale</th>
                <th className="px-4 py-2 text-right">Sale Price</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {products.filter(product => product.retailer_discount > 0).map((product, index) => {
                const salePrice = product.price - product.retailer_discount - (product.manufacturer_rebate || 0);
                return (
                  <tr key={product.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2">{product.name}</td>
                    <td className="px-4 py-2 text-right">${product.price.toFixed(2)}</td>
                    <td className="px-4 py-2 text-right">${product.retailer_discount.toFixed(2)}</td>
                    <td className="px-4 py-2 text-right">${salePrice.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Products with Manufacturer Rebates</h3>
        <div className="overflow-x-auto shadow-lg border border-gray-200 rounded-lg">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-100 text-gray-600 text-left">
              <tr>
                <th className="px-4 py-2">#</th>
                <th className="px-4 py-2">Product Name</th>
                <th className="px-4 py-2 text-right">Price</th>
                <th className="px-4 py-2 text-right">Rebate Amount</th>
                <th className="px-4 py-2 text-right">Sale Price</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {products.filter(product => product.manufacturer_rebate > 0).map((product, index) => {
                const salePrice = product.price - product.manufacturer_rebate - (product.retailer_discount || 0);
                return (
                  <tr key={product.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2">{product.name}</td>
                    <td className="px-4 py-2 text-right">${product.price.toFixed(2)}</td>
                    <td className="px-4 py-2 text-right">${product.manufacturer_rebate.toFixed(2)}</td>
                    <td className="px-4 py-2 text-right">${salePrice.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default InventoryPage;
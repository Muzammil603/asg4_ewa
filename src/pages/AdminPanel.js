import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

function AdminPanel() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    accessories: []
  });
  const [accessoryData, setAccessoryData] = useState({
    name: '',
    price: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    fetch('http://127.0.0.1:5001/api/products')
      .then(response => response.json())
      .then(data => setProducts(data))
      .catch(error => console.error('Error fetching products:', error));
  };

  const userRole = localStorage.getItem('userRole');
  if (userRole !== 'storeManager') {
    return <Navigate to="/login" />;
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAccessoryInputChange = (e) => {
    setAccessoryData({
      ...accessoryData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddAccessory = () => {
    setFormData({
      ...formData,
      accessories: [...formData.accessories, { ...accessoryData, id: Date.now().toString() }]
    });
    setAccessoryData({ name: '', price: '' });
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    const newProduct = {
      ...formData,
      accessories: formData.accessories
    };

    fetch('http://127.0.0.1:5001/api/products/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newProduct)
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          console.error('Error adding product:', data.error);
        } else {
          fetchProducts();
          setFormData({
            name: '',
            description: '',
            price: '',
            category: '',
            accessories: []
          });
        }
      })
      .catch(error => console.error('Error:', error));
  };

  const handleDeleteProduct = (productId) => {
    fetch(`http://127.0.0.1:5001/api/products/delete/${productId}`, {
      method: 'DELETE'
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          console.error('Error deleting product:', data.error);
        } else {
          fetchProducts();
        }
      })
      .catch(error => console.error('Error:', error));
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setFormData(product);
  };

  const handleUpdateProduct = (e) => {
    e.preventDefault();
    fetch(`http://127.0.0.1:5001/api/products/update/${selectedProduct.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          console.error('Error updating product:', data.error);
        } else {
          fetchProducts();
          setSelectedProduct(null);
          setFormData({
            name: '',
            description: '',
            price: '',
            category: '',
            accessories: []
          });
        }
      })
      .catch(error => console.error('Error:', error));
  };

  const handleCancelEdit = () => {
    setSelectedProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      accessories: []
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
      <h2 className="text-2xl font-semibold mb-4">{selectedProduct ? 'Edit Product' : 'Add Product'}</h2>
      <form
        onSubmit={selectedProduct ? handleUpdateProduct : handleAddProduct}
        className="bg-white shadow-md rounded-lg p-6 mb-6"
      >
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description:</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
          ></textarea>
        </div>
        <div className="mb-4">
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price:</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category:</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
          >
            <option value="">Select a category</option>
            <option value="1">Smart Doorbells</option>
            <option value="2">Smart Doorlocks</option>
            <option value="3">Smart Speakers</option>
            <option value="4">Smart Lightings</option>
            <option value="5">Smart Thermostats</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Accessories:</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              name="name"
              value={accessoryData.name}
              onChange={handleAccessoryInputChange}
              placeholder="Accessory Name"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            />
            <input
              type="number"
              name="price"
              value={accessoryData.price}
              onChange={handleAccessoryInputChange}
              placeholder="Price"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            />
            <button
              type="button"
              onClick={handleAddAccessory}
              className="px-4 py-2 bg-green-500 text-white rounded-md shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Add Accessory
            </button>
          </div>
          <ul className="list-disc pl-5">
            {formData.accessories.map((accessory) => (
              <li key={accessory.id} className="mb-2">
                {accessory.name} (${accessory.price})
              </li>
            ))}
          </ul>
        </div>
        <div className="flex gap-4">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {selectedProduct ? 'Update Product' : 'Add Product'}
          </button>
          {selectedProduct && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
      <h2 className="text-2xl font-semibold mb-4">Product List</h2>
      <ul className="list-disc pl-5">
        {products.map((product) => (
          <li key={product.id} className="mb-2 flex justify-between items-center">
            <div>
              <strong>{product.name}</strong>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleSelectProduct(product)}
                className="px-2 py-1 bg-yellow-500 text-white rounded-md shadow-sm hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteProduct(product.id)}
                className="px-2 py-1 bg-red-500 text-white rounded-md shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminPanel;

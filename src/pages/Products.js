import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { BASE_URL } from './config';

function Products() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [noResults, setNoResults] = useState(false);  // New state to track no results

  useEffect(() => {
    fetchProducts();  // Fetch all products on page load
  }, []);

  const fetchProducts = (query = '') => {
    const searchUrl = query ? `${BASE_URL}/products/search?query=${query}` : `${BASE_URL}/products`;
    fetch(searchUrl, {
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    })
      .then(response => response.json())
      .then(data => {
        setProducts(data);
        setNoResults(data.length === 0);  // Set noResults to true if no products are returned
      })
      .catch(error => console.error('Error fetching products:', error));
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Fetch suggestions based on search term
    if (value.length > 0) {
      fetch(`${BASE_URL}/products/search?query=${value}`)
        .then(response => response.json())
        .then(data => setSuggestions(data))
        .catch(error => console.error('Error fetching suggestions:', error));
    } else {
      setSuggestions([]);
    }
  };

  const handleSearchClick = () => {
    fetchProducts(searchTerm);  // Fetch products based on the search term
  };

  const handleSelectSuggestion = (suggestion) => {
    setSearchTerm(suggestion.name);  // Set search term to the selected suggestion
    setSuggestions([]);  // Clear suggestions
    fetchProducts(suggestion.name);  // Fetch products based on the selected suggestion
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Products</h1>

      {/* Search Bar with Button */}
      <div className="mb-6 flex items-center">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search for products..."
          className="w-full p-2 border border-gray-300 rounded-lg shadow-sm"
        />
        <button
          onClick={handleSearchClick}
          className="ml-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Search
        </button>
      </div>

      {/* Auto-complete suggestions */}
      {suggestions.length > 0 && (
        <ul className="mt-2 bg-white border border-gray-300 rounded-lg shadow-md">
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.id}
              className="p-2 cursor-pointer hover:bg-gray-100"
              onClick={() => handleSelectSuggestion(suggestion)}
            >
              {suggestion.name}
            </li>
          ))}
        </ul>
      )}

      {/* Display "No Results Found" */}
      {noResults ? (
        <p className="text-lg text-gray-500">No results found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link
              to={`/products/${product.id}`}
              key={product.id}
              className="block bg-white border border-gray-300 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <ProductCard product={product} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Products;

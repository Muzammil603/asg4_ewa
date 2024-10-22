import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from './config';

const Trending = () => {
  const [topLikedProducts, setTopLikedProducts] = useState([]);
  const [topZipCodes, setTopZipCodes] = useState([]);
  const [topSoldProducts, setTopSoldProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrendingData = async () => {
      try {
        const [likedProductsRes, zipCodesRes, soldProductsRes] = await Promise.all([
          axios.get(`${BASE_URL}/trending/liked-products`, {
            headers: {
              'ngrok-skip-browser-warning': 'true'
            }
          }),
          axios.get(`${BASE_URL}/trending/zip-codes`, {
            headers: {
              'ngrok-skip-browser-warning': 'true'
            }
          }),
          axios.get(`${BASE_URL}/trending/sold-products`, {
            headers: {
              'ngrok-skip-browser-warning': 'true'
            }
          })
        ]);

        setTopLikedProducts(likedProductsRes.data);
        setTopZipCodes(zipCodesRes.data);
        setTopSoldProducts(soldProductsRes.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching trending data:', error);
        setError('Failed to fetch trending data. Please try again later.');
        setLoading(false);
      }
    };

    fetchTrendingData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto mt-10 p-6 bg-red-100 rounded-lg shadow-xl text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-3xl font-bold mb-10 text-center text-blue-600">Trending</h2>

      {/* Top 5 Most Liked Products */}
      <div className="mb-10">
        <h3 className="text-2xl font-semibold mb-4 text-gray-700 border-b-2 border-blue-500 pb-2">Top 5 Most Liked Products</h3>
        {topLikedProducts.length > 0 ? (
          <ul className="space-y-4">
            {topLikedProducts.map((product, index) => (
              <li
                key={index}
                className="bg-blue-100 p-4 rounded-lg shadow-md hover:bg-blue-200 transition-all duration-200"
              >
                <div className="text-lg font-medium">Product Name: {product.ProductModelName}</div>
                <div className="text-sm text-gray-600">Rating: <span className="font-semibold">{product.ReviewRating}</span></div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No liked products found.</p>
        )}
      </div>

      {/* Top 5 Zip Codes with Most Sales */}
      <div className="mb-10">
        <h3 className="text-2xl font-semibold mb-4 text-gray-700 border-b-2 border-green-500 pb-2">Top 5 Zip Codes with Most Sales</h3>
        {topZipCodes.length > 0 ? (
          <ul className="space-y-4">
            {topZipCodes.map((zip, index) => (
              <li
                key={index}
                className="bg-green-100 p-4 rounded-lg shadow-md hover:bg-green-200 transition-all duration-200"
              >
                <div className="text-lg font-medium">Zip Code: {zip.zip_code}</div>
                <div className="text-sm text-gray-600">Sales Count: <span className="font-semibold">{zip.sales_count}</span></div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No zip code data found.</p>
        )}
      </div>

      {/* Top 5 Most Sold Products */}
      <div>
        <h3 className="text-2xl font-semibold mb-4 text-gray-700 border-b-2 border-purple-500 pb-2">Top 5 Most Sold Products</h3>
        {topSoldProducts.length > 0 ? (
          <ul className="space-y-4">
            {topSoldProducts.map((product) => (
              <li
                key={product.product_id}
                className="bg-purple-100 p-4 rounded-lg shadow-md hover:bg-purple-200 transition-all duration-200"
              >
                <div className="text-lg font-medium">Product Name: {product.product_name}</div>
                <div className="text-sm text-gray-600">Sold Count: <span className="font-semibold">{product.sold_count}</span></div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No sold products found.</p>
        )}
      </div>
    </div>
  );
};

export default Trending;
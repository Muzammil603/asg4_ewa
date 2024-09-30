import React, { useEffect, useState } from 'react';
import axios from 'axios';

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
          axios.get('http://127.0.0.1:5001/api/trending/liked-products'),
          axios.get('http://127.0.0.1:5001/api/trending/zip-codes'),
          axios.get('http://127.0.0.1:5001/api/trending/sold-products')
        ]);

        setTopLikedProducts(likedProductsRes.data);
        setTopZipCodes(zipCodesRes.data);
        setTopSoldProducts(soldProductsRes.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching trending data:', error);
        setError('Failed to fetch trending data');
        setLoading(false);
      }
    };

    fetchTrendingData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="container mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-3xl font-bold mb-6 text-center">Trending</h2>
      
      {/* Top 5 Most Liked Products */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">Top 5 Most Liked Products</h3>
        <ul>
          {topLikedProducts.length > 0 ? (
            topLikedProducts.map((product, index) => (
              <li key={index}>
                Product Name: {product.ProductModelName}, Rating: {product.ReviewRating}
              </li>
            ))
          ) : (
            <p>No liked products found.</p>
          )}
        </ul>
      </div>
      
      {/* Top 5 Zip Codes with Most Sales */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">Top 5 Zip Codes with Most Sales</h3>
        <ul>
          {topZipCodes.length > 0 ? (
            topZipCodes.map((zip, index) => (
              <li key={index}>
                Zip Code: {zip.zip_code}, Sales Count: {zip.sales_count}
              </li>
            ))
          ) : (
            <p>No zip code data found.</p>
          )}
        </ul>
      </div>

      {/* Top 5 Most Sold Products */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Top 5 Most Sold Products</h3>
        <ul>
          {topSoldProducts.length > 0 ? (
            topSoldProducts.map((product, index) => (
              <li key={index}>
                Product Name: {product.product_name}, Sold Count: {product.sold_count}
              </li>
            ))
          ) : (
            <p>No sold products found.</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Trending;

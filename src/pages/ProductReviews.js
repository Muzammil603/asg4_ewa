import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaStar } from 'react-icons/fa';

const ProductReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState({});
  const [ratingFilter, setRatingFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('Newest');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [reviewsResponse, productsResponse] = await Promise.all([
          axios.get('http://127.0.0.1:5001/api/product-reviews'),
          axios.get('http://127.0.0.1:5001/api/products'),
        ]);

        setReviews(reviewsResponse.data);
        const productsMap = productsResponse.data.reduce((acc, product) => {
          acc[product.name] = product;
          return acc;
        }, {});
        setProducts(productsMap);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter reviews based on the selected rating
  const filteredReviews = ratingFilter === 'All'
    ? reviews
    : reviews.filter(review => review.ReviewRating.toString() === ratingFilter);

    const sortedReviews = [...filteredReviews].sort((a, b) => {
      if (sortOrder === 'Highest') return b.ReviewRating - a.ReviewRating;
      if (sortOrder === 'Lowest') return a.ReviewRating - b.ReviewRating;
      if (sortOrder === 'Newest') return new Date(b.ReviewDate) - new Date(a.ReviewDate);
      if (sortOrder === 'Oldest') return new Date(a.ReviewDate) - new Date(b.ReviewDate);
      return 0; // Default return value to handle all cases
    });

  // Render stars for rating
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FaStar key={index} className={index < rating ? 'text-yellow-500' : 'text-gray-300'} />
    ));
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-4xl font-bold mb-8 text-center">Product Reviews</h2>

      {/* Rating and Sort Filters */}
      <div className="flex justify-between mb-6">
        <div className="flex items-center">
          <label className="mr-4 text-lg font-medium">Filter by Rating:</label>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="p-2 border rounded-lg bg-white shadow-sm focus:outline-none"
          >
            <option value="All">All</option>
            <option value="1">1 Star</option>
            <option value="2">2 Stars</option>
            <option value="3">3 Stars</option>
            <option value="4">4 Stars</option>
            <option value="5">5 Stars</option>
          </select>
        </div>

        <div className="flex items-center">
          <label className="mr-4 text-lg font-medium">Sort by:</label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="p-2 border rounded-lg bg-white shadow-sm focus:outline-none"
          >
            <option value="Newest">Newest</option>
            <option value="Oldest">Oldest</option>
            <option value="Highest">Highest Rating</option>
            <option value="Lowest">Lowest Rating</option>
          </select>
        </div>
      </div>

      {/* Loader */}
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <p className="text-xl text-gray-500">Loading reviews...</p>
        </div>
      ) : sortedReviews.length === 0 ? (
        <p className="text-center text-gray-500">No reviews found.</p>
      ) : (
        sortedReviews.map((review, index) => (
          <div
            key={index}
            className="mb-6 p-6 border rounded-lg bg-gray-50 shadow-sm hover:bg-gray-100 transition duration-300"
          >
            <h3 className="text-2xl font-semibold mb-2 text-blue-600">{review.ProductModelName}</h3>
            <p className="text-gray-700"><span className="font-semibold">Category:</span> {review.ProductCategoryName}</p>
            <p className="text-gray-700"><span className="font-semibold">Price:</span> ${products[review.ProductModelName]?.price || 'N/A'}</p>
            <p className="text-gray-700"><span className="font-semibold">Store:</span> {review.StoreID}, {review.StoreCity}, {review.StoreState}, Zip: {review.StoreZip}</p>
            <p className="text-gray-700"><span className="font-semibold">On Sale:</span> {review.ProductOnSale}</p>
            <p className="text-gray-700"><span className="font-semibold">Manufacturer:</span> {review.ManufacturerName}</p>
            <p className="text-gray-700"><span className="font-semibold">Rebate:</span> {review.ManufacturerRebate}</p>

            {/* Review Details */}
            <div className="mt-4 p-4 bg-white rounded-lg shadow-sm">
              <h4 className="text-xl font-semibold mb-3">Review Details</h4>
              <div className="flex items-center mb-2">
                <span className="font-semibold text-gray-700">Rating:</span>
                <div className="ml-2 flex">{renderStars(review.ReviewRating)}</div>
                <span className="ml-2 text-gray-600">({review.ReviewRating}/5)</span>
              </div>
              <p className="text-gray-700"><span className="font-semibold">Reviewer:</span> {review.UserID}</p>
              <p className="text-gray-700"><span className="font-semibold">Age:</span> {review.UserAge}</p>
              <p className="text-gray-700"><span className="font-semibold">Gender:</span> {review.UserGender}</p>
              <p className="text-gray-700"><span className="font-semibold">Occupation:</span> {review.UserOccupation}</p>
              <p className="text-gray-700"><span className="font-semibold">Date:</span> {new Date(review.ReviewDate).toLocaleDateString()}</p>
              <p className="text-gray-700 mt-3"><span className="font-semibold">Review:</span> {review.ReviewText}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ProductReviews;

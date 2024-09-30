import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProductReviews = () => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5001/api/product-reviews');
        setReviews(response.data);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };

    fetchReviews();
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-3xl font-bold mb-6 text-center">Product Reviews</h2>
      {reviews.length === 0 ? (
        <p className="text-center text-gray-500">No reviews found.</p>
      ) : (
        reviews.map((review, index) => (
          <div key={index} className="mb-6 p-6 border rounded-lg bg-gray-50">
            <h3 className="text-2xl font-semibold mb-2">{review.ProductModelName}</h3>
            <p className="text-sm text-gray-700">Category: <span className="font-medium">{review.ProductCategoryName}</span></p>
            <p className="text-sm text-gray-700">Store: <span className="font-medium">{review.StoreID}</span>, {review.StoreCity}, {review.StoreState}, Zip: {review.StoreZip}</p>
            <p className="text-sm text-gray-700">Product On Sale: <span className="font-medium">{review.ProductOnSale}</span></p>
            <p className="text-sm text-gray-700">Manufacturer: <span className="font-medium">{review.ManufacturerName}</span></p>
            <p className="text-sm text-gray-700">Manufacturer Rebate: <span className="font-medium">{review.ManufacturerRebate}</span></p>
            <div className="mt-4">
              <p className="text-lg font-semibold">Review Details</p>
              <p className="text-sm text-gray-700">Reviewer: <span className="font-medium">{review.UserID}</span></p>
              <p className="text-sm text-gray-700">Age: <span className="font-medium">{review.UserAge}</span></p>
              <p className="text-sm text-gray-700">Gender: <span className="font-medium">{review.UserGender}</span></p>
              <p className="text-sm text-gray-700">Occupation: <span className="font-medium">{review.UserOccupation}</span></p>
              <p className="text-sm text-gray-700">Rating: <span className="font-medium">{review.ReviewRating}</span>/5</p>
              <p className="text-sm text-gray-700">Date: <span className="font-medium">{new Date(review.ReviewDate).toLocaleString()}</span></p>
              <p className="text-sm text-gray-700 mt-2">Review: <span className="font-medium">{review.ReviewText}</span></p>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ProductReviews;
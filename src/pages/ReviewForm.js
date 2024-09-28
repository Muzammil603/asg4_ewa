import React, { useState } from 'react';

const ReviewForm = () => {
    const [reviewData, setReviewData] = useState({
        productModelName: '',
        productCategory: '',
        productPrice: '',
        storeID: '',
        storeZip: '',
        storeCity: '',
        storeState: '',
        productOnSale: false,
        manufacturerName: '',
        manufacturerRebate: false,
        userID: '',
        userAge: '',
        userGender: '',
        userOccupation: '',
        reviewRating: '',
        reviewDate: '',
        reviewText: ''
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setReviewData({
            ...reviewData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = () => {
        fetch('/submit-review', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reviewData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('Review submitted successfully!');
            } else {
                alert('Failed to submit the review.');
            }
        });
    };

    return (
        <div className="review-form">
            <h2>Submit Product Review</h2>
            <form>
                <div>
                    <label>Product Model Name: </label>
                    <input type="text" name="productModelName" value={reviewData.productModelName} onChange={handleChange} />
                </div>
                <div>
                    <label>Product Category: </label>
                    <input type="text" name="productCategory" value={reviewData.productCategory} onChange={handleChange} />
                </div>
                <div>
                    <label>Product Price: </label>
                    <input type="text" name="productPrice" value={reviewData.productPrice} onChange={handleChange} />
                </div>
                {/* More form fields based on the review data requirements */}
                <div>
                    <label>Review Rating: </label>
                    <input type="number" name="reviewRating" value={reviewData.reviewRating} onChange={handleChange} />
                </div>
                <div>
                    <label>Review Text: </label>
                    <textarea name="reviewText" value={reviewData.reviewText} onChange={handleChange}></textarea>
                </div>
                <button type="button" onClick={handleSubmit}>Submit Review</button>
            </form>
        </div>
    );
};

export default ReviewForm;

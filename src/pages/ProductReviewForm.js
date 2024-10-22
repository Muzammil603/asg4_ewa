import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from './config';

const ProductReviewForm = () => {
  const [formData, setFormData] = useState({
    ProductModelName: '',
    ProductCategoryName: '',
    ProductPrice: '',
    StoreID: '',
    StoreZip: '',
    StoreCity: '',
    StoreState: '',
    ProductOnSale: '',
    ManufacturerName: '',
    ManufacturerRebate: '',
    UserID: '',
    UserAge: '',
    UserGender: '',
    UserOccupation: '',
    ReviewRating: '',
    ReviewDate: '',
    ReviewText: '',
    DeliveryType: 'pickup'
  });

  const [products, setProducts] = useState([]);
  const [storeLocations, setStoreLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsResponse, storeLocationsResponse] = await Promise.all([
          axios.get(`${BASE_URL}/products`, {
            headers: {
              'ngrok-skip-browser-warning': 'true'
            }
          }),
          axios.get(`${BASE_URL}/store-locations`, {
            headers: {
              'ngrok-skip-browser-warning': 'true'
            }
          })
        ]);
        setProducts(productsResponse.data);
        
        setStoreLocations(storeLocationsResponse.data);
      } catch (err) {
        setError('Failed to fetch data. Please try again later.');
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => {
      const newData = { ...prevData, [name]: value };

      if (name === 'ProductModelName') {
        const selectedProduct = products.find(p => p.name === value);
        if (selectedProduct) {
          newData.ProductCategoryName = selectedProduct.category_name || selectedProduct.name;
          newData.ProductPrice = selectedProduct.price;
          newData.ManufacturerName = selectedProduct.manufacturer || '';
        }
      }

      if (name === 'DeliveryType') {
        newData.StoreID = '';
        newData.StoreZip = '';
        newData.StoreCity = '';
        newData.StoreState = '';
      }

      if (name === 'StoreID' && value) {
        const selectedStore = storeLocations.find(s => s.id === parseInt(value));
        if (selectedStore) {
          newData.StoreZip = selectedStore.zip_code;
          newData.StoreCity = selectedStore.city;
          newData.StoreState = selectedStore.state;
        }
      }
      console.log(products);
      return newData;
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BASE_URL}/product-review`, formData, {
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
      alert('Review submitted successfully!');
      setFormData({
        ProductModelName: '',
        ProductCategoryName: '',
        ProductPrice: '',
        StoreID: '',
        StoreZip: '',
        StoreCity: '',
        StoreState: '',
        ProductOnSale: '',
        ManufacturerName: '',
        ManufacturerRebate: '',
        UserID: '',
        UserAge: '',
        UserGender: '',
        UserOccupation: '',
        ReviewRating: '',
        ReviewDate: '',
        ReviewText: '',
        DeliveryType: 'pickup'
      });
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    }
  };

  if (isLoading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-6 text-center">Submit Product Review</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Product Model Name:</label>
          <select
            name="ProductModelName"
            value={formData.ProductModelName}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          >
            <option value="">Select a product</option>
            {products.map((product) => (
              <option key={product.id} value={product.name}>{product.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1">Product Category:</label>
          <input
            type="text"
            name="ProductCategoryName"
            value={formData.ProductCategoryName}
            readOnly
            className="w-full p-2 border rounded bg-gray-100"
          />
        </div>
        <div>
          <label className="block mb-1">Product Price:</label>
          <input
            type="text"
            name="ProductPrice"
            value={formData.ProductPrice}
            readOnly
            className="w-full p-2 border rounded bg-gray-100"
          />
        </div>
        <div>
          <label className="block mb-1">Delivery Type:</label>
          <select
            name="DeliveryType"
            value={formData.DeliveryType}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          >
            <option value="pickup">Pickup</option>
            <option value="delivery">Delivery</option>
          </select>
        </div>
        
        {formData.DeliveryType === 'pickup' ? (
          <>
            <div>
              <label className="block mb-1">Store Location:</label>
              <select
                name="StoreID"
                value={formData.StoreID}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              >
                <option value="">Select a store</option>
                {storeLocations.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.street}, {store.city}, {store.state}
                  </option>
                ))}
              </select>
            </div>
            {formData.StoreID && (
              <>
                <div>
                  <label className="block mb-1">Store Zip:</label>
                  <input
                    type="text"
                    name="StoreZip"
                    value={formData.StoreZip}
                    readOnly
                    className="w-full p-2 border rounded bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block mb-1">Store City:</label>
                  <input
                    type="text"
                    name="StoreCity"
                    value={formData.StoreCity}
                    readOnly
                    className="w-full p-2 border rounded bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block mb-1">Store State:</label>
                  <input
                    type="text"
                    name="StoreState"
                    value={formData.StoreState}
                    readOnly
                    className="w-full p-2 border rounded bg-gray-100"
                  />
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <div>
              <label className="block mb-1">Store Zip:</label>
              <input
                type="text"
                name="StoreZip"
                value={formData.StoreZip}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-1">Store City:</label>
              <input
                type="text"
                name="StoreCity"
                value={formData.StoreCity}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-1">Store State:</label>
              <input
                type="text"
                name="StoreState"
                value={formData.StoreState}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              />
            </div>
          </>
        )}
        
        <div>
          <label className="block mb-1">Product On Sale:</label>
          <select
            name="ProductOnSale"
            value={formData.ProductOnSale}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          >
            <option value="">Select</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>
        <div>
          <label className="block mb-1">Manufacturer Name:</label>
          <input
            type="text"
            name="ManufacturerName"
            value={formData.ManufacturerName}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Manufacturer Rebate:</label>
          <select
            name="ManufacturerRebate"
            value={formData.ManufacturerRebate}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          >
            <option value="">Select</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>
        <div>
          <label className="block mb-1">User ID:</label>
          <input
            type="text"
            name="UserID"
            value={formData.UserID}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1">User Age:</label>
          <input
            type="number"
            name="UserAge"
            value={formData.UserAge}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1">User Gender:</label>
          <select
            name="UserGender"
            value={formData.UserGender}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          >
            <option value="">Select</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="block mb-1">User Occupation:</label>
          <input
            type="text"
            name="UserOccupation"
            value={formData.UserOccupation}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Review Rating:</label>
          <select
            name="ReviewRating"
            value={formData.ReviewRating}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          >
            <option value="">Select</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
        </div>
        <div>
          <label className="block mb-1">Review Date:</label>
          <input
            type="date"
            name="ReviewDate"
            value={formData.ReviewDate}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Review Text:</label>
          <textarea
            name="ReviewText"
            value={formData.ReviewText}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
            rows="4"
          ></textarea>
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          Submit Review
        </button>
      </form>
    </div>
  );
};

export default ProductReviewForm;
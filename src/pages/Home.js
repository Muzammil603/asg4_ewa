import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white bg-cover bg-center" style={{ backgroundImage: "url('https://example.com/your-background-image.jpg')" }}>
      <div className="bg-black bg-opacity-60 p-10 rounded-lg text-center max-w-2xl">
        <h1 className="text-5xl font-bold mb-4">Welcome to SmartHomes</h1>
        <p className="text-xl mb-6">
          At SmartHomes, we are dedicated to bringing you the latest in smart home technology. Our products are designed to make your life easier, safer, and more convenient. From smart doorbells to intelligent thermostats, we have everything you need to transform your home into a smart home.
        </p>
        <p className="text-lg mb-6">
          Visit us at our headquarters:
          <br />
          1234 Smart Street, Suite 100
          <br />
          Chicago, IL 60601
        </p>
        <div className="flex flex-col items-center mb-6">
          <img src="https://example.com/robot-image.jpg" alt="Robot" className="w-32 h-32 mb-4 rounded-full shadow-lg" />
          <p className="text-lg italic">"Automation made easier with SmartHomes"</p>
        </div>
        <Link
          to="/products"
          className="mt-6 inline-block bg-gradient-to-r from-teal-400 to-blue-500 text-white px-6 py-3 text-lg font-semibold rounded-lg shadow-lg hover:from-teal-500 hover:to-blue-600 transition duration-300"
        >
          Start Shopping
        </Link>
      </div>
    </div>
  );
}

export default Home;
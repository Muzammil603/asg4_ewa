import React from 'react';
import { Link } from 'react-router-dom';
import { FaFire } from 'react-icons/fa'; // Import an icon for trending

function Home() {
  return (
    <div
      className="flex items-center justify-center min-h-screen bg-gray-900 text-white bg-cover bg-center relative"
      style={{ backgroundImage: "url('https://example.com/your-background-image.jpg')" }}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black opacity-50 blur-sm"></div>
      
      <div className="relative z-10 bg-black bg-opacity-70 p-10 rounded-3xl text-center max-w-4xl shadow-2xl transform hover:scale-105 transition duration-500 ease-in-out border border-gradient-to-r from-teal-500 to-blue-500">
        {/* Main Heading */}
        <h1 className="text-6xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-blue-400 animate-pulse">
          Welcome to SmartHomes
        </h1>
        
        {/* Description */}
        <p className="text-xl mb-8">
          Experience the future of living with SmartHomes. From intelligent thermostats to smart doorbells, our products bring convenience, security, and comfort to your life.
        </p>
        
        {/* Address */}
        <p className="text-lg mb-10">
          Visit us at:
          <br />
          <span className="text-2xl font-semibold">1234 Smart Street, Suite 100</span>
          <br />
          Chicago, IL 60601
        </p>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-8">
          <Link
            to="/products"
            className="bg-gradient-to-r from-teal-400 to-blue-500 text-white px-8 py-3 text-lg font-semibold rounded-full shadow-lg hover:from-teal-500 hover:to-blue-600 transform hover:scale-110 transition duration-300 ease-in-out"
          >
            Start Shopping
          </Link>
          <Link
            to="/trending"
            className="flex items-center justify-center bg-gradient-to-r from-pink-500 to-red-500 text-white px-8 py-3 text-lg font-semibold rounded-full shadow-lg hover:from-pink-600 hover:to-red-600 transform hover:scale-110 transition duration-300 ease-in-out"
          >
            <FaFire className="mr-2 animate-bounce" /> Trending Now
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;

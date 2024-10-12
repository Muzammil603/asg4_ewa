// src/pages/LogoutConfirmation.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

function LogoutConfirmation() {
  const navigate = useNavigate();
  console.log('LogoutConfirmation.js: LogoutConfirmation()');
  const handleContinue = () => {
    navigate('/auth');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white border border-gray-200 rounded-lg shadow-md p-8 text-center">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Successfully Logged Out</h2>
        <p className="text-gray-600 mb-6">Thank you for using SmartHomes. We hope to see you again soon!</p>
        <button 
          onClick={handleContinue} 
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

export default LogoutConfirmation;

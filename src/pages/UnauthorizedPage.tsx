
import React from 'react';
import { Navigate } from 'react-router-dom';

const UnauthorizedPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <h1 className="text-3xl font-bold mb-4">Unauthorized Access</h1>
      <p className="text-lg mb-6">You don't have permission to access this page.</p>
      <div className="flex gap-4">
        <button 
          onClick={() => window.history.back()} 
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Go Back
        </button>
        <a href="/" className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90">
          Go Home
        </a>
      </div>
    </div>
  );
};

export default UnauthorizedPage;

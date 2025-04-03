
import React from 'react';

interface AuthContainerProps {
  children: React.ReactNode;
}

export const AuthContainer = ({ children }: AuthContainerProps) => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-0">
      <div className="max-w-md w-full mx-auto py-4 sm:py-6 px-4 sm:px-0">
        {children}
      </div>
    </div>
  );
};


import React from 'react';

interface AuthContainerProps {
  children: React.ReactNode;
}

export const AuthContainer = ({ children }: AuthContainerProps) => {
  return (
    <div className="min-h-screen bg-white flex flex-col pt-20 px-4">
      <div className="max-w-md w-full mx-auto py-4 px-4 sm:px-0">
        {children}
      </div>
    </div>
  );
};

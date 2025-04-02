
import React from 'react';

interface AuthContainerProps {
  children: React.ReactNode;
}

export const AuthContainer = ({ children }: AuthContainerProps) => {
  return (
    <div className="min-h-screen bg-white flex items-start justify-center px-4 pt-8">
      <div className="max-w-md w-full mx-auto">
        {children}
      </div>
    </div>
  );
};

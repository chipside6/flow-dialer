
import React from 'react';

interface AuthContainerProps {
  children: React.ReactNode;
}

export const AuthContainer = ({ children }: AuthContainerProps) => {
  return (
    <div className="min-h-screen bg-white flex items-start justify-center px-4 pt-16 pb-8 sm:pt-24 sm:pb-16">
      <div className="max-w-md w-full mx-auto py-6 sm:py-8 px-4 sm:px-0">
        {children}
      </div>
    </div>
  );
};

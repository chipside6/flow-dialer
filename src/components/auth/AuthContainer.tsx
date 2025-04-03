
import React from 'react';

interface AuthContainerProps {
  children: React.ReactNode;
}

export const AuthContainer = ({ children }: AuthContainerProps) => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-8 px-4">
      <div className="max-w-md w-full mx-auto">
        {children}
      </div>
    </div>
  );
};


import React from 'react';

interface AuthContainerProps {
  children: React.ReactNode;
}

export const AuthContainer = ({ children }: AuthContainerProps) => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-start justify-start pt-12 px-4 pb-8 sm:pt-16 sm:pb-10">
      <div className="max-w-md w-full mx-auto">
        {children}
      </div>
    </div>
  );
};

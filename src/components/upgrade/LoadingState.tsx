
import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message }) => {
  return (
    <div className="flex flex-col justify-center items-center p-8 w-full min-h-[200px]">
      <div className="text-center p-6 max-w-md">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-base text-gray-600">{message}</p>
      </div>
    </div>
  );
};

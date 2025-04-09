
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AuthHeaderProps {
  title: string;
  emoji?: string;
}

export const AuthHeader = ({ title, emoji }: AuthHeaderProps) => {
  const navigate = useNavigate();
  
  return (
    <>
      <div className="absolute top-4 left-4">
        <button 
          onClick={() => navigate('/')} 
          className="p-2 rounded-full hover:bg-gray-100 transition-colors flex items-center gap-1 text-gray-700"
          aria-label="Back to Home"
        >
          <ChevronLeft className="h-6 w-6" />
          <span className="text-sm font-medium">Back</span>
        </button>
      </div>
      
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
          {emoji && <span className="text-2xl">{emoji}</span>} {title}
        </h1>
      </div>
    </>
  );
};

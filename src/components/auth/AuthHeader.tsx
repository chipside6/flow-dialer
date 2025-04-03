
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
      <div className="relative w-full mb-8">
        <button 
          onClick={() => navigate('/')} 
          className="absolute left-0 top-0 p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft className="h-6 w-6 text-gray-700" />
        </button>
        
        <h1 className="text-3xl font-bold text-gray-800 text-center flex items-center justify-center gap-2 pt-12">
          {emoji && <span className="text-2xl">{emoji}</span>} {title}
        </h1>
      </div>
    </>
  );
};

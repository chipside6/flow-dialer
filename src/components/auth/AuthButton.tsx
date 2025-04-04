
import { Loader2 } from 'lucide-react';

interface AuthButtonProps {
  isLoading: boolean;
  loadingText?: string;
  buttonText: string;
  disabled?: boolean;
}

export const AuthButton = ({ 
  isLoading, 
  loadingText = "Signing in...", 
  buttonText,
  disabled = false
}: AuthButtonProps) => {
  return (
    <button
      type="submit"
      disabled={isLoading || disabled}
      className="w-full h-12 py-3 px-4 bg-gray-200 hover:bg-gray-300 rounded-full text-gray-800 font-medium transition-colors"
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          {loadingText}
        </span>
      ) : (
        <span>{buttonText}</span>
      )}
    </button>
  );
};

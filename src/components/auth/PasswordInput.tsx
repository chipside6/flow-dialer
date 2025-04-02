
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
}

export const PasswordInput = ({ 
  value, 
  onChange, 
  placeholder = "Enter your password",
  required = true,
  minLength
}: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="relative">
      <input
        id="password"
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        required={required}
        minLength={minLength}
        className="w-full h-12 px-3 bg-transparent border-0 border-b-2 border-gray-300 focus:border-primary focus:ring-0 text-gray-700 text-base placeholder:text-gray-500"
        placeholder={placeholder}
      />
      <button 
        type="button"
        onClick={togglePasswordVisibility}
        className="absolute right-2 bottom-2 text-primary focus:outline-none"
      >
        {showPassword ? (
          <EyeOff className="h-5 w-5" />
        ) : (
          <Eye className="h-5 w-5" />
        )}
      </button>
    </div>
  );
};

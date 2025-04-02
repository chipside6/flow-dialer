
import { Link } from 'react-router-dom';

interface AuthFooterProps {
  type: 'login' | 'signup';
}

export const AuthFooter = ({ type }: AuthFooterProps) => {
  return (
    <div className="mt-8 text-center">
      {type === 'login' ? (
        <div className="space-y-2">
          <div>
            <Link to="/forgot-password" className="text-sm text-primary hover:underline">
              Forgot your password?
            </Link>
          </div>
          <div>
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary font-medium hover:underline">
              Sign up
            </Link>
          </div>
        </div>
      ) : (
        <div>
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Log in
          </Link>
        </div>
      )}
    </div>
  );
};

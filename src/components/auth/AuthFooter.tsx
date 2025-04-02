
import { Link } from 'react-router-dom';

interface AuthFooterProps {
  type: 'login' | 'signup';
}

export const AuthFooter = ({ type }: AuthFooterProps) => {
  return (
    <>
      {type === 'login' && (
        <>
          <div className="mt-6 text-center">
            <Link to="/forgot-password" className="text-primary hover:underline text-sm">
              Forgot Password?
            </Link>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary font-medium hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </>
      )}

      {type === 'signup' && (
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      )}
    </>
  );
};

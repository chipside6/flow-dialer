
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ShieldAlert } from 'lucide-react';

interface AuthAlertProps {
  type: 'error' | 'admin-redirect';
  message?: string;
}

export const AuthAlert = ({ type, message }: AuthAlertProps) => {
  if (type === 'error' && !message) return null;
  
  return (
    <>
      {type === 'admin-redirect' && (
        <Alert className="mb-6 bg-amber-50 border-amber-200 text-left">
          <ShieldAlert className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            This area requires administrator privileges
          </AlertDescription>
        </Alert>
      )}
      
      {type === 'error' && message && (
        <Alert variant="destructive" className="mb-6 animate-fade-in text-left">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
    </>
  );
};

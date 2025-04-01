
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";

// Add more detailed logging
console.log('🔍 Index page is being imported - simplified');

const Index = () => {
  // Add pre-render logging
  console.log('🔍 Index page is rendering - simplified');
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log('🔍 Index page useEffect running');
    
    // Log any environment variables (without exposing sensitive values)
    console.log('🔍 Environment variables available:', {
      VITE_SUPABASE_URL: !!import.meta.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
    });
  }, []);
  
  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-3xl font-bold mb-4">Welcome to Flow Dialer</h1>
      <p className="text-lg mb-4">This is a simplified version of the home page for debugging.</p>
      
      <div className="mb-8">
        <Button 
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => navigate('/diagnostic')}
        >
          <AlertCircle size={16} />
          View Diagnostics
        </Button>
      </div>
      
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <h2 className="text-xl font-semibold text-yellow-800 mb-2">Development Notes</h2>
        <p className="text-yellow-700">
          If you're seeing this page but having issues with database functionality, 
          please make sure your Supabase environment variables are set correctly.
        </p>
        <ul className="list-disc list-inside mt-2 text-yellow-700">
          <li>VITE_SUPABASE_URL</li>
          <li>VITE_SUPABASE_ANON_KEY</li>
        </ul>
      </div>
    </div>
  );
};

// Add post-definition logging
console.log('🔍 Index page has been defined - simplified');

export default Index;


import React, { useEffect } from "react";

// Add more detailed logging
console.log('🔍 Index page is being imported - simplified');

const Index = () => {
  // Add pre-render logging
  console.log('🔍 Index page is rendering - simplified');
  
  useEffect(() => {
    console.log('🔍 Index page useEffect running');
  }, []);
  
  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-3xl font-bold mb-4">Welcome to Flow Dialer</h1>
      <p className="text-lg">This is a simplified version of the home page for debugging.</p>
    </div>
  );
};

// Add post-definition logging
console.log('🔍 Index page has been defined - simplified');

export default Index;

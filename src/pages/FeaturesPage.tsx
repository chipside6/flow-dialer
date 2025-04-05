
import React from 'react';
import Features from '../pages/Features';

const FeaturesPage = () => {
  // Console log to debug
  console.log("FeaturesPage rendered");
  
  return (
    <div className="public-page bg-background min-h-screen">
      <Features />
    </div>
  );
};

export default FeaturesPage;

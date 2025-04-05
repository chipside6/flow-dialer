
import React, { useEffect } from 'react';
import Features from '../pages/Features';

const FeaturesPage = () => {
  // Force header visibility when component mounts
  useEffect(() => {
    console.log("FeaturesPage mounted - ensuring header is visible");
    const forceHeaderVisibility = () => {
      const headers = document.querySelectorAll('.sip-header, .sip-header-container');
      headers.forEach(header => {
        if (header instanceof HTMLElement) {
          header.style.display = 'block';
          header.style.visibility = 'visible';
          header.style.opacity = '1';
        }
      });
    };
    
    forceHeaderVisibility();
    const timer = setTimeout(forceHeaderVisibility, 100);
    return () => clearTimeout(timer);
  }, []);
  
  // Console log to debug
  console.log("FeaturesPage rendered");
  
  return (
    <div className="public-page bg-background min-h-screen">
      <Features />
    </div>
  );
};

export default FeaturesPage;

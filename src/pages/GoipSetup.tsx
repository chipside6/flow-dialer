
import React from 'react';
import GoipDevicePage from './GoipDevicePage';
import ProtectedRoute from '@/components/ProtectedRoute';

// This component now simply wraps our main GoipDevicePage with protection
const GoipSetup = () => {
  return (
    <ProtectedRoute>
      <GoipDevicePage />
    </ProtectedRoute>
  );
};

export default GoipSetup;


import React from 'react';
import TransferNumbers from './TransferNumbers';
import ProtectedRoute from '@/components/ProtectedRoute';

const TransfersPage = () => {
  return (
    <ProtectedRoute>
      <TransferNumbers />
    </ProtectedRoute>
  );
};

export default TransfersPage;

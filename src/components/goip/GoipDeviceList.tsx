
import React from 'react';
import { DeviceListContent } from './list/DeviceListContent';

interface GoipDeviceListProps {
  onRefreshNeeded?: () => void;
}

export const GoipDeviceList: React.FC<GoipDeviceListProps> = ({ onRefreshNeeded }) => {
  return <DeviceListContent onRefreshNeeded={onRefreshNeeded} />;
};

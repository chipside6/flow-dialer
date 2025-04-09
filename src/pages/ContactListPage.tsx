
import React from 'react';
import { useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const ContactListPage = () => {
  const { listId } = useParams();
  
  return (
    <DashboardLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Contact List</h1>
        <p>Viewing contact list ID: {listId}</p>
      </div>
    </DashboardLayout>
  );
};

export default ContactListPage;


import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const HomePage = () => {
  return (
    <DashboardLayout>
      <div className="container py-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-6">Welcome to the Voice App</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Your complete solution for voice campaigns and call management
          </p>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Link to="/profile">
              <Button variant="outline" className="w-full">Profile Settings</Button>
            </Link>
            <Link to="/admin">
              <Button variant="default" className="w-full">Admin Panel</Button>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HomePage;

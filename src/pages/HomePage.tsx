
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sidebar } from '@/components/navigation/Sidebar';
import AsteriskConnectionTestPage from './AsteriskConnectionTestPage';

const HomePage: React.FC = () => {
  return (
    <div className="container mx-auto py-10 grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
      <Sidebar className="hidden md:block" />
      <main>
        <h1 className="text-3xl font-bold mb-6">Asterisk Connection Dashboard</h1>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Welcome to the Asterisk Connection Tool</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Use this dashboard to test and monitor your connection to your Asterisk server.
            </p>
            <p>
              Click on "Asterisk Connection" in the sidebar to access the connection test tool.
            </p>
          </CardContent>
        </Card>
        
        {/* Include the AsteriskConnectionTest component directly on homepage for easy testing */}
        <AsteriskConnectionTestPage />
      </main>
    </div>
  );
};

export default HomePage;


import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sidebar } from '@/components/navigation/Sidebar';

const SettingsPage: React.FC = () => {
  return (
    <div className="container mx-auto py-10 grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
      <Sidebar className="hidden md:block" />
      <main>
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        <Card>
          <CardHeader>
            <CardTitle>Application Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Settings page content will go here.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SettingsPage;

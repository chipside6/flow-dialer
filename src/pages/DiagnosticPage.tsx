
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sidebar } from '@/components/navigation/Sidebar';

const DiagnosticPage: React.FC = () => {
  return (
    <div className="container mx-auto py-10 grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
      <Sidebar className="hidden md:block" />
      <main>
        <h1 className="text-3xl font-bold mb-6">Diagnostic Tools</h1>
        <Card>
          <CardHeader>
            <CardTitle>System Diagnostics</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Visit the Asterisk Connection Test page to test your connection to the Asterisk server.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default DiagnosticPage;

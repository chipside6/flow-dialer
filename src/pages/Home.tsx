
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">AutoDialer Pro</h1>
          <div className="flex gap-4">
            {user ? (
              <Button asChild>
                <Link to="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Automate your outbound calls with ease
            </h2>
            <p className="text-xl text-muted-foreground">
              Upload your lead list, set up your campaign, and let our advanced system handle the rest.
            </p>
            <div className="flex gap-4">
              {user ? (
                <Button size="lg" asChild>
                  <Link to="/campaigns">View Campaigns</Link>
                </Button>
              ) : (
                <Button size="lg" asChild>
                  <Link to="/signup">Get Started</Link>
                </Button>
              )}
            </div>
          </div>
          <div className="rounded-lg overflow-hidden shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1556745753-b2904692b3cd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2073&q=80" 
              alt="Call center" 
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Lead Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Upload and manage your contact lists easily. Our system supports CSV imports and provides validation.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Campaign Automation</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Create campaigns with custom greetings, transfer options, and scheduling. Monitor performance in real-time.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Analytics & Reporting</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Track call outcomes, listen to recordings, and optimize your campaigns with detailed analytics.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border/40 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground">© 2025 AutoDialer Pro. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <Link to="/login" className="text-muted-foreground hover:text-foreground">Login</Link>
              <Link to="/signup" className="text-muted-foreground hover:text-foreground">Sign Up</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;

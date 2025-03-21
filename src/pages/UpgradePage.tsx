
import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UpgradePlanSection } from '@/components/billing/UpgradePlanSection';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function UpgradePage() {
  const { profile } = useAuth();
  
  return (
    <DashboardLayout>
      <div className="container max-w-5xl py-8 space-y-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="h-8 w-8"
          >
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to Dashboard</span>
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Upgrade Your Account</h1>
        </div>
        
        <div className="space-y-6">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Current Plan: {profile?.subscription_plan || 'Free'}</h2>
            <p className="text-muted-foreground mb-6">
              Upgrade to our Lifetime plan to unlock all features and benefits with no recurring costs.
            </p>
            
            <UpgradePlanSection />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

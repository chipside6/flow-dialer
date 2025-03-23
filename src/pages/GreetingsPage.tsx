
import React from 'react';
import { Navbar } from "@/components/Navbar";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Loader2 } from "lucide-react";
import GreetingFiles from './GreetingFiles';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const GreetingsFallback = () => (
  <div className="w-full h-96 flex items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
    <span className="text-lg">Loading greeting files...</span>
  </div>
);

const ErrorFallback = ({ error }: { error: Error }) => (
  <div className="w-full h-96 flex flex-col items-center justify-center">
    <div className="bg-destructive text-destructive-foreground px-4 py-2 rounded-md mb-4">
      <h3 className="text-lg font-medium">Something went wrong</h3>
      <p>{error.message}</p>
    </div>
    <button 
      onClick={() => window.location.reload()}
      className="bg-primary text-primary-foreground px-4 py-2 rounded-md"
    >
      Reload Page
    </button>
  </div>
);

// Create a simple ErrorBoundary component if it doesn't exist
<lov-write file_path="src/components/ErrorBoundary.tsx">
import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: (error: Error) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error!);
      }
      return (
        <div className="p-4 bg-red-100 border border-red-300 rounded-md">
          <h2 className="text-lg font-semibold text-red-800">Something went wrong</h2>
          <p className="text-red-600">{this.state.error?.message}</p>
          <button
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={() => window.location.reload()}
          >
            Reload page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

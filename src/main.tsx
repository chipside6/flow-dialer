
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './App.css'
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/providers"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

console.log('🔍 main.tsx is initializing - checking execution');

// Look for the root element
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('🔍 CRITICAL ERROR: Root element not found in the document');
  // Create a root element if it doesn't exist
  const newRoot = document.createElement('div');
  newRoot.id = 'root';
  document.body.appendChild(newRoot);
  console.log('🔍 Created a new root element');
}

const queryClient = new QueryClient()

console.log('🔍 Query client created, rendering app');

// Try rendering a simple div first to see if React is working
try {
  // Get root element (or the one we just created)
  const rootEl = document.getElementById('root');
  
  // Render a very simple component first to test React
  console.log('🔍 Attempting to render the full application');
  
  ReactDOM.createRoot(rootEl!).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light" storageKey="flow-dialer-theme">
          <App />
          <Toaster />
          <SonnerToaster />
        </ThemeProvider>
      </QueryClientProvider>
    </React.StrictMode>,
  )
  console.log('🔍 React.createRoot called without errors');
} catch (error) {
  console.error('🔍 Error rendering app:', error);
  
  // Fallback - attempt to render error message directly to root element
  try {
    const rootEl = document.getElementById('root');
    if (rootEl) {
      rootEl.innerHTML = `
        <div style="padding: 20px; font-family: sans-serif;">
          <h1 style="color: red;">Error Rendering Application</h1>
          <p>There was an error rendering the application. Please check the console for details.</p>
          <pre style="background: #f1f1f1; padding: 10px; border-radius: 4px;">${error}</pre>
        </div>
      `;
      console.log('🔍 Rendered error message to DOM');
    }
  } catch (fallbackError) {
    console.error('🔍 Even the fallback rendering failed:', fallbackError);
  }
}

console.log('🔍 App rendered - end of main.tsx');

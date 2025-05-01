
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './App.css'
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/providers"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Create the query client outside the render function
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
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

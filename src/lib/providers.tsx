import * as React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '../components/ui/toaster'
import { Toaster as Sonner } from '../components/ui/sonner'

// Create a client
const queryClient = new QueryClient()

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster />
        <Sonner />
      </QueryClientProvider>
    </React.StrictMode>
  )
}

'use client';

import React, { ReactNode, ReactElement } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription, AlertIcon } from '@/components/ui/alert';
import { RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactElement;
  onError?: (error: Error, info: { componentStack: string }) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    // Log error to service
    console.error('Error caught by boundary:', error);
    this.props.onError?.(error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }

      return <DefaultErrorFallback error={this.state.error} reset={this.reset} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error;
  reset: () => void;
}

function DefaultErrorFallback({ error, reset }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <Alert variant="destructive">
          <AlertIcon variant="destructive" />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>
            {error.message || 'An unexpected error occurred'}
          </AlertDescription>
        </Alert>

        {process.env.NODE_ENV === 'development' && (
          <details className="bg-muted p-4 rounded-lg text-sm font-mono text-muted-foreground overflow-auto max-h-48">
            <summary className="cursor-pointer font-semibold mb-2">Error Details</summary>
            <pre className="whitespace-pre-wrap break-words">{error.stack}</pre>
          </details>
        )}

        <div className="flex gap-3">
          <Button onClick={reset} className="flex-1" variant="default">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Link href="/dashboard" className="flex-1">
            <Button variant="outline" className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Error boundary for page-level errors
 */
export function PageErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={(error, reset) => (
        <div className="space-y-6">
          <Alert variant="destructive">
            <AlertIcon variant="destructive" />
            <AlertTitle>Page Error</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
          <Button onClick={reset}>Reload Page</Button>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import Button from './ui/Button';
import { RefreshCcw } from 'lucide-react';

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Something went wrong</h2>
          <p className="mt-2 text-sm text-gray-600">{error.message}</p>
        </div>
        <div className="mt-4">
          <Button
            onClick={resetErrorBoundary}
            variant="primary"
            icon={<RefreshCcw size={18} />}
          >
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ReactErrorBoundary FallbackComponent={ErrorFallback}>
      {children}
    </ReactErrorBoundary>
  );
}
import { Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './ui/Button';

interface Props  { children: ReactNode; fallback?: ReactNode; }
interface State  { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info);
  }

  reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-danger-light flex items-center justify-center mb-4">
            <AlertTriangle size={24} strokeWidth={1.5} className="text-danger" />
          </div>
          <h2 className="font-display text-xl font-semibold text-neutral-900 mb-2">
            Something went wrong.
          </h2>
          <p className="text-sm text-neutral-500 mb-6 max-w-[280px]">
            An unexpected error occurred. Please refresh the page or try again.
          </p>
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
            <Button variant="ghost" size="sm" onClick={this.reset}>
              Try Again
            </Button>
          </div>
          {import.meta.env.DEV && this.state.error && (
            <pre className="mt-6 p-4 bg-neutral-100 rounded-lg text-xs text-left text-neutral-600 max-w-lg overflow-auto">
              {this.state.error.message}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

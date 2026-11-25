import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    let display = error.message || 'An unexpected error occurred.';
    try {
      const parsed = JSON.parse(error.message) as {
        error?: string;
        operationType?: string;
        path?: string;
      };
      if (parsed && parsed.error) {
        display = `${parsed.error}${parsed.path ? ` (${parsed.operationType} on ${parsed.path})` : ''}`;
      }
    } catch {
      // Keep plain error message
    }
    return { hasError: true, message: display };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Application ErrorBoundary caught:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#7A6047] px-6 text-center text-white">
          <div className="max-w-md space-y-5 border border-white/20 bg-[#251C14]/90 p-8 shadow-2xl">
            <p className="text-[11px] tracking-[0.25em] uppercase text-[#D8C7B4]">
              Studio Notice
            </p>
            <h1 className="font-serif text-2xl font-normal text-white">
              Something interrupted your session
            </h1>
            <p className="text-xs font-light leading-relaxed text-white/80">
              {this.state.message}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex min-h-10 items-center justify-center bg-[#F9F6F1] px-6 py-2.5 text-xs font-medium tracking-[0.18em] uppercase text-[#7A6047] transition-colors hover:bg-white cursor-pointer"
            >
              Reload Studio
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

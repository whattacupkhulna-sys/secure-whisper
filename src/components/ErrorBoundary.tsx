import { Component, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    // Log to console for debugging
    console.error("Unhandled error caught by ErrorBoundary:", error);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-xl w-full rounded-xl border border-border bg-muted p-6 shadow">
            <h1 className="text-lg font-semibold text-foreground">Something went wrong</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {this.state.error.message}
            </p>
            <pre className="mt-4 max-h-72 overflow-auto whitespace-pre-wrap text-xs text-muted-foreground">
              {this.state.error.stack}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

import React, { type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[echoes] uncaught render error:", error, info.componentStack);
  }

  render() {
    const { error } = this.state;

    if (error) {
      return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center gap-6 px-4">
          <AlertTriangle size={40} className="text-red-400" />
          <div className="text-center space-y-2">
            <h1 className="text-lg font-semibold">Something went wrong</h1>
            <p className="text-zinc-500 text-sm max-w-sm">
              An unexpected error occurred. Reloading the page usually fixes it.
            </p>
          </div>
          <pre className="text-xs text-zinc-600 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 max-w-sm w-full overflow-auto">
            {error.message}
          </pre>
          <button
            onClick={() => window.location.reload()}
            className="bg-violet-600 hover:bg-violet-500 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            Reload page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

import { Component, type ReactNode } from "react";

interface Props { children: ReactNode }
interface State { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="p-4 m-4 rounded-xl bg-red-500/10 border border-red-500/30">
          <p className="text-xs font-semibold text-red-400 mb-2">Extension error</p>
          <p className="text-[11px] text-red-300 font-mono break-all leading-relaxed">
            {this.state.error.message}
          </p>
          <p className="text-[10px] text-[#6b6b7a] mt-2 break-all">
            {this.state.error.stack?.split("\n")[1]}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

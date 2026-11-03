import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Global ErrorBoundary] Uncaught error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetState = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#EBEBEB] text-gray-800 flex flex-col items-center justify-center p-6 text-center select-none font-sans">
          <div className="p-8 max-w-md w-full bg-[#EBEBEB] rounded-[2.5rem] shadow-[12px_12px_24px_#d1d1d1,-12px_-12px_24px_#ffffff] border border-white/60 flex flex-col items-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#EBEBEB] shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-serif text-xl font-bold text-gray-900">
                Ocurrió un inconveniente temporal
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Se ha detectado una excepción imprevista. Puedes intentar recargar la aplicación para volver a sincronizar el estado.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-[11px] text-rose-900 font-mono w-full text-left overflow-x-auto">
                {this.state.error.message}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2 w-full">
              <button
                type="button"
                onClick={this.handleResetState}
                className="flex-1 py-3 px-4 bg-[#EBEBEB] rounded-2xl shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] active:shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] text-xs font-bold text-gray-700 hover:text-gray-900 transition-all cursor-pointer"
              >
                Reintentar
              </button>
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 py-3 px-4 bg-[#EBEBEB] rounded-2xl shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] active:shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] text-xs font-bold text-rose-700 hover:text-rose-900 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Recargar</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

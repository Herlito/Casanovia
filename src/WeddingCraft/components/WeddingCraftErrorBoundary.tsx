import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { createDefaultWebInvitationDocument } from '../lib/defaultWebTemplate';
import { RESTORED_MASTER_TEMPLATES } from '../data/masterTemplates';
import { del } from 'idb-keyval';
import { Loader2, RefreshCw, CheckCircle2 } from 'lucide-react';

interface Props {
  children: ReactNode;
  eventId?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  recovering: boolean;
  recovered: boolean;
}

export class WeddingCraftErrorBoundary extends Component<Props, State> {
  private recoveryTimeout: any = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      recovering: false,
      recovered: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[WeddingCraft ErrorBoundary] Caught render exception:', error, errorInfo);
    
    // Auto-recover immediately without requiring user action
    this.autoRecoverOfficialTemplate();
  }

  componentWillUnmount() {
    if (this.recoveryTimeout) {
      clearTimeout(this.recoveryTimeout);
    }
  }

  autoRecoverOfficialTemplate = () => {
    this.setState({ recovering: true });

    try {
      const state = useEditorStore.getState();
      const eventData = state.eventData;
      const eventId = eventData?.eventId || this.props.eventId || 'default';

      // 1. Purge corrupted draft key from local storage
      const draftKey = `wedding_design_draft_${eventId}`;
      try {
        localStorage.removeItem(draftKey);
        del(draftKey).catch(() => {});
      } catch (e) {}

      // 2. Locate official master template or generate default wedding template
      let officialDoc: any = null;
      const matchingMaster = RESTORED_MASTER_TEMPLATES.find(
        m => m.document?.parentEventId === eventId || 
             (eventData?.coupleNames && m.name.toLowerCase().includes(eventData.coupleNames[0]?.toLowerCase() || ''))
      );

      if (matchingMaster?.document?.pages?.[0]?.elements?.length) {
        officialDoc = matchingMaster.document;
      } else {
        officialDoc = createDefaultWebInvitationDocument({
          eventId: eventId,
          coupleNames: eventData?.coupleNames || ['Novio', 'Novia'],
          eventDate: eventData?.eventDate || new Date().toISOString(),
          venueName: eventData?.venueName || 'Salón de Recepciones',
          venueAddress: eventData?.venueAddress || '',
          romanticQuote: eventData?.romanticQuote || ''
        });
      }

      // 3. Reinitialize store document
      state.initializeDocument(officialDoc);

      // 4. Reset error boundary state smoothly
      this.recoveryTimeout = setTimeout(() => {
        this.setState({
          hasError: false,
          error: null,
          recovering: false,
          recovered: true
        });

        setTimeout(() => {
          this.setState({ recovered: false });
        }, 3000);
      }, 400);
    } catch (recoverErr) {
      console.error('[WeddingCraft ErrorBoundary] Auto-recovery failed:', recoverErr);
      this.setState({ recovering: false });
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#EBEBEB] text-center select-none">
          <div className="p-8 max-w-md w-full bg-[#EBEBEB] rounded-3xl shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] border border-gray-200/50 flex flex-col items-center">
            {this.state.recovering ? (
              <>
                <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
                <h4 className="text-base font-bold text-gray-800 mb-1">
                  Restaurando lienzo oficial...
                </h4>
                <p className="text-xs text-gray-500">
                  Normalizando automáticamente la plantilla de la boda.
                </p>
              </>
            ) : (
              <>
                <RefreshCw className="w-10 h-10 text-gray-600 animate-spin mb-4" />
                <h4 className="text-base font-bold text-gray-800 mb-2">
                  Optimizando Lienzo de WeddingCraft
                </h4>
                <p className="text-xs text-gray-500 mb-6">
                  Se detectó un desfase en el borrador anterior. Reestableciendo la plantilla oficial de forma automática.
                </p>
                <button
                  type="button"
                  onClick={this.autoRecoverOfficialTemplate}
                  className="px-5 py-2.5 bg-[#EBEBEB] rounded-2xl shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] text-xs font-bold text-gray-800 uppercase tracking-wider hover:text-emerald-700 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Cargar Plantilla Oficial</span>
                </button>
              </>
            )}
          </div>
        </div>
      );
    }

    return (
      <>
        {this.state.recovered && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Lienzo restaurado con la plantilla oficial de la boda</span>
          </div>
        )}
        {this.props.children}
      </>
    );
  }
}

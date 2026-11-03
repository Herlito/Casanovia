import React, { useState, useEffect, useRef, useCallback } from 'react';
import jsQR from 'jsqr';
import { useWedding } from '../../context/WeddingContext';
import { DigitalGuestPass, DigitalPassValidationResult } from '../../types';
import { validatePassAtDoor } from '../../services/digitalPassService';
import { 
  X, 
  QrCode, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Users, 
  ScanLine, 
  UserCheck,
  Camera,
  CameraOff,
  RefreshCw,
  Sparkles
} from 'lucide-react';

interface PassValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PassValidationModal: React.FC<PassValidationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { activeWedding, weddings, activeWeddingId } = useWedding();
  const wedding = activeWedding || weddings.find((w) => w.id === activeWeddingId);

  const [tokenInput, setTokenInput] = useState('');
  const [passesToAdmit, setPassesToAdmit] = useState<number>(1);
  const [isValidating, setIsValidating] = useState(false);
  const [result, setResult] = useState<DigitalPassValidationResult | null>(null);

  // Camera QR scanner states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [scannedSuccessMsg, setScannedSuccessMsg] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const stopCamera = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    setScannedSuccessMsg(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('El navegador no admite el uso de la cámara en este dispositivo.');
        return;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch (e1) {
        // Fallback to basic video constraint if ideal facingMode fails
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;
      setIsCameraActive(true);
    } catch (err: any) {
      console.error('Error al inicializar la cámara:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Permiso denegado. Otorga permiso de acceso a la cámara en tu navegador.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No se detectó ninguna cámara disponible en este dispositivo.');
      } else {
        setCameraError('No se pudo abrir la cámara del dispositivo.');
      }
      setIsCameraActive(false);
    }
  }, [facingMode]);

  // Bind video element to media stream as soon as isCameraActive is true and element is mounted
  useEffect(() => {
    if (isCameraActive && streamRef.current && videoRef.current) {
      const video = videoRef.current;
      video.srcObject = streamRef.current;
      video.muted = true;
      video.playsInline = true;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Playback error on video element:', err);
        });
      }
    }
  }, [isCameraActive]);

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // QR Scanning continuous loop
  const scanFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isCameraActive) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState >= video.HAVE_CURRENT_DATA && video.videoWidth > 0 && video.videoHeight > 0) {
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data && code.data.trim().length > 0 && wedding) {
          const scannedCode = code.data.trim();
          setTokenInput(scannedCode);
          setScannedSuccessMsg(`¡QR detectado: ${scannedCode}!`);

          // Validate pass automatically
          setIsValidating(true);
          validatePassAtDoor(wedding, scannedCode, passesToAdmit)
            .then((res) => {
              setResult(res);
            })
            .catch(() => {
              setResult({
                valid: false,
                message: 'Error al procesar la validación en el servidor.',
                code: 'NOT_FOUND',
              });
            })
            .finally(() => {
              setIsValidating(false);
            });

          stopCamera();
          return;
        }
      }
    }

    animFrameRef.current = requestAnimationFrame(scanFrame);
  }, [wedding, passesToAdmit, isCameraActive, stopCamera]);

  useEffect(() => {
    if (isCameraActive) {
      animFrameRef.current = requestAnimationFrame(scanFrame);
    } else {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    }
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isCameraActive, scanFrame]);

  useEffect(() => {
    if (isCameraActive) {
      startCamera();
    }
  }, [facingMode]);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setTokenInput('');
      setResult(null);
      setCameraError(null);
      setScannedSuccessMsg(null);
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, stopCamera]);

  if (!isOpen || !wedding) return null;

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;

    setIsValidating(true);
    setResult(null);

    try {
      const res = await validatePassAtDoor(wedding, tokenInput.trim(), passesToAdmit);
      setResult(res);
    } catch (err) {
      setResult({
        valid: false,
        message: 'Error al procesar la validación en el servidor.',
        code: 'NOT_FOUND',
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleReset = () => {
    setTokenInput('');
    setResult(null);
    setPassesToAdmit(1);
    setScannedSuccessMsg(null);
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <div
      id="pass-validation-modal"
      className="fixed inset-0 z-[1000] bg-[#EBEBEB] sm:bg-black/60 sm:backdrop-blur-xs flex flex-col justify-start sm:justify-center items-stretch sm:items-center p-0 sm:p-4 font-sans animate-fadeIn overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full min-h-screen sm:min-h-0 sm:h-auto sm:max-w-lg bg-[#EBEBEB] rounded-none sm:rounded-[2.5rem] p-4 sm:p-8 shadow-none sm:shadow-[12px_12px_24px_#c8c8c8,-12px_-12px_24px_#ffffff] border-0 sm:border sm:border-white/80 relative my-0 sm:my-6 flex flex-col justify-between overflow-y-auto pb-10 sm:pb-8">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 sm:right-6 sm:top-6 p-2.5 rounded-2xl bg-[#EBEBEB] text-gray-500 shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#c8c8c8,-6px_-6px_12px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] transition-all cursor-pointer z-20"
          title="Cerrar"
        >
          <X className="w-5 h-5 text-gray-700" />
        </button>

        <div className="w-full">
          {/* Header */}
          <div className="text-center mb-5 pt-3 sm:pt-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-full bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] flex items-center justify-center text-emerald-700 mb-2.5">
              <ScanLine className="w-6 h-6" />
            </div>
            <h3 className="font-serif-display text-xl sm:text-2xl font-bold text-gray-900">
              Control de Ingreso & Escáner
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
              Validador de códigos QR y control de cupo en puerta para {wedding.coupleNames}.
            </p>
          </div>

          {/* Camera Scanner Container */}
          {isCameraActive ? (
            <div className="relative w-full rounded-2xl overflow-hidden bg-black shadow-[inset_4px_4px_8px_rgba(0,0,0,0.5)] border border-gray-700 mb-4">
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                onLoadedMetadata={() => {
                  if (videoRef.current) {
                    videoRef.current.play().catch(console.warn);
                  }
                }}
                className="w-full h-52 sm:h-64 object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Viewfinder frame overlay */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-44 h-44 sm:w-52 sm:h-52 border-2 border-emerald-400/80 rounded-2xl relative shadow-[0_0_20px_rgba(52,211,153,0.4)]">
                  <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                  <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                  <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />
                  <div className="w-full h-0.5 bg-emerald-400/80 absolute top-1/2 -translate-y-1/2 animate-pulse" />
                </div>
              </div>

              {/* Camera Header controls */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-auto">
                <span className="inline-flex items-center space-x-1.5 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Cámara En Vivo</span>
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={toggleCameraFacing}
                    className="p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-all border border-white/20 cursor-pointer"
                    title="Voltear Cámara"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="p-2 rounded-full bg-black/60 text-rose-300 hover:bg-black/80 transition-all border border-rose-500/30 cursor-pointer"
                    title="Detener Cámara"
                  >
                    <CameraOff className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-4">
              <button
                type="button"
                onClick={startCamera}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#EBEBEB] text-emerald-800 font-bold text-xs sm:text-sm shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[8px_8px_16px_#c8c8c8,-8px_-8px_16px_#ffffff] active:shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] transition-all flex items-center justify-center space-x-2 border border-emerald-300/60 cursor-pointer"
              >
                <Camera className="w-4 h-4 text-emerald-700" />
                <span>Activar Escáner de Cámara QR</span>
              </button>
            </div>
          )}

          {/* Camera Error Message */}
          {cameraError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs mb-4 flex items-start space-x-2 animate-fadeIn">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{cameraError}</span>
            </div>
          )}

          {/* Scanned Feedback Toast */}
          {scannedSuccessMsg && !result && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs mb-4 flex items-center space-x-2 animate-fadeIn">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{scannedSuccessMsg}</span>
            </div>
          )}

          {/* Validation Result Box */}
          {result && (
            <div className={`p-4 sm:p-5 rounded-2xl mb-5 animate-fadeIn border ${
              result.valid 
                ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950' 
                : 'bg-rose-50/90 border-rose-200 text-rose-950'
            }`}>
              <div className="flex items-start space-x-3">
                {result.valid ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-bold text-sm leading-snug">{result.message}</p>
                  {result.pass && (
                    <div className="mt-3 pt-3 border-t border-black/10 text-xs space-y-1">
                      <p><span className="font-bold">Invitado:</span> {result.pass.guestFullName}</p>
                      <p><span className="font-bold">Pases usados:</span> {result.pass.usedPasses} de {result.pass.confirmedPasses}</p>
                      {result.pass.assignedTable && (
                        <p><span className="font-bold">Mesa:</span> {result.pass.assignedTable}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-black/10 text-right">
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs font-bold underline cursor-pointer"
                >
                  Escanear / Validar Otro
                </button>
              </div>
            </div>
          )}

          {/* Scanner / Token input form */}
          <form onSubmit={handleValidate} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 text-center">
                Token QR o Código de Pase
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="Escanea el código QR o pega el token..."
                  className="w-full px-5 py-4 text-center font-mono text-xs rounded-2xl bg-[#EBEBEB] text-gray-900 shadow-[inset_5px_5px_10px_#d1d1d1,inset_-5px_-5px_10px_#ffffff] focus:outline-hidden transition-all"
                />
                <QrCode className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff]">
              <span className="text-xs font-bold text-gray-600">Personas a ingresar ahora:</span>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setPassesToAdmit(num)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      passesToAdmit === num
                        ? 'bg-[#EBEBEB] text-emerald-800 shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff]'
                        : 'bg-[#EBEBEB] text-gray-700 shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff]'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isValidating || !tokenInput.trim()}
              className="w-full py-4 rounded-2xl bg-[#EBEBEB] text-gray-900 font-bold text-sm transition-all duration-300 shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] hover:shadow-[12px_12px_24px_#c8c8c8,-12px_-12px_24px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60"
            >
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>{isValidating ? 'Validando Acceso...' : 'Validar e Ingresar'}</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

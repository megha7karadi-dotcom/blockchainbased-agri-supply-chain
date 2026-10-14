import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  QrCode, 
  Camera, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Loader2, 
  RefreshCw, 
  Upload, 
  Zap, 
  ZapOff,
  VideoOff,
  ShieldCheck
} from 'lucide-react';
import jsQR from 'jsqr';
import { useApp } from '../../context/AppContext';
import { useWallet } from '../../context/WalletContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const QRScannerModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { batches, navigateToVerification } = useApp();
  const { addScanRecord, contractAddress } = useWallet();

  const [manualInput, setManualInput] = useState('');
  const [cameraState, setCameraState] = useState<'idle' | 'requesting' | 'active' | 'denied' | 'unsupported' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [detectedBatchName, setDetectedBatchName] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [torchAvailable, setTorchAvailable] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isHandlingScanRef = useRef<boolean>(false);

  // Play a pleasant feedback tone on successful QR scan
  const playBeep = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } catch {
      // Audio context might be restricted before user gesture
    }
  }, []);

  // Safely stop all active camera tracks
  const stopCameraStream = useCallback(() => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setTorchOn(false);
    setTorchAvailable(false);
  }, []);

  // Process decoded batch identifier
  const handleSuccessfulScan = useCallback((rawScannedText: string) => {
    if (isHandlingScanRef.current) return;
    isHandlingScanRef.current = true;

    playBeep();

    let cleanId = rawScannedText.trim();
    // Support URLs like https://domain.com/verify/AGRI-2026-RIC-003 or verify/AGRI-2026-RIC-003
    const urlMatch = cleanId.match(/verify\/([A-Za-z0-9_-]+)/i);
    if (urlMatch && urlMatch[1]) {
      cleanId = urlMatch[1];
    } else {
      cleanId = cleanId.replace(/^.*\/verify\/?/, '').split('?')[0].split('#')[0].trim();
    }

    const match = batches.find(b => 
      b.id.toLowerCase() === cleanId.toLowerCase() || 
      b.batchId.toLowerCase() === cleanId.toLowerCase()
    );

    const finalBatchId = match ? match.batchId : cleanId;
    setScanResult(finalBatchId);
    setDetectedBatchName(match ? match.name : 'Produce Verification Passport');

    if (match) {
      addScanRecord({
        batchId: match.batchId,
        name: match.name,
        variety: match.variety,
        imageUrl: match.imageUrl,
        farmLocation: match.farmerLocation || match.farmLocation,
        farmerName: match.farmerName,
        finalPrice: match.pricing?.finalConsumerPrice,
        farmerPrice: match.pricing?.farmerPrice,
        qualityGrade: match.quality?.grade,
        freshnessScore: match.quality?.freshnessScore,
        status: match.status,
        contractAddress: match.blockchain?.contractAddress || contractAddress,
        tokenId: match.blockchain?.tokenId,
        blockNumber: match.blockchain?.blockNumber,
        networkName: match.blockchain?.consensusMechanism || 'Ethereum Sepolia',
        isTamperEvident: true
      });
    }

    // Stop camera and navigate
    stopCameraStream();

    setTimeout(() => {
      navigateToVerification(finalBatchId);
      onClose();
      isHandlingScanRef.current = false;
      setScanResult(null);
      setDetectedBatchName(null);
    }, 600);
  }, [batches, addScanRecord, contractAddress, navigateToVerification, onClose, playBeep, stopCameraStream]);

  // Frame scanner loop using jsQR
  const scanLoop = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || isHandlingScanRef.current) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      const width = video.videoWidth;
      const height = video.videoHeight;

      if (width > 0 && height > 0) {
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(video, 0, 0, width, height);
          const imageData = ctx.getImageData(0, 0, width, height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert'
          });

          if (code && code.data && code.data.trim()) {
            handleSuccessfulScan(code.data);
            return; // stop scanning loop on hit
          }
        }
      }
    }

    animationFrameId.current = requestAnimationFrame(scanLoop);
  }, [handleSuccessfulScan]);

  // Initialize camera
  const startCamera = useCallback(async (preferredDeviceId?: string) => {
    stopCameraStream();
    setErrorMessage('');
    setFileError(null);
    isHandlingScanRef.current = false;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraState('unsupported');
      setErrorMessage('Your browser environment does not support direct camera media access.');
      return;
    }

    setCameraState('requesting');

    try {
      const constraints: MediaStreamConstraints = {
        audio: false,
        video: preferredDeviceId
          ? { deviceId: { exact: preferredDeviceId } }
          : {
              facingMode: { ideal: 'environment' },
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Check available cameras
      try {
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevs = allDevices.filter(d => d.kind === 'videoinput');
        setDevices(videoDevs);
      } catch {
        // Enumerate fallback
      }

      // Check torch capability
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        try {
          const capabilities = (videoTrack as any).getCapabilities ? (videoTrack as any).getCapabilities() : {};
          if (capabilities.torch) {
            setTorchAvailable(true);
          }
        } catch {
          // ignore torch detection error
        }
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setCameraState('active');
        animationFrameId.current = requestAnimationFrame(scanLoop);
      }
    } catch (err: any) {
      console.warn('[QRScanner] Camera access notice:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraState('denied');
        setErrorMessage('Camera access was denied. Please allow camera permissions in your browser or choose a batch below.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraState('unsupported');
        setErrorMessage('No camera device detected on this system.');
      } else {
        setCameraState('error');
        setErrorMessage(err.message || 'Unable to start camera scanner.');
      }
    }
  }, [scanLoop, stopCameraStream]);

  // Toggle torch/flashlight
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track && (track as any).applyConstraints) {
      try {
        const nextState = !torchOn;
        await (track as any).applyConstraints({
          advanced: [{ torch: nextState }]
        });
        setTorchOn(nextState);
      } catch (err) {
        console.warn('Torch constraint toggle notice:', err);
      }
    }
  };

  // Switch between available camera devices
  const switchCamera = () => {
    if (devices.length <= 1) return;
    const currentIndex = devices.findIndex(d => d.deviceId === selectedDeviceId);
    const nextIndex = (currentIndex + 1) % devices.length;
    const nextDevice = devices[nextIndex];
    setSelectedDeviceId(nextDevice.deviceId);
    startCamera(nextDevice.deviceId);
  };

  // Handle uploaded image file decoding
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setFileError('Could not process image.');
          return;
        }
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imgData.data, imgData.width, imgData.height);
        if (code && code.data) {
          handleSuccessfulScan(code.data);
        } else {
          setFileError('No QR code detected in this photo. Please try a clearer image or choose a batch below.');
        }
      };
      img.onerror = () => {
        setFileError('Could not load image file.');
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    // Reset input
    e.target.value = '';
  };

  // Manage camera on modal open/close
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCameraStream();
    }
    return () => {
      stopCameraStream();
    };
  }, [isOpen, startCamera, stopCameraStream]);

  // Handle direct manual batch verification
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = manualInput.trim();
    if (!raw) return;
    handleSuccessfulScan(raw);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-xs">
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Hidden file input for QR image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-white px-5 py-4 flex items-center justify-between border-b border-stone-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-stone-900">System Camera QR Scanner</h3>
              <p className="text-xs text-stone-500">Live packaging scanner & origin verifier</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-md transition cursor-pointer"
            aria-label="Close scanner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* System Camera Viewfinder */}
        <div className="p-4 sm:p-6 bg-stone-950 flex flex-col items-center justify-center text-center relative overflow-hidden">
          
          <div className="relative w-full max-w-[320px] aspect-square rounded-xl bg-black border-2 border-emerald-500/50 shadow-inner overflow-hidden flex items-center justify-center">
            
            {/* Live Camera Video Feed */}
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className={`w-full h-full object-cover ${cameraState === 'active' ? 'opacity-100' : 'opacity-0'}`}
            />

            {/* Corner Reticle Brackets */}
            <div className="pointer-events-none absolute inset-4 border border-emerald-500/30 rounded-lg">
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-3 border-l-3 border-emerald-400 rounded-tl-sm" />
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-3 border-r-3 border-emerald-400 rounded-tr-sm" />
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-3 border-l-3 border-emerald-400 rounded-bl-sm" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-3 border-r-3 border-emerald-400 rounded-br-sm" />
            </div>

            {/* Continuous Laser Scanning Guide */}
            {cameraState === 'active' && !scanResult && (
              <motion.div 
                animate={{ top: ['10%', '88%', '10%'] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                className="pointer-events-none absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_#34d399]"
              />
            )}

            {/* State Overlays */}
            {cameraState === 'requesting' && (
              <div className="absolute inset-0 bg-stone-900/90 flex flex-col items-center justify-center text-emerald-400 p-4 space-y-2">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
                <span className="text-xs font-semibold text-stone-200">Opening system camera...</span>
                <span className="text-[11px] text-stone-400">Please grant camera permission</span>
              </div>
            )}

            {(cameraState === 'denied' || cameraState === 'unsupported' || cameraState === 'error') && (
              <div className="absolute inset-0 bg-stone-900/95 flex flex-col items-center justify-center text-stone-300 p-4 space-y-2.5">
                <VideoOff className="w-8 h-8 text-amber-400" />
                <span className="text-xs font-bold text-stone-100">Camera Unavailable</span>
                <p className="text-[11px] text-stone-400 leading-tight max-w-[240px]">
                  {errorMessage || 'Camera could not be started.'}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => startCamera(selectedDeviceId || undefined)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-md flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retry Camera</span>
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-md flex items-center gap-1.5 transition cursor-pointer border border-stone-700"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image</span>
                  </button>
                </div>
              </div>
            )}

            {/* Successful Detection Confirmation */}
            {scanResult && (
              <div className="absolute inset-0 bg-emerald-950/90 flex flex-col items-center justify-center text-emerald-300 p-4 space-y-2 z-20">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-in zoom-in duration-150" />
                <span className="text-sm font-bold text-white">QR Code Verified!</span>
                <span className="text-xs font-semibold text-emerald-300">{detectedBatchName}</span>
                <span className="text-[11px] text-emerald-200 bg-emerald-900/80 px-2.5 py-0.5 rounded border border-emerald-700">
                  {scanResult}
                </span>
              </div>
            )}
          </div>

          {/* Camera Controls Bar */}
          <div className="mt-3 w-full max-w-[320px] flex items-center justify-between text-xs text-stone-400 px-1">
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className={`w-2 h-2 rounded-full ${cameraState === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-stone-500'}`} />
              <span className="text-stone-300 font-medium">
                {cameraState === 'active' ? 'Live Camera Active' : 'Align packaging QR code'}
              </span>
            </div>

            <div className="flex items-center gap-1">
              {torchAvailable && cameraState === 'active' && (
                <button
                  onClick={toggleTorch}
                  title="Toggle Flashlight / Torch"
                  className={`p-1.5 rounded-md text-stone-300 hover:text-white transition cursor-pointer border ${torchOn ? 'bg-amber-500/20 border-amber-400 text-amber-300' : 'bg-stone-800 border-stone-700'}`}
                >
                  {torchOn ? <Zap className="w-3.5 h-3.5" /> : <ZapOff className="w-3.5 h-3.5" />}
                </button>
              )}

              {devices.length > 1 && (
                <button
                  onClick={switchCamera}
                  title="Switch Front/Rear Camera"
                  className="p-1.5 rounded-md bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-300 hover:text-white transition cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="text-[10px]">Flip</span>
                </button>
              )}

              <button
                onClick={() => fileInputRef.current?.click()}
                title="Upload photo of QR code"
                className="px-2 py-1 rounded-md bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-300 hover:text-white text-[11px] font-medium transition cursor-pointer flex items-center gap-1"
              >
                <Upload className="w-3 h-3 text-emerald-400" />
                <span>Upload</span>
              </button>
            </div>
          </div>

          {fileError && (
            <div className="mt-2 text-xs text-rose-300 bg-rose-950/70 border border-rose-800/80 px-3 py-1.5 rounded-md max-w-[320px]">
              {fileError}
            </div>
          )}
        </div>

        {/* Quick Sample Selector & Manual Input */}
        <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-200">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-700 mb-2">
            <span>Or test with verified produce batches:</span>
            <span className="text-[11px] text-emerald-700 font-medium">Click to scan</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {batches.slice(0, 4).map(b => (
              <button
                key={b.id}
                onClick={() => handleSuccessfulScan(b.batchId || b.id)}
                className="p-2 text-left bg-white hover:bg-emerald-50 hover:border-emerald-300 border border-stone-200 rounded-lg transition text-xs flex items-center gap-2 cursor-pointer shadow-2xs"
              >
                <img 
                  src={b.imageUrl || '/assets/harvest_crates.svg'} 
                  alt={b.name}
                  onError={(e) => { e.currentTarget.src = '/assets/harvest_crates.svg'; }}
                  className="w-8 h-8 rounded-md object-cover shrink-0 border border-stone-200"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-stone-900 truncate text-[11px]">{b.name}</div>
                  <div className="text-[10px] text-stone-500 font-medium truncate">{b.batchId}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Manual Input Fallback */}
          <form onSubmit={handleManualSubmit} className="mt-3.5 pt-3 border-t border-stone-200 flex gap-2">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Or enter Batch ID (e.g. AGRI-2026-RIC-003)"
              className="flex-1 px-3 py-2 text-xs bg-white border border-stone-300 rounded-md focus:border-emerald-600 focus:outline-none font-sans"
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-md flex items-center gap-1 transition shadow-xs cursor-pointer"
            >
              <span>Verify</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

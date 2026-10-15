
import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { motion } from 'motion/react';
import {
  X, QrCode, Camera, CheckCircle2, AlertTriangle,
  ArrowRight, Loader2, RefreshCw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useWallet } from '../../context/WalletContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const QRScannerModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { batches, navigateToVerification } = useApp();
  const { addScanRecord, contractAddress } = useWallet();

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const handledRef = useRef(false);
  const [manualInput, setManualInput] = useState('');
  const [cameraReady, setCameraReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [cameraId, setCameraId] = useState('');
  const [scanMessage, setScanMessage] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    const scanner = new Html5Qrcode('consumer-qr-reader');
    scannerRef.current = scanner;

    const startCamera = async () => {
      try {
        setError('');
        setScanMessage('');
        setCameraReady(false);

        const available = await Html5Qrcode.getCameras();
        if (cancelled) return;

        if (!available.length) {
          throw new Error('No camera was found on this device.');
        }

        const mapped = available.map((camera) => ({
          id: camera.id,
          label: camera.label || `Camera ${available.indexOf(camera) + 1}`,
        }));

        setCameras(mapped);
        const preferred = mapped.find((camera) =>
          /back|rear|environment|world/i.test(camera.label)
        ) || mapped[mapped.length - 1];

        const selectedId = cameraId || preferred.id;
        setCameraId(selectedId);

        await scanner.start(
          selectedId,
          { fps: 10, qrbox: { width: 230, height: 230 }, aspectRatio: 1 },
          (decodedText) => {
            if (handledRef.current || cancelled) return;
            handledRef.current = true;
            setScanMessage(decodedText);
            void scanner.stop().catch(() => undefined);
            void processCode(decodedText);
          },
          () => undefined
        );

        if (!cancelled) setCameraReady(true);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? `${err.message} Allow camera access and try again.`
              : 'Unable to start the camera. Check camera permissions.'
          );
        }
      }
    };

    const processCode = async (raw: string) => {
      setBusy(true);
      setError('');

      try {
        let cleanId = raw.trim();

        try {
          const url = new URL(cleanId);
          const pathMatch = url.pathname.match(/\/verify\/([^/]+)/i);
          if (pathMatch) cleanId = decodeURIComponent(pathMatch[1]);
          else {
            cleanId = url.searchParams.get('batchId')
              || url.searchParams.get('id')
              || cleanId;
          }
        } catch {
          // The QR content may simply be a batch ID.
        }

        cleanId = cleanId.replace(/^\/?verify\/?/i, '').split('?')[0].split('#')[0].trim();

        const match = batches.find((batch) =>
          batch.id.toLowerCase() === cleanId.toLowerCase()
          || batch.batchId.toLowerCase() === cleanId.toLowerCase()
        );

        if (!match) {
          setError(`No matching produce batch was found for: ${cleanId}`);
          setScanMessage('');
          handledRef.current = false;
          setBusy(false);
          return;
        }

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
          isTamperEvident: true,
        });

        setScanMessage(`Verified: ${match.batchId}`);
        setTimeout(() => {
          navigateToVerification(match.id);
          onClose();
        }, 500);
      } catch {
        setError('Could not process this QR code. Please try again.');
        handledRef.current = false;
        setBusy(false);
      }
    };

    void startCamera();

    return () => {
      cancelled = true;
      if (scannerRef.current?.isScanning) {
        void scannerRef.current.stop()
          .catch(() => undefined)
          .finally(() => scannerRef.current?.clear());
      } else {
        void scannerRef.current?.clear();
      }
      scannerRef.current = null;
    };
    // Scanner lifecycle is controlled by opening/closing the modal.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const submitManual = (event: React.FormEvent) => {
    event.preventDefault();
    const raw = manualInput.trim();
    if (!raw) return;

    const cleaned = raw.replace(/^.*\/verify\/?/i, '').split('?')[0].split('#')[0].trim();
    const match = batches.find((batch) =>
      batch.id.toLowerCase() === cleaned.toLowerCase()
      || batch.batchId.toLowerCase() === cleaned.toLowerCase()
    );

    if (!match) {
      setError(`No matching produce batch was found for: ${cleaned}`);
      return;
    }

    setBusy(true);
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
      isTamperEvident: true,
    });

    navigateToVerification(match.id);
    onClose();
  };

  const switchCamera = async (nextId: string) => {
    const scanner = scannerRef.current;
    if (!scanner || !scanner.isScanning || !nextId) return;

    try {
      await scanner.stop();
      setCameraId(nextId);
      handledRef.current = false;
      setError('');
      await scanner.start(
        nextId,
        { fps: 10, qrbox: { width: 230, height: 230 }, aspectRatio: 1 },
        (decodedText) => {
          if (handledRef.current) return;
          handledRef.current = true;
          setScanMessage(decodedText);
          void scanner.stop().catch(() => undefined);
          const input = document.querySelector<HTMLInputElement>('#consumer-qr-manual');
          if (input) setManualInput(decodedText);
          setError('QR detected. Press Verify if automatic lookup does not start.');
        },
        () => undefined
      );
    } catch {
      setError('Could not switch cameras. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Consumer QR scanner"
    >
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-slate-100 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Scan produce QR code</h2>
              <p className="text-xs text-slate-500">Hold the code steady inside the frame</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close scanner" className="rounded-xl p-2 text-slate-500 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="bg-slate-950 p-4">
          <div id="consumer-qr-reader" className="mx-auto min-h-64 w-full max-w-sm overflow-hidden rounded-2xl" />
          {!cameraReady && !error && (
            <p className="flex items-center justify-center gap-2 py-3 text-sm text-slate-300">
              <Loader2 className="h-4 w-4 animate-spin" /> Starting camera…
            </p>
          )}
          {cameras.length > 1 && (
            <label className="mt-3 flex items-center gap-2 text-sm text-white">
              Camera
              <select
                value={cameraId}
                onChange={(event) => void switchCamera(event.target.value)}
                className="min-w-0 flex-1 rounded-lg bg-slate-800 p-2 text-white"
              >
                {cameras.map((camera) => (
                  <option key={camera.id} value={camera.id}>{camera.label}</option>
                ))}
              </select>
              <RefreshCw className="h-4 w-4" />
            </label>
          )}
          {cameraReady && !busy && (
            <p className="pt-3 text-center text-xs text-emerald-300">Camera active · scanning automatically</p>
          )}
        </div>

        <div className="space-y-3 p-4">
          {scanMessage && (
            <p className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">
              <CheckCircle2 className="h-4 w-4 shrink-0" /> {scanMessage}
            </p>
          )}
          {error && (
            <p role="alert" className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
            </p>
          )}

          <form onSubmit={submitManual} className="flex gap-2">
            <input
              id="consumer-qr-manual"
              value={manualInput}
              onChange={(event) => setManualInput(event.target.value)}
              placeholder="Enter or paste a batch ID / QR URL"
              className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-600"
            />
            <button type="submit" disabled={busy} className="flex items-center gap-1 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
              Verify <ArrowRight className="h-4 w-4" />
            </button>
          </form>
          <p className="text-xs text-slate-500">
            Camera access requires permission and a secure page (HTTPS or localhost).
          </p>
        </div>
      </div>
    </motion.div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { 
  QrCode, 
  Printer, 
  Check, 
  Copy, 
  Package, 
  Leaf, 
  ExternalLink,
  Download,
  Image as ImageIcon,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useApp } from '../../context/AppContext';

export const FarmerQRGen: React.FC = () => {
  const { batches, currentUser, selectedBatchId: appSelectedBatchId, navigate } = useApp();
  const qrRef = useRef<HTMLDivElement>(null);

  const farmerBatches = batches.filter(b => 
    b.farmerId === currentUser?.id || 
    b.farmerName === currentUser?.name || 
    b.farmerId === 'usr-farmer-01'
  );
  const selectableBatches = farmerBatches.length > 0 ? farmerBatches : batches;

  const [selectedBatchId, setSelectedBatchId] = useState<string>(() => {
    if (appSelectedBatchId && batches.some(b => b.id === appSelectedBatchId || b.batchId === appSelectedBatchId)) {
      return appSelectedBatchId;
    }
    return selectableBatches[0]?.id || batches[0]?.id || '';
  });

  const [labelSize, setLabelSize] = useState<'crate' | 'pouch' | 'pallet'>('crate');
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (appSelectedBatchId && batches.some(b => b.id === appSelectedBatchId || b.batchId === appSelectedBatchId)) {
      setSelectedBatchId(appSelectedBatchId);
    }
  }, [appSelectedBatchId, batches]);

  const selectedBatch = batches.find(b => b.id === selectedBatchId || b.batchId === selectedBatchId) || selectableBatches[0] || batches[0];

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const verificationUrl = selectedBatch ? `${origin}/verify/${selectedBatch.batchId}` : `${origin}/verify`;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(verificationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleOpenVerification = () => {
    if (selectedBatch?.batchId) {
      navigate(`/verify/${selectedBatch.batchId}`);
    }
  };

  const handleExportQRPNG = (mode: 'qr-only' | 'full-tag' = 'qr-only') => {
    if (!selectedBatch) return;
    setIsExporting(true);

    try {
      const svgElement = qrRef.current?.querySelector('svg');
      if (!svgElement) {
        throw new Error('QR Code SVG element not found in DOM');
      }

      const svgXml = new XMLSerializer().serializeToString(svgElement);
      const svgBase64 = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgXml)));

      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const width = 1200;
        const height = mode === 'full-tag' ? 1560 : 1200;

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        if (mode === 'full-tag') {
          // Border
          ctx.strokeStyle = '#263329';
          ctx.lineWidth = 12;
          ctx.strokeRect(30, 30, width - 60, height - 60);

          // Top Header Banner
          ctx.fillStyle = '#246B35';
          ctx.fillRect(40, 40, width - 80, 180);

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 52px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('AGRITRACE VERIFIED PRODUCE', width / 2, 120);

          ctx.font = '32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.fillStyle = '#E3F0DC';
          ctx.fillText('Tracked from Farm to Market', width / 2, 175);

          // Crop Name
          ctx.fillStyle = '#263329';
          ctx.font = 'bold 64px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          const cropDisplay = (selectedBatch.cropVariety ? `${selectedBatch.cropVariety} ${selectedBatch.cropName}` : selectedBatch.cropName || selectedBatch.name || 'Produce').toUpperCase();
          ctx.fillText(cropDisplay, width / 2, 290);

          // QR Code in center
          const qrCanvasSize = 750;
          const qrX = (width - qrCanvasSize) / 2;
          const qrY = 340;
          ctx.drawImage(img, qrX, qrY, qrCanvasSize, qrCanvasSize);

          // Divider
          ctx.strokeStyle = '#DCE5D9';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(80, 1160);
          ctx.lineTo(width - 80, 1160);
          ctx.stroke();

          // Batch details
          ctx.fillStyle = '#263329';
          ctx.font = 'bold 36px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`BATCH: ${selectedBatch.batchId}`, width / 2, 1230);

          ctx.fillStyle = '#657267';
          ctx.font = '32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.fillText(`Origin: ${selectedBatch.farmerLocation || selectedBatch.farmLocation || 'Farm Origin'}`, width / 2, 1290);

          ctx.fillText(
            `Harvest: ${selectedBatch.harvestDate} • Grade: ${selectedBatch.qualityGrade || 'Grade A'}`,
            width / 2,
            1350
          );

          // Footer
          ctx.fillStyle = '#246B35';
          ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.fillText('SCAN WITH PHONE CAMERA TO VERIFY AUTHENTICITY', width / 2, 1430);

          ctx.fillStyle = '#657267';
          ctx.font = '22px monospace';
          ctx.fillText(verificationUrl, width / 2, 1490);

        } else {
          // Plain QR code
          const padding = 120;
          const qrCanvasSize = width - padding * 2;
          ctx.drawImage(img, padding, padding, qrCanvasSize, qrCanvasSize);

          ctx.fillStyle = '#246B35';
          ctx.font = 'bold 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('AGRITRACE CROP QR CODE', width / 2, 75);

          ctx.fillStyle = '#263329';
          ctx.font = 'bold 36px monospace';
          ctx.fillText(selectedBatch.batchId, width / 2, width - 40);
        }

        const pngDataUrl = canvas.toDataURL('image/png', 1.0);
        const link = document.createElement('a');
        const filePrefix = (selectedBatch.batchId || 'AgriTrace').replace(/[^a-zA-Z0-9-_]/g, '_');
        link.download = mode === 'full-tag' ? `${filePrefix}_Packaging_Sticker.png` : `${filePrefix}_QR.png`;
        link.href = pngDataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setExportSuccess(mode === 'full-tag' ? 'Packaging Sticker PNG Downloaded!' : 'High-Res QR Code PNG Downloaded!');
        setTimeout(() => setExportSuccess(null), 3000);
        setIsExporting(false);
      };

      img.onerror = () => {
        setIsExporting(false);
      };

      img.src = svgBase64;
    } catch (err: any) {
      console.error('Error exporting QR PNG:', err);
      setIsExporting(false);
    }
  };

  const qrSize = labelSize === 'pallet' ? 220 : labelSize === 'crate' ? 200 : 160;

  if (!selectedBatch) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-[#657267]">
        No crops available for QR code generation.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      
      {/* Title & Top Action Bar */}
      <div className="bg-white border border-[#DCE5D9] rounded-xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#246B35]"></span>
            <span className="text-[11px] font-semibold text-[#246B35] uppercase tracking-wider">
              Packaging QR Codes
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#263329] flex items-center gap-2">
            <span>View QR Code & Packaging Stickers</span>
          </h1>
          <p className="text-xs text-[#657267]">
            Print or download QR codes to stick onto crates, sacks, or boxes so buyers can verify your farm origin.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2 bg-stone-50 hover:bg-[#F0F7EC] border border-[#DCE5D9] text-[#263329] font-semibold text-xs rounded-lg transition flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#246B35]" />
            <span>Print</span>
          </button>

          <button
            type="button"
            onClick={handleOpenVerification}
            className="px-3.5 py-2 bg-[#246B35] hover:bg-[#1B4332] text-white font-semibold text-xs rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Verify Live</span>
          </button>
        </div>
      </div>

      {/* Export Success Notification */}
      {exportSuccess && (
        <div className="p-3 bg-[#F0F7EC] border border-[#4F9D45] rounded-lg text-xs text-[#246B35] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#246B35] shrink-0" />
            <span className="font-bold">{exportSuccess}</span>
          </div>
          <button 
            type="button"
            onClick={() => setExportSuccess(null)}
            className="text-[#246B35] hover:text-[#1B4332] font-bold text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left: Configuration Panel */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-[#DCE5D9] shadow-xs space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#263329] mb-1.5">Select Crop Batch</label>
            <select
              value={selectedBatch.id}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-[#DCE5D9] rounded-lg focus:border-[#246B35] focus:bg-white outline-none font-medium text-stone-900 cursor-pointer"
            >
              {selectableBatches.map(b => (
                <option key={b.id} value={b.id}>
                  {b.cropName || b.name} — {b.batchId}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#263329] mb-1.5">Sticker Format</label>
            <div className="space-y-1.5">
              {[
                { id: 'crate' as const, label: 'Crate Sticker (4" x 6")', desc: 'For plastic crates or boxes' },
                { id: 'pouch' as const, label: 'Small Bag Sticker (2" x 2")', desc: 'For direct pouches or punnets' },
                { id: 'pallet' as const, label: 'Large Pallet Sheet (A4)', desc: 'For bulk truck consignments' },
              ].map(sz => (
                <button
                  key={sz.id}
                  type="button"
                  onClick={() => setLabelSize(sz.id)}
                  className={`w-full p-2.5 rounded-lg border text-left transition text-xs cursor-pointer ${
                    labelSize === sz.id
                      ? 'bg-[#E3F0DC] border-[#4F9D45] text-[#246B35] font-semibold'
                      : 'bg-stone-50 border-stone-200 text-[#657267] hover:border-stone-300'
                  }`}
                >
                  <div className="font-bold text-[#263329]">{sz.label}</div>
                  <div className="text-[10px] text-[#657267]">{sz.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Download Buttons */}
          <div className="pt-2 border-t border-stone-100 space-y-2">
            <label className="block text-xs font-semibold text-[#263329]">Download Image</label>
            <button
              type="button"
              onClick={() => handleExportQRPNG('qr-only')}
              disabled={isExporting}
              className="w-full py-2 px-3 bg-[#246B35] hover:bg-[#1B4332] text-white text-xs font-semibold rounded-lg transition flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download QR Code (PNG)</span>
            </button>
            <button
              type="button"
              onClick={() => handleExportQRPNG('full-tag')}
              disabled={isExporting}
              className="w-full py-2 px-3 bg-stone-50 hover:bg-[#F0F7EC] border border-[#DCE5D9] text-[#263329] text-xs font-semibold rounded-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <ImageIcon className="w-3.5 h-3.5 text-[#246B35]" />
              <span>Download Full Sticker (PNG)</span>
            </button>
          </div>

          {/* Link Copy */}
          <div className="pt-2 border-t border-stone-100 space-y-2">
            <label className="block text-xs font-semibold text-[#263329]">Direct Verification Link</label>
            <div className="p-2 bg-stone-50 border border-stone-200 rounded font-mono text-[11px] text-[#657267] break-all select-all">
              {verificationUrl}
            </div>

            <button
              type="button"
              onClick={handleCopyLink}
              className={`w-full py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                copied 
                  ? 'bg-[#E3F0DC] border-[#4F9D45] text-[#246B35]' 
                  : 'border-[#DCE5D9] hover:bg-stone-50 text-[#263329]'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#246B35]" /> : <Copy className="w-3.5 h-3.5 text-stone-500" />}
              <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>

        {/* Right: Sticker Preview */}
        <div className="md:col-span-2 flex flex-col items-center justify-center p-6 sm:p-8 bg-[#F0F7EC]/40 rounded-xl border border-[#DCE5D9] space-y-4">
          
          <div className="bg-white border-2 border-stone-800 rounded-lg p-5 shadow-sm max-w-sm w-full space-y-4 text-[#263329]">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b-2 border-stone-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-[#246B35] text-white rounded">
                  <Leaf className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#263329]">AgriTrace Verified</div>
                  <div className="text-[9px] text-[#657267]">Farm to Market Tracked</div>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold bg-stone-100 px-1.5 py-0.5 rounded border border-stone-300">
                {selectedBatch.batchId}
              </span>
            </div>

            {/* Crop Name */}
            <div className="text-center space-y-0.5">
              <h2 className="text-lg font-bold text-[#263329]">
                {selectedBatch.cropVariety ? `${selectedBatch.cropVariety} ${selectedBatch.cropName}` : selectedBatch.cropName || selectedBatch.name}
              </h2>
              <p className="text-[11px] text-[#657267]">
                {selectedBatch.farmLocation || selectedBatch.farmerLocation} • {selectedBatch.qualityGrade || 'Grade A'}
              </p>
            </div>

            {/* QR Code */}
            <div 
              ref={qrRef}
              className="flex items-center justify-center p-3 bg-white border border-stone-200 rounded mx-auto"
            >
              <QRCodeSVG
                value={verificationUrl}
                size={qrSize}
                level="H"
                includeMargin={false}
              />
            </div>

            {/* Footer */}
            <div className="text-center border-t border-stone-200 pt-2 space-y-1">
              <div className="text-[10px] font-bold text-[#246B35] uppercase tracking-wider">
                Scan with smartphone to verify origin
              </div>
              <div className="text-[9px] text-stone-400 font-mono break-all">
                {verificationUrl}
              </div>
            </div>

          </div>

          <p className="text-xs text-[#657267] text-center max-w-md">
            Place this sticker on every crate or bag. When buyers scan it, they see your farm name, harvest date, and quality proof.
          </p>

        </div>

      </div>

    </div>
  );
};

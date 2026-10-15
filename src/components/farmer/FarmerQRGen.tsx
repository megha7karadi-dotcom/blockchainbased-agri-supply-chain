
import React, { useState, useEffect, useRef } from 'react';
import {
  QrCode,
  Printer,
  Check,
  Copy,
  Leaf,
  ExternalLink,
  Download,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useApp } from '../../context/AppContext';
import { useFarmerLanguage } from '../../context/FarmerLanguageContext';
import { BackButton } from '../common/BackButton';

type Language = 'en' | 'hi' | 'kn';

const translations: Record<Language, Record<string, string>> = {
  en: {
    noCrops: 'No crops available for QR code generation.',
    packagingQR: 'Packaging QR Codes',
    title: 'View QR Code & Packaging Stickers',
    description: 'Print or download QR codes to attach to crates, sacks, or boxes so buyers can verify your farm origin.',
    print: 'Print',
    verifyLive: 'Verify Live',
    selectBatch: 'Select Crop Batch',
    stickerFormat: 'Sticker Format',
    crateSticker: 'Crate Sticker (4" x 6")',
    crateDescription: 'For plastic crates or boxes',
    pouchSticker: 'Small Bag Sticker (2" x 2")',
    pouchDescription: 'For pouches or small produce packs',
    palletSticker: 'Large Pallet Sheet (A4)',
    palletDescription: 'For bulk truck consignments',
    downloadImage: 'Download Image',
    downloadQR: 'Download QR Code (PNG)',
    downloadFull: 'Download Full Sticker (PNG)',
    verificationLink: 'Direct Verification Link',
    copied: 'Link Copied!',
    copyLink: 'Copy Link',
    verified: 'AgriTrace Verified',
    tracked: 'Farm to Market Tracked',
    scanOrigin: 'Scan with smartphone to verify origin',
    stickerInstructions: 'Place this sticker on every crate or bag. When buyers scan it, they can view your farm information, harvest date, and quality details.',
    qrDownloaded: 'High-resolution QR Code PNG downloaded!',
    stickerDownloaded: 'Packaging Sticker PNG downloaded!',
    exportError: 'Unable to export the image. Please try again.',
    batch: 'BATCH',
    origin: 'Origin',
    harvest: 'Harvest',
    grade: 'Grade',
    scanAuthenticity: 'SCAN WITH PHONE CAMERA TO VERIFY AUTHENTICITY',
    cropQR: 'AGRITRACE CROP QR CODE',
    produce: 'Produce',
    gradeA: 'Grade A',
    farmOrigin: 'Farm Origin',
  },
  hi: {
    noCrops: 'QR कोड बनाने के लिए कोई फसल उपलब्ध नहीं है।',
    packagingQR: 'पैकेजिंग QR कोड',
    title: 'QR कोड और पैकेजिंग स्टिकर देखें',
    description: 'क्रेट, बोरियों या डिब्बों पर लगाने के लिए QR कोड प्रिंट या डाउनलोड करें, ताकि खरीदार आपके खेत का मूल स्थान सत्यापित कर सकें।',
    print: 'प्रिंट करें',
    verifyLive: 'लाइव सत्यापन',
    selectBatch: 'फसल बैच चुनें',
    stickerFormat: 'स्टिकर का प्रारूप',
    crateSticker: 'क्रेट स्टिकर (4" x 6")',
    crateDescription: 'प्लास्टिक क्रेट या डिब्बों के लिए',
    pouchSticker: 'छोटे बैग का स्टिकर (2" x 2")',
    pouchDescription: 'पाउच या छोटे पैक के लिए',
    palletSticker: 'बड़ा पैलेट शीट (A4)',
    palletDescription: 'बड़ी मात्रा में ट्रक से भेजने के लिए',
    downloadImage: 'छवि डाउनलोड करें',
    downloadQR: 'QR कोड डाउनलोड करें (PNG)',
    downloadFull: 'पूरा स्टिकर डाउनलोड करें (PNG)',
    verificationLink: 'सीधा सत्यापन लिंक',
    copied: 'लिंक कॉपी हो गया!',
    copyLink: 'लिंक कॉपी करें',
    verified: 'AgriTrace सत्यापित',
    tracked: 'खेत से बाजार तक ट्रैक किया गया',
    scanOrigin: 'मूल स्थान सत्यापित करने के लिए फोन से स्कैन करें',
    stickerInstructions: 'इस स्टिकर को हर क्रेट या बैग पर लगाएँ। खरीदार इसे स्कैन करके आपके खेत की जानकारी, कटाई की तारीख और गुणवत्ता का विवरण देख सकते हैं।',
    qrDownloaded: 'उच्च-रिज़ॉल्यूशन QR कोड PNG डाउनलोड हो गया!',
    stickerDownloaded: 'पैकेजिंग स्टिकर PNG डाउनलोड हो गया!',
    exportError: 'छवि डाउनलोड नहीं हो सकी। कृपया दोबारा प्रयास करें।',
    batch: 'बैच',
    origin: 'मूल स्थान',
    harvest: 'कटाई',
    grade: 'ग्रेड',
    scanAuthenticity: 'प्रामाणिकता सत्यापित करने के लिए फोन कैमरे से स्कैन करें',
    cropQR: 'AGRITRACE फसल QR कोड',
    produce: 'उपज',
    gradeA: 'ग्रेड A',
    farmOrigin: 'खेत का मूल स्थान',
  },
  kn: {
    noCrops: 'QR ಕೋಡ್ ರಚಿಸಲು ಯಾವುದೇ ಬೆಳೆ ಲಭ್ಯವಿಲ್ಲ.',
    packagingQR: 'ಪ್ಯಾಕೇಜಿಂಗ್ QR ಕೋಡ್‌ಗಳು',
    title: 'QR ಕೋಡ್ ಮತ್ತು ಪ್ಯಾಕೇಜಿಂಗ್ ಸ್ಟಿಕ್ಕರ್‌ಗಳನ್ನು ವೀಕ್ಷಿಸಿ',
    description: 'ಖರೀದಿದಾರರು ನಿಮ್ಮ ಕೃಷಿ ಮೂಲವನ್ನು ಪರಿಶೀಲಿಸಲು ಕ್ರೇಟ್‌ಗಳು, ಚೀಲಗಳು ಅಥವಾ ಪೆಟ್ಟಿಗೆಗಳಿಗೆ QR ಕೋಡ್‌ಗಳನ್ನು ಮುದ್ರಿಸಿ ಅಥವಾ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ.',
    print: 'ಮುದ್ರಿಸಿ',
    verifyLive: 'ನೇರ ಪರಿಶೀಲನೆ',
    selectBatch: 'ಬೆಳೆ ಬ್ಯಾಚ್ ಆಯ್ಕೆಮಾಡಿ',
    stickerFormat: 'ಸ್ಟಿಕ್ಕರ್ ಸ್ವರೂಪ',
    crateSticker: 'ಕ್ರೇಟ್ ಸ್ಟಿಕ್ಕರ್ (4" x 6")',
    crateDescription: 'ಪ್ಲಾಸ್ಟಿಕ್ ಕ್ರೇಟ್‌ಗಳು ಅಥವಾ ಪೆಟ್ಟಿಗೆಗಳಿಗೆ',
    pouchSticker: 'ಸಣ್ಣ ಚೀಲದ ಸ್ಟಿಕ್ಕರ್ (2" x 2")',
    pouchDescription: 'ಪೌಚ್‌ಗಳು ಅಥವಾ ಸಣ್ಣ ಪ್ಯಾಕ್‌ಗಳಿಗೆ',
    palletSticker: 'ದೊಡ್ಡ ಪ್ಯಾಲೆಟ್ ಶೀಟ್ (A4)',
    palletDescription: 'ದೊಡ್ಡ ಪ್ರಮಾಣದ ಟ್ರಕ್ ಸಾಗಣೆಗೆ',
    downloadImage: 'ಚಿತ್ರ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ',
    downloadQR: 'QR ಕೋಡ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ (PNG)',
    downloadFull: 'ಪೂರ್ಣ ಸ್ಟಿಕ್ಕರ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ (PNG)',
    verificationLink: 'ನೇರ ಪರಿಶೀಲನಾ ಲಿಂಕ್',
    copied: 'ಲಿಂಕ್ ನಕಲಿಸಲಾಗಿದೆ!',
    copyLink: 'ಲಿಂಕ್ ನಕಲಿಸಿ',
    verified: 'AgriTrace ಪರಿಶೀಲಿಸಲಾಗಿದೆ',
    tracked: 'ಹೊಲದಿಂದ ಮಾರುಕಟ್ಟೆಯವರೆಗೆ ಟ್ರ್ಯಾಕ್ ಮಾಡಲಾಗಿದೆ',
    scanOrigin: 'ಮೂಲವನ್ನು ಪರಿಶೀಲಿಸಲು ಸ್ಮಾರ್ಟ್‌ಫೋನ್‌ನಿಂದ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ',
    stickerInstructions: 'ಈ ಸ್ಟಿಕ್ಕರ್ ಅನ್ನು ಪ್ರತಿ ಕ್ರೇಟ್ ಅಥವಾ ಚೀಲದ ಮೇಲೆ ಅಂಟಿಸಿ. ಖರೀದಿದಾರರು ಸ್ಕ್ಯಾನ್ ಮಾಡಿದಾಗ ನಿಮ್ಮ ಹೊಲದ ಮಾಹಿತಿ, ಕೊಯ್ಲಿನ ದಿನಾಂಕ ಮತ್ತು ಗುಣಮಟ್ಟದ ವಿವರಗಳನ್ನು ನೋಡಬಹುದು.',
    qrDownloaded: 'ಉನ್ನತ-ರೆಸಲ್ಯೂಶನ್ QR ಕೋಡ್ PNG ಡೌನ್‌ಲೋಡ್ ಆಗಿದೆ!',
    stickerDownloaded: 'ಪ್ಯಾಕೇಜಿಂಗ್ ಸ್ಟಿಕ್ಕರ್ PNG ಡೌನ್‌ಲೋಡ್ ಆಗಿದೆ!',
    exportError: 'ಚಿತ್ರವನ್ನು ಡೌನ್‌ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    batch: 'ಬ್ಯಾಚ್',
    origin: 'ಮೂಲ ಸ್ಥಳ',
    harvest: 'ಕೊಯ್ಲು',
    grade: 'ಗುಣಮಟ್ಟದ ಗ್ರೇಡ್',
    scanAuthenticity: 'ಅಸಲಿತನ ಪರಿಶೀಲಿಸಲು ಫೋನ್ ಕ್ಯಾಮೆರಾದಿಂದ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ',
    cropQR: 'AGRITRACE ಬೆಳೆ QR ಕೋಡ್',
    produce: 'ಉತ್ಪನ್ನ',
    gradeA: 'ಗ್ರೇಡ್ A',
    farmOrigin: 'ಕೃಷಿ ಮೂಲ ಸ್ಥಳ',
  },
};

const cropTranslations: Record<string, { hi: string; kn: string }> = {
  rice: { hi: 'चावल', kn: 'ಅಕ್ಕಿ' },
  paddy: { hi: 'धान', kn: 'ಭತ್ತ' },
  wheat: { hi: 'गेहूँ', kn: 'ಗೋಧಿ' },
  maize: { hi: 'मक्का', kn: 'ಮೆಕ್ಕೆಜೋಳ' },
  corn: { hi: 'मक्का', kn: 'ಮೆಕ್ಕೆಜೋಳ' },
  jute: { hi: 'जूट', kn: 'ಸೆಣಬು' },
  banana: { hi: 'केला', kn: 'ಬಾಳೆಹಣ್ಣು' },
  mango: { hi: 'आम', kn: 'ಮಾವು' },
  alphonso: { hi: 'अल्फांसो आम', kn: 'ಅಲ್ಫಾನ್ಸೊ ಮಾವು' },
  basmati: { hi: 'बासमती', kn: 'ಬಾಸ್ಮತಿ' },
  tomato: { hi: 'टमाटर', kn: 'ಟೊಮ್ಯಾಟೊ' },
  tomatoes: { hi: 'टमाटर', kn: 'ಟೊಮ್ಯಾಟೊ' },
  'vine tomatoes': { hi: 'बेल वाले टमाटर', kn: 'ಬಳ್ಳಿ ಟೊಮ್ಯಾಟೊ' },
  cotton: { hi: 'कपास', kn: 'ಹತ್ತಿ' },
  sugarcane: { hi: 'गन्ना', kn: 'ಕಬ್ಬು' },
  coconut: { hi: 'नारियल', kn: 'ತೆಂಗಿನಕಾಯಿ' },
  coffee: { hi: 'कॉफी', kn: 'ಕಾಫಿ' },
  grapes: { hi: 'अंगूर', kn: 'ದ್ರಾಕ್ಷಿ' },
  orange: { hi: 'संतरा', kn: 'ಕಿತ್ತಳೆ' },
  papaya: { hi: 'पपीता', kn: 'ಪಪ್ಪಾಯಿ' },
  potato: { hi: 'आलू', kn: 'ಆಲೂಗಡ್ಡೆ' },
  onion: { hi: 'प्याज', kn: 'ಈರುಳ್ಳಿ' },
  soybean: { hi: 'सोयाबीन', kn: 'ಸೋಯಾಬೀನ್' },
  groundnut: { hi: 'मूंगफली', kn: 'ಕಡಲೆಕಾಯಿ' },
  jowar: { hi: 'ज्वार', kn: 'ಜೋಳ' },
  millet: { hi: 'बाजरा', kn: 'ಸಜ್ಜೆ' },
  ragi: { hi: 'रागी', kn: 'ರಾಗಿ' },
  chickpea: { hi: 'चना', kn: 'ಕಡಲೆ' },
  lentil: { hi: 'मसूर', kn: 'ಮಸೂರ' },
};

const translateCrop = (name: string, language: Language): string => {
  if (language === 'en') return name;

  const key = name.trim().toLowerCase();
  const normalizedKey = key.replace(/[_-]+/g, ' ');
  const direct = cropTranslations[key] || cropTranslations[normalizedKey];

  if (direct) return language === 'hi' ? direct.hi : direct.kn;

  const words = normalizedKey.split(/\s+/);
  if (words.length > 1) {
    return words
      .map((word) => {
        const translation = cropTranslations[word];
        return translation
          ? language === 'hi'
            ? translation.hi
            : translation.kn
          : word;
      })
      .join(' ');
  }

  return name;
};

export const FarmerQRGen: React.FC = () => {
  const {
    batches,
    currentUser,
    selectedBatchId: appSelectedBatchId,
    navigate,
  } = useApp();

  const { language } = useFarmerLanguage();
  const lang: Language = language === 'hi' || language === 'kn' ? language : 'en';
  const t = translations[lang];
  const qrRef = useRef<HTMLDivElement>(null);

  const farmerBatches = batches.filter(
    (batch) =>
      batch.farmerId === currentUser?.id ||
      batch.farmerName === currentUser?.name ||
      batch.farmerId === 'usr-farmer-01'
  );

  const selectableBatches = farmerBatches.length > 0 ? farmerBatches : batches;

  const [selectedBatchId, setSelectedBatchId] = useState<string>(() => {
    if (
      appSelectedBatchId &&
      batches.some(
        (batch) =>
          batch.id === appSelectedBatchId ||
          batch.batchId === appSelectedBatchId
      )
    ) {
      const match = batches.find(
        (batch) =>
          batch.id === appSelectedBatchId ||
          batch.batchId === appSelectedBatchId
      );
      return match?.id || '';
    }

    return selectableBatches[0]?.id || batches[0]?.id || '';
  });

  const [labelSize, setLabelSize] = useState<'crate' | 'pouch' | 'pallet'>('crate');
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (appSelectedBatchId) {
      const match = batches.find(
        (batch) =>
          batch.id === appSelectedBatchId ||
          batch.batchId === appSelectedBatchId
      );
      if (match) setSelectedBatchId(match.id);
    }
  }, [appSelectedBatchId, batches]);

  const selectedBatch =
    batches.find((batch) => batch.id === selectedBatchId) ||
    selectableBatches[0] ||
    batches[0];

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const verificationUrl = selectedBatch
    ? `${origin}/verify/${selectedBatch.batchId}`
    : `${origin}/verify`;

  const getBatchCropName = () => {
    if (!selectedBatch) return t.produce;

    const rawName = selectedBatch.cropVariety
      ? `${selectedBatch.cropVariety} ${selectedBatch.cropName}`
      : selectedBatch.cropName || selectedBatch.name || t.produce;

    return translateCrop(rawName, lang);
  };

  const getBatchOrigin = () =>
    selectedBatch?.farmerLocation ||
    selectedBatch?.farmLocation ||
    t.farmOrigin;

  const getBatchGrade = () => {
    const grade = selectedBatch?.qualityGrade;
    if (!grade) return t.gradeA;

    if (lang === 'en') return grade;

    const match = grade.match(/^grade\s*([a-z0-9]+)$/i);
    if (match) return `${t.grade} ${match[1]}`;

    return grade;
  };

  const handlePrint = () => window.print();

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(verificationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setExportSuccess(t.exportError);
      setTimeout(() => setExportSuccess(null), 3000);
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
      const svgBase64 =
        'data:image/svg+xml;base64,' +
        btoa(unescape(encodeURIComponent(svgXml)));

      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const width = 1200;
        const height = mode === 'full-tag' ? 1560 : 1200;

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');

        if (!ctx) {
          setIsExporting(false);
          setExportSuccess(t.exportError);
          return;
        }

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        if (mode === 'full-tag') {
          ctx.strokeStyle = '#1c1917';
          ctx.lineWidth = 12;
          ctx.strokeRect(30, 30, width - 60, height - 60);

          ctx.fillStyle = '#16a34a';
          ctx.fillRect(40, 40, width - 80, 180);

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 52px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(t.verified.toUpperCase(), width / 2, 120);

          ctx.font = '32px sans-serif';
          ctx.fillStyle = '#dcfce7';
          ctx.fillText(t.tracked, width / 2, 175);

          ctx.fillStyle = '#1c1917';
          ctx.font = 'bold 48px sans-serif';
          ctx.fillText(getBatchCropName().toUpperCase(), width / 2, 290);

          const qrCanvasSize = 750;
          ctx.drawImage(img, (width - qrCanvasSize) / 2, 340, qrCanvasSize, qrCanvasSize);

          ctx.strokeStyle = '#bbf7d0';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(80, 1160);
          ctx.lineTo(width - 80, 1160);
          ctx.stroke();

          ctx.fillStyle = '#1c1917';
          ctx.font = 'bold 36px monospace';
          ctx.fillText(`${t.batch.toUpperCase()}: ${selectedBatch.batchId}`, width / 2, 1230);

          ctx.fillStyle = '#78716c';
          ctx.font = '32px sans-serif';
          ctx.fillText(`${t.origin}: ${getBatchOrigin()}`, width / 2, 1290);
          ctx.fillText(
            `${t.harvest}: ${selectedBatch.harvestDate || '-'} • ${t.grade}: ${getBatchGrade()}`,
            width / 2,
            1350
          );

          ctx.fillStyle = '#16a34a';
          ctx.font = 'bold 28px sans-serif';
          ctx.fillText(t.scanAuthenticity.toUpperCase(), width / 2, 1430);

          ctx.fillStyle = '#78716c';
          ctx.font = '22px monospace';
          ctx.fillText(verificationUrl, width / 2, 1490);
        } else {
          const padding = 120;
          const qrCanvasSize = width - padding * 2;

          ctx.drawImage(img, padding, padding, qrCanvasSize, qrCanvasSize);

          ctx.fillStyle = '#16a34a';
          ctx.font = 'bold 32px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(t.cropQR, width / 2, 75);

          ctx.fillStyle = '#1c1917';
          ctx.font = 'bold 36px monospace';
          ctx.fillText(selectedBatch.batchId, width / 2, width - 40);
        }

        try {
          const pngDataUrl = canvas.toDataURL('image/png', 1);
          const link = document.createElement('a');
          const filePrefix = (selectedBatch.batchId || 'AgriTrace').replace(/[^a-zA-Z0-9-_]/g, '_');

          link.download =
            mode === 'full-tag'
              ? `${filePrefix}_Packaging_Sticker.png`
              : `${filePrefix}_QR.png`;

          link.href = pngDataUrl;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          setExportSuccess(mode === 'full-tag' ? t.stickerDownloaded : t.qrDownloaded);
        } catch (error) {
          console.error('Error creating QR PNG:', error);
          setExportSuccess(t.exportError);
        }

        setTimeout(() => setExportSuccess(null), 3000);
        setIsExporting(false);
      };

      img.onerror = () => {
        setIsExporting(false);
        setExportSuccess(t.exportError);
        setTimeout(() => setExportSuccess(null), 3000);
      };

      img.src = svgBase64;
    } catch (error) {
      console.error('Error exporting QR PNG:', error);
      setIsExporting(false);
      setExportSuccess(t.exportError);
      setTimeout(() => setExportSuccess(null), 3000);
    }
  };

  const qrSize = labelSize === 'pallet' ? 220 : labelSize === 'crate' ? 200 : 160;

  if (!selectedBatch) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-[#78716c]">
        {t.noCrops}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <div className="flex items-center justify-start">
        <BackButton fallback="/farmer/dashboard" />
      </div>

      <div className="bg-white border border-[#bbf7d0] rounded-xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#16a34a]" />
            <span className="text-[11px] font-semibold text-[#16a34a] uppercase tracking-wider">
              {t.packagingQR}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-[#1c1917] flex items-center gap-2">
            <QrCode className="w-6 h-6 text-[#16a34a]" />
            <span>{t.title}</span>
          </h1>

          <p className="text-xs text-[#78716c]">{t.description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2 bg-stone-50 hover:bg-[#f0fdf4] border border-[#bbf7d0] text-[#1c1917] font-semibold text-xs rounded-lg transition flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#16a34a]" />
            <span>{t.print}</span>
          </button>

          <button
            type="button"
            onClick={handleOpenVerification}
            className="px-3.5 py-2 bg-[#16a34a] hover:bg-[#15803d] text-white font-semibold text-xs rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>{t.verifyLive}</span>
          </button>
        </div>
      </div>

      {exportSuccess && (
        <div className="p-3 bg-[#f0fdf4] border border-[#22c55e] rounded-lg text-xs text-[#16a34a] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="font-bold">{exportSuccess}</span>
          </div>
          <button
            type="button"
            onClick={() => setExportSuccess(null)}
            className="font-bold text-xs cursor-pointer"
            aria-label="Close notification"
          >
            ✕
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-[#bbf7d0] shadow-xs space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1c1917] mb-1.5">
              {t.selectBatch}
            </label>
            <select
              value={selectedBatch.id}
              onChange={(event) => setSelectedBatchId(event.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-[#bbf7d0] rounded-lg focus:border-[#16a34a] outline-none font-medium text-stone-900 cursor-pointer"
            >
              {selectableBatches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {translateCrop(batch.cropName || batch.name || t.produce, lang)} — {batch.batchId}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1c1917] mb-1.5">
              {t.stickerFormat}
            </label>
            <div className="space-y-1.5">
              {[
                { id: 'crate' as const, label: t.crateSticker, description: t.crateDescription },
                { id: 'pouch' as const, label: t.pouchSticker, description: t.pouchDescription },
                { id: 'pallet' as const, label: t.palletSticker, description: t.palletDescription },
              ].map((size) => (
                <button
                  key={size.id}
                  type="button"
                  onClick={() => setLabelSize(size.id)}
                  className={`w-full p-2.5 rounded-lg border text-left transition text-xs cursor-pointer ${
                    labelSize === size.id
                      ? 'bg-[#dcfce7] border-[#22c55e] text-[#16a34a] font-semibold'
                      : 'bg-stone-50 border-stone-200 text-[#78716c] hover:border-stone-300'
                  }`}
                >
                  <div className="font-bold text-[#1c1917]">{size.label}</div>
                  <div className="text-[10px] text-[#78716c]">{size.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-stone-100 space-y-2">
            <label className="block text-xs font-semibold text-[#1c1917]">
              {t.downloadImage}
            </label>
            <button
              type="button"
              onClick={() => handleExportQRPNG('qr-only')}
              disabled={isExporting}
              className="w-full py-2 px-3 bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-semibold rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.downloadQR}</span>
            </button>
            <button
              type="button"
              onClick={() => handleExportQRPNG('full-tag')}
              disabled={isExporting}
              className="w-full py-2 px-3 bg-stone-50 hover:bg-[#f0fdf4] border border-[#bbf7d0] text-[#1c1917] text-xs font-semibold rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ImageIcon className="w-3.5 h-3.5 text-[#16a34a]" />
              <span>{t.downloadFull}</span>
            </button>
          </div>

          <div className="pt-2 border-t border-stone-100 space-y-2">
            <label className="block text-xs font-semibold text-[#1c1917]">
              {t.verificationLink}
            </label>
            <div className="p-2 bg-stone-50 border border-stone-200 rounded font-mono text-[11px] text-[#78716c] break-all select-all">
              {verificationUrl}
            </div>
            <button
              type="button"
              onClick={handleCopyLink}
              className={`w-full py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                copied
                  ? 'bg-[#dcfce7] border-[#22c55e] text-[#16a34a]'
                  : 'border-[#bbf7d0] hover:bg-stone-50 text-[#1c1917]'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? t.copied : t.copyLink}</span>
            </button>
          </div>
        </div>

        <div className="md:col-span-2 flex flex-col items-center justify-center p-6 sm:p-8 bg-[#f0fdf4]/40 rounded-xl border border-[#bbf7d0] space-y-4">
          <div className="bg-white border-2 border-stone-800 rounded-lg p-5 shadow-sm max-w-sm w-full space-y-4 text-[#1c1917]">
            <div className="flex items-center justify-between border-b-2 border-stone-800 pb-2.5 gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-[#16a34a] text-white rounded">
                  <Leaf className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider">
                    {t.verified}
                  </div>
                  <div className="text-[9px] text-[#78716c]">{t.tracked}</div>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold bg-stone-100 px-1.5 py-0.5 rounded border border-stone-300">
                {selectedBatch.batchId}
              </span>
            </div>

            <div className="text-center space-y-0.5">
              <h2 className="text-lg font-bold">
                {getBatchCropName()}
              </h2>
              <p className="text-[11px] text-[#78716c]">
                {getBatchOrigin()} • {getBatchGrade()}
              </p>
            </div>

            <div ref={qrRef} className="flex items-center justify-center p-3 bg-white border border-stone-200 rounded mx-auto">
              <QRCodeSVG value={verificationUrl} size={qrSize} level="H" includeMargin={false} />
            </div>

            <div className="text-center border-t border-stone-200 pt-2 space-y-1">
              <div className="text-[10px] font-bold text-[#16a34a] uppercase tracking-wider">
                {t.scanOrigin}
              </div>
              <div className="text-[9px] text-stone-400 font-mono break-all">
                {verificationUrl}
              </div>
            </div>
          </div>

          <p className="text-xs text-[#78716c] text-center max-w-md">
            {t.stickerInstructions}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FarmerQRGen;

import React, { useState } from 'react';
import {
  Package,
  Sprout,
  CheckCircle2,
  TrendingUp,
  PlusCircle,
  QrCode,
  CloudSun,
  Scale,
  ChevronRight,
  Truck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { QRCodeModal } from '../common/QRCodeModal';
import { ProduceBatch } from '../../types/produce';
import { useFarmerLanguage } from '../../context/FarmerLanguageContext';

type FarmerLanguage = 'en' | 'hi' | 'kn';

const dashboardTranslations = {
  en: {
    dashboard: 'Farmer Dashboard',
    addCrop: 'Add New Crop',
    myCrops: 'My Crops',
    transfer: 'Transfer Produce',
    marketPrices: 'Check Market Prices',
    recommendation: 'Crop Recommendation',
    qrCode: 'View QR Code',
    activeHarvest: 'Active Harvest Lots',
    total: 'total',
    recorded: 'Recorded on system',
    readyDispatch: 'Ready for Dispatch',
    crops: 'crops',
    awaitingPickup: 'Awaiting transporter pickup',
    totalEarnings: 'Total Crop Earnings',
    payouts: 'Direct farmer payouts',
    revenueShare: 'Farmer Revenue Share',
    traditionalAverage: 'vs ~24% traditional mandi average',
    harvestedCrops: 'My Harvested Crops',
    harvestedDescription: 'Crops logged and ready for market sale or transporter handover',
    fullDirectory: 'View full directory',
    batchId: 'Batch ID',
    cropVariety: 'Crop & Variety',
    harvestDate: 'Harvest Date',
    quantity: 'Quantity',
    qualityGrade: 'Quality Grade',
    myPrice: 'My Price',
    status: 'Status',
    actions: 'Actions',
    viewPackagingQR: 'View Packaging QR',
    dispatch: 'Dispatch',
    verify: 'Verify',
    handover: 'Produce Handover to Transporters',
    handoverDescription: 'Handover batches to transport partners for safe cold delivery',
    transporter: 'Transporter',
    vehicle: 'Vehicle',
    regionalAdvisory: 'Regional Agronomic Advisory',
    agriculturalCluster: 'Ratnagiri & Konkan agricultural cluster',
    temperature: 'Temperature',
    humidity: 'Humidity',
    harvestWindow: 'Harvest Window',
    optimal: 'Optimal',
    pluckingAdvisory: 'Plucking Advisory:',
    pluckingText: 'Low ambient moisture makes current morning conditions ideal for plucking export-grade mangoes and grains with zero fungal rot risk.',
    mandiIntelligence: 'Mandi Intelligence:',
    mandiText: 'Vashi APMC experiencing arrival surges from unorganized belts. AgriTrace contract direct forward dispatch yields ~18% higher realization.',
    forecast: 'Check 30-Day Mandi Price Forecast',
    statusUpdated: 'Batch {id} status updated to "Ready for Dispatch". Logistics carriers notified.',
    kg: 'kg',
    gradeA: 'Grade A',
    close: 'Close',
    unknownCrop: 'Crop',
  },
  hi: {
    dashboard: 'किसान डैशबोर्ड',
    addCrop: 'नई फसल जोड़ें',
    myCrops: 'मेरी फसलें',
    transfer: 'उपज स्थानांतरित करें',
    marketPrices: 'बाज़ार भाव देखें',
    recommendation: 'फसल सुझाव',
    qrCode: 'QR कोड देखें',
    activeHarvest: 'सक्रिय फसल खेप',
    total: 'कुल',
    recorded: 'सिस्टम में दर्ज',
    readyDispatch: 'भेजने के लिए तैयार',
    crops: 'फसलें',
    awaitingPickup: 'परिवहनकर्ता द्वारा उठाए जाने की प्रतीक्षा',
    totalEarnings: 'फसल से कुल कमाई',
    payouts: 'किसान को सीधे भुगतान',
    revenueShare: 'किसान की आय में हिस्सेदारी',
    traditionalAverage: 'पारंपरिक मंडी के लगभग 24% औसत की तुलना में',
    harvestedCrops: 'मेरी काटी गई फसलें',
    harvestedDescription: 'बाज़ार में बिक्री या परिवहनकर्ता को सौंपने के लिए दर्ज फसलें',
    fullDirectory: 'सभी फसलें देखें',
    batchId: 'खेप ID',
    cropVariety: 'फसल और किस्म',
    harvestDate: 'कटाई की तारीख',
    quantity: 'मात्रा',
    qualityGrade: 'गुणवत्ता श्रेणी',
    myPrice: 'मेरा भाव',
    status: 'स्थिति',
    actions: 'कार्रवाई',
    viewPackagingQR: 'पैकेज QR देखें',
    dispatch: 'भेजें',
    verify: 'सत्यापित करें',
    handover: 'परिवहनकर्ताओं को उपज सौंपें',
    handoverDescription: 'सुरक्षित शीत परिवहन के लिए खेप परिवहन साझेदारों को सौंपें',
    transporter: 'परिवहनकर्ता',
    vehicle: 'वाहन',
    regionalAdvisory: 'क्षेत्रीय कृषि सलाह',
    agriculturalCluster: 'रत्नागिरी और कोंकण कृषि क्षेत्र',
    temperature: 'तापमान',
    humidity: 'आर्द्रता',
    harvestWindow: 'कटाई का समय',
    optimal: 'उत्तम',
    pluckingAdvisory: 'तोड़ाई संबंधी सलाह:',
    pluckingText: 'कम नमी के कारण सुबह का वर्तमान मौसम निर्यात-गुणवत्ता वाले आम और अनाज की कटाई के लिए अनुकूल है।',
    mandiIntelligence: 'मंडी जानकारी:',
    mandiText: 'वाशी APMC में आवक बढ़ रही है। AgriTrace के माध्यम से सीधे अग्रिम प्रेषण से लगभग 18% अधिक मूल्य मिल सकता है।',
    forecast: '30-दिन का मंडी मूल्य पूर्वानुमान देखें',
    statusUpdated: 'खेप {id} की स्थिति "भेजने के लिए तैयार" कर दी गई है। लॉजिस्टिक्स वाहकों को सूचित किया गया।',
    kg: 'किग्रा',
    gradeA: 'श्रेणी A',
    close: 'बंद करें',
    unknownCrop: 'फसल',
  },
  kn: {
    dashboard: 'ರೈತರ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    addCrop: 'ಹೊಸ ಬೆಳೆ ಸೇರಿಸಿ',
    myCrops: 'ನನ್ನ ಬೆಳೆಗಳು',
    transfer: 'ಉತ್ಪನ್ನ ವರ್ಗಾವಣೆ',
    marketPrices: 'ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳನ್ನು ನೋಡಿ',
    recommendation: 'ಬೆಳೆ ಶಿಫಾರಸು',
    qrCode: 'QR ಕೋಡ್ ವೀಕ್ಷಿಸಿ',
    activeHarvest: 'ಸಕ್ರಿಯ ಕೊಯ್ಲಿನ ಸರಕುಗಳು',
    total: 'ಒಟ್ಟು',
    recorded: 'ವ್ಯವಸ್ಥೆಯಲ್ಲಿ ದಾಖಲಾಗಿದೆ',
    readyDispatch: 'ರವಾನೆಗೆ ಸಿದ್ಧ',
    crops: 'ಬೆಳೆಗಳು',
    awaitingPickup: 'ಸಾಗಣೆದಾರರ ಆಗಮನಕ್ಕಾಗಿ ಕಾಯುತ್ತಿದೆ',
    totalEarnings: 'ಬೆಳೆಗಳಿಂದ ಒಟ್ಟು ಗಳಿಕೆ',
    payouts: 'ರೈತರಿಗೆ ನೇರ ಪಾವತಿ',
    revenueShare: 'ರೈತರ ಆದಾಯದ ಪಾಲು',
    traditionalAverage: 'ಸಾಂಪ್ರದಾಯಿಕ ಮಂಡಿಯ ಸುಮಾರು 24% ಸರಾಸರಿಗೆ ಹೋಲಿಸಿದರೆ',
    harvestedCrops: 'ನನ್ನ ಕೊಯ್ಲು ಮಾಡಿದ ಬೆಳೆಗಳು',
    harvestedDescription: 'ಮಾರುಕಟ್ಟೆ ಮಾರಾಟ ಅಥವಾ ಸಾಗಣೆದಾರರಿಗೆ ಹಸ್ತಾಂತರಿಸಲು ದಾಖಲಿಸಿದ ಬೆಳೆಗಳು',
    fullDirectory: 'ಎಲ್ಲಾ ಬೆಳೆಗಳನ್ನು ನೋಡಿ',
    batchId: 'ಬ್ಯಾಚ್ ID',
    cropVariety: 'ಬೆಳೆ ಮತ್ತು ತಳಿ',
    harvestDate: 'ಕೊಯ್ಲಿನ ದಿನಾಂಕ',
    quantity: 'ಪ್ರಮಾಣ',
    qualityGrade: 'ಗುಣಮಟ್ಟದ ವರ್ಗ',
    myPrice: 'ನನ್ನ ಬೆಲೆ',
    status: 'ಸ್ಥಿತಿ',
    actions: 'ಕ್ರಿಯೆಗಳು',
    viewPackagingQR: 'ಪ್ಯಾಕೇಜ್ QR ವೀಕ್ಷಿಸಿ',
    dispatch: 'ರವಾನಿಸಿ',
    verify: 'ಪರಿಶೀಲಿಸಿ',
    handover: 'ಸಾಗಣೆದಾರರಿಗೆ ಉತ್ಪನ್ನ ಹಸ್ತಾಂತರ',
    handoverDescription: 'ಸುರಕ್ಷಿತ ಶೀತ ಸಾಗಣೆಗಾಗಿ ಬ್ಯಾಚ್‌ಗಳನ್ನು ಸಾಗಣೆ ಪಾಲುದಾರರಿಗೆ ಹಸ್ತಾಂತರಿಸಿ',
    transporter: 'ಸಾಗಣೆದಾರ',
    vehicle: 'ವಾಹನ',
    regionalAdvisory: 'ಪ್ರಾದೇಶಿಕ ಕೃಷಿ ಸಲಹೆ',
    agriculturalCluster: 'ರತ್ನಗಿರಿ ಮತ್ತು ಕೊಂಕಣ ಕೃಷಿ ಪ್ರದೇಶ',
    temperature: 'ತಾಪಮಾನ',
    humidity: 'ಆರ್ದ್ರತೆ',
    harvestWindow: 'ಕೊಯ್ಲಿನ ಸಮಯ',
    optimal: 'ಸೂಕ್ತ',
    pluckingAdvisory: 'ಕೊಯ್ಲಿನ ಸಲಹೆ:',
    pluckingText: 'ಕಡಿಮೆ ತೇವಾಂಶದಿಂದಾಗಿ ಬೆಳಗಿನ ವಾತಾವರಣವು ರಫ್ತು ಗುಣಮಟ್ಟದ ಮಾವು ಮತ್ತು ಧಾನ್ಯಗಳ ಕೊಯ್ಲಿಗೆ ಸೂಕ್ತವಾಗಿದೆ.',
    mandiIntelligence: 'ಮಂಡಿ ಮಾಹಿತಿ:',
    mandiText: 'ವಾಶಿ APMC ಮಾರುಕಟ್ಟೆಗೆ ಹೆಚ್ಚಿನ ಸರಕುಗಳು ಬರುತ್ತಿವೆ. AgriTrace ಮೂಲಕ ನೇರ ಮುಂಗಡ ರವಾನೆಯಿಂದ ಸುಮಾರು 18% ಹೆಚ್ಚು ಆದಾಯ ದೊರೆಯಬಹುದು.',
    forecast: '30 ದಿನಗಳ ಮಂಡಿ ಬೆಲೆ ಮುನ್ಸೂಚನೆ ನೋಡಿ',
    statusUpdated: 'ಬ್ಯಾಚ್ {id} ಸ್ಥಿತಿಯನ್ನು "ರವಾನೆಗೆ ಸಿದ್ಧ" ಎಂದು ನವೀಕರಿಸಲಾಗಿದೆ. ಸಾಗಣೆ ವ್ಯವಸ್ಥೆಗೆ ಮಾಹಿತಿ ನೀಡಲಾಗಿದೆ.',
    kg: 'ಕೆಜಿ',
    gradeA: 'ವರ್ಗ A',
    close: 'ಮುಚ್ಚಿ',
    unknownCrop: 'ಬೆಳೆ',
  },
} as const;

const cropTranslations: Record<string, { hi: string; kn: string }> = {
  mango: { hi: 'आम', kn: 'ಮಾವು' },
  alphonso: { hi: 'अल्फांसो', kn: 'ಅಲ್ಫಾನ್ಸೊ' },
  kesar: { hi: 'केसर', kn: 'ಕೇಸರ್' },
  banana: { hi: 'केला', kn: 'ಬಾಳೆಹಣ್ಣು' },
  rice: { hi: 'चावल', kn: 'ಅಕ್ಕಿ' },
  paddy: { hi: 'धान', kn: 'ಭತ್ತ' },
  wheat: { hi: 'गेहूँ', kn: 'ಗೋಧಿ' },
  tomato: { hi: 'टमाटर', kn: 'ಟೊಮೇಟೊ' },
  onion: { hi: 'प्याज़', kn: 'ಈರುಳ್ಳಿ' },
  potato: { hi: 'आलू', kn: 'ಆಲೂಗಡ್ಡೆ' },
  cotton: { hi: 'कपास', kn: 'ಹತ್ತಿ' },
  sugarcane: { hi: 'गन्ना', kn: 'ಕಬ್ಬು' },
  grapes: { hi: 'अंगूर', kn: 'ದ್ರಾಕ್ಷಿ' },
  grape: { hi: 'अंगूर', kn: 'ದ್ರಾಕ್ಷಿ' },
  orange: { hi: 'संतरा', kn: 'ಕಿತ್ತಳೆ' },
  pomegranate: { hi: 'अनार', kn: 'ದಾಳಿಂಬೆ' },
  coconut: { hi: 'नारियल', kn: 'ತೆಂಗಿನಕಾಯಿ' },
  chilli: { hi: 'मिर्च', kn: 'ಮೆಣಸಿನಕಾಯಿ' },
  chili: { hi: 'मिर्च', kn: 'ಮೆಣಸಿನಕಾಯಿ' },
  turmeric: { hi: 'हल्दी', kn: 'ಅರಿಶಿನ' },
  groundnut: { hi: 'मूंगफली', kn: 'ಕಡಲೆಕಾಯಿ' },
  maize: { hi: 'मक्का', kn: 'ಮೆಕ್ಕೆಜೋಳ' },
  corn: { hi: 'मक्का', kn: 'ಮೆಕ್ಕೆಜೋಳ' },
  lentil: { hi: 'मसूर', kn: 'ಮಸೂರ ಬೇಳೆ' },
  chickpea: { hi: 'चना', kn: 'ಕಡಲೆ' },
  garlic: { hi: 'लहसुन', kn: 'ಬೆಳ್ಳುಳ್ಳಿ' },
  ginger: { hi: 'अदरक', kn: 'ಶುಂಠಿ' },
  apple: { hi: 'सेब', kn: 'ಸೇಬು' },
  papaya: { hi: 'पपीता', kn: 'ಪಪ್ಪಾಯಿ' },
  guava: { hi: 'अमरूद', kn: 'ಪೇರಲ ಹಣ್ಣು' },
  watermelon: { hi: 'तरबूज', kn: 'ಕಲ್ಲಂಗಡಿ' },
  lemon: { hi: 'नींबू', kn: 'ನಿಂಬೆಹಣ್ಣು' },
  soybean: { hi: 'सोयाबीन', kn: 'ಸೋಯಾಬೀನ್' },
};

const statusTranslations: Record<string, { hi: string; kn: string }> = {
  Registered: { hi: 'पंजीकृत', kn: 'ನೋಂದಾಯಿಸಲಾಗಿದೆ' },
  'Ready for Dispatch': { hi: 'भेजने के लिए तैयार', kn: 'ರವಾನೆಗೆ ಸಿದ್ಧ' },
  'With Distributor': { hi: 'वितरक के पास', kn: 'ವಿತರಕರ ಬಳಿ' },
  'In Transit': { hi: 'रास्ते में', kn: 'ಸಾಗಣೆಯಲ್ಲಿದೆ' },
  'On Retail Shelf': { hi: 'खुदरा दुकान में', kn: 'ಚಿಲ್ಲರೆ ಅಂಗಡಿಯಲ್ಲಿ' },
  'Sold to Consumer': { hi: 'उपभोक्ता को बेचा गया', kn: 'ಗ್ರಾಹಕರಿಗೆ ಮಾರಾಟವಾಗಿದೆ' },
  Completed: { hi: 'पूरा हुआ', kn: 'ಪೂರ್ಣಗೊಂಡಿದೆ' },
  Pending: { hi: 'लंबित', kn: 'ಬಾಕಿಯಿದೆ' },
  Verified: { hi: 'सत्यापित', kn: 'ಪರಿಶೀಲಿಸಲಾಗಿದೆ' },
  Rejected: { hi: 'अस्वीकृत', kn: 'ತಿರಸ್ಕರಿಸಲಾಗಿದೆ' },
  'In Review': { hi: 'समीक्षाधीन', kn: 'ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ' },
};

const gradeTranslations: Record<string, { hi: string; kn: string }> = {
  'Grade A': { hi: 'श्रेणी A', kn: 'ವರ್ಗ A' },
  'Grade B': { hi: 'श्रेणी B', kn: 'ವರ್ಗ B' },
  'Grade C': { hi: 'श्रेणी C', kn: 'ವರ್ಗ C' },
  A: { hi: 'श्रेणी A', kn: 'ವರ್ಗ A' },
  B: { hi: 'श्रेणी B', kn: 'ವರ್ಗ B' },
  C: { hi: 'श्रेणी C', kn: 'ವರ್ಗ C' },
  Premium: { hi: 'प्रीमियम', kn: 'ಪ್ರೀಮಿಯಂ' },
  Standard: { hi: 'मानक', kn: 'ಪ್ರಮಾಣಿತ' },
};

const varietyTranslations: Record<string, { hi: string; kn: string }> = {
  Alphonso: { hi: 'अल्फांसो', kn: 'ಅಲ್ಫಾನ್ಸೊ' },
  Kesar: { hi: 'केसर', kn: 'ಕೇಸರ್' },
  Banganapalli: { hi: 'बंगनपल्ली', kn: 'ಬಂಗನಪಲ್ಲಿ' },
  Dasheri: { hi: 'दशहरी', kn: 'ದಶಹರಿ' },
  Langra: { hi: 'लंगड़ा', kn: 'ಲಂಗ್ಡಾ' },
  Ratna: { hi: 'रत्ना', kn: 'ರತ್ನಾ' },
  Totapuri: { hi: 'तोतापुरी', kn: 'ತೋತಾಪುರಿ' },
  Organic: { hi: 'जैविक', kn: 'ಸಾವಯವ' },
  Hybrid: { hi: 'संकर', kn: 'ಹೈಬ್ರಿಡ್' },
  Local: { hi: 'स्थानीय', kn: 'ಸ್ಥಳೀಯ' },
};

function translateValue(
  value: string | undefined | null,
  language: FarmerLanguage,
  dictionary: Record<string, { hi: string; kn: string }>,
): string {
  if (!value) return '';

  if (language === 'en') return value;

  const exactMatch = dictionary[value];
  if (exactMatch) return exactMatch[language];

  const lowerMatch = Object.keys(dictionary).find(
    (key) => key.toLowerCase() === value.toLowerCase(),
  );

  if (lowerMatch) return dictionary[lowerMatch][language];

  return value
    .split(/(\s+|-|\/)/)
    .map((part) => {
      const match = Object.keys(dictionary).find(
        (key) => key.toLowerCase() === part.toLowerCase(),
      );
      return match ? dictionary[match][language] : part;
    })
    .join('');
}

function translateCropName(
  value: string | undefined | null,
  language: FarmerLanguage,
  unknownLabel: string,
): string {
  if (!value) return unknownLabel;
  return translateValue(value, language, cropTranslations) || unknownLabel;
}

function translateStatus(
  value: string | undefined | null,
  language: FarmerLanguage,
): string {
  if (!value) return '';
  return translateValue(value, language, statusTranslations);
}

function translateGrade(
  value: string | undefined | null,
  language: FarmerLanguage,
  fallback: string,
): string {
  if (!value) return fallback;
  return translateValue(value, language, gradeTranslations);
}

function translateVariety(
  value: string | undefined | null,
  language: FarmerLanguage,
): string {
  if (!value) return '';
  return translateValue(value, language, varietyTranslations);
}

export const FarmerDashboard: React.FC = () => {
  const {
    currentUser,
    navigate,
    batches,
    setSelectedBatchId,
    navigateToVerification,
  } = useApp();

  const { language } = useFarmerLanguage();
  const lang = language as FarmerLanguage;
  const t = dashboardTranslations[lang] || dashboardTranslations.en;

  const [selectedQRBatch, setSelectedQRBatch] = useState<ProduceBatch | null>(null);
  const [statusUpdateNotice, setStatusUpdateNotice] = useState<string | null>(null);

  const farmerName = currentUser?.name || 'Ramesh Patil';
  const farmerOrg = currentUser?.organization || 'Sahyadri Organic Producers Co-op';
  const farmerLocation = currentUser?.location || 'Ratnagiri, Maharashtra, India';

  const farmerBatches = batches.filter(
    (b) =>
      b.farmerId === currentUser?.id ||
      b.farmerName === currentUser?.name ||
      b.farmerId === 'usr-farmer-01',
  );

  const displayBatches = farmerBatches.length > 0 ? farmerBatches : batches;

  const totalBatches = displayBatches.length;

  const activeBatches = displayBatches.filter(
    (b) => b.status !== 'Sold to Consumer' && b.status !== 'Completed',
  ).length;

  const readyForDispatchCount = displayBatches.filter(
    (b) => b.status === 'Ready for Dispatch' || b.status === 'Registered',
  ).length;

  const totalRevenue = displayBatches.reduce((sum, b) => {
    const qty = b.quantity || b.quantityKg || 500;
    const price = b.farmgatePrice || b.pricing?.farmerPrice || 80;
    return sum + qty * price;
  }, 0);

  const formattedRevenue = `â‚¹${totalRevenue.toLocaleString('en-IN')}`;

  const handleInspectBatch = (batchId: string) => {
    const existing = batches.find((b) => b.batchId === batchId || b.id === batchId);
    if (existing) {
      setSelectedBatchId(existing.id);
    }
    navigate('/farmer/my-produce');
  };

  const handleShowQR = (batch: ProduceBatch) => {
    setSelectedQRBatch(batch);
  };

  const handleQuickDispatch = (batchId: string) => {
    const batch = batches.find(
      (item) => item.batchId === batchId || item.id === batchId,
    );

    if (batch) {
      batch.status = 'Ready for Dispatch';
      setStatusUpdateNotice(
        t.statusUpdated.replace('{id}', batch.batchId),
      );
      setTimeout(() => setStatusUpdateNotice(null), 4000);
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      {statusUpdateNotice && (
        <div
          role="status"
          className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-lg flex items-center justify-between text-xs font-semibold shadow-xs"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{statusUpdateNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusUpdateNotice(null)}
            className="p-1 hover:bg-emerald-100 rounded text-emerald-800 cursor-pointer"
            aria-label={t.close}
            title={t.close}
          >
            âœ•
          </button>
        </div>
      )}

      <div className="bg-white border border-stone-200 rounded-xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-700" />
              <span className="text-xs font-semibold text-emerald-900 uppercase tracking-wider">
                {t.dashboard}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
              {farmerName}
            </h1>
            <p className="text-xs sm:text-sm text-stone-600">
              {farmerOrg} â€¢ <span className="text-stone-500">{farmerLocation}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/farmer/register-produce')}
              className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm rounded-md transition shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.addCrop}</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/farmer/my-produce')}
              className="px-3.5 py-2.5 bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-semibold text-xs sm:text-sm rounded-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <Package className="w-4 h-4 text-emerald-800" />
              <span>{t.myCrops} ({displayBatches.length})</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/farmer/transfers')}
              className="px-3.5 py-2.5 bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-semibold text-xs sm:text-sm rounded-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <Truck className="w-4 h-4 text-emerald-800" />
              <span>{t.transfer}</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/farmer/price-prediction')}
              className="px-3.5 py-2.5 bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-semibold text-xs sm:text-sm rounded-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <TrendingUp className="w-4 h-4 text-emerald-800" />
              <span>{t.marketPrices}</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/farmer/crop-recommendation')}
              className="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-semibold text-xs sm:text-sm rounded-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <Sprout className="w-4 h-4" />
              <span>{t.recommendation}</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/farmer/qr-codes')}
              className="px-3.5 py-2.5 bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-semibold text-xs sm:text-sm rounded-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-emerald-800" />
              <span>{t.qrCode}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-stone-200">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            {t.activeHarvest}
          </div>
          <div className="text-2xl font-bold text-stone-900 mt-1 font-mono">
            {activeBatches}{' '}
            <span className="text-xs font-sans text-stone-500 font-normal">
              / {totalBatches} {t.total}
            </span>
          </div>
          <div className="text-[11px] text-stone-500 mt-0.5">{t.recorded}</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-stone-200">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            {t.readyDispatch}
          </div>
          <div className="text-2xl font-bold text-stone-900 mt-1 font-mono">
            {readyForDispatchCount}{' '}
            <span className="text-xs font-sans text-stone-500 font-normal">
              {t.crops}
            </span>
          </div>
          <div className="text-[11px] text-emerald-800 font-medium mt-0.5">
            {t.awaitingPickup}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-stone-200">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            {t.totalEarnings}
          </div>
          <div className="text-2xl font-bold text-emerald-950 mt-1 font-mono">
            {formattedRevenue}
          </div>
          <div className="text-[11px] text-stone-500 mt-0.5">{t.payouts}</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-stone-200">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            {t.revenueShare}
          </div>
          <div className="text-2xl font-bold text-stone-900 mt-1 font-mono">
            62.4%
          </div>
          <div className="text-[11px] text-stone-500 mt-0.5">
            {t.traditionalAverage}
          </div>
        </div>
      </div>

      <section className="bg-white rounded-xl border border-stone-200 p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-stone-900">{t.harvestedCrops}</h2>
            <p className="text-xs text-stone-500">{t.harvestedDescription}</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/farmer/my-produce')}
            className="text-xs font-semibold text-emerald-900 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{t.fullDirectory} ({displayBatches.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto border border-stone-200 rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-700 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">{t.batchId}</th>
                <th className="py-3 px-4">{t.cropVariety}</th>
                <th className="py-3 px-4">{t.harvestDate}</th>
                <th className="py-3 px-4 text-right">{t.quantity}</th>
                <th className="py-3 px-4">{t.qualityGrade}</th>
                <th className="py-3 px-4 text-right">{t.myPrice}</th>
                <th className="py-3 px-4 text-center">{t.status}</th>
                <th className="py-3 px-4 text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 text-stone-800">
              {displayBatches.map((batch) => {
                const cropName = translateCropName(
                  batch.cropName || batch.name,
                  lang,
                  t.unknownCrop,
                );
                const variety = translateVariety(
                  batch.cropVariety || batch.variety,
                  lang,
                );
                const qualityGrade = translateGrade(
                  batch.qualityGrade || batch.quality?.grade,
                  lang,
                  t.gradeA,
                );
                const translatedStatus = translateStatus(batch.status, lang);
                const quantityUnit =
                  (batch.unit || 'kg').toLowerCase() === 'kg'
                    ? t.kg
                    : batch.unit || t.kg;


                return (
                  <tr key={batch.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-stone-900 whitespace-nowrap">
                      {batch.batchId}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-stone-900">{cropName}</div>
                      {variety && (
                        <div className="text-[11px] text-stone-500">{variety}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-stone-600 whitespace-nowrap">
                      {batch.harvestDate || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-medium text-stone-900 whitespace-nowrap">
                      {batch.quantity || batch.quantityKg} {quantityUnit}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-stone-100 text-stone-800 border border-stone-200">
                        {qualityGrade}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-950 whitespace-nowrap">
                      ₹{batch.farmgatePrice || batch.pricing?.farmerPrice || '—'}/{t.kg}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-stone-100 text-stone-700 border border-stone-200">
                        {translatedStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleShowQR(batch)}
                          className="px-2.5 py-1 bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 rounded text-[11px] font-medium transition cursor-pointer flex items-center gap-1"
                          title={t.viewPackagingQR}
                          aria-label={t.viewPackagingQR}
                        >
                          <QrCode className="w-3 h-3 text-emerald-800" />
                          <span>QR</span>
                        </button>

                        {batch.status !== 'Ready for Dispatch' &&
                          batch.status !== 'With Distributor' &&
                          batch.status !== 'In Transit' &&
                          batch.status !== 'On Retail Shelf' && (
                            <button
                              type="button"
                              onClick={() => handleQuickDispatch(batch.batchId)}
                              className="px-2.5 py-1 bg-emerald-900 hover:bg-emerald-800 text-white rounded text-[11px] font-medium transition cursor-pointer"
                            >
                              {t.dispatch}
                            </button>
                          )}

                        <button
                          type="button"
                          onClick={() => navigateToVerification(batch.id)}
                          className="px-2.5 py-1 text-stone-600 hover:text-stone-900 rounded text-[11px] transition cursor-pointer"
                        >
                          {t.verify}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 bg-white rounded-xl border border-stone-200 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200">
            <div>
              <h3 className="font-bold text-sm text-stone-900">{t.handover}</h3>
              <p className="text-xs text-stone-500">{t.handoverDescription}</p>
            </div>
            <Truck className="w-4 h-4 text-stone-600" />
          </div>

          <div className="space-y-3">
            {displayBatches.slice(0, 3).map((batch) => (
              <div
                key={batch.id}
                className="p-3.5 bg-stone-50 rounded-lg border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-stone-900">
                      {batch.batchId}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-stone-200 text-stone-800 rounded font-medium">
                      {translateStatus(batch.status, lang)}
                    </span>
                  </div>
                  <div className="text-stone-700 font-semibold">
                    {translateCropName(
                      batch.cropName || batch.name,
                      lang,
                      t.unknownCrop,
                    )}{' '}
                    ({batch.quantity || batch.quantityKg} {t.kg})
                  </div>
                  <div className="text-[11px] text-stone-500">
                    {t.transporter}: KisanLogix Cold Fleet • {t.vehicle}: MH-04-TR-9182

                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1 shrink-0">
                  <span className="font-mono font-bold text-emerald-950 text-xs">
                    ₹{batch.farmgatePrice || batch.pricing?.farmerPrice || '—'}/{t.kg}
                  </span>

                  <button
                    type="button"
                    onClick={() => navigate('/farmer/transfers')}
                    className="text-[11px] text-emerald-900 hover:underline font-semibold cursor-pointer"
                  >
                    {t.transfer} →

                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 bg-white rounded-xl border border-stone-200 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200">
            <div>
              <h3 className="font-bold text-sm text-stone-900">{t.regionalAdvisory}</h3>
              <p className="text-xs text-stone-500">{t.agriculturalCluster}</p>
            </div>
            <CloudSun className="w-4 h-4 text-amber-700" />
          </div>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 bg-stone-50 rounded-md border border-stone-200">
                <span className="text-[10px] text-stone-500 block uppercase">
                  {t.temperature}
                </span>
                <span className="font-bold text-stone-900 font-mono text-sm">31°C</span>

              </div>
              <div className="p-2.5 bg-stone-50 rounded-md border border-stone-200">
                <span className="text-[10px] text-stone-500 block uppercase">
                  {t.humidity}
                </span>
                <span className="font-bold text-stone-900 font-mono text-sm">68% RH</span>
              </div>
              <div className="p-2.5 bg-stone-50 rounded-md border border-stone-200">
                <span className="text-[10px] text-stone-500 block uppercase">
                  {t.harvestWindow}
                </span>
                <span className="font-bold text-emerald-800 text-sm">{t.optimal}</span>
              </div>
            </div>

            <div className="p-3 bg-stone-50 rounded-md border border-stone-200 text-stone-700 leading-relaxed text-[11px]">
              <strong>{t.pluckingAdvisory}</strong> {t.pluckingText}
            </div>

            <div className="p-3 bg-stone-50 rounded-md border border-stone-200 text-stone-700 leading-relaxed text-[11px]">
              <strong>{t.mandiIntelligence}</strong> {t.mandiText}
            </div>

            <button
              type="button"
              onClick={() => navigate('/farmer/price-prediction')}
              className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs rounded-md transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Scale className="w-3.5 h-3.5 text-emerald-800" />
              <span>{t.forecast}</span>
            </button>
          </div>
        </div>
      </div>

      {selectedQRBatch && (
        <QRCodeModal
          onClose={() => setSelectedQRBatch(null)}
          batch={selectedQRBatch}
        />
      )}
    </div>
  );
};

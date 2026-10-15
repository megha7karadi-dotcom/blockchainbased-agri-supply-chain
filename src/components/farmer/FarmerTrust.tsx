
import React, { useState } from 'react';
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  Star,
  FlaskConical,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useFarmerLanguage } from '../../context/FarmerLanguageContext';
import { BackButton } from '../common/BackButton';

export interface AuditLog {
  id: string;
  date: string;
  title: string;
  certId: string;
  status: string;
  auditor: string;
  expiryDate: string;
  documentHash: string;
}

export interface ConsumerReview {
  id: string;
  consumerName: string;
  location: string;
  rating: number;
  date: string;
  batchId: string;
  crop: string;
  comment: string;
  verifiedScan: boolean;
}

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-01',
    date: '2026-04-10',
    title: 'Annual APEDA Organic Certification Audit (NPOP)',
    certId: 'NPOP/NAB/0014/MH/2026',
    status: 'Passed (Zero Synthetic Residues)',
    auditor: 'State Agricultural Testing Laboratory, Pune',
    expiryDate: '2027-04-09',
    documentHash: '0x8f192...bc019',
  },
  {
    id: 'aud-02',
    date: '2026-03-15',
    title: 'Soil pH, Organic Carbon & Microbial Health Assessment',
    certId: 'SOIL-LAB-78901',
    status: 'Optimal (pH 6.8, Organic Carbon 1.2%)',
    auditor: 'Dr. Balasaheb Sawant Konkan Krishi Vidyapeeth, Dapoli',
    expiryDate: '2027-03-14',
    documentHash: '0x3dc81...91045',
  },
  {
    id: 'aud-03',
    date: '2026-02-28',
    title: 'Irrigation Borewell Heavy Metals Screening (GC-MS)',
    certId: 'WATER-TEST-3419',
    status: 'Clean (Zero Lead, Arsenic & Cadmium)',
    auditor: 'Maharashtra Pollution Control Board Testing Cell',
    expiryDate: '2027-02-27',
    documentHash: '0x71c22...88492',
  },
  {
    id: 'aud-04',
    date: '2025-11-20',
    title: 'Geographical Indication (GI) Authorization Inspection',
    certId: 'GI-APEDA-MH-139',
    status: 'Authorized Authentic Alphonso (GI Tag 139)',
    auditor: 'Konkan Hapus Mango Producers Association',
    expiryDate: 'Permanent (Subject to Annual Audit)',
    documentHash: '0x55aa9...11928',
  },
];

const INITIAL_CONSUMER_REVIEWS: ConsumerReview[] = [
  {
    id: 'rev-01',
    consumerName: 'Priya Nair',
    location: 'Worli, Mumbai',
    rating: 5,
    date: '2026-05-11',
    batchId: 'AGRI-2026-MNG-001',
    crop: 'Alphonso Mango',
    comment:
      'Incredible aroma and sweetness! Scanned the QR sticker at FreshRoot store and verified Rameshji grew it in Ratnagiri without calcium carbide ripening.',
    verifiedScan: true,
  },
  {
    id: 'rev-02',
    consumerName: 'Amitabh Sen',
    location: 'Indiranagar, Bengaluru',
    rating: 5,
    date: '2026-05-09',
    batchId: 'AGRI-2026-RIC-002',
    crop: 'Basmati Rice',
    comment:
      'Authentic long grain and zero pesticide taste. Knowing the farmer received ₹65/kg direct makes paying fair retail price completely worthwhile.',
    verifiedScan: true,
  },
  {
    id: 'rev-03',
    consumerName: 'Kavita Joshi',
    location: 'Aundh, Pune',
    rating: 4.8,
    date: '2026-05-04',
    batchId: 'AGRI-2026-TOM-003',
    crop: 'Vine Tomatoes',
    comment:
      'Super fresh and firm. Cold chain temperature log showed 11°C consistent transit from farm to shelf.',
    verifiedScan: true,
  },
];

const translations = {
  en: {
    pageTitle: 'Farmer Trust, Certification & Reputation Oracle',
    subtitle:
      'Decentralized reputation score computed autonomously via laboratory test oracles, SLA tracking, and consumer scans',
    requestTest: 'Request Lab / Soil Test',
    inspectionScheduled: 'Inspection Scheduled!',
    fieldOfficers: 'field officers will collect leaf/soil samples on',
    forPlot: 'for',
    trustDescription:
      'Consensus trust standing permits zero-collateral forward procurement contracts, advance escrow deposits, and priority cold-chain allocation.',
    residueFree: '100% Residue-Free',
    fssai: 'FSSAI Registered',
    giAuthorized: 'GI Authorized Origin',
    outOf: 'Out of 100 Points',
    consensus: 'Consensus Proof Active',
    chemicalResidues: 'Chemical Residues',
    clean: '100% Clean',
    zeroResidues: 'Zero synthetic chemical residues',
    dispatchSla: 'Dispatch SLA',
    deliveredOnTime: 'Delivered to cold reefers on time',
    gpsSurvey: 'GPS Land Survey',
    verified: '100% Verified',
    cadastral: 'Cadastral survey on-chain',
    consumerQrRating: 'Consumer QR Rating',
    qrScans: 'Across 850+ QR smartphone scans',
    auditTitle: 'Cryptographically Audited Certificates & Tests',
    auditSubtitle:
      'Verified by state agricultural universities and authorized testing labs',
    oracleVerified: 'Oracles Verified On-Chain',
    auditor: 'Auditor:',
    certificateId: 'Certificate ID:',
    expiry: 'Expiry:',
    reviewsTitle: 'Verified Consumer Reviews (via QR Scans)',
    reviewsSubtitle:
      'Real feedback submitted by consumers who scanned packaging QR tags',
    verifiedScan: 'Verified Scan',
    scheduleTitle: 'Schedule Field Lab Inspection',
    testType: 'Test Type',
    plotField: 'Agricultural Plot / Field',
    laboratory: 'Accredited Testing Laboratory',
    collectionDate: 'Preferred Sample Collection Date',
    testNotice:
      'Test results will be cryptographically anchored to your AgriTrace account upon lab completion.',
    cancel: 'Cancel',
    confirmBooking: 'Confirm Inspection Booking',
    passed: 'Passed (Zero Synthetic Residues)',
    optimal: 'Optimal (pH 6.8, Organic Carbon 1.2%)',
    waterClean: 'Clean (Zero Lead, Arsenic & Cadmium)',
    giStatus: 'Authorized Authentic Alphonso (GI Tag 139)',
    permanent: 'Permanent (Subject to Annual Audit)',
    testOptions: [
      'Pesticide Multi-Residue Screening (GC-MS / LC-MS)',
      'Soil Health Card & NPK Micro-Nutrient Test',
      'Irrigation Borewell Heavy Metals Screening',
      'APEDA NPOP Organic Certification Renewal',
    ],
    plotOptions: [
      'Plot A - Main Orchard (8.5 Acres - Mango/Fruit)',
      'Plot B - Organic Polyhouse (3.2 Acres - Vine Tomatoes)',
      'Plot C - Terraced Basmati Paddies (12 Acres)',
    ],
    labOptions: [
      'State Agricultural Testing Laboratory, Pune',
      'Konkan Krishi Vidyapeeth Agro Lab, Dapoli',
      'MPKV Soil & Water Department, Rahuri',
    ],
    reviews: {
      'rev-01': {
        crop: 'Alphonso Mango',
        comment:
          'Incredible aroma and sweetness! Scanned the QR sticker at FreshRoot store and verified the farmer grew it in Ratnagiri without calcium carbide ripening.',
      },
      'rev-02': {
        crop: 'Basmati Rice',
        comment:
          'Authentic long grain and zero pesticide taste. Knowing the farmer received ₹65/kg directly makes paying a fair retail price worthwhile.',
      },
      'rev-03': {
        crop: 'Vine Tomatoes',
        comment:
          'Super fresh and firm. The cold-chain temperature log showed consistent transit at 11°C from farm to shelf.',
      },
    },
  },
  hi: {
    pageTitle: 'किसान विश्वास, प्रमाणन और प्रतिष्ठा',
    subtitle:
      'प्रयोगशाला परीक्षण, SLA ट्रैकिंग और उपभोक्ता QR स्कैन के आधार पर प्रतिष्ठा स्कोर',
    requestTest: 'लैब / मिट्टी परीक्षण का अनुरोध',
    inspectionScheduled: 'निरीक्षण निर्धारित!',
    fieldOfficers: 'के अधिकारी पत्ती/मिट्टी के नमूने एकत्र करेंगे:',
    forPlot: 'खेत के लिए',
    trustDescription:
      'विश्वास स्कोर बिना अतिरिक्त गारंटी के खरीद अनुबंध, अग्रिम एस्क्रो जमा और प्राथमिकता वाली कोल्ड-चेन सुविधा में सहायता करता है।',
    residueFree: '100% अवशेष-मुक्त',
    fssai: 'FSSAI पंजीकृत',
    giAuthorized: 'GI प्रमाणित उत्पत्ति',
    outOf: '100 में से अंक',
    consensus: 'सहमति प्रमाण सक्रिय',
    chemicalResidues: 'रासायनिक अवशेष',
    clean: '100% स्वच्छ',
    zeroResidues: 'कोई कृत्रिम रासायनिक अवशेष नहीं',
    dispatchSla: 'डिस्पैच SLA',
    deliveredOnTime: 'समय पर कोल्ड-चेन वाहन तक डिलीवरी',
    gpsSurvey: 'GPS भूमि सर्वेक्षण',
    verified: '100% सत्यापित',
    cadastral: 'कैडस्ट्रल सर्वेक्षण ब्लॉकचेन पर',
    consumerQrRating: 'उपभोक्ता QR रेटिंग',
    qrScans: '850+ स्मार्टफोन QR स्कैन के आधार पर',
    auditTitle: 'सत्यापित प्रमाणपत्र और परीक्षण',
    auditSubtitle:
      'राज्य कृषि विश्वविद्यालयों और अधिकृत परीक्षण प्रयोगशालाओं द्वारा सत्यापित',
    oracleVerified: 'ब्लॉकचेन पर सत्यापित',
    auditor: 'परीक्षक:',
    certificateId: 'प्रमाणपत्र ID:',
    expiry: 'समाप्ति:',
    reviewsTitle: 'सत्यापित उपभोक्ता समीक्षाएँ (QR स्कैन)',
    reviewsSubtitle:
      'पैकेजिंग QR कोड स्कैन करने वाले उपभोक्ताओं की प्रतिक्रियाएँ',
    verifiedScan: 'सत्यापित स्कैन',
    scheduleTitle: 'फील्ड लैब निरीक्षण निर्धारित करें',
    testType: 'परीक्षण का प्रकार',
    plotField: 'कृषि भूखंड / खेत',
    laboratory: 'मान्यता प्राप्त परीक्षण प्रयोगशाला',
    collectionDate: 'नमूना संग्रह की पसंदीदा तारीख',
    testNotice:
      'प्रयोगशाला परीक्षण पूरा होने पर परिणाम आपके AgriTrace खाते से क्रिप्टोग्राफ़िक रूप से जोड़े जाएँगे।',
    cancel: 'रद्द करें',
    confirmBooking: 'निरीक्षण बुकिंग की पुष्टि करें',
    passed: 'उत्तीर्ण (कोई कृत्रिम अवशेष नहीं)',
    optimal: 'उत्तम (pH 6.8, जैविक कार्बन 1.2%)',
    waterClean: 'स्वच्छ (सीसा, आर्सेनिक और कैडमियम नहीं)',
    giStatus: 'प्रामाणिक अल्फांसो अधिकृत (GI टैग 139)',
    permanent: 'स्थायी (वार्षिक ऑडिट के अधीन)',
    testOptions: [
      'कीटनाशक बहु-अवशेष जाँच (GC-MS / LC-MS)',
      'मृदा स्वास्थ्य कार्ड और NPK सूक्ष्म पोषक परीक्षण',
      'सिंचाई बोरवेल में भारी धातुओं की जाँच',
      'APEDA NPOP जैविक प्रमाणन नवीनीकरण',
    ],
    plotOptions: [
      'भूखंड A - मुख्य बाग (8.5 एकड़ - आम/फल)',
      'भूखंड B - जैविक पॉलीहाउस (3.2 एकड़ - टमाटर)',
      'भूखंड C - सीढ़ीदार बासमती खेत (12 एकड़)',
    ],
    labOptions: [
      'राज्य कृषि परीक्षण प्रयोगशाला, पुणे',
      'कोंकण कृषि विद्यापीठ एग्रो लैब, दापोली',
      'MPKV मृदा एवं जल विभाग, राहुरी',
    ],
    reviews: {
      'rev-01': {
        crop: 'अल्फांसो आम',
        comment:
          'बेहतरीन सुगंध और मिठास! FreshRoot स्टोर पर QR स्टिकर स्कैन करके सत्यापित किया कि किसान ने रत्नागिरी में कैल्शियम कार्बाइड के बिना आम पकाए।',
      },
      'rev-02': {
        crop: 'बासमती चावल',
        comment:
          'असली लंबे दाने और कीटनाशक का कोई स्वाद नहीं। किसान को सीधे ₹65/किलो मिलने की जानकारी से उचित खुदरा कीमत देना सार्थक लगता है।',
      },
      'rev-03': {
        crop: 'बेल वाले टमाटर',
        comment:
          'बहुत ताज़े और सख्त। कोल्ड-चेन तापमान लॉग में खेत से दुकान तक 11°C पर लगातार परिवहन दर्ज था।',
      },
    },
  },
  kn: {
    pageTitle: 'ರೈತರ ವಿಶ್ವಾಸ, ಪ್ರಮಾಣೀಕರಣ ಮತ್ತು ಖ್ಯಾತಿ',
    subtitle:
      'ಪ್ರಯೋಗಾಲಯ ಪರೀಕ್ಷೆ, SLA ಟ್ರ್ಯಾಕಿಂಗ್ ಮತ್ತು ಗ್ರಾಹಕರ QR ಸ್ಕ್ಯಾನ್ ಆಧಾರಿತ ಖ್ಯಾತಿ ಅಂಕ',
    requestTest: 'ಪ್ರಯೋಗಾಲಯ / ಮಣ್ಣಿನ ಪರೀಕ್ಷೆ ವಿನಂತಿಸಿ',
    inspectionScheduled: 'ಪರಿಶೀಲನೆ ನಿಗದಿಯಾಗಿದೆ!',
    fieldOfficers: 'ಅಧಿಕಾರಿಗಳು ಎಲೆ/ಮಣ್ಣಿನ ಮಾದರಿಗಳನ್ನು ಸಂಗ್ರಹಿಸುವರು:',
    forPlot: 'ಜಮೀನಿಗಾಗಿ',
    trustDescription:
      'ವಿಶ್ವಾಸ ಅಂಕವು ಹೆಚ್ಚುವರಿ ಭದ್ರತೆಯಿಲ್ಲದ ಖರೀದಿ ಒಪ್ಪಂದಗಳು, ಮುಂಗಡ ಎಸ್ಕ್ರೋ ಠೇವಣಿ ಮತ್ತು ಆದ್ಯತೆಯ ಶೀತ ಸರಪಳಿ ಸೌಲಭ್ಯಕ್ಕೆ ಸಹಾಯ ಮಾಡುತ್ತದೆ.',
    residueFree: '100% ಅವಶೇಷ ಮುಕ್ತ',
    fssai: 'FSSAI ನೋಂದಾಯಿತ',
    giAuthorized: 'GI ಅಧಿಕೃತ ಮೂಲ',
    outOf: '100 ಅಂಕಗಳಲ್ಲಿ',
    consensus: 'ಒಮ್ಮತದ ಪುರಾವೆ ಸಕ್ರಿಯ',
    chemicalResidues: 'ರಾಸಾಯನಿಕ ಅವಶೇಷಗಳು',
    clean: '100% ಸ್ವಚ್ಛ',
    zeroResidues: 'ಸಂಶ್ಲೇಷಿತ ರಾಸಾಯನಿಕ ಅವಶೇಷಗಳಿಲ್ಲ',
    dispatchSla: 'ರವಾನೆ SLA',
    deliveredOnTime: 'ಶೀತ ಸಾಗಣೆ ವಾಹನಕ್ಕೆ ಸಮಯಕ್ಕೆ ತಲುಪಿಸಲಾಗಿದೆ',
    gpsSurvey: 'GPS ಭೂ ಸಮೀಕ್ಷೆ',
    verified: '100% ಪರಿಶೀಲಿಸಲಾಗಿದೆ',
    cadastral: 'ಕ್ಯಾಡಾಸ್ಟ್ರಲ್ ಸಮೀಕ್ಷೆ ಬ್ಲಾಕ್‌ಚೈನ್‌ನಲ್ಲಿ',
    consumerQrRating: 'ಗ್ರಾಹಕರ QR ರೇಟಿಂಗ್',
    qrScans: '850ಕ್ಕೂ ಹೆಚ್ಚು ಸ್ಮಾರ್ಟ್‌ಫೋನ್ QR ಸ್ಕ್ಯಾನ್‌ಗಳ ಆಧಾರದಲ್ಲಿ',
    auditTitle: 'ಪರಿಶೀಲಿತ ಪ್ರಮಾಣಪತ್ರಗಳು ಮತ್ತು ಪರೀಕ್ಷೆಗಳು',
    auditSubtitle:
      'ರಾಜ್ಯ ಕೃಷಿ ವಿಶ್ವವಿದ್ಯಾಲಯಗಳು ಮತ್ತು ಅಧಿಕೃತ ಪರೀಕ್ಷಾ ಪ್ರಯೋಗಾಲಯಗಳಿಂದ ಪರಿಶೀಲಿಸಲಾಗಿದೆ',
    oracleVerified: 'ಬ್ಲಾಕ್‌ಚೈನ್‌ನಲ್ಲಿ ಪರಿಶೀಲಿಸಲಾಗಿದೆ',
    auditor: 'ಪರೀಕ್ಷಕರು:',
    certificateId: 'ಪ್ರಮಾಣಪತ್ರ ID:',
    expiry: 'ಅವಧಿ ಮುಕ್ತಾಯ:',
    reviewsTitle: 'ಪರಿಶೀಲಿತ ಗ್ರಾಹಕರ ವಿಮರ್ಶೆಗಳು (QR ಸ್ಕ್ಯಾನ್)',
    reviewsSubtitle:
      'ಪ್ಯಾಕೇಜಿಂಗ್ QR ಕೋಡ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿದ ಗ್ರಾಹಕರ ಪ್ರತಿಕ್ರಿಯೆಗಳು',
    verifiedScan: 'ಪರಿಶೀಲಿತ ಸ್ಕ್ಯಾನ್',
    scheduleTitle: 'ಕ್ಷೇತ್ರ ಪ್ರಯೋಗಾಲಯ ಪರಿಶೀಲನೆ ನಿಗದಿಪಡಿಸಿ',
    testType: 'ಪರೀಕ್ಷೆಯ ವಿಧ',
    plotField: 'ಕೃಷಿ ಜಮೀನು / ಕ್ಷೇತ್ರ',
    laboratory: 'ಮಾನ್ಯತೆ ಪಡೆದ ಪರೀಕ್ಷಾ ಪ್ರಯೋಗಾಲಯ',
    collectionDate: 'ಮಾದರಿ ಸಂಗ್ರಹಕ್ಕೆ ಆದ್ಯತೆಯ ದಿನಾಂಕ',
    testNotice:
      'ಪ್ರಯೋಗಾಲಯ ಪರೀಕ್ಷೆ ಪೂರ್ಣಗೊಂಡ ನಂತರ ಫಲಿತಾಂಶಗಳನ್ನು ನಿಮ್ಮ AgriTrace ಖಾತೆಗೆ ಕ್ರಿಪ್ಟೋಗ್ರಾಫಿಕ್ ರೀತಿಯಲ್ಲಿ ಜೋಡಿಸಲಾಗುತ್ತದೆ.',
    cancel: 'ರದ್ದುಮಾಡಿ',
    confirmBooking: 'ಪರಿಶೀಲನೆ ಕಾಯ್ದಿರಿಸುವಿಕೆಯನ್ನು ಖಚಿತಪಡಿಸಿ',
    passed: 'ಯಶಸ್ವಿ (ಸಂಶ್ಲೇಷಿತ ಅವಶೇಷಗಳಿಲ್ಲ)',
    optimal: 'ಉತ್ತಮ (pH 6.8, ಸಾವಯವ ಇಂಗಾಲ 1.2%)',
    waterClean: 'ಸ್ವಚ್ಛ (ಸೀಸ, ಆರ್ಸೆನಿಕ್ ಮತ್ತು ಕ್ಯಾಡ್ಮಿಯಂ ಇಲ್ಲ)',
    giStatus: 'ಅಧಿಕೃತ ಅಲ್ಫಾನ್ಸೊ ಮಾವು (GI ಟ್ಯಾಗ್ 139)',
    permanent: 'ಶಾಶ್ವತ (ವಾರ್ಷಿಕ ಪರಿಶೀಲನೆಗೆ ಒಳಪಟ್ಟಿದೆ)',
    testOptions: [
      'ಕೀಟನಾಶಕ ಬಹು-ಅವಶೇಷ ಪರೀಕ್ಷೆ (GC-MS / LC-MS)',
      'ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಕಾರ್ಡ್ ಮತ್ತು NPK ಸೂಕ್ಷ್ಮ ಪೋಷಕಾಂಶ ಪರೀಕ್ಷೆ',
      'ನೀರಾವರಿ ಬೋರ್‌ವೆಲ್ ಭಾರ ಲೋಹಗಳ ಪರೀಕ್ಷೆ',
      'APEDA NPOP ಸಾವಯವ ಪ್ರಮಾಣೀಕರಣ ನವೀಕರಣ',
    ],
    plotOptions: [
      'ಜಮೀನು A - ಮುಖ್ಯ ತೋಟ (8.5 ಎಕರೆ - ಮಾವು/ಹಣ್ಣು)',
      'ಜಮೀನು B - ಸಾವಯವ ಪಾಲಿಹೌಸ್ (3.2 ಎಕರೆ - ಟೊಮ್ಯಾಟೊ)',
      'ಜಮೀನು C - ಮೆಟ್ಟಿಲು ಬಾಸ್ಮತಿ ಗದ್ದೆಗಳು (12 ಎಕರೆ)',
    ],
    labOptions: [
      'ರಾಜ್ಯ ಕೃಷಿ ಪರೀಕ್ಷಾ ಪ್ರಯೋಗಾಲಯ, ಪುಣೆ',
      'ಕೊಂಕಣ ಕೃಷಿ ವಿದ್ಯಾಪೀಠ ಅಗ್ರೋ ಲ್ಯಾಬ್, ದಾಪೋಲಿ',
      'MPKV ಮಣ್ಣು ಮತ್ತು ನೀರು ಇಲಾಖೆ, ರಾಹುರಿ',
    ],
    reviews: {
      'rev-01': {
        crop: 'ಅಲ್ಫಾನ್ಸೊ ಮಾವು',
        comment:
          'ಅದ್ಭುತ ಸುವಾಸನೆ ಮತ್ತು ಸಿಹಿ! FreshRoot ಅಂಗಡಿಯಲ್ಲಿ QR ಸ್ಟಿಕ್ಕರ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ, ರೈತರು ರತ್ನಗಿರಿಯಲ್ಲಿ ಕ್ಯಾಲ್ಸಿಯಂ ಕಾರ್ಬೈಡ್ ಬಳಸದೆ ಮಾವು ಬೆಳೆಸಿದ್ದಾರೆ ಎಂದು ಪರಿಶೀಲಿಸಿದೆ.',
      },
      'rev-02': {
        crop: 'ಬಾಸ್ಮತಿ ಅಕ್ಕಿ',
        comment:
          'ನಿಜವಾದ ಉದ್ದನೆಯ ಅಕ್ಕಿ ಮತ್ತು ಕೀಟನಾಶಕದ ರುಚಿಯಿಲ್ಲ. ರೈತರಿಗೆ ನೇರವಾಗಿ ₹65/ಕೆಜಿ ಸಿಕ್ಕಿದೆ ಎಂದು ತಿಳಿದು ನ್ಯಾಯಯುತ ಚಿಲ್ಲರೆ ಬೆಲೆ ನೀಡುವುದು ಸಾರ್ಥಕವಾಗಿದೆ.',
      },
      'rev-03': {
        crop: 'ಬಳ್ಳಿ ಟೊಮ್ಯಾಟೊ',
        comment:
          'ತುಂಬಾ ತಾಜಾ ಮತ್ತು ಗಟ್ಟಿಯಾಗಿವೆ. ಹೊಲದಿಂದ ಅಂಗಡಿಯವರೆಗೆ ಸಾಗಣೆಯಲ್ಲಿ ತಾಪಮಾನ ನಿರಂತರವಾಗಿ 11°C ಇತ್ತು ಎಂದು ಶೀತ ಸರಪಳಿ ದಾಖಲೆ ತೋರಿಸಿತು.',
      },
    },
  },
};

const auditTranslations = {
  hi: {
    'aud-01': {
      title: 'वार्षिक APEDA जैविक प्रमाणन ऑडिट (NPOP)',
      status: 'उत्तीर्ण (कोई कृत्रिम अवशेष नहीं)',
    },
    'aud-02': {
      title: 'मिट्टी pH, जैविक कार्बन और सूक्ष्मजीव स्वास्थ्य मूल्यांकन',
      status: 'उत्तम (pH 6.8, जैविक कार्बन 1.2%)',
    },
    'aud-03': {
      title: 'सिंचाई बोरवेल में भारी धातुओं की जाँच (GC-MS)',
      status: 'स्वच्छ (सीसा, आर्सेनिक और कैडमियम नहीं)',
    },
    'aud-04': {
      title: 'भौगोलिक संकेत (GI) प्राधिकरण निरीक्षण',
      status: 'प्रामाणिक अल्फांसो अधिकृत (GI टैग 139)',
    },
  },
  kn: {
    'aud-01': {
      title: 'ವಾರ್ಷಿಕ APEDA ಸಾವಯವ ಪ್ರಮಾಣೀಕರಣ ಪರಿಶೀಲನೆ (NPOP)',
      status: 'ಯಶಸ್ವಿ (ಸಂಶ್ಲೇಷಿತ ಅವಶೇಷಗಳಿಲ್ಲ)',
    },
    'aud-02': {
      title: 'ಮಣ್ಣಿನ pH, ಸಾವಯವ ಇಂಗಾಲ ಮತ್ತು ಸೂಕ್ಷ್ಮಜೀವಿ ಆರೋಗ್ಯ ಮೌಲ್ಯಮಾಪನ',
      status: 'ಉತ್ತಮ (pH 6.8, ಸಾವಯವ ಇಂಗಾಲ 1.2%)',
    },
    'aud-03': {
      title: 'ನೀರಾವರಿ ಬೋರ್‌ವೆಲ್ ಭಾರ ಲೋಹಗಳ ಪರೀಕ್ಷೆ (GC-MS)',
      status: 'ಸ್ವಚ್ಛ (ಸೀಸ, ಆರ್ಸೆನಿಕ್ ಮತ್ತು ಕ್ಯಾಡ್ಮಿಯಂ ಇಲ್ಲ)',
    },
    'aud-04': {
      title: 'ಭೌಗೋಳಿಕ ಸೂಚಕ (GI) ಅಧಿಕೃತ ಪರಿಶೀಲನೆ',
      status: 'ಅಧಿಕೃತ ಅಲ್ಫಾನ್ಸೊ ಮಾವು (GI ಟ್ಯಾಗ್ 139)',
    },
  },
};

export const FarmerTrust: React.FC = () => {
  const { currentUser } = useApp();
  const { language } = useFarmerLanguage();
  const t = translations[language] || translations.en;

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testType, setTestType] = useState(
    'Pesticide Multi-Residue Screening (GC-MS)',
  );
  const [plotName, setPlotName] = useState(
    'Plot A - Main Orchard (8.5 Acres)',
  );
  const [selectedLab, setSelectedLab] = useState(
    'State Agricultural Testing Laboratory, Pune',
  );
  const [preferredDate, setPreferredDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [requestNotice, setRequestNotice] = useState<string | null>(null);

  const trustScore = currentUser?.trustScore || 98;

  const handleScheduleTest = (e: React.FormEvent) => {
    e.preventDefault();

    const newAudit: AuditLog = {
      id: `aud-${Date.now()}`,
      date: preferredDate,
      title: testType,
      certId: `PENDING-ORACLE-${Date.now().toString().slice(-5)}`,
      status: 'Sample Collection Scheduled (On-Farm Visit)',
      auditor: selectedLab,
      expiryDate: 'Pending Test Completion',
      documentHash:
        '0x' +
        Array.from({ length: 12 }, () =>
          Math.floor(Math.random() * 16).toString(16),
        ).join(''),
    };

    setAuditLogs((previousLogs) => [newAudit, ...previousLogs]);
    setIsTestModalOpen(false);

    setRequestNotice(
      `${t.inspectionScheduled} ${selectedLab} ${t.fieldOfficers} ${preferredDate} ${t.forPlot} ${plotName}.`,
    );

    window.setTimeout(() => {
      setRequestNotice(null);
    }, 7000);
  };

  const displayAudit = (log: AuditLog) => {
    if (language === 'en') {
      return { title: log.title, status: log.status };
    }

    const localized =
      auditTranslations[language as 'hi' | 'kn']?.[
        log.id as keyof (typeof auditTranslations)['hi']
      ];

    return localized || { title: log.title, status: log.status };
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      <div className="flex items-center justify-start">
        <BackButton fallback="/farmer/dashboard" />
      </div>

      {requestNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl flex items-center justify-between text-xs font-semibold animate-fadeIn shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{requestNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setRequestNotice(null)}
            aria-label="Close notification"
            className="p-1 hover:bg-emerald-100 rounded-lg text-emerald-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-500" />
            <span>{t.pageTitle}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">{t.subtitle}</p>
        </div>

        <button
          type="button"
          onClick={() => setIsTestModalOpen(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-2 cursor-pointer"
        >
          <FlaskConical className="w-4 h-4" />
          <span>{t.requestTest}</span>
        </button>
      </div>

      <div className="bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-slate-50 text-slate-900 rounded-3xl p-6 sm:p-8 border border-emerald-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 text-center md:text-left">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            {currentUser?.name || 'Ramesh Patil'}
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm max-w-md leading-relaxed">
            {t.trustDescription}
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-medium text-emerald-800">
            <span>• {t.residueFree}</span>
            <span>• {t.fssai}</span>
            <span>• {t.giAuthorized}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 text-center flex-shrink-0 w-48 shadow-2xs">
          <div className="text-4xl sm:text-5xl font-black text-emerald-700">
            {trustScore}
          </div>
          <div className="text-xs text-slate-600 font-semibold mt-1">
            {t.outOf}
          </div>
          <div className="flex justify-center gap-1 mt-2 text-amber-500">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400" />
            ))}
          </div>
          <div className="text-[10px] text-slate-500 mt-2 font-mono">
            {t.consensus}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-400">
            {t.chemicalResidues}
          </span>
          <div className="text-2xl font-black text-emerald-700">
            {t.clean}
          </div>
          <div className="text-[11px] text-slate-500">{t.zeroResidues}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-400">
            {t.dispatchSla}
          </span>
          <div className="text-2xl font-black text-slate-900">98.2%</div>
          <div className="text-[11px] text-slate-500">{t.deliveredOnTime}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-400">
            {t.gpsSurvey}
          </span>
          <div className="text-2xl font-black text-slate-900">{t.verified}</div>
          <div className="text-[11px] text-emerald-700 font-medium">
            {t.cadastral}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-400">
            {t.consumerQrRating}
          </span>
          <div className="text-2xl font-black text-amber-600">4.9 / 5.0</div>
          <div className="text-[11px] text-slate-500">{t.qrScans}</div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {t.auditTitle}
            </h3>
            <p className="text-xs text-slate-500">{t.auditSubtitle}</p>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200 self-start sm:self-auto">
            {t.oracleVerified}
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {auditLogs.map((log) => {
            const localized = displayAudit(log);
            const isPassed =
              localized.status.includes('Passed') ||
              localized.status.includes('Optimal') ||
              localized.status.includes('Authorized') ||
              localized.status.includes('Clean') ||
              localized.status.includes('उत्तीर्ण') ||
              localized.status.includes('उत्तम') ||
              localized.status.includes('अधिकृत') ||
              localized.status.includes('स्वच्छ') ||
              localized.status.includes('ಯಶಸ್ವಿ') ||
              localized.status.includes('ಉತ್ತಮ') ||
              localized.status.includes('ಅಧಿಕೃತ') ||
              localized.status.includes('ಸ್ವಚ್ಛ');

            return (
              <div
                key={log.id}
                className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{localized.title}</span>
                  </div>
                  <div className="text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span>
                      {t.auditor}{' '}
                      <strong className="text-slate-700">{log.auditor}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      {t.certificateId}{' '}
                      <strong className="font-mono text-emerald-800">
                        {log.certId}
                      </strong>
                    </span>
                    <span>•</span>
                    <span>
                      {t.expiry} {log.expiryDate}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
                  <span
                    className={`text-xs font-semibold ${
                      isPassed ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {localized.status}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                    {log.date}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {t.reviewsTitle}
            </h3>
            <p className="text-xs text-slate-500">{t.reviewsSubtitle}</p>
          </div>
          <div className="flex items-center gap-1 text-amber-500 font-bold text-sm shrink-0">
            <Star className="w-4 h-4 fill-amber-400" />
            <span>4.9 / 5.0</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {INITIAL_CONSUMER_REVIEWS.map((rev) => {
            const localizedReview =
              t.reviews[rev.id as keyof typeof t.reviews];

            return (
              <div
                key={rev.id}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2.5 text-xs flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900">
                      {rev.consumerName}
                    </span>
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.floor(rev.rating)
                              ? 'fill-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {rev.location} • {localizedReview.crop}
                  </div>
                  <p className="text-slate-600 leading-relaxed italic">
                    "{localizedReview.comment}"
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2 text-[10px]">
                  <span className="font-mono text-emerald-700 font-bold">
                    {rev.batchId}
                  </span>
                  <span className="text-emerald-700 flex items-center gap-1 font-semibold shrink-0">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{t.verifiedScan}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isTestModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <FlaskConical className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  {t.scheduleTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTestModalOpen(false)}
                aria-label="Close modal"
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleTest} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t.testType}
                </label>
                <select
                  value={testType}
                  onChange={(e) => setTestType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-emerald-600 outline-none text-slate-800"
                >
                  <option value="Pesticide Multi-Residue Screening (GC-MS)">
                    {t.testOptions[0]}
                  </option>
                  <option value="Soil Health Card & NPK Micro-Nutrient Test">
                    {t.testOptions[1]}
                  </option>
                  <option value="Irrigation Borewell Heavy Metals Screening">
                    {t.testOptions[2]}
                  </option>
                  <option value="APEDA NPOP Organic Certification Renewal">
                    {t.testOptions[3]}
                  </option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t.plotField}
                </label>
                <select
                  value={plotName}
                  onChange={(e) => setPlotName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-emerald-600 outline-none text-slate-800"
                >
                  <option value="Plot A - Main Orchard (8.5 Acres)">
                    {t.plotOptions[0]}
                  </option>
                  <option value="Plot B - Organic Polyhouse (3.2 Acres)">
                    {t.plotOptions[1]}
                  </option>
                  <option value="Plot C - Terraced Basmati Paddies (12 Acres)">
                    {t.plotOptions[2]}
                  </option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t.laboratory}
                </label>
                <select
                  value={selectedLab}
                  onChange={(e) => setSelectedLab(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-emerald-600 outline-none text-slate-800"
                >
                  <option value="State Agricultural Testing Laboratory, Pune">
                    {t.labOptions[0]}
                  </option>
                  <option value="Konkan Krishi Vidyapeeth Agro Lab, Dapoli">
                    {t.labOptions[1]}
                  </option>
                  <option value="MPKV Soil & Water Department, Rahuri">
                    {t.labOptions[2]}
                  </option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t.collectionDate}
                </label>
                <input
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-emerald-600 outline-none text-slate-800 font-medium"
                  required
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl text-[11px] text-emerald-900 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{t.testNotice}</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTestModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs transition cursor-pointer"
                >
                  {t.confirmBooking}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
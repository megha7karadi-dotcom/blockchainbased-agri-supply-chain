
import React, { useState, useRef } from 'react';
import {
  Sprout,
  MapPin,
  Calendar,
  Award,
  Tag,
  Info,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  QrCode,
  Package,
  Edit3,
  FileCheck,
  ChevronRight,
  Sparkles,
  Wallet,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useWallet } from '../../context/WalletContext';
import {
  ProduceBatch,
  ProduceUnit,
  QualityGrade,
} from '../../types/produce';
import { BackButton } from '../common/BackButton';
import { useFarmerLanguage } from '../../context/FarmerLanguageContext';

interface FormState {
  cropName: string;
  cropVariety: string;
  quantity: string;
  unit: ProduceUnit;
  farmName: string;
  farmLocation: string;
  district: string;
  state: string;
  pinCode: string;
  harvestDate: string;
  qualityGrade: QualityGrade;
  certification: string;
  notes: string;
  farmgatePrice: string;
  priceUnit: string;
}

interface FormErrors {
  cropName?: string;
  quantity?: string;
  unit?: string;
  farmLocation?: string;
  state?: string;
  harvestDate?: string;
  qualityGrade?: string;
  farmgatePrice?: string;
}

const UNIT_OPTIONS: ProduceUnit[] = [
  'kg',
  'quintal',
  'tonnes',
  'litres',
  'pieces',
];

const GRADE_OPTIONS: QualityGrade[] = ['Grade A', 'Grade B', 'Grade C'];

const translations = {
  en: {
    title: 'Register New Produce',
    subtitle: 'Create a traceable batch record for your agricultural produce.',
    myBatches: 'My Produce Batches',
    sections: {
      a: 'Produce Information',
      aHelp: 'Specify the crop name, variety, and harvest quantity',
      b: 'Farm & Origin',
      bHelp: 'Record where the crop was grown and harvested',
      c: 'Harvest & Quality',
      cHelp: 'Document the harvest date, quality grade, and certifications',
      d: 'Pricing',
      dHelp: 'Record the initial price received at the farm level',
      e: 'Review & Submit',
      eHelp: 'Confirm all details before registering this produce batch',
    },
    fields: {
      cropName: 'Crop Name',
      cropVariety: 'Crop Variety',
      quantity: 'Quantity',
      unit: 'Unit',
      farmName: 'Farm / Organization Name',
      farmLocation: 'Farm Location / Village',
      district: 'District',
      state: 'State',
      pinCode: 'PIN Code',
      harvestDate: 'Harvest Date',
      qualityGrade: 'Quality Grade',
      certification: 'Organic / Certification Information',
      notes: 'Additional Notes',
      farmgatePrice: 'Farmgate Price',
      priceUnit: 'Price Unit',
    },
    required: 'Required',
    optional: 'Optional',
    placeholders: {
      cropName: 'e.g. Mango, Rice, Tomatoes, Turmeric',
      cropVariety: 'e.g. Alphonso, Basmati 1121',
      quantity: 'e.g. 500',
      farmName: 'e.g. Sahyadri Organic Producers Co-op',
      farmLocation: 'e.g. Ratnagiri',
      district: 'e.g. Ratnagiri District',
      state: 'e.g. Maharashtra',
      pinCode: 'e.g. 415612',
      certification: 'e.g. NPOP Certified Organic, GI Certificate No.',
      notes: 'Add harvest, handling, or testing details.',
      farmgatePrice: 'e.g. 120',
      priceUnit: 'e.g. ₹ / kg',
    },
    errors: {
      cropName: 'Crop name is required.',
      quantityRequired: 'Quantity is required.',
      quantityPositive: 'Quantity must be greater than zero.',
      unit: 'Unit is required.',
      farmLocation: 'Farm location is required.',
      state: 'State is required.',
      harvestDate: 'Harvest date is required.',
      futureDate: 'Harvest date cannot be in the future.',
      quality: 'Quality grade is required.',
      priceRequired: 'Farmgate price is required.',
      pricePositive: 'Farmgate price must be greater than zero.',
    },
    certificationNote:
      'Do not claim that a product is certified unless its certificate details have been verified.',
    pricingNote:
      'This is the initial price recorded at the farm level. Later supply-chain stages may record their own transaction prices.',
    preview: 'Batch Preview',
    autoAssigned: 'Assigned automatically during registration',
    producer: 'Producer',
    wallet: {
      notConnected: 'MetaMask Not Connected',
      connectHelp:
        'Connect your farmer wallet to sign this produce batch on Sepolia.',
      connect: 'Connect MetaMask',
      connecting: 'Connecting...',
      switchTitle: 'Switch to Ethereum Sepolia',
      switchHelp: 'Sepolia (Chain ID 11155111) is required.',
      switch: 'Switch to Sepolia',
      network: 'Network: Ethereum Sepolia (11155111)',
      ready: 'Ready to Sign',
      contract: 'Contract',
    },
    submit: 'Register Produce',
    submitting: 'Registering Produce...',
    progress: 'Processing registration...',
    edit: 'Edit Details',
    success: 'Produce Registered Successfully',
    successDescription:
      'Your produce batch has been recorded in AgriTrace with a traceability identifier.',
    batchId: 'Batch ID',
    crop: 'Crop',
    smartContract: 'Smart Contract',
    transactionHash: 'Transaction Hash',
    blockNumber: 'Block Number',
    status: 'Status',
    confirmedLedger: 'Confirmed on Ledger',
    registered: 'Registered',
    nextSteps: 'Next Steps',
    qrStep: 'Generate QR Code',
    qrHelp: 'Create printable QR stickers for bags, crates, or cartons.',
    trackingStep: 'Track Supply Chain',
    trackingHelp:
      'Monitor custody transfers as distributors and retailers verify your harvest.',
    detailsStep: 'View Batch Details',
    detailsHelp:
      'Access inventory records, pricing information, and audit logs.',
    verify: 'Verify On-Chain',
    generateQR: 'Generate QR Code',
    viewProduce: 'View My Produce',
    registerAnother: 'Register Another Batch',
    validationNotice: 'Registration Error',
    errorFallback:
      'An unexpected error occurred while validating or saving the produce.',
    connected: 'MetaMask Connected',
    unknown: 'Unknown',
    yes: 'Yes',
    no: 'No',
  },
  hi: {
    title: 'नई उपज पंजीकृत करें',
    subtitle: 'अपनी कृषि उपज के लिए ट्रैक करने योग्य बैच रिकॉर्ड बनाएँ।',
    myBatches: 'मेरे उपज बैच',
    sections: {
      a: 'उपज की जानकारी',
      aHelp: 'फसल का नाम, किस्म और कटाई की मात्रा दर्ज करें',
      b: 'खेत और उत्पत्ति',
      bHelp: 'दर्ज करें कि फसल कहाँ उगाई और काटी गई',
      c: 'कटाई और गुणवत्ता',
      cHelp: 'कटाई की तारीख, गुणवत्ता श्रेणी और प्रमाणन दर्ज करें',
      d: 'मूल्य निर्धारण',
      dHelp: 'खेत स्तर पर प्राप्त शुरुआती मूल्य दर्ज करें',
      e: 'समीक्षा और सबमिट',
      eHelp: 'बैच पंजीकृत करने से पहले सभी विवरण जाँचें',
    },
    fields: {
      cropName: 'फसल का नाम',
      cropVariety: 'फसल की किस्म',
      quantity: 'मात्रा',
      unit: 'इकाई',
      farmName: 'खेत / संगठन का नाम',
      farmLocation: 'खेत का स्थान / गाँव',
      district: 'जिला',
      state: 'राज्य',
      pinCode: 'पिन कोड',
      harvestDate: 'कटाई की तारीख',
      qualityGrade: 'गुणवत्ता श्रेणी',
      certification: 'जैविक / प्रमाणन जानकारी',
      notes: 'अतिरिक्त टिप्पणियाँ',
      farmgatePrice: 'खेत स्तर का मूल्य',
      priceUnit: 'मूल्य की इकाई',
    },
    required: 'अनिवार्य',
    optional: 'वैकल्पिक',
    placeholders: {
      cropName: 'जैसे आम, चावल, टमाटर, हल्दी',
      cropVariety: 'जैसे अल्फांसो, बासमती 1121',
      quantity: 'जैसे 500',
      farmName: 'जैसे सह्याद्री ऑर्गेनिक प्रोड्यूसर्स को-ऑप',
      farmLocation: 'जैसे रत्नागिरी',
      district: 'जैसे रत्नागिरी जिला',
      state: 'जैसे महाराष्ट्र',
      pinCode: 'जैसे 415612',
      certification: 'जैसे NPOP जैविक प्रमाणन, GI प्रमाणपत्र संख्या',
      notes: 'कटाई, रखरखाव या परीक्षण का विवरण लिखें।',
      farmgatePrice: 'जैसे 120',
      priceUnit: 'जैसे ₹ / kg',
    },
    errors: {
      cropName: 'फसल का नाम आवश्यक है।',
      quantityRequired: 'मात्रा आवश्यक है।',
      quantityPositive: 'मात्रा शून्य से अधिक होनी चाहिए।',
      unit: 'इकाई आवश्यक है।',
      farmLocation: 'खेत का स्थान आवश्यक है।',
      state: 'राज्य आवश्यक है।',
      harvestDate: 'कटाई की तारीख आवश्यक है।',
      futureDate: 'कटाई की तारीख भविष्य की नहीं हो सकती।',
      quality: 'गुणवत्ता श्रेणी आवश्यक है।',
      priceRequired: 'खेत स्तर का मूल्य आवश्यक है।',
      pricePositive: 'मूल्य शून्य से अधिक होना चाहिए।',
    },
    certificationNote:
      'जब तक प्रमाणपत्र के विवरण सत्यापित न हों, उत्पाद को प्रमाणित न बताएँ।',
    pricingNote:
      'यह खेत स्तर पर दर्ज शुरुआती मूल्य है। आपूर्ति श्रृंखला के अगले चरण अपने लेन-देन मूल्य दर्ज कर सकते हैं।',
    preview: 'बैच का पूर्वावलोकन',
    autoAssigned: 'पंजीकरण के दौरान अपने आप निर्धारित होगा',
    producer: 'उत्पादक',
    wallet: {
      notConnected: 'MetaMask कनेक्ट नहीं है',
      connectHelp:
        'Sepolia पर इस उपज बैच पर हस्ताक्षर करने के लिए अपना किसान वॉलेट कनेक्ट करें।',
      connect: 'MetaMask कनेक्ट करें',
      connecting: 'कनेक्ट हो रहा है...',
      switchTitle: 'Ethereum Sepolia पर स्विच करें',
      switchHelp: 'Sepolia (Chain ID 11155111) आवश्यक है।',
      switch: 'Sepolia पर स्विच करें',
      network: 'नेटवर्क: Ethereum Sepolia (11155111)',
      ready: 'हस्ताक्षर के लिए तैयार',
      contract: 'कॉन्ट्रैक्ट',
    },
    submit: 'उपज पंजीकृत करें',
    submitting: 'उपज पंजीकृत हो रही है...',
    progress: 'पंजीकरण प्रक्रिया जारी है...',
    edit: 'विवरण संपादित करें',
    success: 'उपज सफलतापूर्वक पंजीकृत हुई',
    successDescription:
      'आपकी उपज का बैच ट्रेसबिलिटी पहचान के साथ AgriTrace में दर्ज किया गया है।',
    batchId: 'बैच ID',
    crop: 'फसल',
    smartContract: 'स्मार्ट कॉन्ट्रैक्ट',
    transactionHash: 'लेन-देन हैश',
    blockNumber: 'ब्लॉक नंबर',
    status: 'स्थिति',
    confirmedLedger: 'लेजर पर पुष्टि की गई',
    registered: 'पंजीकृत',
    nextSteps: 'अगले चरण',
    qrStep: 'QR कोड बनाएँ',
    qrHelp: 'बैग, क्रेट या डिब्बों के लिए प्रिंट करने योग्य QR स्टिकर बनाएँ।',
    trackingStep: 'आपूर्ति श्रृंखला ट्रैक करें',
    trackingHelp:
      'वितरकों और खुदरा विक्रेताओं द्वारा सत्यापन के दौरान माल के हस्तांतरण को ट्रैक करें।',
    detailsStep: 'बैच का विवरण देखें',
    detailsHelp: 'इन्वेंटरी रिकॉर्ड, मूल्य जानकारी और ऑडिट लॉग देखें।',
    verify: 'ब्लॉकचेन पर सत्यापित करें',
    generateQR: 'QR कोड बनाएँ',
    viewProduce: 'मेरी उपज देखें',
    registerAnother: 'एक और बैच पंजीकृत करें',
    validationNotice: 'पंजीकरण त्रुटि',
    errorFallback:
      'उपज की जाँच या सहेजते समय एक अप्रत्याशित त्रुटि हुई।',
    connected: 'MetaMask कनेक्ट है',
    unknown: 'अज्ञात',
    yes: 'हाँ',
    no: 'नहीं',
  },
  kn: {
    title: 'ಹೊಸ ಉತ್ಪನ್ನವನ್ನು ನೋಂದಾಯಿಸಿ',
    subtitle: 'ನಿಮ್ಮ ಕೃಷಿ ಉತ್ಪನ್ನಕ್ಕೆ ಪತ್ತೆಹಚ್ಚಬಹುದಾದ ಬ್ಯಾಚ್ ದಾಖಲೆಯನ್ನು ರಚಿಸಿ.',
    myBatches: 'ನನ್ನ ಉತ್ಪನ್ನ ಬ್ಯಾಚ್‌ಗಳು',
    sections: {
      a: 'ಉತ್ಪನ್ನದ ಮಾಹಿತಿ',
      aHelp: 'ಬೆಳೆ ಹೆಸರು, ತಳಿ ಮತ್ತು ಕೊಯ್ಲಿನ ಪ್ರಮಾಣವನ್ನು ನಮೂದಿಸಿ',
      b: 'ಜಮೀನು ಮತ್ತು ಮೂಲ',
      bHelp: 'ಬೆಳೆ ಎಲ್ಲಿ ಬೆಳೆದಿದೆ ಮತ್ತು ಕೊಯ್ಲು ಮಾಡಲಾಗಿದೆ ಎಂದು ದಾಖಲಿಸಿ',
      c: 'ಕೊಯ್ಲು ಮತ್ತು ಗುಣಮಟ್ಟ',
      cHelp: 'ಕೊಯ್ಲಿನ ದಿನಾಂಕ, ಗುಣಮಟ್ಟದ ದರ್ಜೆ ಮತ್ತು ಪ್ರಮಾಣೀಕರಣವನ್ನು ದಾಖಲಿಸಿ',
      d: 'ಬೆಲೆ',
      dHelp: 'ಜಮೀನಿನ ಮಟ್ಟದಲ್ಲಿ ದೊರೆತ ಆರಂಭಿಕ ಬೆಲೆಯನ್ನು ದಾಖಲಿಸಿ',
      e: 'ಪರಿಶೀಲಿಸಿ ಸಲ್ಲಿಸಿ',
      eHelp: 'ಬ್ಯಾಚ್ ನೋಂದಾಯಿಸುವ ಮೊದಲು ಎಲ್ಲಾ ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ',
    },
    fields: {
      cropName: 'ಬೆಳೆಯ ಹೆಸರು',
      cropVariety: 'ಬೆಳೆಯ ತಳಿ',
      quantity: 'ಪ್ರಮಾಣ',
      unit: 'ಘಟಕ',
      farmName: 'ಜಮೀನು / ಸಂಸ್ಥೆಯ ಹೆಸರು',
      farmLocation: 'ಜಮೀನಿನ ಸ್ಥಳ / ಗ್ರಾಮ',
      district: 'ಜಿಲ್ಲೆ',
      state: 'ರಾಜ್ಯ',
      pinCode: 'ಪಿನ್ ಕೋಡ್',
      harvestDate: 'ಕೊಯ್ಲಿನ ದಿನಾಂಕ',
      qualityGrade: 'ಗುಣಮಟ್ಟದ ದರ್ಜೆ',
      certification: 'ಸಾವಯವ / ಪ್ರಮಾಣೀಕರಣ ಮಾಹಿತಿ',
      notes: 'ಹೆಚ್ಚುವರಿ ಟಿಪ್ಪಣಿಗಳು',
      farmgatePrice: 'ಜಮೀನಿನ ಬೆಲೆ',
      priceUnit: 'ಬೆಲೆ ಘಟಕ',
    },
    required: 'ಕಡ್ಡಾಯ',
    optional: 'ಐಚ್ಛಿಕ',
    placeholders: {
      cropName: 'ಉದಾ. ಮಾವು, ಅಕ್ಕಿ, ಟೊಮ್ಯಾಟೊ, ಅರಿಶಿನ',
      cropVariety: 'ಉದಾ. ಅಲ್ಫಾನ್ಸೊ, ಬಾಸ್ಮತಿ 1121',
      quantity: 'ಉದಾ. 500',
      farmName: 'ಉದಾ. ಸಹ್ಯಾದ್ರಿ ಸಾವಯವ ಉತ್ಪಾದಕರ ಸಹಕಾರಿ ಸಂಸ್ಥೆ',
      farmLocation: 'ಉದಾ. ರತ್ನಗಿರಿ',
      district: 'ಉದಾ. ರತ್ನಗಿರಿ ಜಿಲ್ಲೆ',
      state: 'ಉದಾ. ಮಹಾರಾಷ್ಟ್ರ',
      pinCode: 'ಉದಾ. 415612',
      certification: 'ಉದಾ. NPOP ಸಾವಯವ ಪ್ರಮಾಣೀಕರಣ, GI ಪ್ರಮಾಣಪತ್ರ ಸಂಖ್ಯೆ',
      notes: 'ಕೊಯ್ಲು, ನಿರ್ವಹಣೆ ಅಥವಾ ಪರೀಕ್ಷೆಯ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ.',
      farmgatePrice: 'ಉದಾ. 120',
      priceUnit: 'ಉದಾ. ₹ / kg',
    },
    errors: {
      cropName: 'ಬೆಳೆಯ ಹೆಸರು ಅಗತ್ಯವಿದೆ.',
      quantityRequired: 'ಪ್ರಮಾಣ ಅಗತ್ಯವಿದೆ.',
      quantityPositive: 'ಪ್ರಮಾಣವು ಶೂನ್ಯಕ್ಕಿಂತ ಹೆಚ್ಚಿರಬೇಕು.',
      unit: 'ಘಟಕ ಅಗತ್ಯವಿದೆ.',
      farmLocation: 'ಜಮೀನಿನ ಸ್ಥಳ ಅಗತ್ಯವಿದೆ.',
      state: 'ರಾಜ್ಯ ಅಗತ್ಯವಿದೆ.',
      harvestDate: 'ಕೊಯ್ಲಿನ ದಿನಾಂಕ ಅಗತ್ಯವಿದೆ.',
      futureDate: 'ಕೊಯ್ಲಿನ ದಿನಾಂಕ ಭವಿಷ್ಯದ ದಿನಾಂಕವಾಗಿರಬಾರದು.',
      quality: 'ಗುಣಮಟ್ಟದ ದರ್ಜೆ ಅಗತ್ಯವಿದೆ.',
      priceRequired: 'ಜಮೀನಿನ ಬೆಲೆ ಅಗತ್ಯವಿದೆ.',
      pricePositive: 'ಬೆಲೆಯು ಶೂನ್ಯಕ್ಕಿಂತ ಹೆಚ್ಚಿರಬೇಕು.',
    },
    certificationNote:
      'ಪ್ರಮಾಣಪತ್ರದ ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸದೆ ಉತ್ಪನ್ನವನ್ನು ಪ್ರಮಾಣೀಕೃತ ಎಂದು ಹೇಳಬೇಡಿ.',
    pricingNote:
      'ಇದು ಜಮೀನಿನ ಮಟ್ಟದಲ್ಲಿ ದಾಖಲಿಸಿದ ಆರಂಭಿಕ ಬೆಲೆ. ಪೂರೈಕೆ ಸರಪಳಿಯ ಮುಂದಿನ ಹಂತಗಳು ತಮ್ಮ ವ್ಯವಹಾರದ ಬೆಲೆಗಳನ್ನು ದಾಖಲಿಸಬಹುದು.',
    preview: 'ಬ್ಯಾಚ್ ಪೂರ್ವವೀಕ್ಷಣೆ',
    autoAssigned: 'ನೋಂದಣಿ ಸಮಯದಲ್ಲಿ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ನೀಡಲಾಗುತ್ತದೆ',
    producer: 'ಉತ್ಪಾದಕರು',
    wallet: {
      notConnected: 'MetaMask ಸಂಪರ್ಕಗೊಂಡಿಲ್ಲ',
      connectHelp:
        'Sepolia ನಲ್ಲಿ ಈ ಉತ್ಪನ್ನ ಬ್ಯಾಚ್‌ಗೆ ಸಹಿ ಮಾಡಲು ನಿಮ್ಮ ರೈತ ವಾಲೆಟ್ ಅನ್ನು ಸಂಪರ್ಕಿಸಿ.',
      connect: 'MetaMask ಸಂಪರ್ಕಿಸಿ',
      connecting: 'ಸಂಪರ್ಕಿಸಲಾಗುತ್ತಿದೆ...',
      switchTitle: 'Ethereum Sepolia ಗೆ ಬದಲಾಯಿಸಿ',
      switchHelp: 'Sepolia (Chain ID 11155111) ಅಗತ್ಯವಿದೆ.',
      switch: 'Sepolia ಗೆ ಬದಲಾಯಿಸಿ',
      network: 'ನೆಟ್‌ವರ್ಕ್: Ethereum Sepolia (11155111)',
      ready: 'ಸಹಿ ಮಾಡಲು ಸಿದ್ಧ',
      contract: 'ಕಾಂಟ್ರಾಕ್ಟ್',
    },
    submit: 'ಉತ್ಪನ್ನ ನೋಂದಾಯಿಸಿ',
    submitting: 'ಉತ್ಪನ್ನವನ್ನು ನೋಂದಾಯಿಸಲಾಗುತ್ತಿದೆ...',
    progress: 'ನೋಂದಣಿ ಪ್ರಕ್ರಿಯೆ ನಡೆಯುತ್ತಿದೆ...',
    edit: 'ವಿವರಗಳನ್ನು ತಿದ್ದುಪಡಿ ಮಾಡಿ',
    success: 'ಉತ್ಪನ್ನ ಯಶಸ್ವಿಯಾಗಿ ನೋಂದಾಯಿಸಲಾಗಿದೆ',
    successDescription:
      'ನಿಮ್ಮ ಉತ್ಪನ್ನ ಬ್ಯಾಚ್ ಅನ್ನು ಪತ್ತೆಹಚ್ಚುವ ಗುರುತಿನೊಂದಿಗೆ AgriTrace ನಲ್ಲಿ ದಾಖಲಿಸಲಾಗಿದೆ.',
    batchId: 'ಬ್ಯಾಚ್ ID',
    crop: 'ಬೆಳೆ',
    smartContract: 'ಸ್ಮಾರ್ಟ್ ಕಾಂಟ್ರಾಕ್ಟ್',
    transactionHash: 'ವಹಿವಾಟಿನ ಹ್ಯಾಶ್',
    blockNumber: 'ಬ್ಲಾಕ್ ಸಂಖ್ಯೆ',
    status: 'ಸ್ಥಿತಿ',
    confirmedLedger: 'ಲೆಡ್ಜರ್‌ನಲ್ಲಿ ದೃಢೀಕರಿಸಲಾಗಿದೆ',
    registered: 'ನೋಂದಾಯಿಸಲಾಗಿದೆ',
    nextSteps: 'ಮುಂದಿನ ಹಂತಗಳು',
    qrStep: 'QR ಕೋಡ್ ರಚಿಸಿ',
    qrHelp: 'ಚೀಲಗಳು, ಕ್ರೇಟ್‌ಗಳು ಅಥವಾ ಪೆಟ್ಟಿಗೆಗಳಿಗೆ ಮುದ್ರಿಸಬಹುದಾದ QR ಸ್ಟಿಕ್ಕರ್‌ಗಳನ್ನು ರಚಿಸಿ.',
    trackingStep: 'ಪೂರೈಕೆ ಸರಪಳಿಯನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ',
    trackingHelp:
      'ವಿತರಕರು ಮತ್ತು ಚಿಲ್ಲರೆ ವ್ಯಾಪಾರಿಗಳು ಪರಿಶೀಲಿಸುವಾಗ ಉತ್ಪನ್ನದ ವರ್ಗಾವಣೆಯನ್ನು ಗಮನಿಸಿ.',
    detailsStep: 'ಬ್ಯಾಚ್ ವಿವರಗಳನ್ನು ವೀಕ್ಷಿಸಿ',
    detailsHelp: 'ದಾಸ್ತಾನು ದಾಖಲೆಗಳು, ಬೆಲೆ ಮಾಹಿತಿ ಮತ್ತು ಪರಿಶೀಲನಾ ದಾಖಲೆಗಳನ್ನು ನೋಡಿ.',
    verify: 'ಬ್ಲಾಕ್‌ಚೈನ್‌ನಲ್ಲಿ ಪರಿಶೀಲಿಸಿ',
    generateQR: 'QR ಕೋಡ್ ರಚಿಸಿ',
    viewProduce: 'ನನ್ನ ಉತ್ಪನ್ನಗಳನ್ನು ವೀಕ್ಷಿಸಿ',
    registerAnother: 'ಮತ್ತೊಂದು ಬ್ಯಾಚ್ ನೋಂದಾಯಿಸಿ',
    validationNotice: 'ನೋಂದಣಿ ದೋಷ',
    errorFallback:
      'ಉತ್ಪನ್ನವನ್ನು ಪರಿಶೀಲಿಸುವಾಗ ಅಥವಾ ಉಳಿಸುವಾಗ ಅನಿರೀಕ್ಷಿತ ದೋಷ ಸಂಭವಿಸಿದೆ.',
    connected: 'MetaMask ಸಂಪರ್ಕಗೊಂಡಿದೆ',
    unknown: 'ಅಜ್ಞಾತ',
    yes: 'ಹೌದು',
    no: 'ಇಲ್ಲ',
  },
};

type Language = keyof typeof translations;

export const RegisterProduce: React.FC = () => {
  const {
    currentUser,
    navigate,
    registerProductBatch,
    setSelectedBatchId,
  } = useApp();

  const { wallet, connect, isSepolia, switchToSepolia } = useWallet();
  const { language } = useFarmerLanguage();

  const lang: Language = language in translations
    ? (language as Language)
    : 'en';

  const t = translations[lang];
  const formRef = useRef<HTMLDivElement>(null);
  const todayStr = new Date().toISOString().split('T')[0];

  const initialForm = (): FormState => ({
    cropName: '',
    cropVariety: '',
    quantity: '',
    unit: 'kg',
    farmName: currentUser?.organization || '',
    farmLocation: currentUser?.location?.split(',')[0]?.trim() || '',
    district: '',
    state: 'Maharashtra',
    pinCode: '',
    harvestDate: todayStr,
    qualityGrade: 'Grade A',
    certification: '',
    notes: '',
    farmgatePrice: '',
    priceUnit: '₹ / kg',
  });

  const [formData, setFormData] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionProgress, setSubmissionProgress] = useState<string | null>(
    null,
  );
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [registeredBatch, setRegisteredBatch] = useState<ProduceBatch | null>(
    null,
  );

  const handleChange = (field: keyof FormState, value: string) => {
    setFormData((previous) => {
      const updated = { ...previous, [field]: value };

      if (field === 'unit') {
        updated.priceUnit = `₹ / ${value}`;
      }

      return updated;
    });

    if (field in errors) {
      setErrors((previous) => ({ ...previous, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.cropName.trim()) {
      newErrors.cropName = t.errors.cropName;
    }

    const quantity = Number.parseFloat(formData.quantity);

    if (!formData.quantity.trim()) {
      newErrors.quantity = t.errors.quantityRequired;
    } else if (!Number.isFinite(quantity) || quantity <= 0) {
      newErrors.quantity = t.errors.quantityPositive;
    }

    if (!formData.unit) {
      newErrors.unit = t.errors.unit;
    }

    if (!formData.farmLocation.trim()) {
      newErrors.farmLocation = t.errors.farmLocation;
    }

    if (!formData.state.trim()) {
      newErrors.state = t.errors.state;
    }

    if (!formData.harvestDate) {
      newErrors.harvestDate = t.errors.harvestDate;
    } else if (formData.harvestDate > todayStr) {
      newErrors.harvestDate = t.errors.futureDate;
    }

    if (!formData.qualityGrade) {
      newErrors.qualityGrade = t.errors.quality;
    }

    const price = Number.parseFloat(formData.farmgatePrice);

    if (!formData.farmgatePrice.trim()) {
      newErrors.farmgatePrice = t.errors.priceRequired;
    } else if (!Number.isFinite(price) || price <= 0) {
      newErrors.farmgatePrice = t.errors.pricePositive;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      formRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmissionError(null);
      setSubmissionProgress(t.wallet.connectHelp);

      const batchData = {
        cropName: formData.cropName.trim(),
        cropVariety: formData.cropVariety.trim() || undefined,
        quantity: Number.parseFloat(formData.quantity),
        unit: formData.unit,
        farmName: formData.farmName.trim() || undefined,
        farmLocation: formData.farmLocation.trim(),
        district: formData.district.trim() || undefined,
        state: formData.state.trim(),
        pinCode: formData.pinCode.trim() || undefined,
        harvestDate: formData.harvestDate,
        qualityGrade: formData.qualityGrade,
        certification: formData.certification.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        farmgatePrice: Number.parseFloat(formData.farmgatePrice),
        priceUnit: formData.priceUnit || `₹ / ${formData.unit}`,
        farmerId: currentUser?.id || 'usr-farmer-01',
        farmerName: currentUser?.name || 'Verified Producer',
      };

      const created = await registerProductBatch(
        batchData,
        (progress: string) => {
          setSubmissionProgress(progress);
        },
      );

      setRegisteredBatch(created);
    } catch (err: unknown) {
      console.error('Failed to register produce:', err);

      setSubmissionError(
        err instanceof Error ? err.message : t.errorFallback,
      );
    } finally {
      setIsSubmitting(false);
      setSubmissionProgress(null);
    }
  };

  const handleEditDetails = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleRegisterAnother = () => {
    setRegisteredBatch(null);
    setFormData(initialForm());
    setErrors({});
    setSubmissionError(null);
  };

  const fieldClass = (error?: string) =>
    `w-full px-3.5 py-2.5 text-xs bg-slate-50 border rounded-xl outline-none transition ${
      error
        ? 'border-rose-400 bg-rose-50/40 focus:border-rose-600'
        : 'border-slate-300 focus:border-emerald-600 focus:bg-white'
    }`;

  const errorMessage = (message?: string) =>
    message ? (
      <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-rose-600">
        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
        <span>{message}</span>
      </p>
    ) : null;

  const label = (
    text: string,
    id: string,
    optional = false,
  ) => (
    <label
      htmlFor={id}
      className="mb-1.5 block text-xs font-semibold text-slate-700"
    >
      {text}{' '}
      {optional ? (
        <span className="text-[11px] font-normal text-slate-400">
          ({t.optional})
        </span>
      ) : (
        <span className="text-rose-500">*</span>
      )}
    </label>
  );

  const sectionHeader = (
    letter: string,
    heading: string,
    description: string,
  ) => (
    <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-xs font-bold text-emerald-700">
        {letter}
      </div>
      <div>
        <h2 className="text-base font-bold text-slate-900">{heading}</h2>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
    </div>
  );

  const inputWrapper = (children: React.ReactNode, className = '') => (
    <div className={className}>{children}</div>
  );

  const displayCrop = formData.cropName.trim() || '—';
  const displayVariety = formData.cropVariety.trim() || '—';
  const displayQuantity = formData.quantity.trim()
    ? `${formData.quantity} ${formData.unit}`
    : '—';
  const displayLocation =
    [formData.farmLocation.trim(), formData.state.trim()]
      .filter(Boolean)
      .join(', ') || '—';

  const displayHarvestDate = formData.harvestDate
    ? new Date(`${formData.harvestDate}T00:00:00`).toLocaleDateString(
        lang === 'hi' ? 'hi-IN' : lang === 'kn' ? 'kn-IN' : 'en-GB',
        { day: 'numeric', month: 'short', year: 'numeric' },
      )
    : '—';

  const displayPrice = formData.farmgatePrice.trim()
    ? `₹${formData.farmgatePrice} / ${formData.unit}`
    : '—';

  const contractAddress =
    registeredBatch?.blockchain?.contractAddress ||
    '0x110D36B8FA4FAc2Fc214c1F341261BA6654a57Ef';

  if (registeredBatch) {
    const targetId =
      registeredBatch.batchId ||
      registeredBatch.blockchain?.mintTxHash ||
      registeredBatch.id;

    const txHash = registeredBatch.blockchain?.mintTxHash;

    return (
      <div className="mx-auto max-w-3xl space-y-6 pb-16">
        <div className="flex items-center justify-start">
          <BackButton fallback="/farmer/dashboard" />
        </div>

        <div className="space-y-6 rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-xs sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-9 w-9" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              {t.success}
            </h1>
            <p className="mx-auto max-w-lg text-xs text-slate-500 sm:text-sm">
              {t.successDescription}
            </p>
          </div>

          <div className="mx-auto max-w-lg divide-y divide-slate-200/80 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-left text-sm">
            <div className="flex items-center justify-between gap-3 pb-3">
              <span className="font-medium text-slate-500">{t.batchId}</span>
              <span className="rounded border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 font-mono text-base font-bold text-emerald-700">
                {registeredBatch.batchId}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 py-3">
              <span className="font-medium text-slate-500">{t.crop}</span>
              <span className="text-right font-bold text-slate-900">
                {registeredBatch.cropVariety
                  ? `${registeredBatch.cropVariety} ${registeredBatch.cropName}`
                  : registeredBatch.cropName}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 py-3">
              <span className="font-medium text-slate-500">{t.fields.quantity}</span>
              <span className="font-bold text-slate-900">
                {registeredBatch.quantity} {registeredBatch.unit}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 py-3">
              <span className="font-medium text-slate-500">{t.fields.farmgatePrice}</span>
              <span className="font-bold text-emerald-700">
                ₹{registeredBatch.farmgatePrice} / {registeredBatch.unit}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 py-3">
              <span className="font-medium text-slate-500">{t.smartContract}</span>
              <a
                href={`https://sepolia.etherscan.io/address/${contractAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="max-w-[200px] truncate font-mono text-xs font-bold text-emerald-700 underline hover:text-emerald-800"
              >
                {contractAddress.slice(0, 8)}...{contractAddress.slice(-6)}
              </a>
            </div>

            <div className="flex items-center justify-between gap-3 py-3">
              <span className="font-medium text-slate-500">{t.transactionHash}</span>
              {txHash?.startsWith('0x') ? (
                <a
                  href={`https://sepolia.etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="max-w-[200px] truncate font-mono text-xs font-bold text-emerald-700 underline hover:text-emerald-800"
                >
                  {txHash.slice(0, 10)}...{txHash.slice(-8)}
                </a>
              ) : (
                <span className="font-mono text-xs text-slate-700">
                  {t.confirmedLedger}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 py-3">
              <span className="font-medium text-slate-500">{t.blockNumber}</span>
              <span className="font-mono font-bold text-slate-900">
                #{registeredBatch.blockchain?.blockNumber || t.confirmedLedger}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 pt-3">
              <span className="font-medium text-slate-500">{t.status}</span>
              <span className="text-xs font-bold text-emerald-700">
                {registeredBatch.status || t.registered}
              </span>
            </div>
          </div>

          <div className="mx-auto max-w-lg space-y-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-6 text-left">
            <div className="text-xs font-bold text-emerald-950">
              {t.nextSteps}
            </div>

            <ol className="space-y-3 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                  1
                </span>
                <div>
                  <strong className="text-slate-900">{t.qrStep}:</strong>{' '}
                  {t.qrHelp}
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                  2
                </span>
                <div>
                  <strong className="text-slate-900">{t.trackingStep}:</strong>{' '}
                  {t.trackingHelp}
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                  3
                </span>
                <div>
                  <strong className="text-slate-900">{t.detailsStep}:</strong>{' '}
                  {t.detailsHelp}
                </div>
              </li>
            </ol>
          </div>

          <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={() => {
                if (targetId) {
                  setSelectedBatchId(targetId);
                  navigate(`/verify/${encodeURIComponent(targetId)}`);
                } else {
                  navigate('/verify');
                }
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-xs font-bold text-white transition hover:bg-emerald-800 sm:w-auto"
            >
              <FileCheck className="h-4 w-4" />
              {t.verify}
            </button>

            <button
              type="button"
              onClick={() => navigate('/farmer/qr-codes')}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-xs font-bold text-white transition hover:bg-emerald-500 sm:w-auto"
            >
              <QrCode className="h-4 w-4" />
              {t.generateQR}
            </button>

            <button
              type="button"
              onClick={() => navigate('/farmer/my-produce')}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-6 py-3 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100 sm:w-auto"
            >
              <Package className="h-4 w-4" />
              {t.viewProduce}
            </button>

            <button
              type="button"
              onClick={handleRegisterAnother}
              className="w-full rounded-xl border border-slate-300 bg-white px-5 py-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 sm:w-auto"
            >
              {t.registerAnother}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={formRef} className="mx-auto max-w-4xl space-y-6 pb-16">
      <div className="flex items-center justify-start">
        <BackButton fallback="/farmer/dashboard" />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              {t.title}
            </h1>
            <p className="max-w-xl text-xs text-slate-500 sm:text-sm">
              {t.subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/farmer/my-produce')}
            className="flex items-center gap-1.5 self-start rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 sm:self-auto"
          >
            <Package className="h-4 w-4 text-slate-500" />
            {t.myBatches}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-8">
        <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
          {sectionHeader('A', t.sections.a, t.sections.aHelp)}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {inputWrapper(
              <>
                {label(t.fields.cropName, 'input-cropName')}
                <input
                  id="input-cropName"
                  value={formData.cropName}
                  onChange={(e) => handleChange('cropName', e.target.value)}
                  placeholder={t.placeholders.cropName}
                  className={fieldClass(errors.cropName)}
                />
                {errorMessage(errors.cropName)}
              </>,
            )}

            {inputWrapper(
              <>
                {label(t.fields.cropVariety, 'input-cropVariety', true)}
                <input
                  id="input-cropVariety"
                  value={formData.cropVariety}
                  onChange={(e) => handleChange('cropVariety', e.target.value)}
                  placeholder={t.placeholders.cropVariety}
                  className={fieldClass()}
                />
              </>,
            )}

            {inputWrapper(
              <>
                {label(t.fields.quantity, 'input-quantity')}
                <input
                  id="input-quantity"
                  type="number"
                  min="0.01"
                  step="any"
                  value={formData.quantity}
                  onChange={(e) => handleChange('quantity', e.target.value)}
                  placeholder={t.placeholders.quantity}
                  className={fieldClass(errors.quantity)}
                />
                {errorMessage(errors.quantity)}
              </>,
            )}

            {inputWrapper(
              <>
                {label(t.fields.unit, 'select-unit')}
                <select
                  id="select-unit"
                  value={formData.unit}
                  onChange={(e) =>
                    handleChange('unit', e.target.value as ProduceUnit)
                  }
                  className={fieldClass(errors.unit)}
                >
                  {UNIT_OPTIONS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
                {errorMessage(errors.unit)}
              </>,
            )}
          </div>
        </section>

        <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
          {sectionHeader('B', t.sections.b, t.sections.bHelp)}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              {label(t.fields.farmName, 'input-farmName', true)}
              <input
                id="input-farmName"
                value={formData.farmName}
                onChange={(e) => handleChange('farmName', e.target.value)}
                placeholder={t.placeholders.farmName}
                className={fieldClass()}
              />
            </div>

            <div>
              {label(t.fields.farmLocation, 'input-farmLocation')}
              <input
                id="input-farmLocation"
                value={formData.farmLocation}
                onChange={(e) => handleChange('farmLocation', e.target.value)}
                placeholder={t.placeholders.farmLocation}
                className={fieldClass(errors.farmLocation)}
              />
              {errorMessage(errors.farmLocation)}
            </div>

            <div>
              {label(t.fields.district, 'input-district', true)}
              <input
                id="input-district"
                value={formData.district}
                onChange={(e) => handleChange('district', e.target.value)}
                placeholder={t.placeholders.district}
                className={fieldClass()}
              />
            </div>

            <div>
              {label(t.fields.state, 'input-state')}
              <input
                id="input-state"
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value)}
                placeholder={t.placeholders.state}
                className={fieldClass(errors.state)}
              />
              {errorMessage(errors.state)}
            </div>

            <div>
              {label(t.fields.pinCode, 'input-pinCode', true)}
              <input
                id="input-pinCode"
                value={formData.pinCode}
                onChange={(e) => handleChange('pinCode', e.target.value)}
                placeholder={t.placeholders.pinCode}
                className={fieldClass()}
              />
            </div>
          </div>
        </section>

        <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
          {sectionHeader('C', t.sections.c, t.sections.cHelp)}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              {label(t.fields.harvestDate, 'input-harvestDate')}
              <input
                id="input-harvestDate"
                type="date"
                max={todayStr}
                value={formData.harvestDate}
                onChange={(e) => handleChange('harvestDate', e.target.value)}
                className={fieldClass(errors.harvestDate)}
              />
              {errorMessage(errors.harvestDate)}
            </div>

            <div>
              {label(t.fields.qualityGrade, 'select-qualityGrade')}
              <select
                id="select-qualityGrade"
                value={formData.qualityGrade}
                onChange={(e) =>
                  handleChange('qualityGrade', e.target.value as QualityGrade)
                }
                className={fieldClass(errors.qualityGrade)}
              >
                {GRADE_OPTIONS.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
              {errorMessage(errors.qualityGrade)}
            </div>

            <div className="sm:col-span-2">
              {label(t.fields.certification, 'input-certification', true)}
              <input
                id="input-certification"
                value={formData.certification}
                onChange={(e) => handleChange('certification', e.target.value)}
                placeholder={t.placeholders.certification}
                className={fieldClass()}
              />
              <p className="mt-1 text-[11px] text-slate-400">
                {t.certificationNote}
              </p>
            </div>

            <div className="sm:col-span-2">
              {label(t.fields.notes, 'input-notes', true)}
              <textarea
                id="input-notes"
                rows={3}
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder={t.placeholders.notes}
                className={`${fieldClass()} resize-none`}
              />
            </div>
          </div>
        </section>

        <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
          {sectionHeader('D', t.sections.d, t.sections.dHelp)}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              {label(t.fields.farmgatePrice, 'input-farmgatePrice')}
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">
                  ₹
                </span>
                <input
                  id="input-farmgatePrice"
                  type="number"
                  min="0.01"
                  step="any"
                  value={formData.farmgatePrice}
                  onChange={(e) =>
                    handleChange('farmgatePrice', e.target.value)
                  }
                  placeholder={t.placeholders.farmgatePrice}
                  className={`${fieldClass(errors.farmgatePrice)} pl-8 font-semibold`}
                />
              </div>
              {errorMessage(errors.farmgatePrice)}
            </div>

            <div>
              {label(t.fields.priceUnit, 'input-priceUnit')}
              <input
                id="input-priceUnit"
                value={formData.priceUnit}
                onChange={(e) => handleChange('priceUnit', e.target.value)}
                placeholder={t.placeholders.priceUnit}
                className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 font-mono text-xs text-slate-700 outline-none"
              />
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-slate-50 p-4">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
            <p className="text-xs leading-relaxed text-slate-600">
              {t.pricingNote}
            </p>
          </div>
        </section>

        <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
          {sectionHeader('E', t.sections.e, t.sections.eHelp)}

          <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <span className="text-xs font-bold text-slate-700">
                {t.preview}
              </span>
              <span className="text-right font-mono text-xs text-slate-500">
                {t.autoAssigned}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs sm:grid-cols-4">
              <div>
                <span className="mb-1 block text-[11px] text-slate-400">
                  {t.crop}
                </span>
                <strong className="block truncate font-bold text-slate-900">
                  {displayCrop}
                </strong>
              </div>

              <div>
                <span className="mb-1 block text-[11px] text-slate-400">
                  {t.fields.cropVariety}
                </span>
                <span className="block truncate font-medium text-slate-700">
                  {displayVariety}
                </span>
              </div>

              <div>
                <span className="mb-1 block text-[11px] text-slate-400">
                  {t.fields.quantity}
                </span>
                <strong className="block font-bold text-slate-900">
                  {displayQuantity}
                </strong>
              </div>

              <div>
                <span className="mb-1 block text-[11px] text-slate-400">
                  {t.fields.farmLocation}
                </span>
                <span className="block truncate font-medium text-slate-700">
                  {displayLocation}
                </span>
              </div>

              <div>
                <span className="mb-1 block text-[11px] text-slate-400">
                  {t.fields.harvestDate}
                </span>
                <span className="block font-medium text-slate-700">
                  {displayHarvestDate}
                </span>
              </div>

              <div>
                <span className="mb-1 block text-[11px] text-slate-400">
                  {t.fields.qualityGrade}
                </span>
                <span className="inline-block rounded border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold text-slate-800">
                  {formData.qualityGrade}
                </span>
              </div>

              <div>
                <span className="mb-1 block text-[11px] text-slate-400">
                  {t.fields.farmgatePrice}
                </span>
                <strong className="block font-black text-emerald-700">
                  {displayPrice}
                </strong>
              </div>

              <div>
                <span className="mb-1 block text-[11px] text-slate-400">
                  {t.producer}
                </span>
                <span className="block truncate font-medium text-slate-700">
                  {currentUser?.name || 'Farmer'}
                </span>
              </div>
            </div>
          </div>

          {!wallet.isConnected ? (
            <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4 text-xs text-slate-100 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2.5">
                <div className="shrink-0 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2 text-emerald-400">
                  <Wallet className="h-4 w-4" />
                </div>
                <div>
                  <span className="block font-bold text-white">
                    {t.wallet.notConnected}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {t.wallet.connectHelp}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => connect()}
                disabled={wallet.isConnecting}
                className="flex w-full shrink-0 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-60 sm:w-auto"
              >
                <Wallet className="h-3.5 w-3.5" />
                {wallet.isConnecting
                  ? t.wallet.connecting
                  : t.wallet.connect}
              </button>
            </div>
          ) : !isSepolia ? (
            <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-amber-800 bg-amber-950/50 p-4 text-xs text-amber-200 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2.5">
                <div className="shrink-0 rounded-xl border border-amber-500/20 bg-amber-500/10 p-2 text-amber-400">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div>
                  <span className="block font-bold text-amber-100">
                    {t.wallet.switchTitle}
                  </span>
                  <span className="text-[11px] text-amber-300/80">
                    {t.wallet.switchHelp} {wallet.networkName || `Chain ${wallet.chainId}`}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => switchToSepolia()}
                className="w-full shrink-0 rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-amber-500 sm:w-auto"
              >
                {t.wallet.switch}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-900">
              <div className="flex items-center gap-2.5">
                <span className="h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-emerald-500" />
                <div>
                  <span className="block font-bold text-emerald-900">
                    {t.connected}:{' '}
                    <span className="font-mono">
                      {wallet.address?.slice(0, 8)}...
                      {wallet.address?.slice(-6)}
                    </span>
                  </span>
                  <span className="text-[11px] text-emerald-700">
                    {t.wallet.network} · {t.wallet.contract}: 0x110D...57Ef
                  </span>
                </div>
              </div>
              <span className="shrink-0 rounded-full border border-emerald-300 bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                {t.wallet.ready}
              </span>
            </div>
          )}

          {submissionError && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
              <div className="flex-1">
                <span className="mb-0.5 block font-bold text-rose-900">
                  {t.validationNotice}
                </span>
                <span>{submissionError}</span>
              </div>
            </div>
          )}

          <div className="flex flex-col items-center justify-end gap-3 pt-2 sm:flex-row">
            <button
              id="btn-edit-details"
              type="button"
              onClick={handleEditDetails}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 sm:w-auto"
            >
              <Edit3 className="h-4 w-4 text-slate-500" />
              {t.edit}
            </button>

            <button
              id="btn-submit-register"
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-7 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-400 sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  <span>{submissionProgress || t.submitting}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{t.submit}</span>
                </>
              )}
            </button>
          </div>
        </section>
      </form>
    </div>
  );
};

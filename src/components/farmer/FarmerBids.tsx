import { BackButton } from '../common/BackButton';
import React, { useState } from 'react';
import {
  Handshake,
  Package,
  CheckCircle2,
  ArrowUpRight,
  ShieldCheck,
  Truck,
  Building2,
  Calendar,
  TrendingUp,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useFarmerLanguage } from '../../context/FarmerLanguageContext';

export interface ProcurementBid {
  id: string;
  buyerName: string;
  buyerType: 'Distributor' | 'Retailer' | 'Exporters Consortium';
  buyerLocation: string;
  crop: string;
  variety: string;
  batchId?: string;
  quantityKg: number;
  offeredPricePerKg: number;
  mandiBenchmarkPrice: number;
  advanceEscrowPercent: number;
  pickupDate: string;
  transportProvided: boolean;
  status: 'Pending' | 'Accepted' | 'Countered' | 'Declined';
  contractType: 'Forward Purchase' | 'Spot Procurement';
  notes: string;
}

const INITIAL_BIDS: ProcurementBid[] = [
  {
    id: 'bid-001',
    buyerName: 'KisanLogix Agri Cold-Chain Solutions',
    buyerType: 'Distributor',
    buyerLocation: 'Pune Logistics Hub, Maharashtra',
    crop: 'Alphonso Mango',
    variety: 'Ratnagiri Hapus GI-139',
    batchId: 'AGRI-2026-MNG-001',
    quantityKg: 800,
    offeredPricePerKg: 135,
    mandiBenchmarkPrice: 120,
    advanceEscrowPercent: 40,
    pickupDate: '2026-05-18',
    transportProvided: true,
    status: 'Pending',
    contractType: 'Forward Purchase',
    notes: 'Requires refrigerated reefers maintained between 12-14°C. Advance deposit locked in consortium smart contract.',
  },
  {
    id: 'bid-002',
    buyerName: 'FreshRoot Organic Markets Ltd',
    buyerType: 'Retailer',
    buyerLocation: 'Bandra West, Mumbai',
    crop: 'Vine Tomatoes',
    variety: 'Roma San Marzano',
    batchId: 'AGRI-2026-TOM-003',
    quantityKg: 450,
    offeredPricePerKg: 32,
    mandiBenchmarkPrice: 28,
    advanceEscrowPercent: 50,
    pickupDate: '2026-05-14',
    transportProvided: false,
    status: 'Pending',
    contractType: 'Spot Procurement',
    notes: 'Direct farm-to-shelf delivery to Mumbai store. Grade A zero-residue certified only.',
  },
  {
    id: 'bid-003',
    buyerName: 'MahaAgro Export Consortium',
    buyerType: 'Exporters Consortium',
    buyerLocation: 'JNPT Port Free Trade Zone, Navi Mumbai',
    crop: 'Basmati Rice',
    variety: 'Dehradun Organic 1121',
    batchId: 'AGRI-2026-RIC-002',
    quantityKg: 1200,
    offeredPricePerKg: 72,
    mandiBenchmarkPrice: 65,
    advanceEscrowPercent: 30,
    pickupDate: '2026-05-25',
    transportProvided: true,
    status: 'Accepted',
    contractType: 'Forward Purchase',
    notes: 'Contract executed on Ethereum Sepolia. Advance escrow of ₹25,920 released to farmer wallet.',
  },
  {
    id: 'bid-004',
    buyerName: 'Reliance Retail Agri Sourcing',
    buyerType: 'Retailer',
    buyerLocation: 'Thane Central Fulfillment Center',
    crop: 'Royal Delicious Apple',
    variety: 'Kinnaur Mountain Organic',
    batchId: 'AGRI-2026-APL-005',
    quantityKg: 600,
    offeredPricePerKg: 102,
    mandiBenchmarkPrice: 95,
    advanceEscrowPercent: 35,
    pickupDate: '2026-05-20',
    transportProvided: true,
    status: 'Pending',
    contractType: 'Forward Purchase',
    notes: 'Quality inspection on loading. Smart contract auto-settlement on GPS delivery confirmation.',
  },
];

type Language = 'en' | 'hi' | 'kn';

const translations: Record<Language, Record<string, string>> = {
  en: {
    title: 'Procurement Bids & Forward Contracts',
    description: 'Receive verified procurement offers directly from cold-chain distributors, organic retailers, and export consortiums with smart contract escrow protection.',
    compareRates: 'Compare Mandi Rates',
    registerProduce: 'Register Produce for Bids',
    activeOffers: 'Active Procurement Offers',
    bidsPending: 'Bids Pending',
    aboveMinimum: 'Above APMC Mandi Minimums',
    lockedEscrow: 'Accepted Contract Value',
    guaranteedSettlement: 'Smart contract settlement terms',
    averagePremium: 'Average Price Premium',
    aboveTraditional: 'Compared with traditional local market rates',
    allBids: 'All Bids',
    pending: 'Pending',
    acceptedContracts: 'Accepted Contracts',
    escrowActive: 'Consortium Multi-Sig Escrow Active',
    noBids: 'No bids found in this category',
    noBidsDescription: 'Verified buyer procurement offers will appear here.',
    contractType: 'Contract Type',
    terms: 'Terms & SLA:',
    produceVariety: 'Produce & Variety',
    requestedVolume: 'Requested Volume',
    advanceEscrow: 'Advance Escrow Deposit',
    onSigning: 'on signing',
    upfront: 'upfront',
    pickupTransport: 'Pickup & Transport',
    buyerTransports: 'Buyer Transports',
    farmerDelivery: 'Farmer Delivery',
    date: 'Date',
    scheduledDispatch: 'Scheduled dispatch:',
    decline: 'Decline',
    counterOffer: 'Counter Offer',
    acceptEscrow: 'Accept & Lock Escrow',
    contractActive: 'Smart Contract Active • Escrow Secured',
    awaitingResponse: 'Awaiting response from',
    submitCounter: 'Submit Counter-Offer',
    buyer: 'Buyer:',
    produce: 'Produce:',
    theirOffer: 'Their Offer:',
    mandiRate: 'Mandi rate:',
    proposedRate: 'Your Proposed Rate (₹ / kg)',
    revisedPrice: 'Enter revised price',
    totalContract: 'Total contract value at this rate:',
    cancel: 'Cancel',
    sendCounter: 'Send Counter-Offer',
    smartExecuted: 'Smart Contract Executed: Bid from',
    accepted: 'accepted! Advance escrow of',
    lockedForBatch: 'is locked in escrow for your batch.',
    declinedNotice: 'Bid from',
    declinedSuffix: 'declined.',
    transmitted: 'Counter-offer of',
    transmittedTo: 'transmitted to',
    invalidPrice: 'Enter a valid price greater than zero.',
    distributor: 'Distributor',
    retailer: 'Retailer',
    exporters: 'Exporters Consortium',
    forwardPurchase: 'Forward Purchase',
    spotProcurement: 'Spot Procurement',
    statusPending: 'Pending',
    statusAccepted: 'Accepted',
    statusCountered: 'Countered',
    statusDeclined: 'Declined',
  },
  hi: {
    title: 'खरीद बोलियाँ और अग्रिम अनुबंध',
    description: 'स्मार्ट कॉन्ट्रैक्ट एस्क्रो सुरक्षा के साथ कोल्ड-चेन वितरकों, जैविक खुदरा विक्रेताओं और निर्यातक समूहों से सत्यापित खरीद प्रस्ताव प्राप्त करें।',
    compareRates: 'मंडी दरों की तुलना करें',
    registerProduce: 'बोली के लिए उपज दर्ज करें',
    activeOffers: 'सक्रिय खरीद प्रस्ताव',
    bidsPending: 'लंबित बोलियाँ',
    aboveMinimum: 'APMC मंडी की न्यूनतम दरों से अधिक',
    lockedEscrow: 'स्वीकृत अनुबंध का मूल्य',
    guaranteedSettlement: 'स्मार्ट कॉन्ट्रैक्ट निपटान शर्तें',
    averagePremium: 'औसत मूल्य प्रीमियम',
    aboveTraditional: 'पारंपरिक स्थानीय बाजार दरों की तुलना में',
    allBids: 'सभी बोलियाँ',
    pending: 'लंबित',
    acceptedContracts: 'स्वीकृत अनुबंध',
    escrowActive: 'कंसोर्टियम मल्टी-सिग एस्क्रो सक्रिय',
    noBids: 'इस श्रेणी में कोई बोली नहीं मिली',
    noBidsDescription: 'सत्यापित खरीदारों के खरीद प्रस्ताव यहाँ दिखाई देंगे।',
    contractType: 'अनुबंध प्रकार',
    terms: 'शर्तें और SLA:',
    produceVariety: 'उपज और किस्म',
    requestedVolume: 'माँगी गई मात्रा',
    advanceEscrow: 'अग्रिम एस्क्रो जमा',
    onSigning: 'हस्ताक्षर पर',
    upfront: 'अग्रिम',
    pickupTransport: 'उठान और परिवहन',
    buyerTransports: 'खरीदार परिवहन करेगा',
    farmerDelivery: 'किसान डिलीवरी',
    date: 'तारीख',
    scheduledDispatch: 'निर्धारित प्रेषण:',
    decline: 'अस्वीकार करें',
    counterOffer: 'प्रति-प्रस्ताव',
    acceptEscrow: 'स्वीकार करें और एस्क्रो लॉक करें',
    contractActive: 'स्मार्ट कॉन्ट्रैक्ट सक्रिय • एस्क्रो सुरक्षित',
    awaitingResponse: 'से उत्तर की प्रतीक्षा:',
    submitCounter: 'प्रति-प्रस्ताव भेजें',
    buyer: 'खरीदार:',
    produce: 'उपज:',
    theirOffer: 'उनका प्रस्ताव:',
    mandiRate: 'मंडी दर:',
    proposedRate: 'आपकी प्रस्तावित दर (₹ / किग्रा)',
    revisedPrice: 'नई कीमत दर्ज करें',
    totalContract: 'इस दर पर कुल अनुबंध मूल्य:',
    cancel: 'रद्द करें',
    sendCounter: 'प्रति-प्रस्ताव भेजें',
    smartExecuted: 'स्मार्ट कॉन्ट्रैक्ट निष्पादित: ',
    accepted: 'ने प्रस्ताव स्वीकार किया! अग्रिम एस्क्रो राशि',
    lockedForBatch: 'आपके बैच के लिए एस्क्रो में लॉक है।',
    declinedNotice: 'का प्रस्ताव',
    declinedSuffix: 'अस्वीकार किया गया।',
    transmitted: '₹ दर का प्रति-प्रस्ताव',
    transmittedTo: 'को भेजा गया',
    invalidPrice: 'शून्य से अधिक एक मान्य कीमत दर्ज करें।',
    distributor: 'वितरक',
    retailer: 'खुदरा विक्रेता',
    exporters: 'निर्यातक समूह',
    forwardPurchase: 'अग्रिम खरीद',
    spotProcurement: 'तत्काल खरीद',
    statusPending: 'लंबित',
    statusAccepted: 'स्वीकृत',
    statusCountered: 'प्रति-प्रस्ताव भेजा',
    statusDeclined: 'अस्वीकृत',
  },
  kn: {
    title: 'ಖರೀದಿ ಬಿಡ್‌ಗಳು ಮತ್ತು ಮುಂಗಡ ಒಪ್ಪಂದಗಳು',
    description: 'ಕೋಲ್ಡ್-ಚೈನ್ ವಿತರಕರು, ಸಾವಯವ ಚಿಲ್ಲರೆ ವ್ಯಾಪಾರಿಗಳು ಮತ್ತು ರಫ್ತುದಾರರ ಒಕ್ಕೂಟಗಳಿಂದ ಸ್ಮಾರ್ಟ್ ಕಾಂಟ್ರಾಕ್ಟ್ ಎಸ್ಕ್ರೋ ರಕ್ಷಣೆಯೊಂದಿಗೆ ಪರಿಶೀಲಿತ ಖರೀದಿ ಕೊಡುಗೆಗಳನ್ನು ಪಡೆಯಿರಿ.',
    compareRates: 'ಮಂಡಿ ದರಗಳನ್ನು ಹೋಲಿಸಿ',
    registerProduce: 'ಬಿಡ್‌ಗಳಿಗಾಗಿ ಉತ್ಪನ್ನ ನೋಂದಣಿ',
    activeOffers: 'ಸಕ್ರಿಯ ಖರೀದಿ ಕೊಡುಗೆಗಳು',
    bidsPending: 'ಬಾಕಿ ಇರುವ ಬಿಡ್‌ಗಳು',
    aboveMinimum: 'APMC ಮಂಡಿಯ ಕನಿಷ್ಠ ದರಕ್ಕಿಂತ ಹೆಚ್ಚು',
    lockedEscrow: 'ಸ್ವೀಕೃತ ಒಪ್ಪಂದದ ಮೌಲ್ಯ',
    guaranteedSettlement: 'ಸ್ಮಾರ್ಟ್ ಕಾಂಟ್ರಾಕ್ಟ್ ಇತ್ಯರ್ಥ ನಿಯಮಗಳು',
    averagePremium: 'ಸರಾಸರಿ ಬೆಲೆ ಪ್ರೀಮಿಯಂ',
    aboveTraditional: 'ಸಾಂಪ್ರದಾಯಿಕ ಸ್ಥಳೀಯ ಮಾರುಕಟ್ಟೆ ದರಗಳಿಗೆ ಹೋಲಿಸಿದರೆ',
    allBids: 'ಎಲ್ಲಾ ಬಿಡ್‌ಗಳು',
    pending: 'ಬಾಕಿ',
    acceptedContracts: 'ಸ್ವೀಕೃತ ಒಪ್ಪಂದಗಳು',
    escrowActive: 'ಒಕ್ಕೂಟದ ಮಲ್ಟಿ-ಸಿಗ್ ಎಸ್ಕ್ರೋ ಸಕ್ರಿಯವಾಗಿದೆ',
    noBids: 'ಈ ವಿಭಾಗದಲ್ಲಿ ಬಿಡ್‌ಗಳು ಕಂಡುಬಂದಿಲ್ಲ',
    noBidsDescription: 'ಪರಿಶೀಲಿತ ಖರೀದಿದಾರರ ಖರೀದಿ ಕೊಡುಗೆಗಳು ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ.',
    contractType: 'ಒಪ್ಪಂದದ ವಿಧ',
    terms: 'ನಿಯಮಗಳು ಮತ್ತು SLA:',
    produceVariety: 'ಉತ್ಪನ್ನ ಮತ್ತು ತಳಿ',
    requestedVolume: 'ಕೋರಿದ ಪ್ರಮಾಣ',
    advanceEscrow: 'ಮುಂಗಡ ಎಸ್ಕ್ರೋ ಠೇವಣಿ',
    onSigning: 'ಸಹಿ ಮಾಡುವಾಗ',
    upfront: 'ಮುಂಗಡವಾಗಿ',
    pickupTransport: 'ಸಂಗ್ರಹಣೆ ಮತ್ತು ಸಾರಿಗೆ',
    buyerTransports: 'ಖರೀದಿದಾರರ ಸಾರಿಗೆ',
    farmerDelivery: 'ರೈತರ ವಿತರಣೆ',
    date: 'ದಿನಾಂಕ',
    scheduledDispatch: 'ನಿಗದಿತ ರವಾನೆ:',
    decline: 'ತಿರಸ್ಕರಿಸಿ',
    counterOffer: 'ಪ್ರತಿ-ಪ್ರಸ್ತಾಪ',
    acceptEscrow: 'ಸ್ವೀಕರಿಸಿ ಮತ್ತು ಎಸ್ಕ್ರೋ ಲಾಕ್ ಮಾಡಿ',
    contractActive: 'ಸ್ಮಾರ್ಟ್ ಕಾಂಟ್ರಾಕ್ಟ್ ಸಕ್ರಿಯ • ಎಸ್ಕ್ರೋ ಸುರಕ್ಷಿತ',
    awaitingResponse: 'ಇವರ ಪ್ರತಿಕ್ರಿಯೆಗಾಗಿ ಕಾಯಲಾಗುತ್ತಿದೆ:',
    submitCounter: 'ಪ್ರತಿ-ಪ್ರಸ್ತಾಪ ಸಲ್ಲಿಸಿ',
    buyer: 'ಖರೀದಿದಾರ:',
    produce: 'ಉತ್ಪನ್ನ:',
    theirOffer: 'ಅವರ ಕೊಡುಗೆ:',
    mandiRate: 'ಮಂಡಿ ದರ:',
    proposedRate: 'ನಿಮ್ಮ ಪ್ರಸ್ತಾಪಿತ ದರ (₹ / ಕೆಜಿ)',
    revisedPrice: 'ಹೊಸ ಬೆಲೆಯನ್ನು ನಮೂದಿಸಿ',
    totalContract: 'ಈ ದರದ ಒಟ್ಟು ಒಪ್ಪಂದದ ಮೌಲ್ಯ:',
    cancel: 'ರದ್ದುಮಾಡಿ',
    sendCounter: 'ಪ್ರತಿ-ಪ್ರಸ್ತಾಪ ಕಳುಹಿಸಿ',
    smartExecuted: 'ಸ್ಮಾರ್ಟ್ ಕಾಂಟ್ರಾಕ್ಟ್ ಕಾರ್ಯಗತಗೊಂಡಿದೆ: ',
    accepted: 'ಅವರ ಬಿಡ್ ಸ್ವೀಕರಿಸಲಾಗಿದೆ! ಮುಂಗಡ ಎಸ್ಕ್ರೋ ಮೊತ್ತ',
    lockedForBatch: 'ನಿಮ್ಮ ಬ್ಯಾಚ್‌ಗಾಗಿ ಎಸ್ಕ್ರೋದಲ್ಲಿ ಲಾಕ್ ಮಾಡಲಾಗಿದೆ.',
    declinedNotice: 'ಅವರ ಬಿಡ್',
    declinedSuffix: 'ತಿರಸ್ಕರಿಸಲಾಗಿದೆ.',
    transmitted: 'ಪ್ರತಿ-ಪ್ರಸ್ತಾಪದ ದರ',
    transmittedTo: 'ಇವರಿಗೆ ಕಳುಹಿಸಲಾಗಿದೆ',
    invalidPrice: 'ಶೂನ್ಯಕ್ಕಿಂತ ಹೆಚ್ಚಿನ ಮಾನ್ಯ ಬೆಲೆಯನ್ನು ನಮೂದಿಸಿ.',
    distributor: 'ವಿತರಕರು',
    retailer: 'ಚಿಲ್ಲರೆ ವ್ಯಾಪಾರಿ',
    exporters: 'ರಫ್ತುದಾರರ ಒಕ್ಕೂಟ',
    forwardPurchase: 'ಮುಂಗಡ ಖರೀದಿ',
    spotProcurement: 'ತಕ್ಷಣದ ಖರೀದಿ',
    statusPending: 'ಬಾಕಿ',
    statusAccepted: 'ಸ್ವೀಕರಿಸಲಾಗಿದೆ',
    statusCountered: 'ಪ್ರತಿ-ಪ್ರಸ್ತಾಪಿಸಲಾಗಿದೆ',
    statusDeclined: 'ತಿರಸ್ಕರಿಸಲಾಗಿದೆ',
  },
};

export const FarmerBids: React.FC = () => {
  const { navigate } = useApp();
  const { language } = useFarmerLanguage();
  const t = translations[language as Language] || translations.en;

  const [bids, setBids] = useState<ProcurementBid[]>(INITIAL_BIDS);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'accepted'>('all');
  const [selectedBid, setSelectedBid] = useState<ProcurementBid | null>(null);
  const [isCounterModalOpen, setIsCounterModalOpen] = useState(false);
  const [counterPrice, setCounterPrice] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const formatMoney = (amount: number) =>
    amount.toLocaleString('en-IN');

  const statusLabel = (status: ProcurementBid['status']) => {
    const labels = {
      Pending: t.statusPending,
      Accepted: t.statusAccepted,
      Countered: t.statusCountered,
      Declined: t.statusDeclined,
    };
    return labels[status];
  };

  const buyerTypeLabel = (type: ProcurementBid['buyerType']) => {
    const labels = {
      Distributor: t.distributor,
      Retailer: t.retailer,
      'Exporters Consortium': t.exporters,
    };
    return labels[type];
  };

  const contractTypeLabel = (type: ProcurementBid['contractType']) => {
    const labels = {
      'Forward Purchase': t.forwardPurchase,
      'Spot Procurement': t.spotProcurement,
    };
    return labels[type];
  };

  const handleAcceptBid = (bidId: string) => {
    const bid = bids.find((item) => item.id === bidId);
    if (!bid) return;

    setBids((previous) =>
      previous.map((item) =>
        item.id === bidId ? { ...item, status: 'Accepted' } : item
      )
    );

    const advanceAmount = Math.round(
      (bid.quantityKg * bid.offeredPricePerKg * bid.advanceEscrowPercent) / 100
    );

    setActionNotice(
      `${t.smartExecuted} ${bid.buyerName} ${t.accepted} ₹${formatMoney(advanceAmount)} ${t.lockedForBatch}`
    );

    setTimeout(() => setActionNotice(null), 6000);
  };

  const handleDeclineBid = (bidId: string) => {
    const bid = bids.find((item) => item.id === bidId);
    if (!bid) return;

    setBids((previous) =>
      previous.map((item) =>
        item.id === bidId ? { ...item, status: 'Declined' } : item
      )
    );

    setActionNotice(`${t.declinedNotice} ${bid.buyerName} ${t.declinedSuffix}`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleOpenCounter = (bid: ProcurementBid) => {
    setSelectedBid(bid);
    setCounterPrice((bid.offeredPricePerKg + 5).toString());
    setIsCounterModalOpen(true);
  };

  const handleSubmitCounter = () => {
    if (!selectedBid || !counterPrice) return;

    const priceNum = parseFloat(counterPrice);

    if (isNaN(priceNum) || priceNum <= 0) {
      setActionNotice(t.invalidPrice);
      setTimeout(() => setActionNotice(null), 4000);
      return;
    }

    setBids((previous) =>
      previous.map((bid) =>
        bid.id === selectedBid.id
          ? {
              ...bid,
              status: 'Countered',
              offeredPricePerKg: priceNum,
              notes: `${bid.notes} [Farmer countered with ₹${priceNum}/kg on ${new Date().toLocaleDateString()}]`,
            }
          : bid
      )
    );

    setIsCounterModalOpen(false);
    setActionNotice(
      `${t.transmitted} ₹${priceNum}/kg ${t.transmittedTo} ${selectedBid.buyerName}.`
    );
    setTimeout(() => setActionNotice(null), 5000);
  };

  const filteredBids = bids.filter((bid) => {
    if (activeTab === 'pending') return bid.status === 'Pending';
    if (activeTab === 'accepted') return bid.status === 'Accepted';
    return true;
  });

  const totalContractValue = bids
    .filter((bid) => bid.status === 'Accepted')
    .reduce(
      (total, bid) => total + bid.quantityKg * bid.offeredPricePerKg,
      0
    );

  const pendingBidsCount = bids.filter(
    (bid) => bid.status === 'Pending'
  ).length;

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      <BackButton fallback="/farmer/dashboard" />
      {actionNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl flex items-center justify-between text-xs font-semibold animate-fadeIn shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="p-1 hover:bg-emerald-100 rounded-lg text-emerald-700"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Handshake className="w-7 h-7 text-emerald-600" />
              <span>{t.title}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
              {t.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/farmer/price-prediction')}
              className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>{t.compareRates}</span>
            </button>

            <button
              onClick={() => navigate('/farmer/register-produce')}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Package className="w-4 h-4" />
              <span>{t.registerProduce}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-400">
            {t.activeOffers}
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {pendingBidsCount} {t.bidsPending}
          </div>
          <span className="text-[11px] text-emerald-700 font-medium">
            {t.aboveMinimum}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-400">
            {t.lockedEscrow}
          </span>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            ₹{formatMoney(totalContractValue)}
          </div>
          <span className="text-[11px] text-slate-500">
            {t.guaranteedSettlement}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-400">
            {t.averagePremium}
          </span>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            +12.4%
          </div>
          <span className="text-[11px] text-slate-500">
            {t.aboveTraditional}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {(['all', 'pending', 'accepted'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === tab
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab === 'all'
                ? `${t.allBids} (${bids.length})`
                : tab === 'pending'
                  ? `${t.pending} (${pendingBidsCount})`
                  : t.acceptedContracts}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-400 font-medium">
          {t.escrowActive}
        </span>
      </div>

      <div className="space-y-4">
        {filteredBids.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
            <Handshake className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-700 text-sm">{t.noBids}</h3>
            <p className="text-xs text-slate-500">{t.noBidsDescription}</p>
          </div>
        ) : (
          filteredBids.map((bid) => {
            const totalValue = bid.quantityKg * bid.offeredPricePerKg;
            const advanceValue = Math.round(
              (totalValue * bid.advanceEscrowPercent) / 100
            );
            const premiumPercent = Math.round(
              ((bid.offeredPricePerKg - bid.mandiBenchmarkPrice) /
                bid.mandiBenchmarkPrice) *
                100
            );

            return (
              <div
                key={bid.id}
                className={`bg-white rounded-3xl p-6 border transition shadow-xs space-y-4 ${
                  bid.status === 'Accepted'
                    ? 'border-emerald-300 ring-1 ring-emerald-100'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                      <Building2 className="w-6 h-6" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 text-base">
                          {bid.buyerName}
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className="text-xs text-slate-500 font-medium">
                          {buyerTypeLabel(bid.buyerType)}
                        </span>
                        <span className="text-slate-300">|</span>
                        <span
                          className={`text-xs font-semibold ${
                            bid.status === 'Accepted'
                              ? 'text-emerald-700'
                              : bid.status === 'Countered'
                                ? 'text-amber-700'
                                : bid.status === 'Declined'
                                  ? 'text-rose-700'
                                  : 'text-blue-700'
                          }`}
                        >
                          {statusLabel(bid.status)}
                        </span>
                      </div>

                      <div className="text-xs text-slate-500">
                        {bid.buyerLocation} • {t.contractType}:{' '}
                        <span className="font-semibold text-slate-700">
                          {contractTypeLabel(bid.contractType)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col items-start md:items-end justify-between md:justify-center border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                    <div className="text-right">
                      <div className="text-2xl font-black text-emerald-700">
                        ₹{bid.offeredPricePerKg}
                        <span className="text-xs text-slate-500 font-normal">
                          /kg
                        </span>
                      </div>
                      <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 md:justify-end">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>
                          +{premiumPercent}% vs Mandi (₹
                          {bid.mandiBenchmarkPrice})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px] font-medium">
                      {t.produceVariety}
                    </span>
                    <span className="font-bold text-slate-800">{bid.crop}</span>
                    <span className="text-[10px] text-slate-500 block truncate">
                      {bid.variety}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px] font-medium">
                      {t.requestedVolume}
                    </span>
                    <span className="font-bold text-slate-800">
                      {bid.quantityKg.toLocaleString()} kg
                    </span>
                    <span className="text-[10px] text-emerald-700 block font-medium">
                      Total: ₹{formatMoney(totalValue)}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px] font-medium">
                      {t.advanceEscrow}
                    </span>
                    <span className="font-bold text-emerald-700">
                      {bid.advanceEscrowPercent}% {t.onSigning}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      ₹{formatMoney(advanceValue)} {t.upfront}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px] font-medium">
                      {t.pickupTransport}
                    </span>
                    <div className="flex items-center gap-1 text-slate-800 font-semibold">
                      <Truck className="w-3.5 h-3.5 text-blue-600" />
                      <span>
                        {bid.transportProvided
                          ? t.buyerTransports
                          : t.farmerDelivery}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 block">
                      {t.date}: {bid.pickupDate}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 bg-emerald-50/40 border border-emerald-100/60 p-3 rounded-xl flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-emerald-950">
                      {t.terms}{' '}
                    </span>
                    {bid.notes}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {t.scheduledDispatch}{' '}
                      <strong className="text-slate-700">
                        {bid.pickupDate}
                      </strong>
                    </span>
                  </div>

                  {bid.status === 'Pending' && (
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleDeclineBid(bid.id)}
                        className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                      >
                        {t.decline}
                      </button>

                      <button
                        onClick={() => handleOpenCounter(bid)}
                        className="px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition cursor-pointer"
                      >
                        {t.counterOffer}
                      </button>

                      <button
                        onClick={() => handleAcceptBid(bid.id)}
                        className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{t.acceptEscrow}</span>
                      </button>
                    </div>
                  )}

                  {bid.status === 'Accepted' && (
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t.contractActive}</span>
                    </div>
                  )}

                  {bid.status === 'Countered' && (
                    <div className="text-xs font-medium text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                      {t.awaitingResponse} {bid.buyerName}
                    </div>
                  )}

                  {bid.status === 'Declined' && (
                    <div className="text-xs font-medium text-rose-700 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200">
                      {statusLabel(bid.status)}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {isCounterModalOpen && selectedBid && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {t.submitCounter}
              </h3>
              <button
                onClick={() => setIsCounterModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"
                aria-label={t.cancel}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <div className="text-slate-500">
                  {t.buyer}{' '}
                  <strong className="text-slate-800">
                    {selectedBid.buyerName}
                  </strong>
                </div>
                <div className="text-slate-500">
                  {t.produce}{' '}
                  <strong className="text-slate-800">
                    {selectedBid.crop}
                  </strong>{' '}
                  ({selectedBid.quantityKg} kg)
                </div>
                <div className="text-slate-500">
                  {t.theirOffer}{' '}
                  <span className="font-bold text-slate-800">
                    ₹{selectedBid.offeredPricePerKg}/kg
                  </span>{' '}
                  ({t.mandiRate} ₹{selectedBid.mandiBenchmarkPrice}/kg)
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  {t.proposedRate}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={counterPrice}
                    onChange={(event) => setCounterPrice(event.target.value)}
                    className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-emerald-600 outline-none font-bold text-slate-900"
                    placeholder={t.revisedPrice}
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {t.totalContract}{' '}
                  <strong>
                    ₹
                    {formatMoney(
                      (parseFloat(counterPrice) || 0) * selectedBid.quantityKg
                    )}
                  </strong>
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsCounterModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleSubmitCounter}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs transition"
              >
                {t.sendCounter}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

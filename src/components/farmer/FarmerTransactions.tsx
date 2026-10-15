
import React, { useState } from 'react';
import {
  DollarSign,
  CheckCircle2,
  Clock,
  Download,
  Wallet,
  Building2,
  QrCode,
  FileText,
  Filter,
  Check,
  X,
} from 'lucide-react';
import { useFarmerLanguage } from '../../context/FarmerLanguageContext';
import { BackButton } from '../common/BackButton';

export interface EscrowTransaction {
  id: string;
  batchId: string;
  crop: string;
  amount: number;
  type: string;
  payer: string;
  payerRole: string;
  status:
    | 'Escrow Released to Wallet'
    | 'Smart Contract Escrow Locked'
    | 'Advance Deposit Released';
  date: string;
  hash: string;
  block: number;
  gasUsed: string;
  utrNumber: string;
}

const INITIAL_TRANSACTIONS: EscrowTransaction[] = [
  {
    id: 'tx-001',
    batchId: 'AGRI-2026-MNG-001',
    crop: 'Ratnagiri Alphonso Mangoes',
    amount: 144000,
    type: 'Direct Farmer Procurement Settlement',
    payer: 'KisanLogix Cold Fleet Ltd',
    payerRole: 'Distributor',
    status: 'Escrow Released to Wallet',
    date: '2026-05-02',
    hash: '0x9fa1c7849e89d10e0129bc88a71928019ab91284',
    block: 18945205,
    gasUsed: '0.0021 ETH (Consortium Subsidized)',
    utrNumber: 'CMS26050298124501',
  },
  {
    id: 'tx-002',
    batchId: 'AGRI-2026-RIC-002',
    crop: 'Dehradun Basmati Rice',
    amount: 162500,
    type: 'Consortium Forward Purchase Contract',
    payer: 'MahaAgro Export Consortium',
    payerRole: 'Exporters Consortium',
    status: 'Escrow Released to Wallet',
    date: '2026-04-29',
    hash: '0x3dc81048bca1209df1045938210398492019a827',
    block: 18944118,
    gasUsed: '0.0019 ETH (Consortium Subsidized)',
    utrNumber: 'CMS26042944018239',
  },
  {
    id: 'tx-003',
    batchId: 'AGRI-2026-TOM-003',
    crop: 'Organic Vine Tomatoes',
    amount: 19200,
    type: 'Direct Retail Perishable Settlement',
    payer: 'FreshRoot Retail Stores (Direct)',
    payerRole: 'Retailer',
    status: 'Smart Contract Escrow Locked',
    date: '2026-05-06',
    hash: '0x889a71b238914028591823901928374901928341',
    block: 18946012,
    gasUsed: '0.0024 ETH (Consortium Subsidized)',
    utrNumber: 'ESCROW-LOCK-77189',
  },
  {
    id: 'tx-004',
    batchId: 'AGRI-2026-TRM-004',
    crop: 'High Curcumin Turmeric',
    amount: 42000,
    type: 'Export Forward Purchase Agreement',
    payer: 'VedicSpice Agro Exporters',
    payerRole: 'Exporters Consortium',
    status: 'Escrow Released to Wallet',
    date: '2026-04-26',
    hash: '0x12a9bc489e81240189bfa98210398492019a8271',
    block: 18941098,
    gasUsed: '0.0018 ETH (Consortium Subsidized)',
    utrNumber: 'CMS26042611029384',
  },
  {
    id: 'tx-005',
    batchId: 'AGRI-2026-APL-005',
    crop: 'Royal Delicious Apple',
    amount: 76000,
    type: 'Cold-Chain Procurement Advance (40%)',
    payer: 'Reliance Retail Agri Sourcing',
    payerRole: 'Retailer',
    status: 'Advance Deposit Released',
    date: '2026-05-08',
    hash: '0x55ef019283bc8192830192837490192834109283',
    block: 18947150,
    gasUsed: '0.0020 ETH (Consortium Subsidized)',
    utrNumber: 'CMS26050855291044',
  },
];

const translations = {
  en: {
    title: 'Escrow Settlements & Farmer Wallet',
    description:
      'Track payment settlements and wallet withdrawals for your produce.',
    export: 'Export Tax Statement',
    withdraw: 'Withdraw to Bank / UPI',
    balance: 'Available Wallet Balance',
    instantReady: 'Instant IMPS / UPI Ready',
    liquid: '100% Liquid',
    realized: 'Total Escrow Realized',
    proceeds: 'Direct farmgate proceeds',
    cleared: 'Cleared',
    custody: 'Escrow in Custody Transit',
    awaiting: 'Awaiting retail delivery',
    guaranteed: 'Guaranteed',
    gas: 'Consortium Gas Subsidized',
    paid: '₹0.00 Paid',
    gasFee: '100% subsidized blockchain fee',
    consortium: 'Consortium',
    ledger: 'Immutable Settlement Ledger',
    ledgerDescription:
      'Recorded smart contract settlement events on the blockchain.',
    status: 'Status:',
    all: 'All Transactions',
    released: 'Settled to Wallet',
    locked: 'Escrow Locked',
    date: 'Date',
    batch: 'Batch / Description',
    counterparty: 'Counterparty',
    amount: 'Amount',
    settlementStatus: 'Settlement Status',
    audit: 'Audit Reference',
    receipt: 'Receipt',
    noTransactions: 'No transactions found.',
    withdrawTitle: 'Withdraw Funds to Bank / UPI',
    available: 'Available Balance',
    account: 'Select Settlement Account',
    primaryBank: 'HDFC Bank (Primary Agri Account)',
    account1: 'A/C: ****4921 • IFSC: HDFC0001290',
    kccBank: 'State Bank of India (KCC Account)',
    account2: 'A/C: ****1184 • IFSC: SBIN0000450',
    upiRail: 'Instant UPI Rail',
    upiId: 'VPA: ramesh.patil@okhdfcbank',
    withdrawalAmount: 'Withdrawal Amount (₹)',
    enterAmount: 'Enter amount (e.g. 50000)',
    max: 'MAX',
    transferCharges:
      'Zero transfer charges • Instant IMPS dispatch within 5 seconds',
    cancel: 'Cancel',
    confirm: 'Confirm Payout',
    receiptTitle: 'Settlement Receipt',
    voucher: 'Smart Contract Escrow Voucher',
    transactionRef: 'Transaction Ref:',
    produceLot: 'Produce Lot:',
    payer: 'Payer Counterparty:',
    settlementAmount: 'Settlement Amount:',
    banking: 'Banking & Ledger Audit Details',
    utr: 'Bank Transfer UTR:',
    verified: 'AgriTrace Verified & Settled',
    ledgerRef: 'Ledger Audit Ref:',
    taxNote:
      '*Please consult a qualified tax professional to confirm the tax treatment applicable to your agricultural income.',
    printReceipt: 'Print Receipt',
    close: 'Close',
    viewReceipt: 'View settlement receipt',
    releasedStatus: 'Escrow Released to Wallet',
    lockedStatus: 'Smart Contract Escrow Locked',
    advanceStatus: 'Advance Deposit Released',
    withdrawalError:
      'Please enter a valid withdrawal amount within your wallet balance.',
    payoutSuccess: (amount: string, destination: string, utr: string) =>
      `Payout of ₹${amount} initiated to ${destination}. Reference UTR: ${utr}`,
    distributor: 'Distributor',
    exporter: 'Exporters Consortium',
    retailer: 'Retailer',
    contract: 'Consortium Smart Contract',
    payoutGateway: 'AgriTrace Settlement Gateway',
    bankPayout: 'Bank Account Payout',
  },
  hi: {
    title: 'एस्क्रो भुगतान और किसान वॉलेट',
    description:
      'अपनी उपज के भुगतान और वॉलेट से निकासी का विवरण देखें।',
    export: 'कर विवरण डाउनलोड करें',
    withdraw: 'बैंक / UPI में निकालें',
    balance: 'उपलब्ध वॉलेट बैलेंस',
    instantReady: 'तत्काल IMPS / UPI उपलब्ध',
    liquid: '100% उपलब्ध',
    realized: 'कुल प्राप्त एस्क्रो राशि',
    proceeds: 'सीधे खेत से प्राप्त भुगतान',
    cleared: 'पूर्ण',
    custody: 'एस्क्रो में रोकी गई राशि',
    awaiting: 'खुदरा डिलीवरी की प्रतीक्षा',
    guaranteed: 'सुरक्षित',
    gas: 'कंसोर्टियम द्वारा गैस शुल्क',
    paid: '₹0.00 भुगतान',
    gasFee: 'ब्लॉकचेन शुल्क पर 100% सब्सिडी',
    consortium: 'कंसोर्टियम',
    ledger: 'लेन-देन का अपरिवर्तनीय रिकॉर्ड',
    ledgerDescription: 'ब्लॉकचेन पर दर्ज स्मार्ट कॉन्ट्रैक्ट भुगतान।',
    status: 'स्थिति:',
    all: 'सभी लेन-देन',
    released: 'वॉलेट में जमा',
    locked: 'एस्क्रो में रोकी गई राशि',
    date: 'तारीख',
    batch: 'बैच / विवरण',
    counterparty: 'भुगतानकर्ता',
    amount: 'राशि',
    settlementStatus: 'भुगतान की स्थिति',
    audit: 'ऑडिट संदर्भ',
    receipt: 'रसीद',
    noTransactions: 'कोई लेन-देन नहीं मिला।',
    withdrawTitle: 'बैंक / UPI में राशि निकालें',
    available: 'उपलब्ध बैलेंस',
    account: 'भुगतान खाता चुनें',
    primaryBank: 'HDFC बैंक (मुख्य कृषि खाता)',
    account1: 'खाता: ****4921 • IFSC: HDFC0001290',
    kccBank: 'भारतीय स्टेट बैंक (KCC खाता)',
    account2: 'खाता: ****1184 • IFSC: SBIN0000450',
    upiRail: 'तत्काल UPI भुगतान',
    upiId: 'VPA: ramesh.patil@okhdfcbank',
    withdrawalAmount: 'निकासी राशि (₹)',
    enterAmount: 'राशि दर्ज करें (जैसे 50000)',
    max: 'अधिकतम',
    transferCharges: 'कोई ट्रांसफर शुल्क नहीं • IMPS भुगतान',
    cancel: 'रद्द करें',
    confirm: 'भुगतान की पुष्टि करें',
    receiptTitle: 'भुगतान रसीद',
    voucher: 'स्मार्ट कॉन्ट्रैक्ट एस्क्रो वाउचर',
    transactionRef: 'लेन-देन संदर्भ:',
    produceLot: 'उपज बैच:',
    payer: 'भुगतानकर्ता:',
    settlementAmount: 'भुगतान राशि:',
    banking: 'बैंक और लेजर ऑडिट विवरण',
    utr: 'बैंक ट्रांसफर UTR:',
    verified: 'AgriTrace द्वारा सत्यापित',
    ledgerRef: 'लेजर ऑडिट संदर्भ:',
    taxNote:
      '*कृषि आय पर लागू कर की पुष्टि के लिए योग्य कर सलाहकार से परामर्श करें।',
    printReceipt: 'रसीद प्रिंट करें',
    close: 'बंद करें',
    viewReceipt: 'भुगतान रसीद देखें',
    releasedStatus: 'वॉलेट में एस्क्रो जारी',
    lockedStatus: 'स्मार्ट कॉन्ट्रैक्ट एस्क्रो लॉक',
    advanceStatus: 'अग्रिम जमा जारी',
    withdrawalError: 'कृपया वॉलेट बैलेंस के भीतर सही निकासी राशि दर्ज करें।',
    payoutSuccess: (amount: string, destination: string, utr: string) =>
      `₹${amount} का भुगतान ${destination} के लिए शुरू किया गया। UTR: ${utr}`,
    distributor: 'वितरक',
    exporter: 'निर्यातक कंसोर्टियम',
    retailer: 'खुदरा विक्रेता',
    contract: 'कंसोर्टियम स्मार्ट कॉन्ट्रैक्ट',
    payoutGateway: 'AgriTrace भुगतान गेटवे',
    bankPayout: 'बैंक खाता भुगतान',
  },
  kn: {
    title: 'ಎಸ್ಕ್ರೋ ಪಾವತಿಗಳು ಮತ್ತು ರೈತರ ವಾಲೆಟ್',
    description:
      'ನಿಮ್ಮ ಉತ್ಪನ್ನಗಳ ಪಾವತಿ ಮತ್ತು ವಾಲೆಟ್‌ನಿಂದ ಹಣ ಹಿಂಪಡೆಯುವ ವಿವರಗಳನ್ನು ನೋಡಿ.',
    export: 'ತೆರಿಗೆ ವಿವರವನ್ನು ರಫ್ತು ಮಾಡಿ',
    withdraw: 'ಬ್ಯಾಂಕ್ / UPI ಗೆ ಹಿಂಪಡೆಯಿರಿ',
    balance: 'ಲಭ್ಯವಿರುವ ವಾಲೆಟ್ ಬ್ಯಾಲೆನ್ಸ್',
    instantReady: 'ತಕ್ಷಣದ IMPS / UPI ಸಿದ್ಧ',
    liquid: '100% ಲಭ್ಯ',
    realized: 'ಒಟ್ಟು ಸ್ವೀಕರಿಸಿದ ಎಸ್ಕ್ರೋ ಮೊತ್ತ',
    proceeds: 'ನೇರ ಕೃಷಿ ಉತ್ಪನ್ನ ಮಾರಾಟದ ಹಣ',
    cleared: 'ಪೂರ್ಣಗೊಂಡಿದೆ',
    custody: 'ಎಸ್ಕ್ರೋದಲ್ಲಿ ತಡೆಹಿಡಿದ ಮೊತ್ತ',
    awaiting: 'ಚಿಲ್ಲರೆ ವಿತರಣೆಗೆ ಕಾಯುತ್ತಿದೆ',
    guaranteed: 'ಖಚಿತ',
    gas: 'ಕನ್ಸೋರ್ಟಿಯಂ ಗ್ಯಾಸ್ ಶುಲ್ಕ',
    paid: '₹0.00 ಪಾವತಿ',
    gasFee: 'ಬ್ಲಾಕ್‌ಚೈನ್ ಶುಲ್ಕಕ್ಕೆ 100% ಸಹಾಯಧನ',
    consortium: 'ಕನ್ಸೋರ್ಟಿಯಂ',
    ledger: 'ಬದಲಾಯಿಸಲಾಗದ ಪಾವತಿ ದಾಖಲೆ',
    ledgerDescription: 'ಬ್ಲಾಕ್‌ಚೈನ್‌ನಲ್ಲಿ ದಾಖಲಾದ ಸ್ಮಾರ್ಟ್ ಕಾಂಟ್ರಾಕ್ಟ್ ಪಾವತಿಗಳು.',
    status: 'ಸ್ಥಿತಿ:',
    all: 'ಎಲ್ಲಾ ವಹಿವಾಟುಗಳು',
    released: 'ವಾಲೆಟ್‌ಗೆ ಜಮಾ',
    locked: 'ಎಸ್ಕ್ರೋದಲ್ಲಿ ತಡೆಹಿಡಿದಿದೆ',
    date: 'ದಿನಾಂಕ',
    batch: 'ಬ್ಯಾಚ್ / ವಿವರ',
    counterparty: 'ಪಾವತಿದಾರ',
    amount: 'ಮೊತ್ತ',
    settlementStatus: 'ಪಾವತಿ ಸ್ಥಿತಿ',
    audit: 'ಪರಿಶೀಲನಾ ಉಲ್ಲೇಖ',
    receipt: 'ರಸೀದಿ',
    noTransactions: 'ಯಾವುದೇ ವಹಿವಾಟುಗಳು ಕಂಡುಬಂದಿಲ್ಲ.',
    withdrawTitle: 'ಬ್ಯಾಂಕ್ / UPI ಗೆ ಹಣ ಹಿಂಪಡೆಯಿರಿ',
    available: 'ಲಭ್ಯವಿರುವ ಬ್ಯಾಲೆನ್ಸ್',
    account: 'ಪಾವತಿ ಖಾತೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    primaryBank: 'HDFC ಬ್ಯಾಂಕ್ (ಮುಖ್ಯ ಕೃಷಿ ಖಾತೆ)',
    account1: 'ಖಾತೆ: ****4921 • IFSC: HDFC0001290',
    kccBank: 'ಸ್ಟೇಟ್ ಬ್ಯಾಂಕ್ ಆಫ್ ಇಂಡಿಯಾ (KCC ಖಾತೆ)',
    account2: 'ಖಾತೆ: ****1184 • IFSC: SBIN0000450',
    upiRail: 'ತಕ್ಷಣದ UPI ಪಾವತಿ',
    upiId: 'VPA: ramesh.patil@okhdfcbank',
    withdrawalAmount: 'ಹಿಂಪಡೆಯುವ ಮೊತ್ತ (₹)',
    enterAmount: 'ಮೊತ್ತ ನಮೂದಿಸಿ (ಉದಾ. 50000)',
    max: 'ಗರಿಷ್ಠ',
    transferCharges: 'ವರ್ಗಾವಣೆ ಶುಲ್ಕವಿಲ್ಲ • IMPS ಪಾವತಿ',
    cancel: 'ರದ್ದುಮಾಡಿ',
    confirm: 'ಪಾವತಿಯನ್ನು ಖಚಿತಪಡಿಸಿ',
    receiptTitle: 'ಪಾವತಿ ರಸೀದಿ',
    voucher: 'ಸ್ಮಾರ್ಟ್ ಕಾಂಟ್ರಾಕ್ಟ್ ಎಸ್ಕ್ರೋ ವೌಚರ್',
    transactionRef: 'ವಹಿವಾಟಿನ ಉಲ್ಲೇಖ:',
    produceLot: 'ಉತ್ಪನ್ನ ಬ್ಯಾಚ್:',
    payer: 'ಪಾವತಿದಾರ:',
    settlementAmount: 'ಪಾವತಿ ಮೊತ್ತ:',
    banking: 'ಬ್ಯಾಂಕ್ ಮತ್ತು ಲೆಡ್ಜರ್ ಪರಿಶೀಲನಾ ವಿವರಗಳು',
    utr: 'ಬ್ಯಾಂಕ್ ವರ್ಗಾವಣೆ UTR:',
    verified: 'AgriTrace ಮೂಲಕ ಪರಿಶೀಲಿಸಲಾಗಿದೆ',
    ledgerRef: 'ಲೆಡ್ಜರ್ ಪರಿಶೀಲನಾ ಉಲ್ಲೇಖ:',
    taxNote:
      '*ಕೃಷಿ ಆದಾಯಕ್ಕೆ ಅನ್ವಯಿಸುವ ತೆರಿಗೆಯನ್ನು ಖಚಿತಪಡಿಸಲು ಅರ್ಹ ತೆರಿಗೆ ಸಲಹೆಗಾರರನ್ನು ಸಂಪರ್ಕಿಸಿ.',
    printReceipt: 'ರಸೀದಿಯನ್ನು ಮುದ್ರಿಸಿ',
    close: 'ಮುಚ್ಚಿ',
    viewReceipt: 'ಪಾವತಿ ರಸೀದಿಯನ್ನು ವೀಕ್ಷಿಸಿ',
    releasedStatus: 'ವಾಲೆಟ್‌ಗೆ ಎಸ್ಕ್ರೋ ಬಿಡುಗಡೆ',
    lockedStatus: 'ಸ್ಮಾರ್ಟ್ ಕಾಂಟ್ರಾಕ್ಟ್ ಎಸ್ಕ್ರೋ ಲಾಕ್ ಆಗಿದೆ',
    advanceStatus: 'ಮುಂಗಡ ಠೇವಣಿ ಬಿಡುಗಡೆ',
    withdrawalError:
      'ದಯವಿಟ್ಟು ವಾಲೆಟ್ ಬ್ಯಾಲೆನ್ಸ್ ಒಳಗಿನ ಸರಿಯಾದ ಮೊತ್ತವನ್ನು ನಮೂದಿಸಿ.',
    payoutSuccess: (amount: string, destination: string, utr: string) =>
      `₹${amount} ಮೊತ್ತದ ಪಾವತಿಯನ್ನು ${destination} ಗೆ ಪ್ರಾರಂಭಿಸಲಾಗಿದೆ. UTR: ${utr}`,
    distributor: 'ವಿತರಕರು',
    exporter: 'ರಫ್ತುದಾರರ ಕನ್ಸೋರ್ಟಿಯಂ',
    retailer: 'ಚಿಲ್ಲರೆ ವ್ಯಾಪಾರಿ',
    contract: 'ಕನ್ಸೋರ್ಟಿಯಂ ಸ್ಮಾರ್ಟ್ ಕಾಂಟ್ರಾಕ್ಟ್',
    payoutGateway: 'AgriTrace ಪಾವತಿ ಗೇಟ್‌ವೇ',
    bankPayout: 'ಬ್ಯಾಂಕ್ ಖಾತೆ ಪಾವತಿ',
  },
};

export const FarmerTransactions: React.FC = () => {
  const { language } = useFarmerLanguage();
  const t = translations[language];

  const [transactions, setTransactions] =
    useState<EscrowTransaction[]>(INITIAL_TRANSACTIONS);
  const [filterStatus, setFilterStatus] = useState('all');
  const [walletBalance, setWalletBalance] = useState(382500);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<'bank1' | 'bank2' | 'upi'>('bank1');
  const [withdrawSuccessNotice, setWithdrawSuccessNotice] =
    useState<string | null>(null);
  const [selectedReceiptTx, setSelectedReceiptTx] =
    useState<EscrowTransaction | null>(null);

  const filteredTransactions = transactions.filter((tx) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'released') return tx.status.includes('Released');
    if (filterStatus === 'locked') return tx.status.includes('Locked');
    return true;
  });

  const totalReleased = transactions
    .filter((tx) => tx.status.includes('Released'))
    .reduce((total, tx) => total + tx.amount, 0);

  const totalLocked = transactions
    .filter((tx) => tx.status.includes('Locked'))
    .reduce((total, tx) => total + tx.amount, 0);

  const getStatusLabel = (status: EscrowTransaction['status']) => {
    if (status === 'Escrow Released to Wallet') return t.releasedStatus;
    if (status === 'Smart Contract Escrow Locked') return t.lockedStatus;
    return t.advanceStatus;
  };

  const getRoleLabel = (role: string) => {
    if (role === 'Distributor') return t.distributor;
    if (role === 'Exporters Consortium') return t.exporter;
    if (role === 'Retailer') return t.retailer;
    if (role === 'Consortium Smart Contract') return t.contract;
    return role;
  };

  const handleWithdraw = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const amountNum = Number.parseFloat(withdrawAmount);

    if (
      !Number.isFinite(amountNum) ||
      amountNum < 100 ||
      amountNum > walletBalance
    ) {
      window.alert(t.withdrawalError);
      return;
    }

    const destination =
      selectedPaymentMethod === 'bank1'
        ? 'HDFC Bank A/C ****4921'
        : selectedPaymentMethod === 'bank2'
          ? 'State Bank of India A/C ****1184'
          : 'UPI ID: ramesh.patil@okhdfcbank';

    const newBalance = walletBalance - amountNum;
    setWalletBalance(newBalance);

    const withdrawalTx: EscrowTransaction = {
      id: `tx-${Date.now()}`,
      batchId: 'WALLET-PAYOUT',
      crop: t.bankPayout,
      amount: -amountNum,
      type: `Direct Payout to ${destination}`,
      payer: t.payoutGateway,
      payerRole: 'Consortium Smart Contract',
      status: 'Escrow Released to Wallet',
      date: new Date().toISOString().split('T')[0],
      hash:
        '0x' +
        Array.from({ length: 40 }, () =>
          Math.floor(Math.random() * 16).toString(16),
        ).join(''),
      block: 18948299,
      gasUsed: '0.0000 ETH (Free Tier)',
      utrNumber: `IMPS${Date.now().toString().slice(-10)}`,
    };

    setTransactions((previous) => [withdrawalTx, ...previous]);
    setIsWithdrawModalOpen(false);
    setWithdrawAmount('');

    setWithdrawSuccessNotice(
      t.payoutSuccess(
        amountNum.toLocaleString('en-IN'),
        destination,
        withdrawalTx.utrNumber,
      ),
    );

    window.setTimeout(() => setWithdrawSuccessNotice(null), 7000);
  };

  const handlePrintStatement = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-16 max-w-6xl mx-auto">
      <div className="flex items-center justify-start">
        <BackButton fallback="/farmer/dashboard" />
      </div>

      {withdrawSuccessNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl flex items-center justify-between text-xs font-semibold animate-fadeIn shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{withdrawSuccessNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setWithdrawSuccessNotice(null)}
            className="p-1 hover:bg-emerald-100 rounded-lg text-emerald-700"
            aria-label={t.close}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <DollarSign className="w-7 h-7 text-emerald-600" />
              <span>{t.title}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
              {t.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handlePrintStatement}
              className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs rounded-xl transition flex items-center gap-2 shadow-2xs cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>{t.export}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsWithdrawModalOpen(true)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Wallet className="w-4 h-4" />
              <span>{t.withdraw}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">
              {t.balance}
            </span>
            <div className="text-2xl font-black text-emerald-700 mt-1">
              ₹{walletBalance.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="text-[11px] text-emerald-700 font-medium pt-3 border-t border-slate-100 mt-2 flex items-center justify-between">
            <span>{t.instantReady}</span>
            <span className="font-mono font-bold">{t.liquid}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">
              {t.realized}
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              ₹{totalReleased.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="text-[11px] text-slate-500 pt-3 border-t border-slate-100 mt-2 flex items-center justify-between">
            <span>{t.proceeds}</span>
            <span className="text-emerald-700 font-semibold font-mono">
              {t.cleared}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">
              {t.custody}
            </span>
            <div className="text-2xl font-black text-amber-600 mt-1">
              ₹{totalLocked.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="text-[11px] text-slate-500 pt-3 border-t border-slate-100 mt-2 flex items-center justify-between">
            <span>{t.awaiting}</span>
            <span className="text-amber-700 font-semibold font-mono">
              {t.guaranteed}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">
              {t.gas}
            </span>
            <div className="text-2xl font-black text-teal-700 mt-1">
              {t.paid}
            </div>
          </div>
          <div className="text-[11px] text-slate-500 pt-3 border-t border-slate-100 mt-2 flex items-center justify-between">
            <span>{t.gasFee}</span>
            <span className="text-teal-700 font-semibold font-mono">
              {t.consortium}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">{t.ledger}</h2>
            <p className="text-xs text-slate-500">{t.ledgerDescription}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>{t.status}</span>
            </span>
            {(['all', 'released', 'locked'] as const).map((status) => (
              <button
                type="button"
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                  filterStatus === status
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status === 'all'
                  ? t.all
                  : status === 'released'
                    ? t.released
                    : t.locked}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3">{t.date}</th>
                <th className="py-3 px-3">{t.batch}</th>
                <th className="py-3 px-3">{t.counterparty}</th>
                <th className="py-3 px-3">{t.amount}</th>
                <th className="py-3 px-3">{t.settlementStatus}</th>
                <th className="py-3 px-3">{t.audit}</th>
                <th className="py-3 px-3 text-right">{t.receipt}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredTransactions.map((tx) => {
                const isDebit = tx.amount < 0;

                return (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-3 font-sans text-slate-600 whitespace-nowrap">
                      {tx.date}
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="font-bold text-slate-900 font-sans">
                        {tx.crop}
                      </div>
                      <div className="text-[10px] text-emerald-700">
                        {tx.batchId}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-sans whitespace-nowrap">
                      <div className="text-slate-800 font-medium">
                        {tx.payer}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {getRoleLabel(tx.payerRole)}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-sans text-sm whitespace-nowrap">
                      <span
                        className={`font-black ${
                          isDebit ? 'text-rose-600' : 'text-emerald-700'
                        }`}
                      >
                        {isDebit ? '-' : '+'}₹
                        {Math.abs(tx.amount).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-sans whitespace-nowrap">
                      <span
                        className={`text-xs font-semibold flex items-center gap-1 w-fit ${
                          tx.status.includes('Released')
                            ? 'text-emerald-700'
                            : 'text-amber-700'
                        }`}
                      >
                        {tx.status.includes('Released') ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                        )}
                        <span>{getStatusLabel(tx.status)}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="text-slate-600 font-mono text-[11px] font-medium">
                        #{tx.id.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right font-sans whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setSelectedReceiptTx(tx)}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-emerald-700 transition cursor-pointer"
                        title={t.viewReceipt}
                        aria-label={t.viewReceipt}
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-8 text-center text-slate-500 font-sans"
                  >
                    {t.noTransactions}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 border border-slate-200 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  {t.withdrawTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsWithdrawModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 cursor-pointer"
                aria-label={t.close}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleWithdraw} className="space-y-4 text-xs">
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200/60 flex items-center justify-between">
                <span className="text-emerald-800 font-medium">
                  {t.available}
                </span>
                <span className="text-base font-black text-emerald-900">
                  ₹{walletBalance.toLocaleString('en-IN')}
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  {t.account}
                </label>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod('bank1')}
                    className={`w-full text-left p-3 rounded-2xl border transition flex items-center justify-between ${
                      selectedPaymentMethod === 'bank1'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Building2 className="w-4 h-4 text-slate-600" />
                      <div>
                        <div>{t.primaryBank}</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          {t.account1}
                        </div>
                      </div>
                    </div>
                    {selectedPaymentMethod === 'bank1' && (
                      <Check className="w-4 h-4 text-emerald-600" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod('bank2')}
                    className={`w-full text-left p-3 rounded-2xl border transition flex items-center justify-between ${
                      selectedPaymentMethod === 'bank2'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Building2 className="w-4 h-4 text-slate-600" />
                      <div>
                        <div>{t.kccBank}</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          {t.account2}
                        </div>
                      </div>
                    </div>
                    {selectedPaymentMethod === 'bank2' && (
                      <Check className="w-4 h-4 text-emerald-600" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod('upi')}
                    className={`w-full text-left p-3 rounded-2xl border transition flex items-center justify-between ${
                      selectedPaymentMethod === 'upi'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <QrCode className="w-4 h-4 text-slate-600" />
                      <div>
                        <div>{t.upiRail}</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          {t.upiId}
                        </div>
                      </div>
                    </div>
                    {selectedPaymentMethod === 'upi' && (
                      <Check className="w-4 h-4 text-emerald-600" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  {t.withdrawalAmount}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    max={walletBalance}
                    min={100}
                    step="0.01"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder={t.enterAmount}
                    className="w-full pl-8 pr-16 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:border-emerald-600 outline-none font-bold text-slate-900"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount(walletBalance.toString())}
                    className="absolute right-2 top-2 px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold rounded-lg transition"
                  >
                    {t.max}
                  </button>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {t.transferCharges}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsWithdrawModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs transition"
                >
                  {t.confirm}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedReceiptTx && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-slate-500">
                  {t.receiptTitle}
                </span>
                <h3 className="font-extrabold text-slate-900 text-lg mt-1">
                  {t.voucher}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReceiptTx(null)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 cursor-pointer"
                aria-label={t.close}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">{t.transactionRef}</span>
                  <span className="font-mono font-bold text-slate-800">
                    {selectedReceiptTx.id.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">{t.produceLot}</span>
                  <span className="font-bold text-slate-800 text-right">
                    {selectedReceiptTx.crop} ({selectedReceiptTx.batchId})
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">{t.payer}</span>
                  <span className="font-bold text-slate-800 text-right">
                    {selectedReceiptTx.payer}
                  </span>
                </div>
                <div className="flex justify-between gap-3 border-t border-slate-200/60 pt-2">
                  <span className="text-slate-600 font-bold">
                    {t.settlementAmount}
                  </span>
                  <span className="font-black text-emerald-700 text-base">
                    ₹
                    {Math.abs(selectedReceiptTx.amount).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5 text-xs">
                <div className="text-slate-900 font-bold">{t.banking}</div>
                <div className="text-slate-600 flex justify-between gap-3">
                  <span>{t.utr}</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {selectedReceiptTx.utrNumber}
                  </span>
                </div>
                <div className="text-slate-600 flex justify-between gap-3">
                  <span>{t.settlementStatus}</span>
                  <span className="text-emerald-700 font-medium">
                    {t.verified}
                  </span>
                </div>
                <div className="text-slate-600 flex justify-between gap-3">
                  <span>{t.ledgerRef}</span>
                  <span className="font-mono text-slate-700">
                    AUDIT-{selectedReceiptTx.id.toUpperCase()}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                {t.taxNote}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>{t.printReceipt}</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedReceiptTx(null)}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition cursor-pointer"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

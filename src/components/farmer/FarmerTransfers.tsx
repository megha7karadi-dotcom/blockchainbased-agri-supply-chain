
import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Truck,
  Building2,
  Check,
  ArrowRightLeft,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useFarmerLanguage } from '../../context/FarmerLanguageContext';
import { BackButton } from '../common/BackButton';

const DISTRIBUTOR_PARTNERS = [
  {
    id: 'dist-01',
    name: 'KisanLogix Cold Fleet Ltd',
    location: 'Pune Logistics Hub',
  },
  {
    id: 'dist-02',
    name: 'MahaAgro Export Consortium',
    location: 'Navi Mumbai Cold Hub',
  },
  {
    id: 'dist-03',
    name: 'Sahyadri Agri Logistics Hub',
    location: 'Nashik Aggregation Center',
  },
  {
    id: 'dist-04',
    name: 'Deccan Fresh Transporters',
    location: 'Satara Processing Depot',
  },
];

const translations = {
  en: {
    eyebrow: 'Produce Handover',
    title: 'Transfer Produce',
    description:
      'Hand over your harvested crop to transporters or buyers. Record quantity and agreed price.',
    myCrops: 'My Crops',
    confirmed: 'Transfer Confirmed',
    notice: 'Notice',
    formTitle: 'Handover to Transporter or Buyer',
    formDescription:
      'Select your crop, choose the receiving partner, and confirm the handover amount.',
    selectBatch: 'Select Crop Batch',
    noCrops: 'You have not registered any crops yet.',
    addCrop: 'Add a crop now',
    currentStatus: 'Current Status:',
    origin: 'Farm Origin:',
    farmPrice: 'Recorded Farm Price:',
    partner: 'Transporter / Buyer Partner',
    customPartner: 'Other Local Buyer / Transporter',
    partnerName: 'Partner Name & Vehicle Number',
    partnerPlaceholder: 'e.g. Patil Logistics, MH-09-AB-1234',
    quantity: 'Quantity Handed Over',
    quantityPlaceholder: 'e.g. 500',
    agreedPrice: 'Agreed Handover Price (₹)',
    pricePlaceholder: 'e.g. 85',
    estimatedValue: 'Estimated Handover Value:',
    confirming: 'Confirming Transfer...',
    confirm: 'Confirm & Hand Over Produce',
    history: 'Recent Transfers',
    historyDescription:
      'Your produce currently in transit or delivered to distributors',
    noTransfers:
      'No transferred crops yet. Use the form on the left to hand over your first batch.',
    handedOverAt: 'Handed over at',
    selectCropError: 'Please select a crop to transfer.',
    quantityError: 'Please enter a valid quantity.',
    quantityLimitError:
      'The transfer quantity cannot exceed the available crop quantity.',
    priceError: 'Please enter a valid agreed price per unit.',
    transferFailed: 'Failed to submit transfer. Please try again.',
    directPartner: 'Direct Distribution Partner',
    defaultPartner: 'KisanLogix Cold Fleet Ltd',
    transferSuccess: (
      batchId: string,
      crop: string,
      partner: string,
      price: string,
      unit: string,
    ) =>
      `Transferred batch ${batchId} (${crop}) to ${partner} at ₹${price}/${unit}.`,
    transferFallback: (crop: string, partner: string) =>
      `Transfer confirmed for ${crop} to ${partner}.`,
    statuses: {
      Registered: 'Registered',
      'Ready for Dispatch': 'Ready for Dispatch',
      'Harvested & Tokenized': 'Harvested & Tokenized',
      'Transferred to Distributor': 'Transferred to Distributor',
      'At Distributor': 'At Distributor',
      'In Transit': 'In Transit',
      'In Transit to Retailer': 'In Transit to Retailer',
      'Delivered to Retailer': 'Delivered to Retailer',
      'On Retail Shelf': 'On Retail Shelf',
      'Sold to Consumer': 'Sold to Consumer',
    } as Record<string, string>,
  },
  hi: {
    eyebrow: 'उपज का हस्तांतरण',
    title: 'उपज स्थानांतरित करें',
    description:
      'अपनी कटी हुई फसल परिवहनकर्ता या खरीदार को सौंपें। मात्रा और तय कीमत दर्ज करें।',
    myCrops: 'मेरी फसलें',
    confirmed: 'हस्तांतरण की पुष्टि हुई',
    notice: 'सूचना',
    formTitle: 'परिवहनकर्ता या खरीदार को सौंपें',
    formDescription:
      'अपनी फसल चुनें, प्राप्तकर्ता भागीदार चुनें और सौंपे जाने वाले माल की पुष्टि करें।',
    selectBatch: 'फसल का बैच चुनें',
    noCrops: 'आपने अभी तक कोई फसल पंजीकृत नहीं की है।',
    addCrop: 'अभी फसल जोड़ें',
    currentStatus: 'वर्तमान स्थिति:',
    origin: 'खेत का स्थान:',
    farmPrice: 'दर्ज खेत मूल्य:',
    partner: 'परिवहनकर्ता / खरीदार भागीदार',
    customPartner: 'अन्य स्थानीय खरीदार / परिवहनकर्ता',
    partnerName: 'भागीदार का नाम और वाहन नंबर',
    partnerPlaceholder: 'जैसे पटिल लॉजिस्टिक्स, MH-09-AB-1234',
    quantity: 'सौंपी जाने वाली मात्रा',
    quantityPlaceholder: 'जैसे 500',
    agreedPrice: 'तय हस्तांतरण मूल्य (₹)',
    pricePlaceholder: 'जैसे 85',
    estimatedValue: 'अनुमानित हस्तांतरण मूल्य:',
    confirming: 'हस्तांतरण की पुष्टि हो रही है...',
    confirm: 'पुष्टि करें और उपज सौंपें',
    history: 'हाल के हस्तांतरण',
    historyDescription:
      'आपकी उपज जो अभी परिवहन में है या वितरक को पहुँचा दी गई है',
    noTransfers:
      'अभी कोई फसल स्थानांतरित नहीं हुई है। पहली खेप सौंपने के लिए बाईं ओर का फ़ॉर्म इस्तेमाल करें।',
    handedOverAt: 'सौंपने का मूल्य',
    selectCropError: 'कृपया हस्तांतरण के लिए फसल चुनें।',
    quantityError: 'कृपया सही मात्रा दर्ज करें।',
    quantityLimitError:
      'हस्तांतरण की मात्रा उपलब्ध फसल की मात्रा से अधिक नहीं हो सकती।',
    priceError: 'कृपया प्रति इकाई सही तय कीमत दर्ज करें।',
    transferFailed: 'हस्तांतरण जमा नहीं हो सका। कृपया फिर से प्रयास करें।',
    directPartner: 'सीधा वितरण भागीदार',
    defaultPartner: 'KisanLogix Cold Fleet Ltd',
    transferSuccess: (
      batchId: string,
      crop: string,
      partner: string,
      price: string,
      unit: string,
    ) =>
      `बैच ${batchId} (${crop}) को ${partner} को ₹${price}/${unit} की दर से सौंपा गया।`,
    transferFallback: (crop: string, partner: string) =>
      `${crop} को ${partner} को सौंपने की पुष्टि हुई।`,
    statuses: {
      Registered: 'पंजीकृत',
      'Ready for Dispatch': 'भेजने के लिए तैयार',
      'Harvested & Tokenized': 'कटाई और टोकनकरण पूरा',
      'Transferred to Distributor': 'वितरक को हस्तांतरित',
      'At Distributor': 'वितरक के पास',
      'In Transit': 'परिवहन में',
      'In Transit to Retailer': 'खुदरा विक्रेता तक परिवहन में',
      'Delivered to Retailer': 'खुदरा विक्रेता को पहुँचाया गया',
      'On Retail Shelf': 'खुदरा दुकान में उपलब्ध',
      'Sold to Consumer': 'उपभोक्ता को बेचा गया',
    } as Record<string, string>,
  },
  kn: {
    eyebrow: 'ಉತ್ಪನ್ನ ಹಸ್ತಾಂತರ',
    title: 'ಉತ್ಪನ್ನ ವರ್ಗಾವಣೆ',
    description:
      'ಕೊಯ್ಲು ಮಾಡಿದ ಬೆಳೆಯನ್ನು ಸಾಗಣೆದಾರರು ಅಥವಾ ಖರೀದಿದಾರರಿಗೆ ಹಸ್ತಾಂತರಿಸಿ. ಪ್ರಮಾಣ ಮತ್ತು ಒಪ್ಪಿದ ಬೆಲೆಯನ್ನು ದಾಖಲಿಸಿ.',
    myCrops: 'ನನ್ನ ಬೆಳೆಗಳು',
    confirmed: 'ವರ್ಗಾವಣೆ ದೃಢೀಕರಿಸಲಾಗಿದೆ',
    notice: 'ಸೂಚನೆ',
    formTitle: 'ಸಾಗಣೆದಾರರು ಅಥವಾ ಖರೀದಿದಾರರಿಗೆ ಹಸ್ತಾಂತರಿಸಿ',
    formDescription:
      'ನಿಮ್ಮ ಬೆಳೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ, ಸ್ವೀಕರಿಸುವ ಪಾಲುದಾರರನ್ನು ಆರಿಸಿ ಮತ್ತು ಹಸ್ತಾಂತರದ ವಿವರಗಳನ್ನು ದೃಢೀಕರಿಸಿ.',
    selectBatch: 'ಬೆಳೆ ಬ್ಯಾಚ್ ಆಯ್ಕೆಮಾಡಿ',
    noCrops: 'ನೀವು ಇನ್ನೂ ಯಾವುದೇ ಬೆಳೆಗಳನ್ನು ನೋಂದಾಯಿಸಿಲ್ಲ.',
    addCrop: 'ಈಗ ಬೆಳೆ ಸೇರಿಸಿ',
    currentStatus: 'ಪ್ರಸ್ತುತ ಸ್ಥಿತಿ:',
    origin: 'ಕೃಷಿ ಮೂಲಸ್ಥಳ:',
    farmPrice: 'ದಾಖಲಿಸಿದ ಕೃಷಿ ಬೆಲೆ:',
    partner: 'ಸಾಗಣೆದಾರ / ಖರೀದಿದಾರ ಪಾಲುದಾರ',
    customPartner: 'ಇತರ ಸ್ಥಳೀಯ ಖರೀದಿದಾರ / ಸಾಗಣೆದಾರ',
    partnerName: 'ಪಾಲುದಾರರ ಹೆಸರು ಮತ್ತು ವಾಹನ ಸಂಖ್ಯೆ',
    partnerPlaceholder: 'ಉದಾ. ಪಾಟೀಲ್ ಲಾಜಿಸ್ಟಿಕ್ಸ್, MH-09-AB-1234',
    quantity: 'ಹಸ್ತಾಂತರಿಸುವ ಪ್ರಮಾಣ',
    quantityPlaceholder: 'ಉದಾ. 500',
    agreedPrice: 'ಒಪ್ಪಿದ ಹಸ್ತಾಂತರ ಬೆಲೆ (₹)',
    pricePlaceholder: 'ಉದಾ. 85',
    estimatedValue: 'ಅಂದಾಜು ಹಸ್ತಾಂತರ ಮೌಲ್ಯ:',
    confirming: 'ವರ್ಗಾವಣೆಯನ್ನು ದೃಢೀಕರಿಸಲಾಗುತ್ತಿದೆ...',
    confirm: 'ದೃಢೀಕರಿಸಿ ಮತ್ತು ಬೆಳೆ ಹಸ್ತಾಂತರಿಸಿ',
    history: 'ಇತ್ತೀಚಿನ ವರ್ಗಾವಣೆಗಳು',
    historyDescription:
      'ಸಾಗಣೆಯಲ್ಲಿರುವ ಅಥವಾ ವಿತರಕರಿಗೆ ತಲುಪಿಸಿರುವ ನಿಮ್ಮ ಉತ್ಪನ್ನಗಳು',
    noTransfers:
      'ಇನ್ನೂ ಯಾವುದೇ ಬೆಳೆ ವರ್ಗಾವಣೆಗೊಂಡಿಲ್ಲ. ಮೊದಲ ಬ್ಯಾಚ್ ಹಸ್ತಾಂತರಿಸಲು ಎಡಭಾಗದ ಫಾರ್ಮ್ ಬಳಸಿ.',
    handedOverAt: 'ಹಸ್ತಾಂತರದ ಬೆಲೆ',
    selectCropError: 'ವರ್ಗಾಯಿಸಲು ದಯವಿಟ್ಟು ಬೆಳೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
    quantityError: 'ದಯವಿಟ್ಟು ಸರಿಯಾದ ಪ್ರಮಾಣವನ್ನು ನಮೂದಿಸಿ.',
    quantityLimitError:
      'ವರ್ಗಾವಣೆಯ ಪ್ರಮಾಣವು ಲಭ್ಯವಿರುವ ಬೆಳೆಯ ಪ್ರಮಾಣಕ್ಕಿಂತ ಹೆಚ್ಚಿರಬಾರದು.',
    priceError: 'ದಯವಿಟ್ಟು ಪ್ರತಿ ಘಟಕದ ಸರಿಯಾದ ಒಪ್ಪಿದ ಬೆಲೆಯನ್ನು ನಮೂದಿಸಿ.',
    transferFailed: 'ವರ್ಗಾವಣೆ ಸಲ್ಲಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    directPartner: 'ನೇರ ವಿತರಣಾ ಪಾಲುದಾರ',
    defaultPartner: 'KisanLogix Cold Fleet Ltd',
    transferSuccess: (
      batchId: string,
      crop: string,
      partner: string,
      price: string,
      unit: string,
    ) =>
      `${batchId} ಬ್ಯಾಚ್‌ನ ${crop} ಅನ್ನು ${partner} ಅವರಿಗೆ ₹${price}/${unit} ದರದಲ್ಲಿ ಹಸ್ತಾಂತರಿಸಲಾಗಿದೆ.`,
    transferFallback: (crop: string, partner: string) =>
      `${crop} ಅನ್ನು ${partner} ಅವರಿಗೆ ಹಸ್ತಾಂತರಿಸಿರುವುದು ದೃಢೀಕರಿಸಲಾಗಿದೆ.`,
    statuses: {
      Registered: 'ನೋಂದಾಯಿಸಲಾಗಿದೆ',
      'Ready for Dispatch': 'ರವಾನೆಗೆ ಸಿದ್ಧ',
      'Harvested & Tokenized': 'ಕೊಯ್ಲು ಮತ್ತು ಟೋಕನೀಕರಣ ಪೂರ್ಣ',
      'Transferred to Distributor': 'ವಿತರಕರಿಗೆ ವರ್ಗಾಯಿಸಲಾಗಿದೆ',
      'At Distributor': 'ವಿತರಕರ ಬಳಿ',
      'In Transit': 'ಸಾಗಣೆಯಲ್ಲಿದೆ',
      'In Transit to Retailer': 'ಚಿಲ್ಲರೆ ವ್ಯಾಪಾರಿಗೆ ಸಾಗಣೆಯಲ್ಲಿದೆ',
      'Delivered to Retailer': 'ಚಿಲ್ಲರೆ ವ್ಯಾಪಾರಿಗೆ ತಲುಪಿಸಲಾಗಿದೆ',
      'On Retail Shelf': 'ಚಿಲ್ಲರೆ ಅಂಗಡಿಯಲ್ಲಿ ಲಭ್ಯವಿದೆ',
      'Sold to Consumer': 'ಗ್ರಾಹಕರಿಗೆ ಮಾರಾಟವಾಗಿದೆ',
    } as Record<string, string>,
  },
};

export const FarmerTransfers: React.FC = () => {
  const { batches, currentUser, farmerTransferToDistributor, navigate } =
    useApp();
  const { language } = useFarmerLanguage();
  const t = translations[language];

  const farmerBatches = batches.filter(
    (batch) =>
      batch.farmerId === currentUser?.id ||
      batch.farmerName === currentUser?.name ||
      batch.farmerId === 'usr-farmer-01',
  );

  const transferrableBatches = farmerBatches.filter(
    (batch) =>
      batch.status === 'Registered' ||
      batch.status === 'Ready for Dispatch' ||
      batch.status === 'Harvested & Tokenized',
  );

  const [selectedBatchId, setSelectedBatchId] = useState<string>(
    transferrableBatches[0]?.id || farmerBatches[0]?.id || '',
  );
  const [selectedDistributorId, setSelectedDistributorId] =
    useState<string>(DISTRIBUTOR_PARTNERS[0].id);
  const [customDistributorName, setCustomDistributorName] = useState('');
  const [transferQuantity, setTransferQuantity] = useState('');
  const [agreedPrice, setAgreedPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedBatch = batches.find(
    (batch) =>
      batch.id === selectedBatchId || batch.batchId === selectedBatchId,
  );

  React.useEffect(() => {
    if (selectedBatch) {
      setTransferQuantity(
        String(
          selectedBatch.quantityKg || selectedBatch.quantity || 1000,
        ),
      );
      setAgreedPrice(
        String(
          selectedBatch.pricing?.farmerPrice ||
            selectedBatch.farmgatePrice ||
            60,
        ),
      );
    }
  }, [selectedBatchId]);

  const transferredBatches = farmerBatches.filter((batch) =>
    [
      'Transferred to Distributor',
      'At Distributor',
      'In Transit',
      'In Transit to Retailer',
      'Delivered to Retailer',
      'On Retail Shelf',
      'Sold to Consumer',
    ].includes(batch.status),
  );

  const getStatusLabel = (status: string) =>
    t.statuses[status] || status;

  const handleConfirmTransfer = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!selectedBatch) {
      setErrorMessage(t.selectCropError);
      return;
    }

    const quantity = Number.parseFloat(transferQuantity);

    if (!Number.isFinite(quantity) || quantity <= 0) {
      setErrorMessage(t.quantityError);
      return;
    }

    const availableQuantity = Number(
      selectedBatch.quantityKg || selectedBatch.quantity || 0,
    );

    if (availableQuantity > 0 && quantity > availableQuantity) {
      setErrorMessage(t.quantityLimitError);
      return;
    }

    const price = Number.parseFloat(agreedPrice);

    if (!Number.isFinite(price) || price <= 0) {
      setErrorMessage(t.priceError);
      return;
    }

    const distributor = DISTRIBUTOR_PARTNERS.find(
      (partner) => partner.id === selectedDistributorId,
    );

    const distributorName =
      selectedDistributorId === 'custom'
        ? customDistributorName.trim() || t.directPartner
        : distributor?.name || t.defaultPartner;

    setIsSubmitting(true);

    try {
      const result = await farmerTransferToDistributor(
        selectedBatch.batchId,
        distributorName,
        selectedDistributorId,
        quantity,
        price,
      );

      if (result) {
        setSuccessMessage(
          t.transferSuccess(
            selectedBatch.batchId,
            selectedBatch.cropName || selectedBatch.name,
            distributorName,
            price.toLocaleString('en-IN'),
            selectedBatch.unit || 'kg',
          ),
        );
      } else {
        setSuccessMessage(
          t.transferFallback(
            selectedBatch.cropName || selectedBatch.name,
            distributorName,
          ),
        );
      }
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : t.transferFailed,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      <div className="flex items-center justify-start">
        <BackButton fallback="/farmer/dashboard" />
      </div>

      <div className="bg-white border border-[#bbf7d0] rounded-xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#16a34a]" />
            <span className="text-[11px] font-semibold text-[#16a34a] uppercase tracking-wider">
              {t.eyebrow}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1c1917] flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-[#16a34a]" />
            <span>{t.title}</span>
          </h1>
          <p className="text-xs text-[#78716c]">{t.description}</p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/farmer/my-produce')}
          className="px-3.5 py-2 bg-stone-50 hover:bg-[#f0fdf4] text-[#1c1917] font-semibold text-xs rounded-lg border border-[#bbf7d0] transition cursor-pointer self-start sm:self-auto"
        >
          {t.myCrops}
        </button>
      </div>

      {successMessage && (
        <div className="p-4 bg-[#f0fdf4] border border-[#22c55e] rounded-lg flex items-start gap-3 text-[#16a34a] text-xs">
          <CheckCircle2 className="w-5 h-5 text-[#16a34a] shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block">{t.confirmed}</span>
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="p-4 bg-rose-50 border border-rose-300 rounded-lg flex items-start gap-3 text-rose-900 text-xs"
        >
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block">{t.notice}</span>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-xl border border-[#bbf7d0] shadow-xs space-y-5">
          <div className="border-b border-stone-100 pb-3">
            <h2 className="text-sm font-bold text-[#1c1917] flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#16a34a]" />
              <span>{t.formTitle}</span>
            </h2>
            <p className="text-xs text-[#78716c] mt-0.5">
              {t.formDescription}
            </p>
          </div>

          <form onSubmit={handleConfirmTransfer} className="space-y-4">
            <div>
              <label
                htmlFor="transfer-batch"
                className="block text-xs font-semibold text-[#1c1917] mb-1.5"
              >
                {t.selectBatch} <span className="text-rose-500">*</span>
              </label>

              {farmerBatches.length === 0 ? (
                <div className="p-4 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-600">
                  {t.noCrops}{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/farmer/register-produce')}
                    className="text-[#16a34a] font-bold underline"
                  >
                    {t.addCrop}
                  </button>
                </div>
              ) : (
                <select
                  id="transfer-batch"
                  required
                  value={selectedBatch?.id || ''}
                  onChange={(event) =>
                    setSelectedBatchId(event.target.value)
                  }
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#f0fdf4]/30 border border-[#bbf7d0] rounded-lg focus:bg-white focus:border-[#16a34a] outline-none transition font-medium text-stone-900"
                >
                  {farmerBatches.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.cropName || batch.name} ({batch.batchId}) —{' '}
                      {batch.quantityKg || batch.quantity} {batch.unit || 'kg'} [
                      {getStatusLabel(batch.status)}]
                    </option>
                  ))}
                </select>
              )}
            </div>

            {selectedBatch && (
              <div className="p-3.5 bg-stone-50 rounded-lg border border-stone-200 text-xs space-y-1.5">
                <div className="flex justify-between items-center gap-3 text-stone-600">
                  <span>{t.currentStatus}</span>
                  <span className="font-semibold text-[#16a34a] bg-white px-2 py-0.5 rounded border border-stone-200">
                    {getStatusLabel(selectedBatch.status)}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-3 text-stone-600">
                  <span>{t.origin}</span>
                  <span className="font-medium text-stone-800 text-right">
                    {selectedBatch.farmLocation ||
                      selectedBatch.farmerLocation ||
                      '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-3 text-stone-600">
                  <span>{t.farmPrice}</span>
                  <span className="font-bold text-[#16a34a]">
                    ₹
                    {selectedBatch.farmgatePrice ||
                      selectedBatch.pricing?.farmerPrice ||
                      0}{' '}
                    / {selectedBatch.unit || 'kg'}
                  </span>
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="transfer-partner"
                className="block text-xs font-semibold text-[#1c1917] mb-1.5"
              >
                {t.partner} <span className="text-rose-500">*</span>
              </label>
              <select
                id="transfer-partner"
                value={selectedDistributorId}
                onChange={(event) =>
                  setSelectedDistributorId(event.target.value)
                }
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 border border-[#bbf7d0] rounded-lg focus:bg-white focus:border-[#16a34a] outline-none transition font-medium text-stone-900"
              >
                {DISTRIBUTOR_PARTNERS.map((partner) => (
                  <option key={partner.id} value={partner.id}>
                    {partner.name} ({partner.location})
                  </option>
                ))}
                <option value="custom">{t.customPartner}</option>
              </select>
            </div>

            {selectedDistributorId === 'custom' && (
              <div>
                <label
                  htmlFor="custom-partner"
                  className="block text-xs font-semibold text-[#1c1917] mb-1.5"
                >
                  {t.partnerName}
                </label>
                <input
                  id="custom-partner"
                  type="text"
                  value={customDistributorName}
                  onChange={(event) =>
                    setCustomDistributorName(event.target.value)
                  }
                  placeholder={t.partnerPlaceholder}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 border border-[#bbf7d0] rounded-lg focus:bg-white focus:border-[#16a34a] outline-none transition"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="transfer-quantity"
                  className="block text-xs font-semibold text-[#1c1917] mb-1.5"
                >
                  {t.quantity} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="transfer-quantity"
                    type="number"
                    min="1"
                    max={
                      selectedBatch
                        ? selectedBatch.quantityKg ||
                          selectedBatch.quantity ||
                          undefined
                        : undefined
                    }
                    step="any"
                    required
                    value={transferQuantity}
                    onChange={(event) =>
                      setTransferQuantity(event.target.value)
                    }
                    placeholder={t.quantityPlaceholder}
                    className="w-full px-3.5 py-2.5 pr-14 text-xs sm:text-sm bg-stone-50 border border-[#bbf7d0] rounded-lg focus:bg-white focus:border-[#16a34a] outline-none transition font-semibold"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs font-medium text-stone-400">
                    {selectedBatch?.unit || 'kg'}
                  </span>
                </div>
              </div>

              <div>
                <label
                  htmlFor="transfer-price"
                  className="block text-xs font-semibold text-[#1c1917] mb-1.5"
                >
                  {t.agreedPrice} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-stone-400">
                    ₹
                  </span>
                  <input
                    id="transfer-price"
                    type="number"
                    min="0.01"
                    step="any"
                    required
                    value={agreedPrice}
                    onChange={(event) => setAgreedPrice(event.target.value)}
                    placeholder={t.pricePlaceholder}
                    className="w-full pl-7 pr-14 py-2.5 text-xs sm:text-sm bg-stone-50 border border-[#bbf7d0] rounded-lg focus:bg-white focus:border-[#16a34a] outline-none transition font-semibold"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs font-medium text-stone-400">
                    /{selectedBatch?.unit || 'kg'}
                  </span>
                </div>
              </div>
            </div>

            {transferQuantity.trim() !== '' &&
              agreedPrice.trim() !== '' &&
              Number.isFinite(Number(transferQuantity)) &&
              Number.isFinite(Number(agreedPrice)) && (
                <div className="p-3.5 bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg flex items-center justify-between gap-3 text-xs">
                  <span className="text-[#78716c] font-medium">
                    {t.estimatedValue}
                  </span>
                  <span className="font-mono font-bold text-[#16a34a] text-sm">
                    ₹
                    {(
                      Number(transferQuantity) * Number(agreedPrice)
                    ).toLocaleString('en-IN')}
                  </span>
                </div>
              )}

            <button
              type="submit"
              disabled={
                isSubmitting ||
                !selectedBatch ||
                transferrableBatches.length === 0
              }
              className="w-full py-3 bg-[#16a34a] hover:bg-[#15803d] disabled:bg-stone-300 text-white font-bold text-xs sm:text-sm rounded-lg transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{t.confirming}</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{t.confirm}</span>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-xl border border-[#bbf7d0] shadow-xs space-y-4">
          <div className="border-b border-stone-100 pb-3">
            <h3 className="font-bold text-sm text-[#1c1917]">
              {t.history}
            </h3>
            <p className="text-xs text-[#78716c]">
              {t.historyDescription}
            </p>
          </div>

          {transferredBatches.length === 0 ? (
            <div className="p-8 text-center text-xs text-stone-400 space-y-2">
              <Truck className="w-8 h-8 mx-auto text-stone-300" />
              <p>{t.noTransfers}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transferredBatches.map((batch) => (
                <div
                  key={batch.id}
                  className="p-3.5 bg-stone-50 rounded-lg border border-stone-200 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-[#16a34a]">
                      {batch.batchId}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 bg-white text-stone-700 rounded font-medium border border-stone-200">
                      {getStatusLabel(batch.status)}
                    </span>
                  </div>
                  <div className="font-semibold text-[#1c1917]">
                    {batch.cropName || batch.name} (
                    {batch.quantity || batch.quantityKg} {batch.unit || 'kg'})
                  </div>
                  <div className="text-[11px] text-[#78716c]">
                    {t.handedOverAt} ₹
                    {batch.farmgatePrice || batch.pricing?.farmerPrice || 0}/
                    {batch.unit || 'kg'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FarmerTransfers;

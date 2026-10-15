
import React, { useState } from 'react';
import {
  Package,
  Search,
  Filter,
  QrCode,
  PlusCircle,
  X,
  Eye,
  Table as TableIcon,
  LayoutGrid,
  Truck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useFarmerLanguage } from '../../context/FarmerLanguageContext';
import { ProduceBatch } from '../../types/produce';
import { QRCodeModal } from '../common/QRCodeModal';
import { BackButton } from '../common/BackButton';

const translations = {
  en: {
    directory: 'Crop Directory',
    title: 'My Crops',
    description: 'All crops logged by your farm. View packaging QR codes, check status, or transfer to buyers.',
    addCrop: 'Add New Crop',
    search: 'Search crop, batch ID, town...',
    status: 'Status',
    all: 'All',
    registered: 'Registered',
    ready: 'Ready for Dispatch',
    transit: 'In Transit',
    tableView: 'Table View',
    cardView: 'Card View',
    noCrops: 'No crops found',
    noMatches: 'No crops match your current search or filter.',
    addFirst: 'Add Your First Crop',
    batchId: 'Batch ID',
    cropVariety: 'Crop & Variety',
    quantity: 'Quantity',
    harvestDate: 'Harvest Date',
    quality: 'Quality',
    location: 'Farm Location',
    price: 'My Price',
    actions: 'Actions',
    details: 'Details',
    transfer: 'Transfer',
    transferTitle: 'Transfer to Buyer or Transporter',
    viewQR: 'View QR Code',
    produce: 'Produce',
    localFarm: 'Local Farm',
    gradeA: 'Grade A',
    gradeB: 'Grade B',
    grade: 'Grade',
    harvest: 'Harvest',
    farmerPrice: 'Farmer Price',
    origin: 'Origin Village',
    close: 'Close',
    transferProduce: 'Transfer Produce',
    kg: 'kg',
  },
  hi: {
    directory: 'फसल सूची',
    title: 'मेरी फसलें',
    description: 'आपके खेत में दर्ज सभी फसलें। पैकेजिंग QR कोड देखें, स्थिति जाँचें या खरीदारों को उपज स्थानांतरित करें।',
    addCrop: 'नई फसल जोड़ें',
    search: 'फसल, बैच ID या शहर खोजें...',
    status: 'स्थिति',
    all: 'सभी',
    registered: 'पंजीकृत',
    ready: 'भेजने के लिए तैयार',
    transit: 'रास्ते में',
    tableView: 'तालिका दृश्य',
    cardView: 'कार्ड दृश्य',
    noCrops: 'कोई फसल नहीं मिली',
    noMatches: 'आपकी खोज या फ़िल्टर से कोई फसल मेल नहीं खाती।',
    addFirst: 'अपनी पहली फसल जोड़ें',
    batchId: 'बैच ID',
    cropVariety: 'फसल और किस्म',
    quantity: 'मात्रा',
    harvestDate: 'कटाई की तारीख',
    quality: 'गुणवत्ता',
    location: 'खेत का स्थान',
    price: 'मेरा भाव',
    actions: 'कार्रवाई',
    details: 'विवरण',
    transfer: 'स्थानांतरित करें',
    transferTitle: 'खरीदार या परिवहनकर्ता को स्थानांतरित करें',
    viewQR: 'QR कोड देखें',
    produce: 'उपज',
    localFarm: 'स्थानीय खेत',
    gradeA: 'श्रेणी A',
    gradeB: 'श्रेणी B',
    grade: 'श्रेणी',
    harvest: 'कटाई',
    farmerPrice: 'किसान का भाव',
    origin: 'मूल गाँव',
    close: 'बंद करें',
    transferProduce: 'उपज स्थानांतरित करें',
    kg: 'किग्रा',
  },
  kn: {
    directory: 'ಬೆಳೆಗಳ ಪಟ್ಟಿ',
    title: 'ನನ್ನ ಬೆಳೆಗಳು',
    description: 'ನಿಮ್ಮ ಜಮೀನಿನಲ್ಲಿ ದಾಖಲಿಸಿದ ಎಲ್ಲಾ ಬೆಳೆಗಳು. ಪ್ಯಾಕೇಜಿಂಗ್ QR ಕೋಡ್‌ಗಳನ್ನು ನೋಡಿ, ಸ್ಥಿತಿ ಪರಿಶೀಲಿಸಿ ಅಥವಾ ಖರೀದಿದಾರರಿಗೆ ವರ್ಗಾಯಿಸಿ.',
    addCrop: 'ಹೊಸ ಬೆಳೆ ಸೇರಿಸಿ',
    search: 'ಬೆಳೆ, ಬ್ಯಾಚ್ ID ಅಥವಾ ಊರನ್ನು ಹುಡುಕಿ...',
    status: 'ಸ್ಥಿತಿ',
    all: 'ಎಲ್ಲಾ',
    registered: 'ನೋಂದಾಯಿಸಲಾಗಿದೆ',
    ready: 'ರವಾನೆಗೆ ಸಿದ್ಧ',
    transit: 'ಸಾಗಣೆಯಲ್ಲಿದೆ',
    tableView: 'ಪಟ್ಟಿ ನೋಟ',
    cardView: 'ಕಾರ್ಡ್ ನೋಟ',
    noCrops: 'ಯಾವುದೇ ಬೆಳೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ',
    noMatches: 'ನಿಮ್ಮ ಹುಡುಕಾಟ ಅಥವಾ ಫಿಲ್ಟರ್‌ಗೆ ಹೊಂದುವ ಬೆಳೆಗಳಿಲ್ಲ.',
    addFirst: 'ನಿಮ್ಮ ಮೊದಲ ಬೆಳೆಯನ್ನು ಸೇರಿಸಿ',
    batchId: 'ಬ್ಯಾಚ್ ID',
    cropVariety: 'ಬೆಳೆ ಮತ್ತು ತಳಿ',
    quantity: 'ಪ್ರಮಾಣ',
    harvestDate: 'ಕೊಯ್ಲಿನ ದಿನಾಂಕ',
    quality: 'ಗುಣಮಟ್ಟ',
    location: 'ಜಮೀನಿನ ಸ್ಥಳ',
    price: 'ನನ್ನ ಬೆಲೆ',
    actions: 'ಕ್ರಿಯೆಗಳು',
    details: 'ವಿವರಗಳು',
    transfer: 'ವರ್ಗಾಯಿಸಿ',
    transferTitle: 'ಖರೀದಿದಾರರಿಗೆ ಅಥವಾ ಸಾಗಣೆದಾರರಿಗೆ ವರ್ಗಾಯಿಸಿ',
    viewQR: 'QR ಕೋಡ್ ವೀಕ್ಷಿಸಿ',
    produce: 'ಉತ್ಪನ್ನ',
    localFarm: 'ಸ್ಥಳೀಯ ಜಮೀನು',
    gradeA: 'ವರ್ಗ A',
    gradeB: 'ವರ್ಗ B',
    grade: 'ವರ್ಗ',
    harvest: 'ಕೊಯ್ಲು',
    farmerPrice: 'ರೈತರ ಬೆಲೆ',
    origin: 'ಮೂಲ ಗ್ರಾಮ',
    close: 'ಮುಚ್ಚಿ',
    transferProduce: 'ಉತ್ಪನ್ನ ವರ್ಗಾವಣೆ',
    kg: 'ಕೆಜಿ',
  },
} as const;

type Language = keyof typeof translations;

const statusTranslations: Record<Language, Record<string, string>> = {
  en: {
    Registered: 'Registered',
    'Ready for Dispatch': 'Ready for Dispatch',
    'In Transit': 'In Transit',
    'With Distributor': 'With Distributor',
    'On Retail Shelf': 'On Retail Shelf',
    'Sold to Consumer': 'Sold to Consumer',
    Completed: 'Completed',
  },
  hi: {
    Registered: 'पंजीकृत',
    'Ready for Dispatch': 'भेजने के लिए तैयार',
    'In Transit': 'रास्ते में',
    'With Distributor': 'वितरक के पास',
    'On Retail Shelf': 'खुदरा दुकान पर',
    'Sold to Consumer': 'उपभोक्ता को बेचा गया',
    Completed: 'पूरा हुआ',
  },
  kn: {
    Registered: 'ನೋಂದಾಯಿಸಲಾಗಿದೆ',
    'Ready for Dispatch': 'ರವಾನೆಗೆ ಸಿದ್ಧ',
    'In Transit': 'ಸಾಗಣೆಯಲ್ಲಿದೆ',
    'With Distributor': 'ವಿತರಕರ ಬಳಿ',
    'On Retail Shelf': 'ಚಿಲ್ಲರೆ ಅಂಗಡಿಯಲ್ಲಿ',
    'Sold to Consumer': 'ಗ್ರಾಹಕರಿಗೆ ಮಾರಾಟವಾಗಿದೆ',
    Completed: 'ಪೂರ್ಣಗೊಂಡಿದೆ',
  },
};

export const MyProduce: React.FC = () => {
  const {
    batches,
    currentUser,
    navigate,
    setSelectedBatchId,
  } = useApp();

  const { language } = useFarmerLanguage();
  const t = translations[language as Language] || translations.en;
  const statusText = statusTranslations[language as Language] || statusTranslations.en;

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [activeQRBatch, setActiveQRBatch] = useState<ProduceBatch | null>(null);
  const [inspectBatch, setInspectBatch] = useState<ProduceBatch | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const farmerBatches = batches.filter(
    (b) =>
      b.farmerId === currentUser?.id ||
      b.farmerName === currentUser?.name ||
      b.farmerId === 'usr-farmer-01'
  );

  const displayPool = farmerBatches.length > 0 ? farmerBatches : batches;

  const filtered = displayPool.filter((b) => {
    const statusMatch =
      filterStatus === 'all' ||
      b.status.toLowerCase() === filterStatus.toLowerCase();

    const query = searchFilter.toLowerCase();

    const nameMatch =
      (b.cropName || b.name || '').toLowerCase().includes(query) ||
      (b.batchId || '').toLowerCase().includes(query) ||
      (b.farmLocation || b.farmerLocation || '').toLowerCase().includes(query);

    return statusMatch && nameMatch;
  });

  const handleViewDetails = (batch: ProduceBatch) => {
    setSelectedBatchId(batch.id);
    setInspectBatch(batch);
  };

  const getQuality = (batch: ProduceBatch) =>
    batch.qualityGrade ||
    (batch.quality?.grade?.includes('A') ? 'Grade A' : 'Grade B');

  const getStatus = (status: string | undefined) =>
    status ? statusText[status] || status : statusText.Registered || 'Registered';

  const getCropName = (batch: ProduceBatch) =>
    batch.cropName || batch.name || t.produce;

  const getVariety = (batch: ProduceBatch) =>
    batch.cropVariety || batch.variety || '';

  const getQuantity = (batch: ProduceBatch) =>
    batch.quantity || batch.quantityKg || 0;

  const getUnit = (batch: ProduceBatch) => batch.unit || 'kg';

  const getPrice = (batch: ProduceBatch) =>
    batch.farmgatePrice || batch.pricing?.farmerPrice || 0;

  const getLocation = (batch: ProduceBatch) =>
    batch.farmLocation || batch.farmerLocation || t.localFarm;

  const getFilterLabel = (status: string) => {
    if (status === 'all') return t.all;
    return getStatus(status);
  };

  const filterOptions = [
    { value: 'all', label: t.all },
    { value: 'Registered', label: t.registered },
    { value: 'Ready for Dispatch', label: t.ready },
    { value: 'In Transit', label: t.transit },
  ];

  return (
    <div className="space-y-6 pb-16 max-w-6xl mx-auto">
      <div className="flex items-center justify-start">
        <BackButton fallback="/farmer/dashboard" />
      </div>

      <div className="bg-white border border-[#bbf7d0] rounded-xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#16a34a]" />
            <span className="text-[11px] font-semibold text-[#16a34a] uppercase tracking-wider">
              {t.directory}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1c1917]">
            {t.title}
          </h1>
          <p className="text-xs text-[#78716c]">{t.description}</p>
        </div>

        <button
          id="btn-register-new-batch"
          onClick={() => navigate('/farmer/register-produce')}
          className="px-4 py-2.5 bg-[#16a34a] hover:bg-[#15803d] text-white font-semibold text-xs sm:text-sm rounded-lg transition shadow-xs flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t.addCrop}</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-[#bbf7d0] shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder={t.search}
            aria-label={t.search}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-[#f0fdf4]/30 border border-[#bbf7d0] rounded-lg focus:border-[#16a34a] focus:bg-white outline-none transition"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end overflow-x-auto">
          <div className="flex items-center gap-1.5 text-xs overflow-x-auto">
            <span className="text-[#78716c] font-medium mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>{t.status}:</span>
            </span>
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilterStatus(option.value)}
                className={`px-3 py-1 rounded-md whitespace-nowrap transition cursor-pointer text-xs font-semibold ${
                  filterStatus.toLowerCase() === option.value.toLowerCase()
                    ? 'bg-[#16a34a] text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="flex items-center bg-stone-100 p-0.5 rounded-lg shrink-0">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded transition cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-[#16a34a] shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
              title={t.tableView}
              aria-label={t.tableView}
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded transition cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white text-[#16a34a] shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
              title={t.cardView}
              aria-label={t.cardView}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-10 text-center border border-[#bbf7d0] space-y-4">
          <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
            <Package className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-[#1c1917] text-base">{t.noCrops}</h3>
            <p className="text-xs text-[#78716c] max-w-sm mx-auto">
              {t.noMatches}
            </p>
          </div>
          <button
            onClick={() => navigate('/farmer/register-produce')}
            className="px-4 py-2 bg-[#16a34a] hover:bg-[#15803d] text-white font-semibold text-xs rounded-lg transition inline-flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.addFirst}</span>
          </button>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white border border-[#bbf7d0] rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f0fdf4]/60 border-b border-[#bbf7d0] text-[#1c1917] font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-bold">{t.batchId}</th>
                  <th className="py-3 px-4 font-bold">{t.cropVariety}</th>
                  <th className="py-3 px-4 font-bold">{t.quantity}</th>
                  <th className="py-3 px-4 font-bold">{t.harvestDate}</th>
                  <th className="py-3 px-4 font-bold">{t.quality}</th>
                  <th className="py-3 px-4 font-bold">{t.location}</th>
                  <th className="py-3 px-4 font-bold">{t.price}</th>
                  <th className="py-3 px-4 font-bold">{t.status}</th>
                  <th className="py-3 px-4 font-bold text-right">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-800">
                {filtered.map((batch) => (
                  <tr key={batch.id} className="hover:bg-stone-50/80 transition">
                    <td className="py-3 px-4 whitespace-nowrap font-mono font-bold text-[#16a34a]">
                      {batch.batchId}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-bold text-[#1c1917]">{getCropName(batch)}</div>
                      {getVariety(batch) && (
                        <div className="text-[11px] text-[#78716c] font-normal">
                          {getVariety(batch)}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-semibold text-stone-900 font-mono">
                      {getQuantity(batch)} {getUnit(batch)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-stone-600">
                      {batch.harvestDate}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-stone-100 text-stone-700 border border-stone-200">
                        {getQuality(batch)}
                      </span>
                    </td>
                    <td
                      className="py-3 px-4 whitespace-nowrap text-stone-600 max-w-[150px] truncate"
                      title={getLocation(batch)}
                    >
                      {getLocation(batch)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-bold text-[#16a34a] font-mono">
                      ₹{getPrice(batch)} / {getUnit(batch)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-[11px] font-medium text-stone-700 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                        {getStatus(batch.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-right space-x-1.5">
                      <button
                        onClick={() => handleViewDetails(batch)}
                        className="px-2.5 py-1 rounded bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-semibold transition inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{t.details}</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedBatchId(batch.id);
                          navigate('/farmer/transfers');
                        }}
                        title={t.transferTitle}
                        className="px-2.5 py-1 rounded bg-stone-100 hover:bg-stone-200 text-[#1c1917] text-xs font-semibold transition inline-flex items-center gap-1 cursor-pointer border border-stone-200"
                      >
                        <Truck className="w-3.5 h-3.5 text-[#16a34a]" />
                        <span>{t.transfer}</span>
                      </button>
                      <button
                        onClick={() => setActiveQRBatch(batch)}
                        title={t.viewQR}
                        className="p-1 rounded border border-stone-300 hover:bg-stone-100 text-[#16a34a] transition inline-flex items-center cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}

              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((batch) => (
            <div
              key={batch.id}
              className="bg-white rounded-xl border border-[#bbf7d0] shadow-xs hover:border-[#22c55e] transition overflow-hidden flex flex-col justify-between"
            >
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#16a34a]">
                    {batch.batchId}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-medium border border-stone-200">
                    {getStatus(batch.status)}
                  </span>

                </div>
                <div>
                  <h3 className="font-bold text-[#1c1917] text-base">{getCropName(batch)}</h3>
                  {getVariety(batch) && (
                    <p className="text-xs text-[#78716c]">{getVariety(batch)}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-stone-100">
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase">{t.quantity}</span>
                    <strong className="text-stone-900 font-mono">
                      {getQuantity(batch)} {getUnit(batch)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase">{t.price}</span>
                    <strong className="text-[#16a34a] font-mono">
                      ₹{getPrice(batch)}/{getUnit(batch)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase">{t.harvest}</span>
                    <span className="text-stone-600">{batch.harvestDate}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase">{t.grade}</span>
                    <span className="text-stone-600">{getQuality(batch)}</span>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-[#f0fdf4]/50 border-t border-[#bbf7d0] flex items-center justify-between gap-2">
                <button
                  onClick={() => handleViewDetails(batch)}
                  className="flex-1 py-1.5 px-3 bg-white hover:bg-stone-50 border border-[#bbf7d0] rounded text-xs font-semibold text-[#1c1917] transition text-center cursor-pointer"
                >
                  {t.details}
                </button>
                <button
                  onClick={() => {
                    setSelectedBatchId(batch.id);
                    navigate('/farmer/transfers');
                  }}
                  className="flex-1 py-1.5 px-3 bg-[#16a34a] hover:bg-[#15803d] text-white rounded text-xs font-semibold transition text-center cursor-pointer"
                >
                  {t.transfer}
                </button>
                <button
                  onClick={() => setActiveQRBatch(batch)}
                  className="p-1.5 bg-white hover:bg-stone-50 border border-[#bbf7d0] rounded text-[#16a34a] transition cursor-pointer"
                  title={t.viewQR}
                >
                  <QrCode className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {inspectBatch && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#bbf7d0] max-w-xl w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <span className="text-[11px] font-mono font-bold text-[#16a34a]">
                  {inspectBatch.batchId}
                </span>
                <h3 className="text-lg font-bold text-[#1c1917]">
                  {getCropName(inspectBatch)}{' '}
                  {getVariety(inspectBatch) && `(${getVariety(inspectBatch)})`}
                </h3>
              </div>
              <button
                onClick={() => setInspectBatch(null)}
                className="p-1 hover:bg-stone-100 rounded text-stone-500 cursor-pointer"
                aria-label={t.close}
                title={t.close}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-stone-50 rounded border border-stone-200">
                <span className="text-stone-400 block text-[10px] uppercase">{t.quantity}</span>
                <span className="font-bold text-stone-900 text-sm font-mono">
                  {getQuantity(inspectBatch)} {getUnit(inspectBatch)}
                </span>
              </div>
              <div className="p-3 bg-stone-50 rounded border border-stone-200">
                <span className="text-stone-400 block text-[10px] uppercase">{t.farmerPrice}</span>
                <span className="font-bold text-[#16a34a] text-sm font-mono">
                  ₹{getPrice(inspectBatch)} / {getUnit(inspectBatch)}

                </span>
              </div>
              <div className="p-3 bg-stone-50 rounded border border-stone-200">
                <span className="text-stone-400 block text-[10px] uppercase">{t.origin}</span>
                <span className="font-semibold text-stone-800">
                  {getLocation(inspectBatch)}
                </span>
              </div>
              <div className="p-3 bg-stone-50 rounded border border-stone-200">
                <span className="text-stone-400 block text-[10px] uppercase">{t.harvestDate}</span>
                <span className="font-semibold text-stone-800">
                  {inspectBatch.harvestDate}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
              <button
                onClick={() => {
                  const batch = inspectBatch;
                  setInspectBatch(null);
                  setActiveQRBatch(batch);
                }}
                className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-[#1c1917] font-semibold text-xs rounded-lg transition flex items-center gap-1.5 cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5 text-[#16a34a]" />
                <span>{t.viewQR}</span>
              </button>
              <button
                onClick={() => {
                  const batch = inspectBatch;
                  setInspectBatch(null);
                  setSelectedBatchId(batch.id);
                  navigate('/farmer/transfers');
                }}
                className="px-4 py-2 bg-[#16a34a] hover:bg-[#15803d] text-white font-semibold text-xs rounded-lg transition flex items-center gap-1.5 cursor-pointer"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>{t.transferProduce}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeQRBatch && (
        <QRCodeModal
          onClose={() => setActiveQRBatch(null)}
          batch={activeQRBatch}
        />
      )}
    </div>
  );
};

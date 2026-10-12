import React, { useState } from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  QrCode, 
  ArrowRight, 
  CheckCircle2, 
  PlusCircle, 
  ExternalLink,
  Calendar,
  MapPin,
  Tag,
  Award,
  X,
  Eye,
  Layers,
  Table as TableIcon,
  LayoutGrid,
  ArrowRightLeft,
  Truck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProduceBatch } from '../../types/produce';
import { QRCodeModal } from '../common/QRCodeModal';

export const MyProduce: React.FC = () => {
  const { batches, currentUser, navigate, setSelectedBatchId, navigateToVerification } = useApp();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [activeQRBatch, setActiveQRBatch] = useState<ProduceBatch | null>(null);
  const [inspectBatch, setInspectBatch] = useState<ProduceBatch | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const farmerBatches = batches.filter(b => 
    b.farmerId === currentUser?.id || 
    b.farmerName === currentUser?.name || 
    b.farmerId === 'usr-farmer-01'
  );

  const displayPool = farmerBatches.length > 0 ? farmerBatches : batches;

  const filtered = displayPool.filter(b => {
    const statusMatch = filterStatus === 'all' || b.status.toLowerCase() === filterStatus.toLowerCase();
    const query = searchFilter.toLowerCase();
    const nameMatch = (b.cropName || b.name || '').toLowerCase().includes(query) ||
                      (b.batchId || '').toLowerCase().includes(query) ||
                      (b.farmLocation || b.farmerLocation || '').toLowerCase().includes(query);
    return statusMatch && nameMatch;
  });

  const handleViewDetails = (batch: ProduceBatch) => {
    setSelectedBatchId(batch.id);
    setInspectBatch(batch);
  };

  return (
    <div className="space-y-6 pb-16 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="bg-white border border-[#bbf7d0] rounded-xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#16a34a]"></span>
            <span className="text-[11px] font-semibold text-[#16a34a] uppercase tracking-wider">
              Crop Directory
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1c1917]">
            My Crops
          </h1>
          <p className="text-xs text-[#78716c]">
            All crops logged by your farm. View packaging QR codes, check status, or transfer to buyers.
          </p>
        </div>

        <button
          id="btn-register-new-batch"
          onClick={() => navigate('/farmer/register-produce')}
          className="px-4 py-2.5 bg-[#16a34a] hover:bg-[#15803d] text-white font-semibold text-xs sm:text-sm rounded-lg transition shadow-xs flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Crop</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#bbf7d0] shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search crop, batch ID, town..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-[#f0fdf4]/30 border border-[#bbf7d0] rounded-lg focus:border-[#16a34a] focus:bg-white outline-none transition"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end overflow-x-auto">
          {/* Status Filter Chips */}
          <div className="flex items-center gap-1.5 text-xs overflow-x-auto">
            <span className="text-[#78716c] font-medium mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Status:</span>
            </span>
            {['all', 'Registered', 'Ready for Dispatch', 'In Transit'].map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-md whitespace-nowrap transition cursor-pointer text-xs font-semibold ${
                  filterStatus.toLowerCase() === st.toLowerCase()
                    ? 'bg-[#16a34a] text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {st === 'all' ? 'All' : st}
              </button>
            ))}
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-stone-100 p-0.5 rounded-lg shrink-0">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded transition cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-[#16a34a] shadow-xs' : 'text-stone-500 hover:text-stone-800'
              }`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded transition cursor-pointer ${
                viewMode === 'cards' ? 'bg-white text-[#16a34a] shadow-xs' : 'text-stone-500 hover:text-stone-800'
              }`}
              title="Card View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Batches Display */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-10 text-center border border-[#bbf7d0] space-y-4">
          <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
            <Package className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-[#1c1917] text-base">No crops found</h3>
            <p className="text-xs text-[#78716c] max-w-sm mx-auto">
              No crops match your current search or filter.
            </p>
          </div>
          <button
            onClick={() => navigate('/farmer/register-produce')}
            className="px-4 py-2 bg-[#16a34a] hover:bg-[#15803d] text-white font-semibold text-xs rounded-lg transition inline-flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Your First Crop</span>
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white border border-[#bbf7d0] rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f0fdf4]/60 border-b border-[#bbf7d0] text-[#1c1917] font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-bold">Batch ID</th>
                  <th className="py-3 px-4 font-bold">Crop & Variety</th>
                  <th className="py-3 px-4 font-bold">Quantity</th>
                  <th className="py-3 px-4 font-bold">Harvest Date</th>
                  <th className="py-3 px-4 font-bold">Quality</th>
                  <th className="py-3 px-4 font-bold">Farm Location</th>
                  <th className="py-3 px-4 font-bold">My Price</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-800">
                {filtered.map(batch => {
                  const cropTitle = batch.cropName || batch.name || 'Produce';
                  const variety = batch.cropVariety || batch.variety || '';
                  const qty = batch.quantity || batch.quantityKg || 0;
                  const unit = batch.unit || 'kg';
                  const price = batch.farmgatePrice || batch.pricing?.farmerPrice || 0;
                  const location = batch.farmLocation || batch.farmerLocation || 'Local Farm';
                  const quality = batch.qualityGrade || (batch.quality?.grade?.includes('A') ? 'Grade A' : 'Grade B');

                  return (
                    <tr key={batch.id} className="hover:bg-stone-50/80 transition">
                      <td className="py-3 px-4 whitespace-nowrap font-mono font-bold text-[#16a34a]">
                        {batch.batchId}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-[#1c1917]">{cropTitle}</div>
                        {variety && <div className="text-[11px] text-[#78716c] font-normal">{variety}</div>}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap font-semibold text-stone-900 font-mono">
                        {qty} {unit}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-stone-600">
                        {batch.harvestDate}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-stone-100 text-stone-700 border border-stone-200">
                          {quality}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-stone-600 max-w-[150px] truncate" title={location}>
                        {location}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap font-bold text-[#16a34a] font-mono">
                        ₹{price} / {unit}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-[11px] font-medium text-stone-700 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                          {batch.status || 'Registered'}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-right space-x-1.5">
                        <button
                          onClick={() => handleViewDetails(batch)}
                          className="px-2.5 py-1 rounded bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-semibold transition inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBatchId(batch.id);
                            navigate('/farmer/transfers');
                          }}
                          title="Transfer to Buyer or Transporter"
                          className="px-2.5 py-1 rounded bg-stone-100 hover:bg-stone-200 text-[#1c1917] text-xs font-semibold transition inline-flex items-center gap-1 cursor-pointer border border-stone-200"
                        >
                          <Truck className="w-3.5 h-3.5 text-[#16a34a]" />
                          <span>Transfer</span>
                        </button>
                        <button
                          onClick={() => setActiveQRBatch(batch)}
                          title="View QR Code"
                          className="p-1 rounded border border-stone-300 hover:bg-stone-100 text-[#16a34a] transition inline-flex items-center cursor-pointer"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(batch => {
            const cropTitle = batch.cropName || batch.name || 'Produce';
            const variety = batch.cropVariety || batch.variety || '';
            const qty = batch.quantity || batch.quantityKg || 0;
            const unit = batch.unit || 'kg';
            const price = batch.farmgatePrice || batch.pricing?.farmerPrice || 0;
            const location = batch.farmLocation || batch.farmerLocation || 'Local Farm';
            const quality = batch.qualityGrade || (batch.quality?.grade?.includes('A') ? 'Grade A' : 'Grade B');

            return (
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
                      {batch.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-[#1c1917] text-base">{cropTitle}</h3>
                    {variety && <p className="text-xs text-[#78716c]">{variety}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-stone-100">
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase">Quantity</span>
                      <strong className="text-stone-900 font-mono">{qty} {unit}</strong>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase">Price</span>
                      <strong className="text-[#16a34a] font-mono">₹{price}/{unit}</strong>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase">Harvest</span>
                      <span className="text-stone-600">{batch.harvestDate}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase">Grade</span>
                      <span className="text-stone-600">{quality}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-[#f0fdf4]/50 border-t border-[#bbf7d0] flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleViewDetails(batch)}
                    className="flex-1 py-1.5 px-3 bg-white hover:bg-stone-50 border border-[#bbf7d0] rounded text-xs font-semibold text-[#1c1917] transition text-center cursor-pointer"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => {
                      setSelectedBatchId(batch.id);
                      navigate('/farmer/transfers');
                    }}
                    className="flex-1 py-1.5 px-3 bg-[#16a34a] hover:bg-[#15803d] text-white rounded text-xs font-semibold transition text-center cursor-pointer"
                  >
                    Transfer
                  </button>
                  <button
                    onClick={() => setActiveQRBatch(batch)}
                    className="p-1.5 bg-white hover:bg-stone-50 border border-[#bbf7d0] rounded text-[#16a34a] transition cursor-pointer"
                    title="View QR Code"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Batch Details Inspection Modal */}
      {inspectBatch && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#bbf7d0] max-w-xl w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <span className="text-[11px] font-mono font-bold text-[#16a34a]">{inspectBatch.batchId}</span>
                <h3 className="text-lg font-bold text-[#1c1917]">
                  {inspectBatch.cropName || inspectBatch.name} {inspectBatch.cropVariety && `(${inspectBatch.cropVariety})`}
                </h3>
              </div>
              <button 
                onClick={() => setInspectBatch(null)}
                className="p-1 hover:bg-stone-100 rounded text-stone-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-stone-50 rounded border border-stone-200">
                <span className="text-stone-400 block text-[10px] uppercase">Quantity</span>
                <span className="font-bold text-stone-900 text-sm font-mono">
                  {inspectBatch.quantity || inspectBatch.quantityKg} {inspectBatch.unit || 'kg'}
                </span>
              </div>
              <div className="p-3 bg-stone-50 rounded border border-stone-200">
                <span className="text-stone-400 block text-[10px] uppercase">Farmer Price</span>
                <span className="font-bold text-[#16a34a] text-sm font-mono">
                  ₹{inspectBatch.farmgatePrice || inspectBatch.pricing?.farmerPrice} / {inspectBatch.unit || 'kg'}
                </span>
              </div>
              <div className="p-3 bg-stone-50 rounded border border-stone-200">
                <span className="text-stone-400 block text-[10px] uppercase">Origin Village</span>
                <span className="font-semibold text-stone-800">{inspectBatch.farmLocation || inspectBatch.farmerLocation}</span>
              </div>
              <div className="p-3 bg-stone-50 rounded border border-stone-200">
                <span className="text-stone-400 block text-[10px] uppercase">Harvest Date</span>
                <span className="font-semibold text-stone-800">{inspectBatch.harvestDate}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
              <button
                onClick={() => {
                  const b = inspectBatch;
                  setInspectBatch(null);
                  setActiveQRBatch(b);
                }}
                className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-[#1c1917] font-semibold text-xs rounded-lg transition flex items-center gap-1.5 cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5 text-[#16a34a]" />
                <span>View QR Code</span>
              </button>

              <button
                onClick={() => {
                  const b = inspectBatch;
                  setInspectBatch(null);
                  setSelectedBatchId(b.id);
                  navigate('/farmer/transfers');
                }}
                className="px-4 py-2 bg-[#16a34a] hover:bg-[#15803d] text-white font-semibold text-xs rounded-lg transition flex items-center gap-1.5 cursor-pointer"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Transfer Produce</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {activeQRBatch && (
        <QRCodeModal
          isOpen={!!activeQRBatch}
          onClose={() => setActiveQRBatch(null)}
          batch={activeQRBatch}
        />
      )}

    </div>
  );
};

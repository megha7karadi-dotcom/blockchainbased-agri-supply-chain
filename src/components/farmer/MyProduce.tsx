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
  ArrowRightLeft
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

  // Filter batches for current farmer (or show default platform batches if new session)
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
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      
      {/* =========================================================================
          PAGE HEADER
          ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Package className="w-7 h-7 text-emerald-600" />
              <span>My Produce Batches</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
              Manage your registered agricultural batches, view traceability status, and inspect farmgate records.
            </p>
          </div>

          <button
            id="btn-register-new-batch"
            onClick={() => navigate('/farmer/register-produce')}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Register New Produce</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search by crop, batch ID, location..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:border-emerald-600 outline-none transition"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end overflow-x-auto">
          {/* Status Filter Chips */}
          <div className="flex items-center gap-1.5 text-xs overflow-x-auto">
            <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Status:</span>
            </span>
            {['all', 'Registered', 'Ready for Dispatch', 'In Transit'].map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-xl whitespace-nowrap transition cursor-pointer text-xs font-semibold ${
                  filterStatus.toLowerCase() === st.toLowerCase()
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === 'all' ? 'All' : st}
              </button>
            ))}
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'cards' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Card View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          BATCHES DISPLAY (Section 13)
          ========================================================================= */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
          <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Package className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800 text-base">No produce batches found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No batches matched your current search or filter criteria.
            </p>
          </div>
          <button
            onClick={() => navigate('/farmer/register-produce')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition inline-flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Register Your First Batch</span>
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW (Section 13 exact specification) */
        <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Batch ID</th>
                  <th className="py-3.5 px-4 font-bold">Crop</th>
                  <th className="py-3.5 px-4 font-bold">Quantity</th>
                  <th className="py-3.5 px-4 font-bold">Harvest Date</th>
                  <th className="py-3.5 px-4 font-bold">Quality</th>
                  <th className="py-3.5 px-4 font-bold">Farm Location</th>
                  <th className="py-3.5 px-4 font-bold">Farmgate Price</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                  <th className="py-3.5 px-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(batch => {
                  const cropTitle = batch.cropName || batch.name || 'Agricultural Produce';
                  const variety = batch.cropVariety || batch.variety || '';
                  const qty = batch.quantity || batch.quantityKg || 0;
                  const unit = batch.unit || 'kg';
                  const price = batch.farmgatePrice || batch.pricing?.farmerPrice || 0;
                  const location = batch.farmLocation || batch.farmerLocation || 'Local Farm';
                  const quality = batch.qualityGrade || (batch.quality?.grade?.includes('A') ? 'Grade A' : 'Grade B');

                  return (
                    <tr key={batch.id} className="hover:bg-slate-50/70 transition">
                      {/* Batch ID */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                          {batch.batchId}
                        </span>
                      </td>

                      {/* Crop */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900">{cropTitle}</div>
                        {variety && <div className="text-[11px] text-slate-500 font-normal">{variety}</div>}
                      </td>

                      {/* Quantity */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-800">
                        {qty} {unit}
                      </td>

                      {/* Harvest Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                        {batch.harvestDate}
                      </td>

                      {/* Quality */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                          {quality}
                        </span>
                      </td>

                      {/* Farm Location */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 max-w-[160px] truncate" title={location}>
                        {location}
                      </td>

                      {/* Farmgate Price */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-bold text-emerald-700">
                        ₹{price} / {unit}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="text-xs font-semibold text-emerald-700">
                          {batch.status || 'Registered'}
                        </span>
                      </td>

                      {/* Action: "View Details", "Transfer", "QR" */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right space-x-1.5">
                        <button
                          onClick={() => handleViewDetails(batch)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition inline-flex items-center gap-1 cursor-pointer shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBatchId(batch.id);
                            navigate('/farmer/transfers');
                          }}
                          title="Transfer to Distributor"
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition inline-flex items-center gap-1 cursor-pointer"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Transfer</span>
                        </button>
                        <button
                          onClick={() => setActiveQRBatch(batch)}
                          title="Generate QR Code"
                          className="p-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-600 text-xs transition inline-flex items-center cursor-pointer"
                        >
                          <QrCode className="w-3.5 h-3.5 text-emerald-700" />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(batch => {
            const cropTitle = batch.cropName || batch.name || 'Agricultural Produce';
            const variety = batch.cropVariety || batch.variety || '';
            const qty = batch.quantity || batch.quantityKg || 0;
            const unit = batch.unit || 'kg';
            const price = batch.farmgatePrice || batch.pricing?.farmerPrice || 0;
            const location = batch.farmLocation || batch.farmerLocation || 'Local Farm';
            const quality = batch.qualityGrade || (batch.quality?.grade?.includes('A') ? 'Grade A' : 'Grade B');

            return (
              <div
                key={batch.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition overflow-hidden flex flex-col justify-between"
              >
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-700">
                      {batch.batchId}
                    </span>
                    <span className="text-xs font-semibold text-emerald-700">
                      {batch.status || 'Registered'}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{cropTitle}</h3>
                    {variety && <p className="text-xs text-slate-500 line-clamp-1">{variety}</p>}
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Quantity:</span>
                      <span className="font-bold text-slate-800">{qty} {unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Harvest Date:</span>
                      <span className="font-medium text-slate-700">{batch.harvestDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Quality:</span>
                      <span className="font-bold text-slate-800">{quality}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Location:</span>
                      <span className="font-medium text-slate-700 truncate max-w-[140px]">{location}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200/60 pt-1.5">
                      <span className="text-slate-500 font-medium">Farmgate Price:</span>
                      <span className="font-bold text-emerald-700">₹{price} / {unit}</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => setActiveQRBatch(batch)}
                    className="py-2 px-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5 text-emerald-700" />
                    <span>QR</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedBatchId(batch.id);
                      navigate('/farmer/transfers');
                    }}
                    className="py-2 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Transfer</span>
                  </button>
                  <button
                    onClick={() => handleViewDetails(batch)}
                    className="py-2 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer shadow-xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Details</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          VIEW DETAILS MODAL
          ========================================================================= */}
      {inspectBatch && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-slate-800">
                  {inspectBatch.batchId}
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                  {inspectBatch.cropName || inspectBatch.name}
                </h2>
                {inspectBatch.cropVariety && (
                  <p className="text-xs text-slate-500">{inspectBatch.cropVariety}</p>
                )}
              </div>
              <button
                onClick={() => setInspectBatch(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Detailed Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="text-slate-400 block text-[11px]">Quantity</span>
                <span className="text-sm font-bold text-slate-900">
                  {inspectBatch.quantity || inspectBatch.quantityKg} {inspectBatch.unit || 'kg'}
                </span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="text-slate-400 block text-[11px]">Farmgate Price</span>
                <span className="text-sm font-bold text-emerald-700">
                  ₹{inspectBatch.farmgatePrice || inspectBatch.pricing?.farmerPrice} / {inspectBatch.unit || 'kg'}
                </span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="text-slate-400 block text-[11px]">Quality Grade</span>
                <span className="text-xs font-bold text-slate-800">
                  {inspectBatch.qualityGrade || inspectBatch.quality?.grade || 'Grade A'}
                </span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="text-slate-400 block text-[11px]">Harvest Date</span>
                <span className="text-xs font-bold text-slate-800">
                  {inspectBatch.harvestDate}
                </span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 col-span-2">
                <span className="text-slate-400 block text-[11px]">Farm & Location</span>
                <span className="text-xs font-medium text-slate-800">
                  {inspectBatch.farmName ? `${inspectBatch.farmName}, ` : ''}{inspectBatch.farmLocation || inspectBatch.farmerLocation}
                  {inspectBatch.state ? `, ${inspectBatch.state}` : ''}
                </span>
              </div>

              {inspectBatch.certification && (
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 col-span-2">
                  <span className="text-slate-400 block text-[11px]">Certification / Standard</span>
                  <span className="text-xs font-medium text-emerald-800">
                    {inspectBatch.certification}
                  </span>
                </div>
              )}

              {inspectBatch.notes && (
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 col-span-2">
                  <span className="text-slate-400 block text-[11px]">Farmer Notes</span>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                    {inspectBatch.notes}
                  </p>
                </div>
              )}

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 col-span-2 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[11px]">Registration Status</span>
                  <span className="text-xs font-bold text-slate-900">{inspectBatch.status || 'Registered'}</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {inspectBatch.createdAt ? new Date(inspectBatch.createdAt).toLocaleString() : 'Recent'}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  const targetId = inspectBatch.batchId;
                  setInspectBatch(null);
                  navigateToVerification(targetId);
                }}
                className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <ExternalLink className="w-4 h-4 text-emerald-700" />
                <span>Verify on Public Portal</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setInspectBatch(null);
                  setActiveQRBatch(inspectBatch);
                }}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <QrCode className="w-4 h-4" />
                <span>Generate QR Code</span>
              </button>
              <button
                type="button"
                onClick={() => setInspectBatch(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* QR Code Tag Modal */}
      {activeQRBatch && (
        <QRCodeModal batch={activeQRBatch} onClose={() => setActiveQRBatch(null)} />
      )}

    </div>
  );
};

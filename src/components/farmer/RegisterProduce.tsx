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
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProduceBatch, ProduceUnit, QualityGrade } from '../../types/produce';

interface FormState {
  // Section A: Produce Information
  cropName: string;
  cropVariety: string;
  quantity: string;
  unit: ProduceUnit;

  // Section B: Farm & Origin
  farmName: string;
  farmLocation: string;
  district: string;
  state: string;
  pinCode: string;

  // Section C: Harvest & Quality
  harvestDate: string;
  qualityGrade: QualityGrade;
  certification: string;
  notes: string;

  // Section D: Pricing
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

const UNIT_OPTIONS: ProduceUnit[] = ['kg', 'quintal', 'tonnes', 'litres', 'pieces'];
const GRADE_OPTIONS: QualityGrade[] = ['Grade A', 'Grade B', 'Grade C'];

export const RegisterProduce: React.FC = () => {
  const { currentUser, navigate, registerProductBatch } = useApp();
  const formRef = useRef<HTMLDivElement>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Initialize form state
  const [formData, setFormData] = useState<FormState>({
    cropName: '',
    cropVariety: '',
    quantity: '',
    unit: 'kg',
    farmName: currentUser?.organization || '',
    farmLocation: currentUser?.location?.split(',')[0]?.trim() || '',
    district: '',
    state: currentUser?.location?.includes('Maharashtra') ? 'Maharashtra' : 'Maharashtra',
    pinCode: '',
    harvestDate: todayStr,
    qualityGrade: 'Grade A',
    certification: '',
    notes: '',
    farmgatePrice: '',
    priceUnit: '₹ / kg',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredBatch, setRegisteredBatch] = useState<ProduceBatch | null>(null);

  // Field change handler
  const handleChange = (field: keyof FormState, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      // Keep price unit synced with unit choice if user didn't customize it
      if (field === 'unit') {
        updated.priceUnit = `₹ / ${value}`;
      }
      return updated;
    });

    // Clear field-level error on change
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // 1. Crop Name *
    if (!formData.cropName.trim()) {
      newErrors.cropName = 'Crop name is required.';
    }

    // 2. Quantity *
    const qtyNum = parseFloat(formData.quantity);
    if (!formData.quantity.trim()) {
      newErrors.quantity = 'Quantity is required.';
    } else if (isNaN(qtyNum) || qtyNum <= 0) {
      newErrors.quantity = 'Quantity must be a positive number greater than 0.';
    }

    // 3. Unit *
    if (!formData.unit) {
      newErrors.unit = 'Unit is required.';
    }

    // 4. Farm Location *
    if (!formData.farmLocation.trim()) {
      newErrors.farmLocation = 'Farm location is required.';
    }

    // 5. State *
    if (!formData.state.trim()) {
      newErrors.state = 'State is required.';
    }

    // 6. Harvest Date *
    if (!formData.harvestDate) {
      newErrors.harvestDate = 'Harvest date is required.';
    } else if (formData.harvestDate > todayStr) {
      newErrors.harvestDate = 'Harvest date cannot be a future date.';
    }

    // 7. Quality Grade *
    if (!formData.qualityGrade) {
      newErrors.qualityGrade = 'Quality grade is required.';
    }

    // 8. Farmgate Price *
    const priceNum = parseFloat(formData.farmgatePrice);
    if (!formData.farmgatePrice.trim()) {
      newErrors.farmgatePrice = 'Farmgate price is required.';
    } else if (isNaN(priceNum) || priceNum <= 0) {
      newErrors.farmgatePrice = 'Farmgate price must be a positive amount greater than 0.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      // Smooth scroll to top of form or first error
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    try {
      setIsSubmitting(true);

      const batchData = {
        cropName: formData.cropName.trim(),
        cropVariety: formData.cropVariety.trim() || undefined,
        quantity: parseFloat(formData.quantity),
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
        farmgatePrice: parseFloat(formData.farmgatePrice),
        priceUnit: formData.priceUnit || `₹ / ${formData.unit}`,
        farmerId: currentUser?.id || 'usr-farmer-01',
        farmerName: currentUser?.name || 'Verified Producer',
      };

      // Register produce using clean service abstraction via AppContext
      const created = await registerProductBatch(batchData);
      setRegisteredBatch(created);
    } catch (err) {
      console.error('Failed to register produce:', err);
      alert('An unexpected error occurred while saving the produce. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditDetails = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleRegisterAnother = () => {
    setRegisteredBatch(null);
    setFormData({
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
    setErrors({});
  };

  // =========================================================================
  // SUCCESS SCREEN (Section 11)
  // =========================================================================
  if (registeredBatch) {
    return (
      <div className="max-w-3xl mx-auto space-y-8 pb-16">
        {/* Success Banner Card */}
        <div className="bg-white border border-emerald-200 rounded-3xl p-8 sm:p-10 shadow-xs text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Produce Registered Successfully
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
              Your produce batch has been logged onto AgriTrace with an immutable record and unique traceability identifier.
            </p>
          </div>

          {/* Core Batch Confirmation Details */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 max-w-lg mx-auto text-left divide-y divide-slate-200/80 text-sm">
            <div className="pb-3 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Batch ID</span>
              <span className="font-mono font-bold text-emerald-700 text-base bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                {registeredBatch.batchId}
              </span>
            </div>

            <div className="py-3 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Crop</span>
              <span className="font-bold text-slate-900">
                {registeredBatch.cropVariety ? `${registeredBatch.cropVariety} ${registeredBatch.cropName}` : registeredBatch.cropName}
              </span>
            </div>

            <div className="py-3 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Quantity</span>
              <span className="font-bold text-slate-900">
                {registeredBatch.quantity} {registeredBatch.unit}
              </span>
            </div>

            <div className="py-3 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Farmgate Price</span>
              <span className="font-bold text-emerald-700">
                ₹{registeredBatch.farmgatePrice} / {registeredBatch.unit}
              </span>
            </div>

            <div className="pt-3 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Status</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                <span>{registeredBatch.status || 'Registered'}</span>
              </span>
            </div>
          </div>

          {/* Next Steps Section */}
          <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-6 text-left max-w-lg mx-auto space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-900">
              Next Steps
            </div>
            <ol className="space-y-2 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                <div>
                  <strong className="text-slate-900">Generate QR Code:</strong> Create printable packaging stickers for bags, crates, or cartons.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                <div>
                  <strong className="text-slate-900">Track Supply Chain:</strong> Monitor custody transfers as distributors and retailers verify your harvest.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                <div>
                  <strong className="text-slate-900">View Batch Details:</strong> Access the complete inventory record, pricing insights, and audit logs.
                </div>
              </li>
            </ol>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              id="btn-generate-qr"
              onClick={() => navigate('/farmer/qr-codes')}
              className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>Generate QR Code</span>
            </button>

            <button
              id="btn-view-my-produce"
              onClick={() => navigate('/farmer/my-produce')}
              className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Package className="w-4 h-4" />
              <span>View My Produce</span>
            </button>

            <button
              id="btn-register-another"
              onClick={handleRegisterAnother}
              className="w-full sm:w-auto px-5 py-3 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer"
            >
              Register Another Batch
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate review values
  const displayCrop = formData.cropName.trim() || '—';
  const displayVariety = formData.cropVariety.trim() || '—';
  const displayQuantity = formData.quantity.trim() ? `${formData.quantity} ${formData.unit}` : '—';
  const displayLocation = [formData.farmLocation.trim(), formData.state.trim()].filter(Boolean).join(', ') || '—';
  const displayHarvestDate = formData.harvestDate ? new Date(formData.harvestDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
  const displayQuality = formData.qualityGrade;
  const displayPrice = formData.farmgatePrice.trim() ? `₹${formData.farmgatePrice}/${formData.unit}` : '—';

  return (
    <div ref={formRef} className="max-w-4xl mx-auto space-y-8 pb-16">
      
      {/* =========================================================================
          PAGE HEADER
          ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-mono uppercase tracking-wider">Batch Registration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Register New Produce
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
              Create a traceable batch record for your agricultural produce.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/farmer/my-produce')}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition self-start sm:self-auto flex items-center gap-1.5 cursor-pointer"
          >
            <Package className="w-4 h-4 text-slate-500" />
            <span>My Produce Batches</span>
          </button>
        </div>
      </div>

      {/* Main Registration Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-8">
        
        {/* =========================================================================
            SECTION A: PRODUCE INFORMATION
            ========================================================================= */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
              A
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Produce Information</h2>
              <p className="text-xs text-slate-500">Specify the botanical crop name, variety, and harvest quantity</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Crop Name * */}
            <div>
              <label htmlFor="input-cropName" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Crop Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-cropName"
                type="text"
                value={formData.cropName}
                onChange={(e) => handleChange('cropName', e.target.value)}
                placeholder="e.g. Mango, Rice, Vine Tomatoes, Turmeric"
                className={`w-full px-3.5 py-2.5 text-xs bg-slate-50 border rounded-xl outline-none transition ${
                  errors.cropName ? 'border-rose-400 bg-rose-50/40 text-slate-900 focus:border-rose-600' : 'border-slate-300 focus:border-emerald-600 focus:bg-white'
                }`}
              />
              {errors.cropName && (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.cropName}</span>
                </p>
              )}
            </div>

            {/* Crop Variety */}
            <div>
              <label htmlFor="input-cropVariety" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Crop Variety <span className="text-slate-400 text-[11px] font-normal">(Optional)</span>
              </label>
              <input
                id="input-cropVariety"
                type="text"
                value={formData.cropVariety}
                onChange={(e) => handleChange('cropVariety', e.target.value)}
                placeholder="e.g. Alphonso, Basmati 1121, San Marzano"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:border-emerald-600 focus:bg-white outline-none transition"
              />
            </div>

            {/* Quantity * */}
            <div>
              <label htmlFor="input-quantity" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Quantity <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-quantity"
                type="number"
                min="0.01"
                step="any"
                value={formData.quantity}
                onChange={(e) => handleChange('quantity', e.target.value)}
                placeholder="e.g. 500"
                className={`w-full px-3.5 py-2.5 text-xs bg-slate-50 border rounded-xl outline-none transition ${
                  errors.quantity ? 'border-rose-400 bg-rose-50/40 text-slate-900 focus:border-rose-600' : 'border-slate-300 focus:border-emerald-600 focus:bg-white'
                }`}
              />
              {errors.quantity && (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.quantity}</span>
                </p>
              )}
            </div>

            {/* Unit * */}
            <div>
              <label htmlFor="select-unit" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Unit <span className="text-rose-500">*</span>
              </label>
              <select
                id="select-unit"
                value={formData.unit}
                onChange={(e) => handleChange('unit', e.target.value as ProduceUnit)}
                className={`w-full px-3.5 py-2.5 text-xs bg-slate-50 border rounded-xl outline-none transition ${
                  errors.unit ? 'border-rose-400 bg-rose-50/40' : 'border-slate-300 focus:border-emerald-600 focus:bg-white'
                }`}
              >
                {UNIT_OPTIONS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
              {errors.unit && (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.unit}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION B: FARM & ORIGIN
            ========================================================================= */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
              B
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Farm & Origin</h2>
              <p className="text-xs text-slate-500">Record where the crop was grown and harvested</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Farm / Organization Name */}
            <div className="sm:col-span-2">
              <label htmlFor="input-farmName" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Farm / Organization Name <span className="text-slate-400 text-[11px] font-normal">(Optional)</span>
              </label>
              <input
                id="input-farmName"
                type="text"
                value={formData.farmName}
                onChange={(e) => handleChange('farmName', e.target.value)}
                placeholder="e.g. Sahyadri Organic Producers Co-op"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:border-emerald-600 focus:bg-white outline-none transition"
              />
            </div>

            {/* Farm Location * */}
            <div>
              <label htmlFor="input-farmLocation" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Farm Location / Village <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-farmLocation"
                type="text"
                value={formData.farmLocation}
                onChange={(e) => handleChange('farmLocation', e.target.value)}
                placeholder="e.g. Ratnagiri"
                className={`w-full px-3.5 py-2.5 text-xs bg-slate-50 border rounded-xl outline-none transition ${
                  errors.farmLocation ? 'border-rose-400 bg-rose-50/40 text-slate-900 focus:border-rose-600' : 'border-slate-300 focus:border-emerald-600 focus:bg-white'
                }`}
              />
              {errors.farmLocation && (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.farmLocation}</span>
                </p>
              )}
            </div>

            {/* District */}
            <div>
              <label htmlFor="input-district" className="block text-xs font-semibold text-slate-700 mb-1.5">
                District <span className="text-slate-400 text-[11px] font-normal">(Optional)</span>
              </label>
              <input
                id="input-district"
                type="text"
                value={formData.district}
                onChange={(e) => handleChange('district', e.target.value)}
                placeholder="e.g. Ratnagiri District"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:border-emerald-600 focus:bg-white outline-none transition"
              />
            </div>

            {/* State * */}
            <div>
              <label htmlFor="input-state" className="block text-xs font-semibold text-slate-700 mb-1.5">
                State <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-state"
                type="text"
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value)}
                placeholder="e.g. Maharashtra"
                className={`w-full px-3.5 py-2.5 text-xs bg-slate-50 border rounded-xl outline-none transition ${
                  errors.state ? 'border-rose-400 bg-rose-50/40 text-slate-900 focus:border-rose-600' : 'border-slate-300 focus:border-emerald-600 focus:bg-white'
                }`}
              />
              {errors.state && (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.state}</span>
                </p>
              )}
            </div>

            {/* PIN Code */}
            <div>
              <label htmlFor="input-pinCode" className="block text-xs font-semibold text-slate-700 mb-1.5">
                PIN Code <span className="text-slate-400 text-[11px] font-normal">(Optional)</span>
              </label>
              <input
                id="input-pinCode"
                type="text"
                value={formData.pinCode}
                onChange={(e) => handleChange('pinCode', e.target.value)}
                placeholder="e.g. 415612"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:border-emerald-600 focus:bg-white outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION C: HARVEST & QUALITY
            ========================================================================= */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
              C
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Harvest & Quality</h2>
              <p className="text-xs text-slate-500">Document the harvest date, standard grade, and organic certifications</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Harvest Date * */}
            <div>
              <label htmlFor="input-harvestDate" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Harvest Date <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-harvestDate"
                type="date"
                max={todayStr}
                value={formData.harvestDate}
                onChange={(e) => handleChange('harvestDate', e.target.value)}
                className={`w-full px-3.5 py-2.5 text-xs bg-slate-50 border rounded-xl outline-none transition ${
                  errors.harvestDate ? 'border-rose-400 bg-rose-50/40 text-slate-900 focus:border-rose-600' : 'border-slate-300 focus:border-emerald-600 focus:bg-white'
                }`}
              />
              {errors.harvestDate && (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.harvestDate}</span>
                </p>
              )}
            </div>

            {/* Quality Grade * */}
            <div>
              <label htmlFor="select-qualityGrade" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Quality Grade <span className="text-rose-500">*</span>
              </label>
              <select
                id="select-qualityGrade"
                value={formData.qualityGrade}
                onChange={(e) => handleChange('qualityGrade', e.target.value as QualityGrade)}
                className={`w-full px-3.5 py-2.5 text-xs bg-slate-50 border rounded-xl outline-none transition ${
                  errors.qualityGrade ? 'border-rose-400 bg-rose-50/40' : 'border-slate-300 focus:border-emerald-600 focus:bg-white'
                }`}
              >
                {GRADE_OPTIONS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              {errors.qualityGrade && (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.qualityGrade}</span>
                </p>
              )}
            </div>

            {/* Organic / Certification Information (Optional) */}
            <div className="sm:col-span-2">
              <label htmlFor="input-certification" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Organic / Certification Information <span className="text-slate-400 text-[11px] font-normal">(Optional)</span>
              </label>
              <input
                id="input-certification"
                type="text"
                value={formData.certification}
                onChange={(e) => handleChange('certification', e.target.value)}
                placeholder="e.g. NPOP Certified Organic, GI Certificate No. GI-139"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:border-emerald-600 focus:bg-white outline-none transition"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Note: Do not claim that a product is certified unless verified certificate details are provided.
              </p>
            </div>

            {/* Additional Notes */}
            <div className="sm:col-span-2">
              <label htmlFor="input-notes" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Additional Notes <span className="text-slate-400 text-[11px] font-normal">(Optional)</span>
              </label>
              <textarea
                id="input-notes"
                rows={2}
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="e.g. Hand-picked at peak maturity, natural tree ripening, pesticide residue test zero."
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:border-emerald-600 focus:bg-white outline-none transition resize-none"
              />
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION D: PRICING
            ========================================================================= */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
              D
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Pricing</h2>
              <p className="text-xs text-slate-500">Record the initial farmgate price received at the producer level</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Farmgate Price * */}
            <div>
              <label htmlFor="input-farmgatePrice" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Farmgate Price <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">₹</span>
                <input
                  id="input-farmgatePrice"
                  type="number"
                  min="0.01"
                  step="any"
                  value={formData.farmgatePrice}
                  onChange={(e) => handleChange('farmgatePrice', e.target.value)}
                  placeholder="e.g. 120"
                  className={`w-full pl-8 pr-3.5 py-2.5 text-xs bg-slate-50 border rounded-xl outline-none transition font-semibold ${
                    errors.farmgatePrice ? 'border-rose-400 bg-rose-50/40 text-slate-900 focus:border-rose-600' : 'border-slate-300 focus:border-emerald-600 focus:bg-white'
                  }`}
                />
              </div>
              {errors.farmgatePrice && (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.farmgatePrice}</span>
                </p>
              )}
            </div>

            {/* Price Unit */}
            <div>
              <label htmlFor="input-priceUnit" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Price Unit
              </label>
              <input
                id="input-priceUnit"
                type="text"
                value={formData.priceUnit}
                onChange={(e) => handleChange('priceUnit', e.target.value)}
                placeholder="e.g. ₹ / kg"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-mono outline-none"
              />
            </div>
          </div>

          {/* Informational Note Required by Specification */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-start gap-3">
            <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-600 leading-relaxed">
              This is the initial price recorded at the farm level. Later supply-chain stages may record their own transaction prices.
            </p>
          </div>
        </div>

        {/* =========================================================================
            SECTION E: REVIEW & SUBMIT (Section 8)
            ========================================================================= */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
              E
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Review & Submit</h2>
              <p className="text-xs text-slate-500">Confirm all details before registering this produce batch</p>
            </div>
          </div>

          {/* Batch Preview Card as requested in Section 8 */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Batch Preview
              </span>
              <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                Batch ID Generated upon Registration
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Crop</span>
                <strong className="text-slate-900 font-bold block truncate">{displayCrop}</strong>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Variety</span>
                <span className="text-slate-700 font-medium block truncate">{displayVariety}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Quantity</span>
                <strong className="text-slate-900 font-bold block">{displayQuantity}</strong>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Farm Location</span>
                <span className="text-slate-700 font-medium block truncate">{displayLocation}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Harvest Date</span>
                <span className="text-slate-700 font-medium block">{displayHarvestDate}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Quality</span>
                <span className="inline-block px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-800">
                  {displayQuality}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Farmgate Price</span>
                <strong className="text-emerald-700 font-black block">{displayPrice}</strong>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Producer Node</span>
                <span className="text-slate-700 font-medium block truncate">{currentUser?.name || 'Farmer'}</span>
              </div>
            </div>
          </div>

          {/* Buttons: "Edit Details" and "Register Produce" */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
            <button
              id="btn-edit-details"
              type="button"
              onClick={handleEditDetails}
              className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Edit3 className="w-4 h-4 text-slate-500" />
              <span>Edit Details</span>
            </button>

            <button
              id="btn-submit-register"
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-7 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-400 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Registering Batch...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Register Produce</span>
                </>
              )}
            </button>
          </div>
        </div>

      </form>

    </div>
  );
};

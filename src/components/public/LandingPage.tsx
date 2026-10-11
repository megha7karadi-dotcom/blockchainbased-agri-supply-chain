import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Leaf, 
  QrCode, 
  ArrowRight, 
  Search, 
  CheckCircle2, 
  Truck, 
  Store, 
  ShoppingBag,
  ChevronRight,
  Sprout,
  Scale,
  Sparkles,
  Award
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LandingPage: React.FC<{ onOpenQRScanner: () => void }> = ({ onOpenQRScanner }) => {
  const { 
    batches, 
    navigate,
    navigateToVerification, 
    searchBatchQuery, 
    setSearchBatchQuery,
    isAuthenticated,
    currentRole
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchBatchQuery.trim()) {
      const match = batches.find(b => 
        b.batchId.toLowerCase().includes(searchBatchQuery.toLowerCase()) ||
        b.name.toLowerCase().includes(searchBatchQuery.toLowerCase())
      );
      navigateToVerification(match ? match.batchId : 'AGRI-2026-RIC-003');
    } else {
      navigateToVerification('AGRI-2026-RIC-003');
    }
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate(`/${currentRole}/dashboard`);
    } else {
      navigate('/signup');
    }
  };

  // Filtered featured batches
  const filteredBatches = selectedCategory === 'all' 
    ? batches.slice(0, 6) 
    : batches.filter(b => b.category.toLowerCase() === selectedCategory.toLowerCase());

  // Reliable crop image lookup helper
  const getCropImage = (cropName: string, fallback?: string): string => {
    const lower = (cropName || '').toLowerCase();
    if (lower.includes('rice') || lower.includes('basmati') || lower.includes('paddy')) {
      return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80';
    }
    if (lower.includes('mango') || lower.includes('alphonso')) {
      return 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&auto=format&fit=crop&q=80';
    }
    if (lower.includes('grape') || lower.includes('nashik')) {
      return 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=600&auto=format&fit=crop&q=80';
    }
    if (lower.includes('orange') || lower.includes('mandarin') || lower.includes('nagpur')) {
      return 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=600&auto=format&fit=crop&q=80';
    }
    if (lower.includes('wheat') || lower.includes('sharbati')) {
      return 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80';
    }
    if (lower.includes('tomato')) {
      return 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80';
    }
    return fallback || 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=600&auto=format&fit=crop&q=80';
  };

  return (
    <div className="space-y-16 pb-20 max-w-7xl mx-auto">
      
      {/* =========================================================================
          1. REALISTIC AGRICULTURAL HERO SECTION
          ========================================================================= */}
      <section className="relative rounded-2xl overflow-hidden border border-stone-200 bg-[#1b4332] text-white shadow-sm">
        
        {/* Background Agricultural Photograph */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=1600&auto=format&fit=crop&q=85" 
            alt="Indian farmer standing in lush green agricultural field at sunrise"
            className="w-full h-full object-cover object-center filter brightness-65 sm:brightness-75"
            loading="eager"
          />
          {/* Subtle gradient overlay for clean contrast and warmth */}
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/85 via-stone-950/60 to-transparent"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 p-6 sm:p-12 lg:p-16 max-w-3xl space-y-6">
          
          {/* Natural Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/15 backdrop-blur-sm border border-white/20 text-emerald-200 text-xs font-semibold">
            <Sprout className="w-4 h-4 text-emerald-300" />
            <span>Direct Farm-to-Consumer Trust</span>
          </div>

          {/* Simple, Powerful Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-5xl font-bold tracking-tight text-white leading-[1.15]">
            From Farm to Market, Every Step Tracked.
          </h1>

          {/* Short, Farmer-Friendly Description */}
          <p className="text-stone-200 text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
            Track your crops, follow your produce, and help customers trust what they buy.
          </p>

          {/* Two Clear Primary Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
            <button
              onClick={handleGetStarted}
              className="px-7 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm sm:text-base rounded-md transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                onOpenQRScanner();
              }}
              className="px-6 py-3.5 bg-white/95 hover:bg-white text-stone-900 font-semibold text-sm sm:text-base rounded-md transition shadow-sm flex items-center justify-center gap-2 cursor-pointer border border-stone-200"
            >
              <QrCode className="w-4 h-4 text-emerald-800" />
              <span>Verify Product</span>
            </button>
          </div>

          {/* Quick Search Box for Consumers & Buyers */}
          <div className="pt-4 max-w-xl">
            <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row gap-2 bg-white/95 p-1.5 rounded-lg border border-stone-300 shadow-md">
              <div className="relative flex-1 flex items-center">
                <Search className="absolute left-3 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  value={searchBatchQuery}
                  onChange={(e) => setSearchBatchQuery(e.target.value)}
                  placeholder="Enter batch number (e.g. AGRI-2026-RIC-003) or crop..."
                  className="w-full pl-9 pr-3 py-2 text-stone-900 placeholder-stone-500 text-xs sm:text-sm bg-transparent outline-none font-medium"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-[#1b4332] hover:bg-[#2d5a3f] text-white text-xs font-semibold rounded transition flex items-center justify-center gap-1 cursor-pointer shrink-0"
              >
                <span>Find Crop</span>
              </button>
            </form>
          </div>

          {/* Trust Indicators */}
          <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-stone-200">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Verified Indian Farms</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Fair Earnings for Farmers</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>100% Genuine QR Labels</span>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          2. SIMPLE 4-STEP JOURNEY (ANIMATED TIMELINE)
          ========================================================================= */}
      <section className="bg-white rounded-xl border border-stone-200 p-6 sm:p-10 space-y-8 shadow-2xs">
        
        <div className="max-w-2xl space-y-1.5">
          <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
            How AgriTrace Works
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            How Fresh Produce Moves From Farm to Kitchen
          </h2>
          <p className="text-sm text-stone-600">
            Every harvest is recorded simply so farmers get fair payment and buyers know the truth.
          </p>
        </div>

        {/* 4 Connected Practical Steps with Real Photography */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Step 1: Farmer */}
          <div className="border border-stone-200 rounded-lg p-4 space-y-3 bg-stone-50/60 hover:bg-stone-50 transition duration-200 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="h-36 w-full rounded overflow-hidden bg-stone-200">
                <img 
                  src="https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=600&auto=format&fit=crop&q=80" 
                  alt="Farmer inspecting crop in field"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-[#1b4332] text-white font-bold text-xs flex items-center justify-center">
                  1
                </span>
                <h3 className="font-bold text-sm text-stone-900">Add New Crop</h3>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed">
                Farmer adds crop name, harvest date, and price. A unique QR code is created instantly for every bag or crate.
              </p>
            </div>

            <div className="pt-2 border-t border-stone-200 text-[11px] font-semibold text-emerald-800 flex items-center gap-1">
              <Sprout className="w-3.5 h-3.5" />
              <span>Instant QR Code Created</span>
            </div>
          </div>

          {/* Step 2: Transport */}
          <div className="border border-stone-200 rounded-lg p-4 space-y-3 bg-stone-50/60 hover:bg-stone-50 transition duration-200 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="h-36 w-full rounded overflow-hidden bg-stone-200">
                <img 
                  src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80" 
                  alt="Produce transport and logistics"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-[#2d5a3f] text-white font-bold text-xs flex items-center justify-center">
                  2
                </span>
                <h3 className="font-bold text-sm text-stone-900">Safe Transportation</h3>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed">
                Transporters pick up produce from the farm and keep it in cold storage trucks so crops stay fresh during the journey.
              </p>
            </div>

            <div className="pt-2 border-t border-stone-200 text-[11px] font-semibold text-stone-700 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5" />
              <span>Fresh & Safe Transit</span>
            </div>
          </div>

          {/* Step 3: Retailer */}
          <div className="border border-stone-200 rounded-lg p-4 space-y-3 bg-stone-50/60 hover:bg-stone-50 transition duration-200 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="h-36 w-full rounded overflow-hidden bg-stone-200">
                <img 
                  src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80" 
                  alt="Market produce crates on grocery shelves"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-[#406343] text-white font-bold text-xs flex items-center justify-center">
                  3
                </span>
                <h3 className="font-bold text-sm text-stone-900">Market & Shop</h3>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed">
                Grocery stores and mandi retailers receive the produce and place it on shelves with verified pricing.
              </p>
            </div>

            <div className="pt-2 border-t border-stone-200 text-[11px] font-semibold text-stone-700 flex items-center gap-1">
              <Store className="w-3.5 h-3.5" />
              <span>Fair Store Pricing</span>
            </div>
          </div>

          {/* Step 4: Consumer */}
          <div className="border border-stone-200 rounded-lg p-4 space-y-3 bg-stone-50/60 hover:bg-stone-50 transition duration-200 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="h-36 w-full rounded overflow-hidden bg-stone-200">
                <img 
                  src="https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&auto=format&fit=crop&q=80" 
                  alt="Customer buying fresh produce"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-[#1b4332] text-white font-bold text-xs flex items-center justify-center">
                  4
                </span>
                <h3 className="font-bold text-sm text-stone-900">Customer Scans QR</h3>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed">
                Buyers scan the QR code on the packaging to see the farmer's name, farm location, harvest date, and fair price.
              </p>
            </div>

            <div className="pt-2 border-t border-stone-200 text-[11px] font-semibold text-emerald-800 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Full Trust in Every Bite</span>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          3. TRADITIONAL SYSTEM VS AGRITRACE (SIMPLE & HONEST)
          ========================================================================= */}
      <section className="bg-stone-50 rounded-xl border border-stone-200 p-6 sm:p-10 space-y-6">
        <div className="max-w-2xl space-y-1">
          <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
            Why It Matters
          </div>
          <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
            Better for Farmers, Better for Families
          </h2>
          <p className="text-xs sm:text-sm text-stone-600">
            See the difference between the traditional mandi middlemen and direct AgriTrace tracking.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Traditional Middleman Chain */}
          <div className="bg-white rounded-lg p-5 border border-stone-200 space-y-3.5">
            <div className="flex items-center justify-between pb-2.5 border-b border-stone-200">
              <span className="font-bold text-sm text-stone-900">Traditional Mandi System</span>
              <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                High Middlemen Cuts
              </span>
            </div>

            <ul className="space-y-2.5 text-xs text-stone-600">
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold shrink-0">✕</span>
                <span><strong>Low Farmer Payouts:</strong> Farmers often receive only ₹20 to ₹25 for every ₹100 paid by the consumer.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold shrink-0">✕</span>
                <span><strong>Lost Farm Identity:</strong> Crops get mixed together at wholesale yards; buyers never know the actual farm.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold shrink-0">✕</span>
                <span><strong>Spoilage in Transit:</strong> Lack of temperature care causes up to 30% of fruits and vegetables to spoil.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold shrink-0">✕</span>
                <span><strong>Unproven Claims:</strong> Buyers cannot verify if produce is truly organic, fresh, or chemical-free.</span>
              </li>
            </ul>
          </div>

          {/* AgriTrace Verified Chain */}
          <div className="bg-white rounded-lg p-5 border border-emerald-300 space-y-3.5">
            <div className="flex items-center justify-between pb-2.5 border-b border-emerald-200">
              <span className="font-bold text-sm text-emerald-950">With AgriTrace</span>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                Fair & Direct
              </span>
            </div>

            <ul className="space-y-2.5 text-xs text-stone-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span><strong>Fair Farmer Earnings:</strong> Farmers retain ₹60 to ₹70 per ₹100, receiving direct credit for quality.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span><strong>Direct Farm Identity:</strong> Every bag or carton has a QR code linked directly to the farmer and soil.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span><strong>Freshness Preserved:</strong> Clean, monitored transport keeps produce crisp from harvest to retail shelf.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span><strong>Instant Trust:</strong> Consumers scan the sticker with any smartphone camera to see the full story.</span>
              </li>
            </ul>
          </div>

        </div>
      </section>

      {/* =========================================================================
          4. FRESH CROPS IN MARKET (CLEAN PRODUCE LIST WITH REAL PHOTOS)
          ========================================================================= */}
      <section className="bg-white rounded-xl border border-stone-200 p-6 sm:p-10 space-y-6 shadow-2xs">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Fresh Harvests
            </div>
            <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
              Currently Available Crops
            </h2>
            <p className="text-xs sm:text-sm text-stone-500">
              Genuine produce registered by farmers with transparent farm prices and QR verification.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1 p-1 bg-stone-100 rounded-md border border-stone-200 text-xs font-medium">
            {['all', 'Fruits', 'Grains', 'Vegetables'].map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded transition cursor-pointer capitalize ${
                  selectedCategory.toLowerCase() === cat.toLowerCase()
                    ? 'bg-white font-bold text-stone-900 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {cat === 'all' ? 'All Crops' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Clean Structured Data Table */}
        <div className="overflow-x-auto border border-stone-200 rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-700 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Batch No.</th>
                <th className="py-3 px-4">Crop Name</th>
                <th className="py-3 px-4">Farmer & Location</th>
                <th className="py-3 px-4">Harvest Date</th>
                <th className="py-3 px-4 text-right">Farmer Price</th>
                <th className="py-3 px-4 text-right">Market Price</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 text-stone-800">
              {filteredBatches.map(batch => (
                <tr key={batch.id} className="hover:bg-stone-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-stone-900 whitespace-nowrap">
                    {batch.batchId}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md overflow-hidden bg-stone-100 border border-stone-200 shrink-0">
                        <img 
                          src={getCropImage(batch.name || batch.cropName || '', batch.imageUrl)} 
                          alt={batch.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-stone-900">{batch.cropName || batch.name}</div>
                        <div className="text-[11px] text-stone-500">{batch.cropVariety || batch.variety}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-stone-800 font-medium">{batch.farmerLocation || batch.farmLocation || 'India'}</div>
                    <div className="text-[10px] text-stone-500">{batch.farmerName}</div>
                  </td>
                  <td className="py-3.5 px-4 text-stone-600 whitespace-nowrap">
                    {batch.harvestDate}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-semibold text-stone-900 whitespace-nowrap">
                    ₹{batch.farmgatePrice || batch.pricing?.farmerPrice}/kg
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-950 whitespace-nowrap">
                    ₹{batch.pricing?.finalConsumerPrice}/kg
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-stone-100 text-stone-700 border border-stone-200">
                      {batch.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => navigateToVerification(batch.id)}
                      className="px-3 py-1.5 bg-[#1b4332] hover:bg-[#2d5a3f] text-white rounded text-[11px] font-medium transition cursor-pointer"
                    >
                      Verify Crop
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* =========================================================================
          5. MANDI PRICE CHECK (FARMER MARKET RATES)
          ========================================================================= */}
      <section className="bg-white rounded-xl border border-stone-200 p-6 sm:p-10 space-y-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Market Prices
            </div>
            <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
              Mandi Wholesale Rates & Farmer Earnings
            </h2>
            <p className="text-xs sm:text-sm text-stone-500">
              Compare regular wholesale mandi rates with direct AgriTrace farmer payouts.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/farmer/price-prediction')}
            className="self-start sm:self-auto px-4 py-2 border border-stone-300 hover:bg-stone-50 rounded-md text-xs font-semibold text-stone-700 transition cursor-pointer flex items-center gap-1.5"
          >
            <Scale className="w-4 h-4 text-emerald-800" />
            <span>Check Market Prices</span>
          </button>
        </div>

        <div className="overflow-x-auto border border-stone-200 rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-700 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Crop Name</th>
                <th className="py-3 px-4">Reference Mandi</th>
                <th className="py-3 px-4 text-right">Govt MSP</th>
                <th className="py-3 px-4 text-right">Mandi Rate</th>
                <th className="py-3 px-4 text-right">AgriTrace Farmer Payout</th>
                <th className="py-3 px-4 text-right">Extra Farmer Earnings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 text-stone-800 font-mono">
              <tr className="hover:bg-stone-50/70">
                <td className="py-3 px-4 font-sans font-semibold text-stone-900">Alphonso Mango (Ratnagiri)</td>
                <td className="py-3 px-4 font-sans text-stone-600">APMC Vashi, Navi Mumbai</td>
                <td className="py-3 px-4 text-right text-stone-500">—</td>
                <td className="py-3 px-4 text-right">₹160 / kg</td>
                <td className="py-3 px-4 text-right font-bold text-emerald-950">₹220 / kg</td>
                <td className="py-3 px-4 text-right font-sans font-semibold text-emerald-800">+37.5%</td>
              </tr>
              <tr className="hover:bg-stone-50/70">
                <td className="py-3 px-4 font-sans font-semibold text-stone-900">Basmati Rice (1121)</td>
                <td className="py-3 px-4 font-sans text-stone-600">Karnal Grain Mandi, Haryana</td>
                <td className="py-3 px-4 text-right text-stone-500">₹38.50 / kg</td>
                <td className="py-3 px-4 text-right">₹44.00 / kg</td>
                <td className="py-3 px-4 text-right font-bold text-emerald-950">₹56.00 / kg</td>
                <td className="py-3 px-4 text-right font-sans font-semibold text-emerald-800">+27.2%</td>
              </tr>
              <tr className="hover:bg-stone-50/70">
                <td className="py-3 px-4 font-sans font-semibold text-stone-900">Sharbati Wheat</td>
                <td className="py-3 px-4 font-sans text-stone-600">Sehore Krishi Mandi, MP</td>
                <td className="py-3 px-4 text-right text-stone-500">₹24.25 / kg</td>
                <td className="py-3 px-4 text-right">₹31.00 / kg</td>
                <td className="py-3 px-4 text-right font-bold text-emerald-950">₹38.00 / kg</td>
                <td className="py-3 px-4 text-right font-sans font-semibold text-emerald-800">+22.5%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* =========================================================================
          6. FARMER & BUYER CALL TO ACTION
          ========================================================================= */}
      <section className="bg-[#1b4332] text-white rounded-xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2 max-w-xl text-center md:text-left">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Ready to track your harvest and earn fair prices?
          </h2>
          <p className="text-stone-200 text-xs sm:text-sm">
            Join thousands of Indian farmers, distributors, and grocery retailers building honest food transparency.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleGetStarted}
            className="px-6 py-3 bg-white hover:bg-stone-100 text-[#1b4332] font-semibold text-xs sm:text-sm rounded-md transition cursor-pointer shadow-xs"
          >
            Get Started
          </button>
          <button
            type="button"
            onClick={onOpenQRScanner}
            className="px-5 py-3 bg-[#2d5a3f] hover:bg-[#3b6b4e] text-white border border-emerald-600 font-semibold text-xs sm:text-sm rounded-md transition cursor-pointer"
          >
            Verify Product
          </button>
        </div>
      </section>

    </div>
  );
};

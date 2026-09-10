import React from 'react';
import { PriceBreakdown } from '../../types/produce';
import { TrendingUp, ShieldAlert, CheckCircle, HelpCircle, DollarSign } from 'lucide-react';

interface Props {
  pricing: PriceBreakdown;
  cropName?: string;
  showGovBenchmark?: boolean;
}

export const PriceBreakdownCard: React.FC<Props> = ({ 
  pricing, 
  cropName,
  showGovBenchmark = true 
}) => {
  const {
    farmerPrice,
    distributorLogisticsCost,
    distributorMargin,
    retailerOverhead,
    retailerMargin,
    finalConsumerPrice,
    currency,
    fairPriceCeiling,
  } = pricing;

  const total = finalConsumerPrice > 0 ? finalConsumerPrice : (farmerPrice + distributorLogisticsCost + distributorMargin + retailerOverhead + retailerMargin);

  const farmerSharePct = total > 0 ? Math.round((farmerPrice / total) * 100) : 0;
  const distCostPct = total > 0 ? Math.round((distributorLogisticsCost / total) * 100) : 0;
  const distMarginPct = total > 0 ? Math.round((distributorMargin / total) * 100) : 0;
  const retOverheadPct = total > 0 ? Math.round((retailerOverhead / total) * 100) : 0;
  const retMarginPct = total > 0 ? Math.round((retailerMargin / total) * 100) : 0;

  const isWithinFairCeiling = total <= fairPriceCeiling;
  const totalMiddlemenMargin = distributorMargin + retailerMargin;
  const totalMiddlemenMarginPct = Math.round((totalMiddlemenMargin / total) * 100);

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h4 className="font-bold text-slate-900 text-base">
              Pricing Transparency Breakdown
            </h4>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographically audited cost buildup from farmgate to retail shelf
          </p>
        </div>

        {showGovBenchmark && (
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
            isWithinFairCeiling 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}>
            {isWithinFairCeiling ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Fair Price Compliant (Max {currency}{fairPriceCeiling}/kg)</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                <span>Exceeds Fair Benchmark ({currency}{fairPriceCeiling})</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Visual Proportional Bar */}
      <div className="space-y-1.5 mb-5">
        <div className="flex justify-between text-xs font-semibold text-slate-700">
          <span>Farmer Share: {farmerSharePct}%</span>
          <span>Intermediaries & Logistics: {100 - farmerSharePct}%</span>
        </div>

        <div className="h-4 w-full rounded-full overflow-hidden flex shadow-inner bg-slate-100">
          {farmerSharePct > 0 && (
            <div 
              style={{ width: `${farmerSharePct}%` }} 
              className="bg-emerald-600 hover:opacity-90 transition"
              title={`Farmer Price: ${currency}${farmerPrice}/kg (${farmerSharePct}%)`}
            />
          )}
          {distCostPct > 0 && (
            <div 
              style={{ width: `${distCostPct}%` }} 
              className="bg-blue-500 hover:opacity-90 transition"
              title={`Logistics & Cold Storage: ${currency}${distributorLogisticsCost}/kg (${distCostPct}%)`}
            />
          )}
          {distMarginPct > 0 && (
            <div 
              style={{ width: `${distMarginPct}%` }} 
              className="bg-amber-400 hover:opacity-90 transition"
              title={`Distributor Margin: ${currency}${distributorMargin}/kg (${distMarginPct}%)`}
            />
          )}
          {retOverheadPct > 0 && (
            <div 
              style={{ width: `${retOverheadPct}%` }} 
              className="bg-purple-400 hover:opacity-90 transition"
              title={`Retail Overhead: ${currency}${retailerOverhead}/kg (${retOverheadPct}%)`}
            />
          )}
          {retMarginPct > 0 && (
            <div 
              style={{ width: `${retMarginPct}%` }} 
              className="bg-teal-500 hover:opacity-90 transition"
              title={`Retailer Profit Margin: ${currency}${retailerMargin}/kg (${retMarginPct}%)`}
            />
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-600 pt-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <span>Farmer Received</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span>Logistics & Cold-Chain</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span>Distributor Markup</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
            <span>Retail Overhead</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
            <span>Retailer Profit</span>
          </span>
        </div>
      </div>

      {/* Numerical Step Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs sm:text-sm">
        
        {/* Step 1: Farmgate */}
        <div className="p-3 bg-emerald-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center">
              1
            </span>
            <div>
              <span className="font-semibold text-slate-800">Farmgate Base Price</span>
              <p className="text-[11px] text-slate-500">Directly transferred to farmer via smart escrow</p>
            </div>
          </div>
          <div className="text-right">
            <span className="font-bold text-emerald-800 text-sm sm:text-base">
              {currency}{farmerPrice.toFixed(2)}
            </span>
            <span className="text-slate-400 text-xs ml-1">/kg ({farmerSharePct}%)</span>
          </div>
        </div>

        {/* Step 2: Distributor Logistics */}
        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">
              2
            </span>
            <div>
              <span className="font-semibold text-slate-800">Cold Logistics & Transit Cost</span>
              <p className="text-[11px] text-slate-500">Reefer transport, fuel, IoT telemetry, de-stoning/packaging</p>
            </div>
          </div>
          <div className="text-right">
            <span className="font-semibold text-slate-800">
              +{currency}{distributorLogisticsCost.toFixed(2)}
            </span>
            <span className="text-slate-400 text-xs ml-1">/kg</span>
          </div>
        </div>

        {/* Step 3: Distributor Margin */}
        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-amber-500 text-white font-bold text-[10px] flex items-center justify-center">
              3
            </span>
            <div>
              <span className="font-semibold text-slate-800">Distributor Margin</span>
              <p className="text-[11px] text-slate-500">Wholesale operations & working capital markup</p>
            </div>
          </div>
          <div className="text-right">
            <span className="font-semibold text-slate-800">
              +{currency}{distributorMargin.toFixed(2)}
            </span>
            <span className="text-slate-400 text-xs ml-1">/kg</span>
          </div>
        </div>

        {/* Step 4: Retailer Overhead */}
        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold text-[10px] flex items-center justify-center">
              4
            </span>
            <div>
              <span className="font-semibold text-slate-800">Retail Store Overhead</span>
              <p className="text-[11px] text-slate-500">Refrigeration, shelf display, wastage allowance</p>
            </div>
          </div>
          <div className="text-right">
            <span className="font-semibold text-slate-800">
              +{currency}{retailerOverhead.toFixed(2)}
            </span>
            <span className="text-slate-400 text-xs ml-1">/kg</span>
          </div>
        </div>

        {/* Step 5: Retailer Margin */}
        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold text-[10px] flex items-center justify-center">
              5
            </span>
            <div>
              <span className="font-semibold text-slate-800">Retailer Profit Margin</span>
              <p className="text-[11px] text-slate-500">Certified organic store margin</p>
            </div>
          </div>
          <div className="text-right">
            <span className="font-semibold text-slate-800">
              +{currency}{retailerMargin.toFixed(2)}
            </span>
            <span className="text-slate-400 text-xs ml-1">/kg</span>
          </div>
        </div>

        {/* Total Consumer Price */}
        <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <span className="font-bold text-sm sm:text-base">Final Transparent Consumer Price</span>
            <p className="text-slate-400 text-xs">Total payable at retail checkout counter</p>
          </div>
          <div className="text-right">
            <span className="font-extrabold text-emerald-400 text-base sm:text-xl">
              {currency}{total.toFixed(2)}
            </span>
            <span className="text-slate-300 text-xs ml-1">/kg</span>
          </div>
        </div>
      </div>

      {/* Supply Chain Pricing Benchmark Takeaway */}
      <div className="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
        <HelpCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-800">Supply-Chain Pricing Benchmark: </strong>
          In conventional unmonitored supply chains, farmer revenue drops below 25%, with middlemen taking over 60%. Under AgriTrace verifiable pricing standards, farmer retention is <strong className="text-emerald-700 font-bold">{farmerSharePct}%</strong> of retail shelf value, with logistics and retail margins capped and disclosed.
        </div>
      </div>
    </div>
  );
};

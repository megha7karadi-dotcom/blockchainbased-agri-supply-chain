import React, { useState } from 'react';
import { 
  ThermometerSnowflake, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  MapPin, 
  ShieldCheck,
  Cpu,
  TrendingDown
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CryptoHashDisplay } from '../common/CryptoHashDisplay';

export const ColdChainMonitor: React.FC = () => {
  const { batches, reportFraudAlert } = useApp();
  const [isTransmittingAlert, setIsTransmittingAlert] = useState(false);
  const [spikeTriggered, setSpikeTriggered] = useState(false);

  const fleetReadings = [
    {
      vehicleId: 'MH-04-TR-9182',
      driver: 'Mahesh Jadhav',
      route: 'Ratnagiri Orchards ➔ Vashi Wholesale Terminal',
      cargo: 'Ratnagiri Alphonso Mangoes (AGRI-2026-MNG-001)',
      temp: spikeTriggered ? '21.4°C' : '12.2°C',
      humidity: '88%',
      status: spikeTriggered ? 'Thermal Excursion Critical' : 'Optimal Safe Zone',
      statusColor: spikeTriggered ? 'rose' : 'emerald',
      lastPing: '34 seconds ago',
      oracleHash: '0x99a812bf08129038471928019ab12849019a8274',
    },
    {
      vehicleId: 'UK-07-CD-4109',
      driver: 'Balwinder Singh',
      route: 'Dehradun Valley ➔ Azadpur Central Terminal',
      cargo: 'Organic Basmati Rice (AGRI-2026-RIC-002)',
      temp: '18.5°C',
      humidity: '55%',
      status: 'Optimal Dry Ambient',
      statusColor: 'emerald',
      lastPing: '1 minute ago',
      oracleHash: '0x12dc8891048bca1209df1045938210398492019a',
    },
    {
      vehicleId: 'MH-12-RF-7801',
      driver: 'Kishore Shinde',
      route: 'Nashik Greenhouse ➔ FreshRoot Retail Mumbai',
      cargo: 'Vine Tomatoes (AGRI-2026-TOM-003)',
      temp: '9.8°C',
      humidity: '92%',
      status: 'Optimal Chill',
      statusColor: 'emerald',
      lastPing: '2 minutes ago',
      oracleHash: '0xfa889a71b2389140285918239019283749019283',
    },
  ];

  const handleTriggerTelemetryAlert = () => {
    setIsTransmittingAlert(true);
    setTimeout(() => {
      setSpikeTriggered(true);
      setIsTransmittingAlert(false);
      reportFraudAlert(
        'AGRI-2026-MNG-001',
        'Thermal Excursion Alert: Reefer temp spiked to 21.4°C (Safe limit: 14°C). Spoilage risk logged on-chain.',
        'high'
      );
    }, 800);
  };

  const handleReset = () => {
    setSpikeTriggered(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ThermometerSnowflake className="w-6 h-6 text-teal-600" />
            <span>IoT Cold-Chain Telemetry Oracles</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated environmental logging stream with cryptographic proof publication to ledger
          </p>
        </div>

        {/* IoT Diagnostic Controls */}
        <div className="flex items-center gap-2">
          {!spikeTriggered ? (
            <button
              onClick={handleTriggerTelemetryAlert}
              disabled={isTransmittingAlert}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-xs"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>{isTransmittingAlert ? 'Transmitting Sensor Alert...' : 'Report Sensor Anomaly'}</span>
            </button>
          ) : (
            <button
              onClick={handleReset}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-xs"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset IoT Sensor Stream</span>
            </button>
          )}
        </div>
      </div>

      {/* Critical Alert if triggered */}
      {spikeTriggered && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-3xl p-5 text-rose-950 flex items-start gap-3.5 animate-in fade-in">
          <AlertTriangle className="w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-sm">Smart Contract Oracle Alert: Thermal Excursion Detected</div>
            <p className="text-xs text-rose-800 leading-relaxed">
              Reefer Vehicle <strong>MH-04-TR-9182</strong> has breached maximum critical temperature threshold (21.4°C vs 14.0°C max allowed). Quality penalty event logged on-chain. Retailer and Regulatory Admin nodes have been notified.
            </p>
          </div>
        </div>
      )}

      {/* Fleet Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {fleetReadings.map((truck) => (
          <div
            key={truck.vehicleId}
            className={`bg-white rounded-3xl border p-6 shadow-xs transition space-y-4 flex flex-col justify-between ${
              truck.statusColor === 'rose' ? 'border-rose-400 ring-2 ring-rose-300' : 'border-slate-200'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {truck.vehicleId}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  truck.statusColor === 'rose' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {truck.status}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-sm">{truck.cargo}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>{truck.route}</span>
              </p>

              {/* Live Gauges */}
              <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100">
                <div className={`p-3 rounded-2xl border ${
                  truck.statusColor === 'rose' ? 'bg-rose-50 border-rose-200' : 'bg-teal-50/60 border-teal-200'
                }`}>
                  <span className="text-[10px] text-slate-500 block">Current Temp</span>
                  <span className={`text-2xl font-black font-mono ${
                    truck.statusColor === 'rose' ? 'text-rose-700' : 'text-teal-800'
                  }`}>
                    {truck.temp}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Target: 10 - 14°C</span>
                </div>

                <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-200">
                  <span className="text-[10px] text-slate-500 block">Relative Humidity</span>
                  <span className="text-2xl font-black font-mono text-blue-800">{truck.humidity}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Opt: 85 - 95%</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Driver:</span>
                <span className="font-medium text-slate-800">{truck.driver}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Last Oracle Ping:</span>
                <span className="font-mono text-emerald-700">{truck.lastPing}</span>
              </div>
              <div className="pt-1">
                <CryptoHashDisplay hash={truck.oracleHash} label="Oracle State Hash" truncateLength={6} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* IoT Architecture Explainer */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold font-mono uppercase tracking-wider">
          <Cpu className="w-4 h-4" />
          <span>Decentralized Oracle Integration Architecture</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
          In traditional distribution, carriers frequently turn off active refrigeration units during transit to save diesel fuel, severely degrading produce shelf life and vitamin content. Our decentralized IoT oracles enforce continuous data feeds. If temperature readings exceed safe threshold limits for more than 45 minutes, smart contract penalties automatically debit the distributor's collateral bond.
        </p>
      </div>

    </div>
  );
};

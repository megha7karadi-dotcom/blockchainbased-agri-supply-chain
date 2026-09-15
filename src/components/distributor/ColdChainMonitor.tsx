import React, { useState } from 'react';
import { 
  ThermometerSnowflake, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  MapPin, 
  ShieldCheck,
  Cpu,
  TrendingDown,
  Activity,
  Radio,
  Clock,
  Truck
} from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { CryptoHashDisplay } from '../common/CryptoHashDisplay';

export const ColdChainMonitor: React.FC = () => {
  const { batches, reportFraudAlert } = useApp();
  const [isTransmittingAlert, setIsTransmittingAlert] = useState(false);
  const [spikeTriggered, setSpikeTriggered] = useState(false);
  const [selectedTruckIndex, setSelectedTruckIndex] = useState(0);

  const fleetReadings = [
    {
      vehicleId: 'MH-04-TR-9182',
      driver: 'Mahesh Jadhav',
      route: 'Ratnagiri Orchards ➔ Vashi Wholesale Terminal',
      cargo: 'Ratnagiri Alphonso Mangoes (BATCH-2025-0891)',
      temp: spikeTriggered ? '21.4°C' : '12.2°C',
      humidity: '88%',
      status: spikeTriggered ? 'Thermal Excursion Critical' : 'Optimal Safe Zone',
      statusColor: spikeTriggered ? 'rose' : 'emerald',
      lastPing: '34 seconds ago',
      oracleHash: '0x99a812bf08129038471928019ab12849019a8274',
      telemetryHistory: [
        { time: '10:00', temp: 11.8, humidity: 86 },
        { time: '11:00', temp: 12.1, humidity: 87 },
        { time: '12:00', temp: 12.4, humidity: 86 },
        { time: '13:00', temp: spikeTriggered ? 17.5 : 12.2, humidity: 88 },
        { time: '14:00', temp: spikeTriggered ? 21.4 : 12.2, humidity: 88 },
      ]
    },
    {
      vehicleId: 'UK-07-CD-4109',
      driver: 'Balwinder Singh',
      route: 'Dehradun Valley ➔ Azadpur Central Terminal',
      cargo: 'Organic Basmati Rice (BATCH-2025-0612)',
      temp: '18.5°C',
      humidity: '55%',
      status: 'Optimal Dry Ambient',
      statusColor: 'emerald',
      lastPing: '1 minute ago',
      oracleHash: '0x12dc8891048bca1209df1045938210398492019a',
      telemetryHistory: [
        { time: '10:00', temp: 18.2, humidity: 56 },
        { time: '11:00', temp: 18.4, humidity: 55 },
        { time: '12:00', temp: 18.6, humidity: 55 },
        { time: '13:00', temp: 18.5, humidity: 55 },
        { time: '14:00', temp: 18.5, humidity: 55 },
      ]
    },
    {
      vehicleId: 'MH-12-RF-7801',
      driver: 'Kishore Shinde',
      route: 'Nashik Greenhouse ➔ FreshRoot Retail Mumbai',
      cargo: 'Vine Tomatoes (BATCH-2025-0455)',
      temp: '9.8°C',
      humidity: '92%',
      status: 'Optimal Chill',
      statusColor: 'emerald',
      lastPing: '2 minutes ago',
      oracleHash: '0xfa889a71b2389140285918239019283749019283',
      telemetryHistory: [
        { time: '10:00', temp: 9.5, humidity: 91 },
        { time: '11:00', temp: 9.7, humidity: 92 },
        { time: '12:00', temp: 9.8, humidity: 92 },
        { time: '13:00', temp: 9.8, humidity: 93 },
        { time: '14:00', temp: 9.8, humidity: 92 },
      ]
    },
  ];

  const handleTriggerTelemetryAlert = () => {
    setIsTransmittingAlert(true);
    setTimeout(() => {
      setSpikeTriggered(true);
      setIsTransmittingAlert(false);
      reportFraudAlert(
        'BATCH-2025-0891',
        'Thermal Excursion Alert: Reefer temp spiked to 21.4°C (Safe limit: 14°C). Spoilage risk logged on-chain.',
        'high'
      );
    }, 700);
  };

  const handleReset = () => {
    setSpikeTriggered(false);
  };

  const currentTruck = fleetReadings[selectedTruckIndex] || fleetReadings[0];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 pb-12"
    >
      
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-blue-50/90 via-slate-50 to-indigo-50/50 text-slate-900 rounded-3xl p-6 sm:p-8 border border-blue-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Cold-Chain Telemetry Command Center
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-2xl">
            Continuous temperature and humidity telemetry feeds streamed from container BLE sensor tags. Cryptographic oracle attestations prove produce freshness and prevent cooling shutdown fraud.
          </p>
        </div>

        {/* Diagnostic Action Button */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {!spikeTriggered ? (
            <button
              onClick={handleTriggerTelemetryAlert}
              disabled={isTransmittingAlert}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-2xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>{isTransmittingAlert ? 'Transmitting Spike...' : 'Simulate Temp Excursion'}</span>
            </button>
          ) : (
            <button
              onClick={handleReset}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-2xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset Oracle Stream</span>
            </button>
          )}
        </div>
      </div>

      {/* Critical Alert if triggered */}
      {spikeTriggered && (
        <motion.div 
          initial={{ opacity: 0, y: -8 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="bg-rose-50 border-2 border-rose-300 rounded-3xl p-5 text-rose-950 flex items-start gap-3.5 shadow-sm"
        >
          <AlertTriangle className="w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-sm">Smart Contract Oracle Alert: Thermal Excursion Detected</div>
            <p className="text-xs text-rose-800 leading-relaxed">
              Reefer Vehicle <strong>MH-04-TR-9182</strong> has breached maximum critical temperature threshold (21.4°C vs 14.0°C max allowed). Quality penalty event logged on-chain. Retailer and Regulatory Admin nodes have been notified.
            </p>
          </div>
        </motion.div>
      )}

      {/* Fleet Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {fleetReadings.map((truck, idx) => {
          const isSelected = selectedTruckIndex === idx;
          const isSpike = truck.statusColor === 'rose';

          return (
            <div
              key={truck.vehicleId}
              onClick={() => setSelectedTruckIndex(idx)}
              className={`bg-white rounded-3xl border p-6 shadow-xs transition space-y-4 flex flex-col justify-between cursor-pointer ${
                isSpike 
                  ? 'border-rose-400 ring-2 ring-rose-200' 
                  : isSelected 
                  ? 'border-blue-400 ring-2 ring-blue-100 shadow-md' 
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-slate-700">
                    {truck.vehicleId}
                  </span>
                  <span className={`text-xs font-semibold ${
                    isSpike ? 'text-rose-700' : 'text-emerald-700'
                  }`}>
                    {truck.status}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm">{truck.cargo}</h3>
                <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{truck.route}</span>
                </p>

                {/* Live Gauges */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100">
                  <div className={`p-3 rounded-2xl border ${
                    isSpike ? 'bg-rose-50 border-rose-200' : 'bg-blue-50/60 border-blue-200'
                  }`}>
                    <span className="text-[10px] text-slate-500 block font-medium">Current Temp</span>
                    <span className={`text-2xl font-black font-mono ${
                      isSpike ? 'text-rose-700' : 'text-blue-900'
                    }`}>
                      {truck.temp}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Target: 10 - 14°C</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block font-medium">Relative Humidity</span>
                    <span className="text-2xl font-black font-mono text-slate-900">{truck.humidity}</span>
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
                  <span className="font-mono text-emerald-700 font-semibold">{truck.lastPing}</span>
                </div>
                <div className="pt-1">
                  <CryptoHashDisplay hash={truck.oracleHash} label="Oracle State Hash" truncateLength={6} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Vehicle Telemetry History Curve */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">
                Hourly Cold-Chain Sensor Log • Vehicle {currentTruck.vehicleId}
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Cargo: {currentTruck.cargo} • Route: {currentTruck.route}
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1 text-blue-700">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <span>Reefer Temp (°C)</span>
            </span>
            <span className="flex items-center gap-1 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
              <span>Humidity (%)</span>
            </span>
          </div>
        </div>

        {/* Timeline Log Bars */}
        <div className="grid grid-cols-5 gap-3 text-center">
          {currentTruck.telemetryHistory.map((pt, i) => {
            const isCritical = pt.temp > 16;
            return (
              <div 
                key={i} 
                className={`p-3.5 rounded-2xl border transition ${
                  isCritical ? 'bg-rose-50 border-rose-300' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="text-[11px] font-mono text-slate-400 font-medium mb-1">{pt.time}</div>
                <div className={`text-lg font-black font-mono ${isCritical ? 'text-rose-700' : 'text-blue-900'}`}>
                  {pt.temp}°C
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  {pt.humidity}% RH
                </div>
                <div className={`text-[10px] font-bold mt-1 px-1.5 py-0.5 rounded ${
                  isCritical ? 'bg-rose-200 text-rose-900' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {isCritical ? 'Excursion' : 'Nominal'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* IoT Architecture Explainer */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-3">
        <h3 className="flex items-center gap-2 text-slate-900 text-sm font-bold">
          <Cpu className="w-4 h-4 text-blue-600" />
          <span>Decentralized Oracle Integration Architecture</span>
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
          In traditional food distribution, dishonest carriers frequently switch off refrigerated cooling units during transit to conserve diesel fuel, destroying organic produce shelf life and vitamin viability. Our decentralized IoT oracles enforce continuous data feeds. If temperature readings exceed safe threshold limits for more than 30 minutes, smart contract penalties automatically debit the carrier's collateral bond.
        </p>
      </div>

    </motion.div>
  );
};

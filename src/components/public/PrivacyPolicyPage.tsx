import React from 'react';
import { ShieldCheck, Lock, FileText, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const PrivacyPolicyPage: React.FC = () => {
  const { navigate } = useApp();

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 px-4 space-y-10">
      
      {/* Header */}
      <div className="space-y-3 border-b border-stone-200 pb-8">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-900 transition cursor-pointer mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-[#16a34a] text-white flex items-center justify-center shadow-xs">
            <Lock className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
            Legal & Compliance
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-stone-900">
          Privacy Policy
        </h1>
        <p className="text-xs sm:text-sm text-stone-500">
          Last updated: October 14, 2026. Effective immediately for all platform participants.
        </p>
      </div>

      {/* Main Content */}
      <div className="space-y-8 text-xs sm:text-sm text-stone-700 leading-relaxed">

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-stone-900">1. Overview and Scope</h2>
          <p>
            AgriTrace operates a verifiable agricultural traceability and price transparency infrastructure. This Privacy Policy outlines how AgriTrace collects, processes, stores, and protects personal information, farm geolocation records, logistics telemetry, and transaction disclosures across our web platform and verification services.
          </p>
          <p>
            By accessing or using AgriTrace as a farmer, agricultural cooperative, logistics distributor, mandi retailer, supermarket operator, or consumer, you agree to the collection and use of information in accordance with this policy and applicable data protection regulations including the Digital Personal Data Protection Act (DPDP Act).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-stone-900">2. Information We Collect</h2>
          <p>We collect information categorized by participant role to facilitate authentic supply-chain provenance:</p>
          
          <div className="bg-stone-50 border border-stone-200 rounded-lg p-5 space-y-3">
            <div className="space-y-1">
              <strong className="text-stone-900 block font-semibold">A. Farmer and Cooperative Data:</strong>
              <p className="text-stone-600">
                Full legal name, phone number, cooperative affiliation, farm regional location, registered acreage, soil analysis reports, crop varieties, harvest dates, and agreed farmgate selling price.
              </p>
            </div>

            <div className="space-y-1 pt-2 border-t border-stone-200">
              <strong className="text-stone-900 block font-semibold">B. Logistics and Transporter Data:</strong>
              <p className="text-stone-600">
                Driver license, vehicle registration, cold-chain temperature telemetry logs, GPS corridor waypoints, transfer custody timestamps, and delivery acceptance signatures.
              </p>
            </div>

            <div className="space-y-1 pt-2 border-t border-stone-200">
              <strong className="text-stone-900 block font-semibold">C. Retailer Data:</strong>
              <p className="text-stone-600">
                Store or wholesale mandi license, retail location, inventory intake logs, shelf pricing records, and final consumer receipt entries.
              </p>
            </div>

            <div className="space-y-1 pt-2 border-t border-stone-200">
              <strong className="text-stone-900 block font-semibold">D. Consumer Verification Data:</strong>
              <p className="text-stone-600">
                Produce scan event timestamps, requested verification batch identifiers, device user-agent for display responsiveness, and optional verified customer quality reviews. We do not track consumer location without explicit browser permission.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-stone-900">3. Public Ledger vs Private Confidential Data</h2>
          <p>
            Transparency is central to the AgriTrace mission. However, we strictly distinguish between public supply-chain verification records and private stakeholder credentials:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-stone-600">
            <li>
              <strong>Public Verification Data:</strong> Produce batch identifier, crop variety, harvest date, regional origin (district and state), quality inspection grade, certified cold-chain temperature range, and fair price breakdown (farmgate price, logistics cost, retail price).
            </li>
            <li>
              <strong>Confidential Private Data:</strong> Precise residential addresses, personal phone numbers, bank account details, and private account credentials are encrypted and never exposed on public QR verification tags.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-stone-900">4. How We Use Information</h2>
          <p>We process collected data strictly for the following operational purposes:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-stone-600">
            <li>Generating tamper-evident packaging QR verification codes for agricultural produce.</li>
            <li>Enforcing fair pricing compliance and validating wholesale markups against government benchmarks.</li>
            <li>Detecting counterfeit batch codes, unauthorized duplicate scans, or cold-chain transit violations.</li>
            <li>Dispatching one-time SMS passwords for secure account verification.</li>
            <li>Facilitating regulatory audits with agricultural bodies including APEDA and FSSAI.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-stone-900">5. Data Retention and Security</h2>
          <p>
            We implement industry-standard encryption protocols (TLS 1.3 in transit and AES-256 at rest) to safeguard user records. Because agricultural supply-chain audits require seasonal traceability, batch provenance records are archived for a minimum period of 36 months following crop distribution.
          </p>
          <p>
            Cryptographic ledger hashes and immutable timeline receipts remain permanently verifiable to protect historical provenance against retroactive alteration.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-stone-900">6. Participant Rights</h2>
          <p>
            Under applicable privacy frameworks, participants possess the right to:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-stone-600">
            <li>Request a copy of personal contact details and operational profiles stored on our servers.</li>
            <li>Update or correct inaccurate organization names, contact leads, or license references.</li>
            <li>Request account deactivation upon conclusion of contractual delivery obligations.</li>
          </ul>
        </section>

        <section className="space-y-3 border-t border-stone-200 pt-6">
          <h2 className="text-lg font-bold text-stone-900">7. Data Protection Officer and Contact</h2>
          <p>
            For privacy inquiries, audit requests, or data rectification, contact our data governance team at:
          </p>
          <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg p-4 text-xs space-y-1">
            <div className="font-semibold text-stone-900">AgriTrace Platform Governance</div>
            <div className="text-stone-600">Email: privacy@agritrace.org</div>
            <div className="text-stone-600">Address: Agricultural Technology Park, Pune, Maharashtra 411005, India</div>
          </div>
        </section>

      </div>

    </div>
  );
};

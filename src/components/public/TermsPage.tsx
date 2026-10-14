import React from 'react';
import { Scale, FileText, CheckCircle2, ArrowLeft, Shield } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const TermsPage: React.FC = () => {
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
            <Scale className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
            Legal & Compliance
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-stone-900">
          Terms and Conditions
        </h1>
        <p className="text-xs sm:text-sm text-stone-500">
          Last updated: October 14, 2026. Effective immediately across all platform transactions and verify portals.
        </p>
      </div>

      {/* Main Content */}
      <div className="space-y-8 text-xs sm:text-sm text-stone-700 leading-relaxed">

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-stone-900">1. Acceptance of Terms</h2>
          <p>
            These Terms and Conditions constitute a legally binding agreement between you (individual participant or entity) and AgriTrace regarding your access to and use of our supply-chain traceability network, verification portals, APIs, and QR code labeling services.
          </p>
          <p>
            By creating an account, registering agricultural produce, accepting custody of physical shipments, establishing retail shelf prices, or scanning verification QR codes, you acknowledge that you have read, understood, and agreed to be bound by these terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-stone-900">2. Participant Eligibility and Obligations</h2>
          <p>Participants must register under their authentic legal identity and appropriate supply-chain role:</p>

          <div className="bg-stone-50 border border-stone-200 rounded-lg p-5 space-y-3">
            <div className="space-y-1">
              <strong className="text-stone-900 block font-semibold">A. Farmers and Growers:</strong>
              <p className="text-stone-600">
                You warrant that all registered produce is grown on the verified parcels indicated, harvested on the reported dates, and compliant with state and national agricultural standards. You must disclose actual farmgate payout amounts honestly.
              </p>
            </div>

            <div className="space-y-1 pt-2 border-t border-stone-200">
              <strong className="text-stone-900 block font-semibold">B. Logistics Distributors:</strong>
              <p className="text-stone-600">
                Transporters agree to maintain required temperature specifications for perishable goods in transit. Digital custody transfers must be recorded accurately at physical handover points.
              </p>
            </div>

            <div className="space-y-1 pt-2 border-t border-stone-200">
              <strong className="text-stone-900 block font-semibold">C. Retailers and Supermarkets:</strong>
              <p className="text-stone-600">
                Retail partners agree to display genuine packaging QR tags on retail shelves. Retailers warrant that customer shelf pricing aligns with disclosures submitted on the platform and adheres to fair price ceiling guidelines.
              </p>
            </div>

            <div className="space-y-1 pt-2 border-t border-stone-200">
              <strong className="text-stone-900 block font-semibold">D. Consumers and Verifiers:</strong>
              <p className="text-stone-600">
                Consumers are granted personal, non-commercial licenses to scan packaging QR codes for verification. Any feedback or product ratings submitted must reflect authentic, firsthand purchase experiences.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-stone-900">3. Provenance and Anti-Fraud Integrity</h2>
          <p>
            The fundamental premise of AgriTrace is verifiable truth. The following actions constitute immediate material breaches of these terms and will result in permanent platform termination and referral to regulatory authorities:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-stone-600">
            <li>Attaching AgriTrace QR tags to produce originating from unverified or mixed third-party sources.</li>
            <li>Replicating, cloning, or reprinting QR labels across multiple batches without authorization.</li>
            <li>Falsifying quality inspection certificates, laboratory residue test results, or organic claims.</li>
            <li>Tampering with IoT temperature sensor readings or reporting fictitious transit corridors.</li>
            <li>Manipulating farmgate base prices to obscure excessive intermediary markups.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-stone-900">4. Immutable Supply-Chain Records</h2>
          <p>
            Supply-chain milestones recorded on the AgriTrace cryptographic ledger are immutable. Once a produce batch is marked as harvested, transferred, or placed on retail shelves, the timestamp, custodial signature, and pricing records cannot be deleted or altered retroactively. Participants are solely responsible for verifying data accuracy prior to confirmation.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-stone-900">5. Limitation of Liability and Warranties</h2>
          <p>
            AgriTrace provides digital provenance tracking, escrow verification tools, and data infrastructure. AgriTrace does not take physical title to crops or act as an agricultural insurer. While we verify and audit participant submissions rigorously:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-stone-600">
            <li>Physical crop quality remains the direct legal responsibility of the registered farmer and seller.</li>
            <li>Cold-chain temperature compliance during transit is guaranteed by the licensed carrier.</li>
            <li>AgriTrace is not liable for indirect, incidental, or consequential damages resulting from spoilage, transport mechanical breakdown, weather delays, or commercial contract defaults between trading partners.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-stone-900">6. Governing Law and Dispute Resolution</h2>
          <p>
            These terms are governed by the laws of India. Any disputes arising in connection with platform use or commercial crop provenance auditing shall be subject to the exclusive jurisdiction of the competent courts in Pune, Maharashtra.
          </p>
        </section>

        <section className="space-y-3 border-t border-stone-200 pt-6">
          <h2 className="text-lg font-bold text-stone-900">7. Platform Inquiries</h2>
          <p>
            For legal notices, compliance auditing, or partner agreements, please contact:
          </p>
          <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg p-4 text-xs space-y-1">
            <div className="font-semibold text-stone-900">AgriTrace Legal & Governance Department</div>
            <div className="text-stone-600">Email: legal@agritrace.org</div>
            <div className="text-stone-600">Website: https://agritrace.org</div>
          </div>
        </section>

      </div>

    </div>
  );
};

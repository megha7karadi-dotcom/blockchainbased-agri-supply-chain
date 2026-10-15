import React from 'react';
import {
  User,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  Building2,
  Award,
  CheckCircle2,
  Calendar,
  Sprout,
  Truck,
  Store,
  Shield,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useFarmerLanguage } from '../../context/FarmerLanguageContext';
import { BackButton } from './BackButton';

type FarmerLanguage = 'en' | 'hi' | 'kn';

const translations = {
  en: {
    noProfile: 'No active profile session found.',
    signIn: 'Sign In',
    verifiedParticipant: 'AgriTrace Verified Participant',
    dashboard: 'Go to Dashboard',
    signOut: 'Sign Out',
    identity: 'Cryptographic Identity',
    walletAddress: 'Wallet / Node Address',
    consensusRole: 'Consensus Role',
    farmerNode: 'Farmer Node',
    distributorNode: 'Distributor Node',
    retailerNode: 'Retailer Node',
    consumerNode: 'Consumer Node',
    adminNode: 'Admin Node',
    trustScore: 'Reputation / Trust Score',
    memberSince: 'Member Since',
    smartVerified: 'Smart Contract Verified',
    verificationDescription:
      'Your cryptographic credentials are validated against the agricultural distributed ledger. All batches minted or transacted carry non-repudiable audit trails.',
    credentials: 'Participant Credentials',
    credentialsDescription: 'Authorized contact and compliance coordinates',
    email: 'Email Address',
    phone: 'Contact Phone',
    organization: 'Organization / Collective',
    individualProducer: 'Individual Producer',
    location: 'Operational Location',
    compliance: 'Governance & Compliance Badges',
    apeda: 'APEDA Certified Producer',
    fssai: 'FSSAI Food Safety Cleared',
    fairPricing: 'Fair Pricing Protocol Signatory',
    organicAudit: 'Zero-Residue Organic Audit',
    updateQuestion: 'Need to update legal registrations or APEDA certificates?',
    updateCertificates: 'Update Certificates',
    certificateNotice:
      'Compliance certificate renewal portal opens via government DigiLocker integration.',
    kycVerified: 'Verified',
    kycPending: 'Pending',
    kycRejected: 'Rejected',
    kycInReview: 'In Review',
    kycUnknown: 'Verification Status',
    close: 'Close',
  },
  hi: {
    noProfile: 'कोई सक्रिय प्रोफ़ाइल सत्र नहीं मिला।',
    signIn: 'साइन इन करें',
    verifiedParticipant: 'AgriTrace सत्यापित प्रतिभागी',
    dashboard: 'डैशबोर्ड पर जाएँ',
    signOut: 'साइन आउट करें',
    identity: 'क्रिप्टोग्राफ़िक पहचान',
    walletAddress: 'वॉलेट / नोड पता',
    consensusRole: 'सहमति भूमिका',
    farmerNode: 'किसान नोड',
    distributorNode: 'वितरक नोड',
    retailerNode: 'खुदरा विक्रेता नोड',
    consumerNode: 'उपभोक्ता नोड',
    adminNode: 'व्यवस्थापक नोड',
    trustScore: 'प्रतिष्ठा / विश्वास स्कोर',
    memberSince: 'सदस्यता की तारीख',
    smartVerified: 'स्मार्ट कॉन्ट्रैक्ट सत्यापित',
    verificationDescription:
      'आपकी क्रिप्टोग्राफ़िक जानकारी कृषि वितरित लेज़र से सत्यापित है। सभी पंजीकृत या लेन-देन की गई खेपों का छेड़छाड़-रोधी ऑडिट रिकॉर्ड रखा जाता है।',
    credentials: 'प्रतिभागी प्रमाण-पत्र',
    credentialsDescription: 'अधिकृत संपर्क और अनुपालन संबंधी जानकारी',
    email: 'ईमेल पता',
    phone: 'संपर्क फ़ोन',
    organization: 'संगठन / समूह',
    individualProducer: 'व्यक्तिगत उत्पादक',
    location: 'कार्यस्थल का स्थान',
    compliance: 'नियामक और अनुपालन प्रमाण-पत्र',
    apeda: 'APEDA प्रमाणित उत्पादक',
    fssai: 'FSSAI खाद्य सुरक्षा स्वीकृत',
    fairPricing: 'उचित मूल्य निर्धारण प्रोटोकॉल हस्ताक्षरकर्ता',
    organicAudit: 'शून्य-अवशेष जैविक ऑडिट',
    updateQuestion: 'क्या कानूनी पंजीकरण या APEDA प्रमाण-पत्र अपडेट करने हैं?',
    updateCertificates: 'प्रमाण-पत्र अपडेट करें',
    certificateNotice:
      'प्रमाण-पत्र नवीनीकरण पोर्टल सरकारी DigiLocker एकीकरण के माध्यम से खुलेगा।',
    kycVerified: 'सत्यापित',
    kycPending: 'लंबित',
    kycRejected: 'अस्वीकृत',
    kycInReview: 'समीक्षाधीन',
    kycUnknown: 'सत्यापन स्थिति',
    close: 'बंद करें',
  },
  kn: {
    noProfile: 'ಸಕ್ರಿಯ ಪ್ರೊಫೈಲ್ ಸೆಷನ್ ಕಂಡುಬಂದಿಲ್ಲ.',
    signIn: 'ಸೈನ್ ಇನ್ ಮಾಡಿ',
    verifiedParticipant: 'AgriTrace ಪರಿಶೀಲಿತ ಭಾಗವಹಿಸುವವರು',
    dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹೋಗಿ',
    signOut: 'ಸೈನ್ ಔಟ್ ಮಾಡಿ',
    identity: 'ಕ್ರಿಪ್ಟೋಗ್ರಾಫಿಕ್ ಗುರುತು',
    walletAddress: 'ವಾಲೆಟ್ / ನೋಡ್ ವಿಳಾಸ',
    consensusRole: 'ಒಮ್ಮತದ ಪಾತ್ರ',
    farmerNode: 'ರೈತ ನೋಡ್',
    distributorNode: 'ವಿತರಕ ನೋಡ್',
    retailerNode: 'ಚಿಲ್ಲರೆ ವ್ಯಾಪಾರಿ ನೋಡ್',
    consumerNode: 'ಗ್ರಾಹಕ ನೋಡ್',
    adminNode: 'ನಿರ್ವಾಹಕ ನೋಡ್',
    trustScore: 'ಖ್ಯಾತಿ / ವಿಶ್ವಾಸ ಅಂಕ',
    memberSince: 'ಸದಸ್ಯರಾದ ದಿನಾಂಕ',
    smartVerified: 'ಸ್ಮಾರ್ಟ್ ಕಾಂಟ್ರಾಕ್ಟ್ ಪರಿಶೀಲಿಸಲಾಗಿದೆ',
    verificationDescription:
      'ನಿಮ್ಮ ಕ್ರಿಪ್ಟೋಗ್ರಾಫಿಕ್ ವಿವರಗಳನ್ನು ಕೃಷಿ ವಿತರಿತ ಲೆಡ್ಜರ್ ಮೂಲಕ ಪರಿಶೀಲಿಸಲಾಗಿದೆ. ನೋಂದಾಯಿಸಲಾದ ಅಥವಾ ವಹಿವಾಟು ನಡೆಸಿದ ಎಲ್ಲಾ ಬ್ಯಾಚ್‌ಗಳಿಗೂ ಬದಲಾಯಿಸಲಾಗದ ಆಡಿಟ್ ದಾಖಲೆಗಳಿವೆ.',
    credentials: 'ಭಾಗವಹಿಸುವವರ ಪ್ರಮಾಣಪತ್ರಗಳು',
    credentialsDescription: 'ಅಧಿಕೃತ ಸಂಪರ್ಕ ಮತ್ತು ಅನುಸರಣೆ ವಿವರಗಳು',
    email: 'ಇಮೇಲ್ ವಿಳಾಸ',
    phone: 'ಸಂಪರ್ಕ ದೂರವಾಣಿ',
    organization: 'ಸಂಸ್ಥೆ / ಸಮೂಹ',
    individualProducer: 'ವೈಯಕ್ತಿಕ ಉತ್ಪಾದಕರು',
    location: 'ಕಾರ್ಯಾಚರಣೆಯ ಸ್ಥಳ',
    compliance: 'ಆಡಳಿತ ಮತ್ತು ಅನುಸರಣೆ ಪ್ರಮಾಣಪತ್ರಗಳು',
    apeda: 'APEDA ಪ್ರಮಾಣೀಕೃತ ಉತ್ಪಾದಕರು',
    fssai: 'FSSAI ಆಹಾರ ಸುರಕ್ಷತೆ ಅನುಮೋದನೆ',
    fairPricing: 'ನ್ಯಾಯಯುತ ಬೆಲೆ ಪ್ರೋಟೋಕಾಲ್ ಸಹಿದಾರರು',
    organicAudit: 'ಶೂನ್ಯ-ಅವಶೇಷ ಸಾವಯವ ಪರಿಶೀಲನೆ',
    updateQuestion: 'ಕಾನೂನು ನೋಂದಣಿ ಅಥವಾ APEDA ಪ್ರಮಾಣಪತ್ರಗಳನ್ನು ನವೀಕರಿಸಬೇಕೇ?',
    updateCertificates: 'ಪ್ರಮಾಣಪತ್ರಗಳನ್ನು ನವೀಕರಿಸಿ',
    certificateNotice:
      'ಸರ್ಕಾರದ DigiLocker ಏಕೀಕರಣದ ಮೂಲಕ ಪ್ರಮಾಣಪತ್ರ ನವೀಕರಣ ಪೋರ್ಟಲ್ ತೆರೆಯುತ್ತದೆ.',
    kycVerified: 'ಪರಿಶೀಲಿಸಲಾಗಿದೆ',
    kycPending: 'ಬಾಕಿಯಿದೆ',
    kycRejected: 'ತಿರಸ್ಕರಿಸಲಾಗಿದೆ',
    kycInReview: 'ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ',
    kycUnknown: 'ಪರಿಶೀಲನೆಯ ಸ್ಥಿತಿ',
    close: 'ಮುಚ್ಚಿ',
  },
} as const;

type TranslationKey = keyof typeof translations.en;

const statusMap: Record<string, TranslationKey> = {
  verified: 'kycVerified',
  approved: 'kycVerified',
  complete: 'kycVerified',
  completed: 'kycVerified',
  pending: 'kycPending',
  rejected: 'kycRejected',
  'in review': 'kycInReview',
  'under review': 'kycInReview',
};

export const ProfilePage: React.FC = () => {
  const { currentUser, currentRole, navigate, logoutUser } = useApp();
  const { language } = useFarmerLanguage();

  // Only the farmer profile uses the selected farmer language.
  // Other roles retain the original English interface.
  const lang: FarmerLanguage =
    currentRole === 'farmer' &&
    (language === 'hi' || language === 'kn')
      ? language
      : 'en';

  const t = translations[lang];

  const getRoleIcon = () => {
    switch (currentRole) {
      case 'farmer':
        return <Sprout className="w-5 h-5 text-emerald-600" />;
      case 'distributor':
        return <Truck className="w-5 h-5 text-blue-600" />;
      case 'retailer':
        return <Store className="w-5 h-5 text-purple-600" />;
      case 'consumer':
        return <User className="w-5 h-5 text-teal-600" />;
      case 'admin':
        return <Shield className="w-5 h-5 text-amber-600" />;
      default:
        return <User className="w-5 h-5 text-slate-600" />;
    }
  };

  const getRoleLabel = () => {
    if (lang === 'en') {
      const role = currentRole || 'user';
      return `${role.charAt(0).toUpperCase()}${role.slice(1)} Node`;
    }

    switch (currentRole) {
      case 'farmer':
        return t.farmerNode;
      case 'distributor':
        return t.distributorNode;
      case 'retailer':
        return t.retailerNode;
      case 'consumer':
        return t.consumerNode;
      case 'admin':
        return t.adminNode;
      default:
        return 'User Node';
    }
  };

  const getKycLabel = () => {
    const rawStatus = String(currentUser?.kycStatus || '').trim();

    if (!rawStatus) return t.kycUnknown;
    if (lang === 'en') return rawStatus;

    const key = statusMap[rawStatus.toLowerCase()];
    return key ? t[key] : rawStatus;
  };

  if (!currentUser) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500">{t.noProfile}</p>
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="mt-4 px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-semibold"
        >
          {t.signIn}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <div className="flex items-center justify-start">
        <BackButton fallback={`/${currentRole}/dashboard`} />
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-extrabold flex items-center justify-center text-xl overflow-hidden shadow-xs shrink-0">
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{currentUser.name.charAt(0)}</span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                {currentUser.name}
              </h1>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                {getKycLabel()}
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-0.5">
              {currentUser.organization || t.verifiedParticipant}
              {' • '}
              {currentUser.location}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-center">
          <button
            type="button"
            onClick={() => navigate(`/${currentRole}/dashboard`)}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition cursor-pointer"
          >
            {t.dashboard}
          </button>

          <button
            type="button"
            onClick={logoutUser}
            className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition cursor-pointer"
          >
            {t.signOut}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t.identity}
            </h3>

            <div className="space-y-3">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                  {t.walletAddress}
                </span>
                <span className="font-mono text-xs text-slate-900 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 block break-all mt-1">
                  {currentUser.walletAddress || '—'}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                  {t.consensusRole}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  {getRoleIcon()}
                  <span className="text-xs font-bold text-slate-800">
                    {getRoleLabel()}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                  {t.trustScore}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span className="text-base font-black text-slate-900">
                    {currentUser.trustScore ?? 0} / 100
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                  {t.memberSince}
                </span>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-700">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{currentUser.registeredDate || '—'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50/70 rounded-3xl p-6 border border-emerald-200 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{t.smartVerified}</span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              {t.verificationDescription}
            </p>
          </div>
        </div>

        <div className="md:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {t.credentials}
              </h2>
              <p className="text-xs text-slate-500">
                {t.credentialsDescription}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{t.email}</span>
              </span>
              <span className="font-semibold text-xs text-slate-900 block truncate">
                {currentUser.email || '—'}
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{t.phone}</span>
              </span>
              <span className="font-semibold text-xs text-slate-900 block truncate">
                {currentUser.phone || '—'}
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{t.organization}</span>
              </span>
              <span className="font-semibold text-xs text-slate-900 block truncate">
                {currentUser.organization || t.individualProducer}
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{t.location}</span>
              </span>
              <span className="font-semibold text-xs text-slate-900 block truncate">
                {currentUser.location || '—'}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {t.compliance}
            </h4>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                {t.apeda}
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 text-xs font-semibold border border-blue-200">
                {t.fssai}
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-800 text-xs font-semibold border border-purple-200">
                {t.fairPricing}
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200">
                {t.organicAudit}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs text-slate-500">
              {t.updateQuestion}
            </span>
            <button
              type="button"
              onClick={() => window.alert(t.certificateNotice)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
            >
              {t.updateCertificates} →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

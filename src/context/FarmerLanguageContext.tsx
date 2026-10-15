
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

export type FarmerLanguage = 'en' | 'hi' | 'kn';

const translations = {
  en: {
    language: 'Language',
    home: 'Home',
    addCrop: 'Add New Crop',
    myCrops: 'My Crops',
    transfer: 'Transfer Produce',
    marketPrices: 'Check Market Prices',
    modelPerformance: 'Model Performance',
    cropRecommendation: 'Crop Recommendation',
    qrCodes: 'View QR Code',
    profile: 'Profile',
    farmerAccount: 'Farmer Account',
    profileAccount: 'Profile & Account',
    logout: 'Logout',
    dashboardTitle: 'Farmer Dashboard',
    totalBatches: 'Total Batches',
    activeBatches: 'Active Batches',
    readyDispatch: 'Ready for Dispatch',
    totalRevenue: 'Total Revenue',
    english: 'English',
    hindi: 'Hindi',
    kannada: 'Kannada',
  },
  hi: {
    language: 'भाषा',
    home: 'होम',
    addCrop: 'नई फसल जोड़ें',
    myCrops: 'मेरी फसलें',
    transfer: 'उपज स्थानांतरित करें',
    marketPrices: 'बाज़ार भाव देखें',
    modelPerformance: 'मॉडल प्रदर्शन',
    cropRecommendation: 'फसल सुझाव',
    qrCodes: 'QR कोड देखें',
    profile: 'प्रोफ़ाइल',
    farmerAccount: 'किसान खाता',
    profileAccount: 'प्रोफ़ाइल और खाता',
    logout: 'लॉग आउट',
    dashboardTitle: 'किसान डैशबोर्ड',
    totalBatches: 'कुल बैच',
    activeBatches: 'सक्रिय बैच',
    readyDispatch: 'भेजने के लिए तैयार',
    totalRevenue: 'कुल आय',
    english: 'अंग्रेज़ी',
    hindi: 'हिन्दी',
    kannada: 'कन्नड़',
  },
  kn: {
    language: 'ಭಾಷೆ',
    home: 'ಮುಖಪುಟ',
    addCrop: 'ಹೊಸ ಬೆಳೆ ಸೇರಿಸಿ',
    myCrops: 'ನನ್ನ ಬೆಳೆಗಳು',
    transfer: 'ಉತ್ಪನ್ನ ವರ್ಗಾವಣೆ',
    marketPrices: 'ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು',
    modelPerformance: 'ಮಾದರಿ ಕಾರ್ಯಕ್ಷಮತೆ',
    cropRecommendation: 'ಬೆಳೆ ಶಿಫಾರಸು',
    qrCodes: 'QR ಕೋಡ್ ವೀಕ್ಷಿಸಿ',
    profile: 'ಪ್ರೊಫೈಲ್',
    farmerAccount: 'ರೈತರ ಖಾತೆ',
    profileAccount: 'ಪ್ರೊಫೈಲ್ ಮತ್ತು ಖಾತೆ',
    logout: 'ಲಾಗ್ ಔಟ್',
    dashboardTitle: 'ರೈತರ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    totalBatches: 'ಒಟ್ಟು ಬ್ಯಾಚ್‌ಗಳು',
    activeBatches: 'ಸಕ್ರಿಯ ಬ್ಯಾಚ್‌ಗಳು',
    readyDispatch: 'ರವಾನೆಗೆ ಸಿದ್ಧ',
    totalRevenue: 'ಒಟ್ಟು ಆದಾಯ',
    english: 'ಇಂಗ್ಲಿಷ್',
    hindi: 'ಹಿಂದಿ',
    kannada: 'ಕನ್ನಡ',
  },
} as const;

type TranslationKey = keyof typeof translations.en;

interface FarmerLanguageContextValue {
  language: FarmerLanguage;
  setLanguage: (language: FarmerLanguage) => void;
  t: (key: TranslationKey) => string;
}

const FarmerLanguageContext =
  createContext<FarmerLanguageContextValue | undefined>(undefined);

export const FarmerLanguageProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [language, setLanguageState] = useState<FarmerLanguage>(() => {
    try {
      const saved = localStorage.getItem('agritrace-farmer-language');

      return saved === 'hi' || saved === 'kn' || saved === 'en'
        ? saved
        : 'en';
    } catch {
      return 'en';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('agritrace-farmer-language', language);
    } catch {
      // The app continues to work if browser storage is unavailable.
    }
  }, [language]);

  const setLanguage = (nextLanguage: FarmerLanguage) => {
    setLanguageState(nextLanguage);
  };

  const t = (key: TranslationKey): string => {
    return translations[language][key];
  };

  return (
    <FarmerLanguageContext.Provider
      value={{ language, setLanguage, t }}
    >
      {children}
    </FarmerLanguageContext.Provider>
  );
};

export const useFarmerLanguage = (): FarmerLanguageContextValue => {
  const context = useContext(FarmerLanguageContext);

  if (!context) {
    throw new Error(
      'useFarmerLanguage must be used inside FarmerLanguageProvider'
    );
  }

  return context;
};
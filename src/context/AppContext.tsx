import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  UserRole, 
  UserProfile, 
  ProduceBatch, 
  FraudAlert, 
  NotificationItem,
  TimelineEvent
} from '../types/produce';
import { productService, RegisterProductInput } from '../services/productService';
import { 
  INITIAL_USERS, 
  INITIAL_BATCHES, 
  INITIAL_FRAUD_ALERTS, 
  INITIAL_NOTIFICATIONS 
} from '../data/mockData';

export interface RegisterFormData {
  role: 'farmer' | 'distributor' | 'retailer' | 'consumer' | '';
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  organizationName?: string;
  location?: string;
  primaryCrops?: string;
  certificationNumber?: string;
}

interface AppContextType {
  isAuthenticated: boolean;
  authLoading: boolean;
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  currentPath: string;
  navigate: (path: string) => void;
  loginUser: (emailOrRole: string, passwordOrEmail?: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  registerUser: (data: RegisterFormData) => Promise<{ success: boolean; error?: string }> | { success: boolean; error?: string };
  logoutUser: () => void;
  authNotice: string | null;
  setAuthNotice: (notice: string | null) => void;
  jwtToken: string | null;
  dbStatus: { connected: boolean; status: string; database?: string };

  activeTab: string;
  setActiveTab: (tab: string) => void;
  
  batches: ProduceBatch[];
  selectedBatchId: string | null;
  setSelectedBatchId: (id: string | null) => void;
  selectedBatch: ProduceBatch | null;
  
  users: UserProfile[];
  fraudAlerts: FraudAlert[];
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  
  // Actions
  registerNewProduce: (newBatch: Partial<ProduceBatch>) => ProduceBatch;
  registerProductBatch: (input: RegisterProductInput) => Promise<ProduceBatch>;
  distributorProcureProduce: (batchId: string, logisticsCost: number, margin: number) => void;
  distributorTransferProduce: (batchId: string, retailerName: string) => void;
  retailerReceiveProduce: (batchId: string) => void;
  retailerUpdatePrice: (batchId: string, overhead: number, margin: number) => void;
  markBatchSoldToConsumer: (batchId: string, consumerName?: string) => void;
  updateUserKYC: (userId: string, status: 'verified' | 'pending' | 'rejected') => void;
  resolveFraudAlert: (alertId: string, resolution: string) => void;
  reportFraudAlert: (batchId: string, description: string, severity?: 'low' | 'medium' | 'high') => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  
  // Search & Navigation helpers
  searchBatchQuery: string;
  setSearchBatchQuery: (q: string) => void;
  navigateToVerification: (batchId: string) => void;
  resetPlatformRecords: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_BATCHES = 'agritrace_batches_v1';
const STORAGE_KEY_USERS = 'agritrace_users_v1';
const STORAGE_KEY_ALERTS = 'agritrace_alerts_v1';
const STORAGE_KEY_AUTH = 'agritrace_auth_session_v1';
const STORAGE_KEY_JWT = 'agritrace_jwt_token';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Authentication Loading State
  const [authLoading, setAuthLoading] = useState<boolean>(() => {
    try {
      return Boolean(localStorage.getItem(STORAGE_KEY_JWT));
    } catch {
      return false;
    }
  });

  // JWT Token State
  const [jwtToken, setJwtToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_JWT);
    } catch {
      return null;
    }
  });

  // MongoDB Atlas Connection Status
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; status: string; database?: string }>({
    connected: true,
    status: 'Connected',
    database: 'agritrace',
  });

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY_AUTH);
      if (saved) {
        const parsed = JSON.parse(saved);
        return Boolean(parsed.isAuthenticated);
      }
    } catch {
      // ignore
    }
    return false; // By default, new users start unauthenticated
  });

  const [currentRole, setCurrentRoleState] = useState<UserRole>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY_AUTH);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.role) return parsed.role;
      }
    } catch {
      // ignore
    }
    return 'public';
  });

  const [activeTab, setActiveTabState] = useState<string>('landing');
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>('batch-001');
  const [searchBatchQuery, setSearchBatchQuery] = useState<string>('');
  const [authNotice, setAuthNotice] = useState<string | null>(null);

  // Users state
  const [users, setUsers] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USERS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return INITIAL_USERS;
  });

  // Current authenticated user
  const [currentUserState, setCurrentUserState] = useState<UserProfile | null>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY_AUTH);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.user) return parsed.user;
      }
    } catch {
      // ignore
    }
    return null;
  });

  // URL Path State
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined' && window.location.pathname) {
      const p = window.location.pathname;
      return p === '' ? '/' : p;
    }
    return '/';
  });

  // Batches state with LocalStorage fallback
  const [batches, setBatches] = useState<ProduceBatch[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BATCHES);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return INITIAL_BATCHES;
  });

  // Fraud alerts
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ALERTS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return INITIAL_FRAUD_ALERTS;
  });

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  // Sync to session storage for auth
  useEffect(() => {
    try {
      if (isAuthenticated && currentUserState) {
        sessionStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify({
          isAuthenticated: true,
          role: currentRole,
          user: currentUserState
        }));
      } else {
        sessionStorage.removeItem(STORAGE_KEY_AUTH);
      }
    } catch {
      // ignore
    }
  }, [isAuthenticated, currentRole, currentUserState]);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_BATCHES, JSON.stringify(batches));
    } catch {
      // Storage error
    }
  }, [batches]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    } catch {
      // Storage error
    }
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ALERTS, JSON.stringify(fraudAlerts));
    } catch {
      // Storage error
    }
  }, [fraudAlerts]);

  // Connect to backend, verify MongoDB Atlas, sync produce batches, and validate JWT
  useEffect(() => {
    let isMounted = true;

    async function initPlatform() {
      // 1. Check health & MongoDB Atlas status
      try {
        const healthRes = await fetch('/api/health');
        if (healthRes.ok) {
          const healthData = await healthRes.json();
          if (isMounted && healthData.database) {
            setDbStatus(healthData.database);
          }
        }
      } catch (err) {
        console.warn('Backend health check notice:', err);
      }

      // 2. Fetch all products from MongoDB Atlas
      try {
        const dbBatches = await productService.getAllProducts();
        if (isMounted && Array.isArray(dbBatches) && dbBatches.length > 0) {
          setBatches(dbBatches);
        }
      } catch (err) {
        console.warn('Products sync notice:', err);
      }

      // 3. Verify JWT token and restore user from MongoDB Atlas
      const token = localStorage.getItem(STORAGE_KEY_JWT);
      if (token) {
        try {
          const meRes = await fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (meRes.ok) {
            const meData = await meRes.json();
            if (isMounted && meData.user) {
              setCurrentUserState(meData.user);
              setIsAuthenticated(true);
              if (meData.user.role) {
                setCurrentRoleState(meData.user.role);
              }
            }
          } else {
            // Token expired or invalid: clear stored credentials
            localStorage.removeItem(STORAGE_KEY_JWT);
            sessionStorage.removeItem(STORAGE_KEY_AUTH);
            if (isMounted) {
              setIsAuthenticated(false);
              setCurrentUserState(null);
              setCurrentRoleState('public');
            }
          }
        } catch (authErr) {
          console.warn('Session restoration notice:', authErr);
        } finally {
          if (isMounted) setAuthLoading(false);
        }
      } else {
        if (isMounted) setAuthLoading(false);
      }
    }

    initPlatform();

    return () => {
      isMounted = false;
    };
  }, []);

  // Derive Current User according to role, with fallback so components don't crash
  const currentUser: UserProfile = currentUserState || users.find(u => u.role === currentRole) || users[0];

  const setCurrentUser = (user: UserProfile) => {
    setCurrentUserState(user);
    setUsers(prev => prev.map(u => u.id === user.id ? user : u));
  };

  // Canonical route translation to legacy activeTab
  const pathToTab = (path: string): string => {
    if (path === '/' || path === '') return 'landing';
    if (path === '/login') return 'login';
    if (path === '/signup') return 'register';
    if (path === '/trace-products') return 'trace-products';
    if (path.startsWith('/verify')) return 'verify';
    if (path === '/scan-qr') return 'qr-scan';
    if (path === '/about') return 'about';
    if (path === '/how-it-works') return 'how-it-works';
    if (path === '/resources') return 'resources';
    if (path === '/for-farmers') return 'for-farmers';
    if (path === '/for-businesses') return 'for-businesses';
    
    // Farmer paths
    if (path === '/farmer/dashboard') return 'farmer-dashboard';
    if (path === '/farmer/register-produce') return 'register-produce';
    if (path === '/farmer/my-produce' || path === '/farmer/supply-chain') return 'my-produce';
    if (path === '/farmer/price-prediction') return 'price-prediction';
    if (path === '/farmer/transactions') return 'farmer-transactions';
    if (path === '/farmer/qr-codes') return 'farmer-qr-gen';
    if (path === '/farmer/trust') return 'farmer-trust';
    if (path === '/farmer/notifications') return 'farmer-notifications';
    if (path === '/farmer/profile') return 'farmer-profile';

    // Distributor paths
    if (path === '/distributor/dashboard') return 'distributor-dashboard';
    if (path === '/distributor/available-produce') return 'available-produce';
    if (path === '/distributor/shipments') return 'in-transit';
    if (path === '/distributor/transportation') return 'cold-chain-monitor';
    if (path === '/distributor/receive-produce') return 'receive-produce';
    if (path === '/distributor/update-price') return 'update-price';
    if (path === '/distributor/ownership-transfer') return 'ownership-transfer';
    if (path === '/distributor/transactions') return 'distributor-transactions';
    if (path === '/distributor/notifications') return 'distributor-notifications';
    if (path === '/distributor/profile') return 'distributor-profile';

    // Retailer paths
    if (path === '/retailer/dashboard') return 'retailer-dashboard';
    if (path === '/retailer/inventory') return 'retailer-inventory';
    if (path === '/retailer/receive-produce') return 'retailer-receive';
    if (path === '/retailer/update-price') return 'retailer-pricing';
    if (path === '/retailer/product-history') return 'retailer-history';
    if (path === '/retailer/ownership-transfer') return 'retailer-transfer';
    if (path === '/retailer/transactions') return 'retailer-transactions';
    if (path === '/retailer/qr-codes') return 'retailer-qr-gen';
    if (path === '/retailer/profile') return 'retailer-profile';

    // Consumer paths
    if (path === '/consumer/dashboard') return 'consumer-dashboard';
    if (path === '/consumer/scan') return 'consumer-scan';
    if (path === '/consumer/history') return 'consumer-history';
    if (path === '/consumer/profile') return 'consumer-profile';

    // Admin paths
    if (path === '/admin/dashboard') return 'admin-dashboard';
    if (path === '/admin/users' || path === '/admin/farmers' || path === '/admin/distributors' || path === '/admin/retailers') return 'admin-users';
    if (path === '/admin/products') return 'admin-products';
    if (path === '/admin/transactions') return 'admin-transactions';
    if (path === '/admin/fraud-alerts') return 'admin-fraud-alerts';
    if (path === '/admin/ai-analytics' || path === '/admin/trust-scores') return 'admin-ai-analytics';
    if (path === '/admin/settings' || path === '/admin/logs') return 'admin-dashboard';

    return 'landing';
  };

  const tabToPath = (tab: string): string => {
    switch (tab) {
      case 'landing': return '/';
      case 'login': return '/login';
      case 'register': return '/signup';
      case 'trace-products': return '/trace-products';
      case 'verify': return selectedBatchId ? `/verify/${selectedBatchId}` : '/verify';
      case 'qr-scan': return '/scan-qr';
      case 'about': return '/about';
      case 'how-it-works': return '/how-it-works';
      case 'resources': return '/resources';
      case 'for-farmers': return '/for-farmers';
      case 'for-businesses': return '/for-businesses';
      case 'dashboard':
      case 'farmer-dashboard': return '/farmer/dashboard';
      case 'register-produce': return '/farmer/register-produce';
      case 'my-produce': return '/farmer/my-produce';
      case 'price-prediction': return '/farmer/price-prediction';
      case 'farmer-transactions': return '/farmer/transactions';
      case 'farmer-qr-gen': return '/farmer/qr-codes';
      case 'farmer-trust': return '/farmer/trust';
      case 'farmer-notifications': return '/farmer/notifications';
      case 'farmer-profile': return '/farmer/profile';
      case 'distributor-dashboard': return '/distributor/dashboard';
      case 'available-produce': return '/distributor/available-produce';
      case 'in-transit': return '/distributor/shipments';
      case 'cold-chain-monitor': return '/distributor/transportation';
      case 'receive-produce': return '/distributor/receive-produce';
      case 'update-price': return '/distributor/update-price';
      case 'ownership-transfer': return '/distributor/ownership-transfer';
      case 'distributor-transactions': return '/distributor/transactions';
      case 'distributor-profile': return '/distributor/profile';
      case 'retailer-dashboard': return '/retailer/dashboard';
      case 'retailer-inventory': return '/retailer/inventory';
      case 'retailer-receive': return '/retailer/receive-produce';
      case 'retailer-pricing': return '/retailer/update-price';
      case 'retailer-history': return '/retailer/product-history';
      case 'retailer-transactions': return '/retailer/transactions';
      case 'retailer-qr-gen': return '/retailer/qr-codes';
      case 'retailer-profile': return '/retailer/profile';
      case 'consumer-dashboard': return '/consumer/dashboard';
      case 'consumer-scan': return '/consumer/scan';
      case 'consumer-history': return '/consumer/history';
      case 'consumer-profile': return '/consumer/profile';
      case 'admin-dashboard': return '/admin/dashboard';
      case 'admin-users': return '/admin/users';
      case 'admin-products': return '/admin/products';
      case 'admin-transactions': return '/admin/transactions';
      case 'admin-fraud-alerts': return '/admin/fraud-alerts';
      case 'admin-ai-analytics': return '/admin/ai-analytics';
      default: return '/';
    }
  };

  // Navigate function: updates path, checks protected routes, pushes browser state
  const navigate = (path: string) => {
    let target = path.startsWith('/') ? path : '/' + path;

    // Check for batch verification with ID
    if (target.startsWith('/verify/')) {
      const bId = target.replace('/verify/', '').trim();
      if (bId) {
        setSelectedBatchId(bId);
      }
    }

    // Route protection check for unauthenticated users
    const isProtected = 
      target.startsWith('/farmer') ||
      target.startsWith('/distributor') ||
      target.startsWith('/retailer') ||
      target.startsWith('/consumer') ||
      target.startsWith('/admin');

    if (isProtected && !isAuthenticated) {
      target = '/login';
      setAuthNotice('Please sign in with your verified credentials to access this workspace.');
    }

    // Prevent redundant navigation and unneeded component resets
    if (target === currentPath) {
      return;
    }

    setCurrentPath(target);
    setActiveTabState(pathToTab(target));

    if (typeof window !== 'undefined') {
      try {
        if (window.location.pathname !== target) {
          window.history.pushState({ path: target }, '', target);
        }
      } catch {
        // iframe history restriction
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Sync with browser back/forward buttons safely without unexpected resets or redirects
  useEffect(() => {
    const handlePopState = () => {
      try {
        const p = window.location.pathname;
        if (p && p !== currentPath) {
          const isProtected = 
            p.startsWith('/farmer') ||
            p.startsWith('/distributor') ||
            p.startsWith('/retailer') ||
            p.startsWith('/consumer') ||
            p.startsWith('/admin');

          if (isProtected && !isAuthenticated) {
            setCurrentPath('/login');
            setActiveTabState('login');
          } else {
            setCurrentPath(p);
            setActiveTabState(pathToTab(p));
          }
        }
      } catch {
        // ignore
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAuthenticated, currentPath]);

  // Backward compatibility wrapper for setActiveTab
  const setActiveTab = (tab: string) => {
    const p = tabToPath(tab);
    navigate(p);
  };

  // Registration handler: creates user via POST /api/auth/register
  const registerUser = async (data: RegisterFormData): Promise<{ success: boolean; error?: string }> => {
    if (!data.role) {
      return { success: false, error: 'Please select your role.' };
    }
    if (!data.fullName.trim()) {
      return { success: false, error: 'Please enter your full name.' };
    }
    if (!data.email.trim()) {
      return { success: false, error: 'Please enter your email.' };
    }
    if (!data.password) {
      return { success: false, error: 'Please enter your password.' };
    }
    if (data.password !== data.confirmPassword) {
      return { success: false, error: 'Passwords do not match.' };
    }

    const cleanEmail = data.email.trim().toLowerCase();

    // Call real backend authentication API: POST /api/auth/register
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.fullName.trim(),
          email: cleanEmail,
          password: data.password,
          role: data.role,
          phone: data.phone?.trim(),
          organizationName: data.organizationName?.trim(),
          location: data.location?.trim(),
          primaryCrops: data.primaryCrops?.trim(),
          certificationNumber: data.certificationNumber?.trim(),
        })
      });

      const resData = await response.json();
      if (!response.ok) {
        return { success: false, error: resData.error || 'Registration failed.' };
      }

      setAuthNotice('Registration successful! Please sign in with your email and password.');
      return { success: true };
    } catch (networkErr: any) {
      console.error('Network call to /api/auth/register failed:', networkErr);
      return { success: false, error: 'Unable to connect to authentication server. Please check your connection.' };
    }
  };

  // Login handler: Authenticates via POST /api/auth/login and receives JWT token
  const loginUser = async (
    roleOrEmail: UserRole | string,
    emailOrPassword?: string,
    passwordParam?: string
  ): Promise<{ success: boolean; error?: string }> => {
    let email = '';
    let password = '';

    if (passwordParam !== undefined) {
      // Called with legacy signature: (role, email, password)
      email = emailOrPassword || '';
      password = passwordParam;
    } else if (emailOrPassword !== undefined) {
      // Called with new signature: (email, password)
      email = roleOrEmail;
      password = emailOrPassword;
    } else {
      email = roleOrEmail;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      return { success: false, error: 'Invalid email or password' };
    }

    // Call real backend authentication API: POST /api/auth/login
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password })
      });

      const resData = await response.json();
      if (!response.ok || !resData.token || !resData.user) {
        return { 
          success: false, 
          error: resData.error || 'Invalid email or password' 
        };
      }

      const token = resData.token;
      const apiUser = resData.user;
      localStorage.setItem(STORAGE_KEY_JWT, token);
      setJwtToken(token);
      setIsAuthenticated(true);
      setCurrentRoleState(apiUser.role);
      setCurrentUserState(apiUser);
      setAuthNotice(null);

      // Redirect according to authenticated user's role
      const targetRole = apiUser.role;
      if (targetRole === 'farmer') navigate('/farmer/dashboard');
      else if (targetRole === 'distributor') navigate('/distributor/dashboard');
      else if (targetRole === 'retailer') navigate('/retailer/dashboard');
      else if (targetRole === 'consumer') navigate('/consumer/dashboard');
      else if (targetRole === 'admin') navigate('/admin/dashboard');
      else navigate('/');

      return { success: true };
    } catch (networkErr: any) {
      console.error('Network call to /api/auth/login failed:', networkErr);
      return { success: false, error: 'Authentication service temporarily unavailable. Please try again.' };
    }
  };

  // Logout handler: clears state, session storage, and JWT token
  const logoutUser = () => {
    setIsAuthenticated(false);
    setCurrentRoleState('public');
    setCurrentUserState(null);
    setJwtToken(null);
    setAuthNotice(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY_AUTH);
      localStorage.removeItem(STORAGE_KEY_JWT);
    } catch {
      // ignore
    }
    navigate('/login');
  };

  // Helper to switch role manually if needed
  const setRole = (role: UserRole) => {
    setCurrentRoleState(role);
    if (role === 'public') {
      logoutUser();
    } else {
      setIsAuthenticated(true);
      const matched = users.find(u => u.role === role);
      if (matched) setCurrentUserState(matched);
      navigate(`/${role}/dashboard`);
    }
  };

  const selectedBatch = batches.find(b => b.id === selectedBatchId || b.batchId === selectedBatchId) || batches[0] || null;

  const unreadNotificationCount = notifications.filter(
    n => !n.read && (n.targetRole === 'all' || n.targetRole === currentRole)
  ).length;

  // Actions
  const registerNewProduce = (newBatchData: Partial<ProduceBatch>): ProduceBatch => {
    const nextNum = batches.length + 1;
    const catCode = (newBatchData.category || 'AGR').substring(0, 3).toUpperCase();
    const batchId = `AGRI-2026-${catCode}-00${nextNum}`;
    const mockBlock = 18945300 + nextNum * 12;
    const mockHash = `0x${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`.substring(0, 66);
    
    const initialTimeline: TimelineEvent = {
      id: `tl-${Date.now()}`,
      stage: 'Farming',
      title: 'Harvest & Smart Contract Batch Minting',
      description: `Harvested at ${newBatchData.farmName || 'Organic Farm'}. Certified batch token minted onto distributed ledger.`,
      actorName: newBatchData.farmerName || currentUser.name,
      actorRole: 'farmer',
      location: newBatchData.farmerLocation || currentUser.location,
      timestamp: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
      blockNumber: mockBlock,
      txHash: mockHash,
      temperature: '22.4°C',
      humidity: '65%',
      verified: true,
    };

    const newBatch: ProduceBatch = {
      id: `batch-${Date.now()}`,
      batchId,
      name: newBatchData.name || 'Organic Produce Batch',
      variety: newBatchData.variety || 'Indigenous Variety',
      category: newBatchData.category || 'Vegetables',
      farmerId: currentUser.id,
      farmerName: currentUser.name,
      farmerLocation: currentUser.location,
      farmName: newBatchData.farmName || 'Green Valley Agro Farm',
      farmCoordinates: newBatchData.farmCoordinates || '19.0760° N, 72.8777° E',
      harvestDate: newBatchData.harvestDate || new Date().toISOString().split('T')[0],
      quantityKg: Number(newBatchData.quantityKg) || 500,
      status: 'Ready for Dispatch',
      currentCustodianRole: 'farmer',
      currentCustodianName: currentUser.name,
      pricing: {
        farmerPrice: Number(newBatchData.pricing?.farmerPrice) || 40,
        distributorLogisticsCost: 0,
        distributorMargin: 0,
        retailerOverhead: 0,
        retailerMargin: 0,
        finalConsumerPrice: Number(newBatchData.pricing?.farmerPrice) || 40,
        currency: '₹',
        fairPriceCeiling: Math.round((Number(newBatchData.pricing?.farmerPrice) || 40) * 1.8),
      },
      quality: {
        grade: newBatchData.quality?.grade || 'Grade A (Export Quality)',
        freshnessScore: 99,
        moistureContent: newBatchData.quality?.moistureContent || '82%',
        pesticideResidueTest: newBatchData.quality?.pesticideResidueTest || 'Zero Residue (Certified Organic)',
        organicCertificationNumber: newBatchData.quality?.organicCertificationNumber || 'NPOP/NAB/0912/MH',
        certifyingBody: newBatchData.quality?.certifyingBody || 'APEDA India',
        harvestDate: newBatchData.harvestDate || new Date().toISOString().split('T')[0],
        shelfLifeDays: Number(newBatchData.quality?.shelfLifeDays) || 12,
      },
      blockchain: {
        contractAddress: '0x3A5b8214Fa9E18aB9B625697d022bfe5716E5D3c',
        tokenId: `0x00${nextNum}_${catCode}`,
        blockNumber: mockBlock,
        mintTxHash: mockHash,
        currentOwnerWallet: currentUser.walletAddress,
        consensusMechanism: 'Ethereum Sepolia Network',
        gasUsed: '78,120 Gwei',
        merkleRootHash: `0x${Math.random().toString(16).substring(2, 34)}`,
        isTamperEvident: true,
        statusNotice: 'Verified Smart Contract State: Registered by Producer',
      },
      timeline: [initialTimeline],
      sensorLogs: [
        { timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), temperature: 22.4, humidity: 65, location: 'Farm Packing Shed', status: 'optimal' }
      ],
      imageUrl: newBatchData.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80',
      description: newBatchData.description || 'Authentic fresh agricultural produce tracked on blockchain from seed to retail shelf.',
    };

    setBatches(prev => [newBatch, ...prev]);
    setSelectedBatchId(newBatch.id);

    // Add notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      targetRole: 'distributor',
      title: 'New Produce Batch Available',
      message: `${currentUser.name} registered ${newBatch.name} (${newBatch.quantityKg} kg) ready for procurement.`,
      timestamp: 'Just now',
      read: false,
      type: 'info',
      linkTab: 'available-produce',
    };
    setNotifications(prev => [newNotif, ...prev]);

    return newBatch;
  };

  const registerProductBatch = async (input: RegisterProductInput): Promise<ProduceBatch> => {
    const created = await productService.registerProduct({
      ...input,
      farmerId: currentUser?.id || input.farmerId,
      farmerName: currentUser?.name || input.farmerName || 'Verified Producer',
    });

    setBatches(prev => [created, ...prev.filter(b => b.id !== created.id)]);
    setSelectedBatchId(created.id);

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      targetRole: 'distributor',
      title: 'New Produce Batch Registered',
      message: `${currentUser?.name || 'Farmer'} registered ${created.cropName} (${created.quantity} ${created.unit}) at ${created.farmLocation}.`,
      timestamp: 'Just now',
      read: false,
      type: 'info',
      linkTab: 'available-produce',
    };
    setNotifications(prev => [newNotif, ...prev]);

    return created;
  };

  const distributorProcureProduce = (batchId: string, logisticsCost: number, margin: number) => {
    setBatches(prev => prev.map(batch => {
      if (batch.id !== batchId && batch.batchId !== batchId) return batch;

      const mockBlock = batch.blockchain.blockNumber + 140;
      const mockTx = `0x${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`.substring(0, 66);
      
      const newEvent: TimelineEvent = {
        id: `tl-${Date.now()}`,
        stage: 'Logistics',
        title: 'Procured by Distributor & Inbound Cold Transit',
        description: 'Custody transferred to KisanLogix Logistics. Refrigerated fleet initiated with live IoT telemetry.',
        actorName: 'Vikram Mehra (Distributor)',
        actorRole: 'distributor',
        location: 'Central Agro Hub, Pune',
        timestamp: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
        blockNumber: mockBlock,
        txHash: mockTx,
        temperature: '12.4°C',
        humidity: '84%',
        verified: true,
      };

      const updatedPricing = {
        ...batch.pricing,
        distributorLogisticsCost: logisticsCost,
        distributorMargin: margin,
        finalConsumerPrice: batch.pricing.farmerPrice + logisticsCost + margin,
      };

      return {
        ...batch,
        status: 'In Transit' as const,
        currentCustodianRole: 'distributor' as const,
        currentCustodianName: 'KisanLogix Agri Cold-Chain Solutions',
        pricing: updatedPricing,
        timeline: [...batch.timeline, newEvent],
        blockchain: {
          ...batch.blockchain,
          blockNumber: mockBlock,
          currentOwnerWallet: '0x94B...89D1',
          statusNotice: 'Verified Smart Contract State: In Distributor Transit',
        },
      };
    }));

    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        targetRole: 'farmer',
        title: 'Produce Procured by Distributor',
        message: `Batch ${batchId} was successfully acquired by KisanLogix with transparent logistics breakdown logged.`,
        timestamp: 'Just now',
        read: false,
        type: 'success',
      },
      ...prev,
    ]);
  };

  const distributorTransferProduce = (batchId: string, retailerName: string) => {
    setBatches(prev => prev.map(batch => {
      if (batch.id !== batchId && batch.batchId !== batchId) return batch;

      const mockBlock = batch.blockchain.blockNumber + 210;
      const mockTx = `0x${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`.substring(0, 66);

      const newEvent: TimelineEvent = {
        id: `tl-${Date.now()}`,
        stage: 'Wholesale',
        title: 'Dispatched to Retailer Outlet',
        description: `Delivered to ${retailerName}. Cold-chain seal intact, cryptographic handover initiated.`,
        actorName: 'Vikram Mehra (Distributor)',
        actorRole: 'distributor',
        location: 'Mumbai Regional Logistics Depot',
        timestamp: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
        blockNumber: mockBlock,
        txHash: mockTx,
        temperature: '13.0°C',
        humidity: '82%',
        verified: true,
      };

      return {
        ...batch,
        status: 'Delivered to Retailer' as const,
        currentCustodianRole: 'retailer' as const,
        currentCustodianName: retailerName,
        timeline: [...batch.timeline, newEvent],
        blockchain: {
          ...batch.blockchain,
          blockNumber: mockBlock,
          currentOwnerWallet: '0x1F2...A4C9',
          statusNotice: 'Verified Smart Contract State: Arrived at Retail Store',
        },
      };
    }));
  };

  const retailerReceiveProduce = (batchId: string) => {
    setBatches(prev => prev.map(batch => {
      if (batch.id !== batchId && batch.batchId !== batchId) return batch;

      const mockBlock = batch.blockchain.blockNumber + 75;
      const mockTx = `0x${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`.substring(0, 66);

      const newEvent: TimelineEvent = {
        id: `tl-${Date.now()}`,
        stage: 'Retail',
        title: 'Retail Store Custody Acknowledged',
        description: 'Produce verified for quality, freshness index, and tamper-proof batch seal. Placed on shelf inventory.',
        actorName: 'Ananya Sharma (Retailer)',
        actorRole: 'retailer',
        location: 'FreshRoot Organic Market, Mumbai',
        timestamp: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
        blockNumber: mockBlock,
        txHash: mockTx,
        temperature: '18.0°C',
        humidity: '70%',
        verified: true,
      };

      return {
        ...batch,
        status: 'On Retail Shelf' as const,
        currentCustodianRole: 'retailer' as const,
        currentCustodianName: 'FreshRoot Organic Markets Ltd',
        timeline: [...batch.timeline, newEvent],
        blockchain: {
          ...batch.blockchain,
          blockNumber: mockBlock,
          statusNotice: 'Verified Smart Contract State: Placed on Retail Shelf',
        },
      };
    }));
  };

  const retailerUpdatePrice = (batchId: string, overhead: number, margin: number) => {
    setBatches(prev => prev.map(batch => {
      if (batch.id !== batchId && batch.batchId !== batchId) return batch;

      const finalConsumerPrice = 
        batch.pricing.farmerPrice + 
        batch.pricing.distributorLogisticsCost + 
        batch.pricing.distributorMargin + 
        overhead + 
        margin;

      // Check if price exceeds fair price ceiling
      if (finalConsumerPrice > batch.pricing.fairPriceCeiling) {
        setFraudAlerts(alerts => [
          {
            id: `alert-${Date.now()}`,
            batchId: batch.batchId,
            cropName: batch.name,
            severity: 'medium',
            alertType: 'Excessive Margin',
            description: `Retail shelf price ₹${finalConsumerPrice}/kg exceeds benchmark fair ceiling of ₹${batch.pricing.fairPriceCeiling}/kg.`,
            flaggedBy: 'Pricing Transparency Algorithmic Auditor',
            timestamp: new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }),
            status: 'Open',
          },
          ...alerts,
        ]);
      }

      return {
        ...batch,
        pricing: {
          ...batch.pricing,
          retailerOverhead: overhead,
          retailerMargin: margin,
          finalConsumerPrice,
        },
      };
    }));
  };

  const markBatchSoldToConsumer = (batchId: string, consumerName = 'Priya Nair (Verified Consumer)') => {
    setBatches(prev => prev.map(batch => {
      if (batch.id !== batchId && batch.batchId !== batchId) return batch;

      const mockBlock = batch.blockchain.blockNumber + 80;
      const mockTx = `0x${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`.substring(0, 66);

      const newEvent: TimelineEvent = {
        id: `tl-${Date.now()}`,
        stage: 'Consumer',
        title: 'Consumer Point of Sale & QR Verification',
        description: `Purchased by ${consumerName}. Batch lifecycle completed and cryptographically verified on ledger.`,
        actorName: consumerName,
        actorRole: 'consumer',
        location: 'Worli, Mumbai',
        timestamp: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
        blockNumber: mockBlock,
        txHash: mockTx,
        verified: true,
      };

      return {
        ...batch,
        status: 'Sold to Consumer' as const,
        currentCustodianRole: 'consumer' as const,
        currentCustodianName: consumerName,
        timeline: [...batch.timeline, newEvent],
        blockchain: {
          ...batch.blockchain,
          blockNumber: mockBlock,
          currentOwnerWallet: '0x38D...66B2',
          statusNotice: 'Lifecycle Completed: Verified Farm-to-Fork Consumer Delivery',
        },
      };
    }));
  };

  const updateUserKYC = (userId: string, status: 'verified' | 'pending' | 'rejected') => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, kycStatus: status } : u));
  };

  const resolveFraudAlert = (alertId: string, resolution: string) => {
    setFraudAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'Resolved', actionTaken: resolution } : a));
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const navigateToVerification = (batchId: string) => {
    setSelectedBatchId(batchId);
    navigate(`/verify/${batchId}`);
  };

  const reportFraudAlert = (batchId: string, description: string, severity: 'low' | 'medium' | 'high' = 'high') => {
    const batch = batches.find(b => b.batchId === batchId || b.id === batchId);
    const newAlert: FraudAlert = {
      id: `alert-${Date.now()}`,
      batchId,
      cropName: batch ? batch.name : 'Agricultural Produce',
      alertType: 'Excessive Margin',
      description,
      severity,
      flaggedBy: 'Automated Regulatory Audit Engine',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: 'Open',
    };
    setFraudAlerts(prev => [newAlert, ...prev]);
  };

  const resetPlatformRecords = () => {
    setBatches(INITIAL_BATCHES);
    setUsers(INITIAL_USERS);
    setFraudAlerts(INITIAL_FRAUD_ALERTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setSelectedBatchId('batch-001');
    try {
      localStorage.removeItem(STORAGE_KEY_BATCHES);
      localStorage.removeItem(STORAGE_KEY_USERS);
      localStorage.removeItem(STORAGE_KEY_ALERTS);
    } catch {
      // ignore
    }
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        authLoading,
        currentRole,
        setRole,
        currentUser,
        setCurrentUser,
        currentPath,
        navigate,
        loginUser,
        registerUser,
        logoutUser,
        authNotice,
        setAuthNotice,
        jwtToken,
        dbStatus,
        activeTab,
        setActiveTab,
        batches,
        selectedBatchId,
        setSelectedBatchId,
        selectedBatch,
        users,
        fraudAlerts,
        notifications,
        unreadNotificationCount,
        registerNewProduce,
        registerProductBatch,
        distributorProcureProduce,
        distributorTransferProduce,
        retailerReceiveProduce,
        retailerUpdatePrice,
        markBatchSoldToConsumer,
        updateUserKYC,
        resolveFraudAlert,
        reportFraudAlert,
        markNotificationRead,
        markAllNotificationsRead,
        searchBatchQuery,
        setSearchBatchQuery,
        navigateToVerification,
        resetPlatformRecords,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

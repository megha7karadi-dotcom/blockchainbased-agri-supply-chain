import React, { useState } from 'react';
import { ShieldAlert, Sparkles } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { Footer } from './components/common/Footer';
import { QRScannerModal } from './components/public/QRScannerModal';
import { ProfilePage } from './components/common/ProfilePage';

// Public Commercial Views
import { LandingPage } from './components/public/LandingPage';
import { TraceProductsPage } from './components/public/TraceProductsPage';
import { ForFarmersPage } from './components/public/ForFarmersPage';
import { ForBusinessesPage } from './components/public/ForBusinessesPage';
import { ResourcesPage } from './components/public/ResourcesPage';
import { AboutPage } from './components/public/AboutPage';
import { HowItWorksPage } from './components/public/HowItWorksPage';
import { LoginPage } from './components/public/LoginPage';
import { RegisterPage } from './components/public/RegisterPage';
import { ProductVerificationPage } from './components/public/ProductVerificationPage';
import { QRVerificationPage } from './components/public/QRVerificationPage';

// Farmer Views
import { FarmerDashboard } from './components/farmer/FarmerDashboard';
import { RegisterProduce } from './components/farmer/RegisterProduce';
import { MyProduce } from './components/farmer/MyProduce';
import { PricePrediction } from './components/farmer/PricePrediction';
import { FarmerTransactions } from './components/farmer/FarmerTransactions';
import { FarmerTrust } from './components/farmer/FarmerTrust';
import { FarmerQRGen } from './components/farmer/FarmerQRGen';
import { FarmerNotifications } from './components/farmer/FarmerNotifications';

// Distributor Views
import { DistributorDashboard } from './components/distributor/DistributorDashboard';
import { AvailableProduce } from './components/distributor/AvailableProduce';
import { InTransitBatches } from './components/distributor/InTransitBatches';
import { ColdChainMonitor } from './components/distributor/ColdChainMonitor';

// Retailer Views
import { RetailerDashboard } from './components/retailer/RetailerDashboard';

// Consumer Views
import { ConsumerDashboard } from './components/consumer/ConsumerDashboard';
import { ConsumerHistory } from './components/consumer/ConsumerHistory';

// Admin Views
import { AdminDashboard } from './components/admin/AdminDashboard';

const MainLayout: React.FC = () => {
  const { isAuthenticated, authLoading, currentRole, currentPath, navigate } = useApp();
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Normalize path to safely handle trailing slashes and query strings
  const normalizedPath = currentPath.split('?')[0].replace(/\/$/, '') || '/';

  // Check if current route requires authentication (ONLY /farmer, /distributor, /retailer, /consumer, /admin)
  const isProtectedRoute = 
    normalizedPath.startsWith('/farmer') ||
    normalizedPath.startsWith('/distributor') ||
    normalizedPath.startsWith('/retailer') ||
    normalizedPath.startsWith('/consumer') ||
    normalizedPath.startsWith('/admin');

  // While authLoading is active, do not execute redirects
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-xs font-semibold text-slate-500">Loading platform credentials...</div>
      </div>
    );
  }

  const renderCurrentView = () => {
    // 1. Route Protection Check - only redirect protected routes if not authenticated
    if (isProtectedRoute && !isAuthenticated) {
      return <LoginPage />;
    }

    // Role-based access enforcement for Protected Workspaces:
    // If an authenticated user attempts to access a workspace of a different role, restrict access.
    const roleRoutes: { prefix: string; role: string; name: string }[] = [
      { prefix: '/farmer', role: 'farmer', name: 'Farmer' },
      { prefix: '/distributor', role: 'distributor', name: 'Distributor' },
      { prefix: '/retailer', role: 'retailer', name: 'Retailer' },
      { prefix: '/consumer', role: 'consumer', name: 'Consumer' },
      { prefix: '/admin', role: 'admin', name: 'Administrator' },
    ];

    for (const { prefix, role, name } of roleRoutes) {
      if (normalizedPath.startsWith(prefix) && currentRole !== role) {
        return (
          <div className="max-w-xl mx-auto my-12 p-8 bg-white border border-rose-200 rounded-3xl shadow-sm text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Access Restricted</h2>
            <p className="text-sm text-slate-600 mb-6">
              The {name} Workspace is only accessible to verified {name} accounts. You are currently signed in as a <strong className="capitalize">{currentRole}</strong>.
            </p>
            <button
              onClick={() => navigate(`/${currentRole}/dashboard`)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Go to Your {currentRole.charAt(0).toUpperCase() + currentRole.slice(1)} Dashboard
            </button>
          </div>
        );
      }
    }

    // 2. PUBLIC COMMERCIAL ROUTES (Open to all visitors, no redirects)
    if (normalizedPath === '/' || normalizedPath === '') {
      return <LandingPage onOpenQRScanner={() => setIsQRScannerOpen(true)} />;
    }
    if (normalizedPath === '/login') {
      return <LoginPage />;
    }
    if (normalizedPath === '/signup') {
      return <RegisterPage />;
    }
    if (normalizedPath === '/trace-products') {
      return <TraceProductsPage onOpenQRScanner={() => setIsQRScannerOpen(true)} />;
    }
    if (normalizedPath.startsWith('/verify')) {
      return <ProductVerificationPage onOpenQRScanner={() => setIsQRScannerOpen(true)} />;
    }
    if (normalizedPath === '/scan-qr') {
      return <QRVerificationPage onOpenQRScanner={() => setIsQRScannerOpen(true)} />;
    }
    if (normalizedPath === '/about') {
      return <AboutPage />;
    }
    if (normalizedPath === '/how-it-works') {
      return <HowItWorksPage />;
    }
    if (normalizedPath === '/resources') {
      return <ResourcesPage />;
    }
    if (normalizedPath === '/for-farmers') {
      return <ForFarmersPage />;
    }
    if (normalizedPath === '/for-businesses') {
      return <ForBusinessesPage />;
    }

    // 3. FARMER PARTICIPANT ROUTES
    if (normalizedPath === '/farmer/dashboard') return <FarmerDashboard />;
    if (normalizedPath === '/farmer/register-produce') return <RegisterProduce />;
    if (normalizedPath === '/farmer/my-produce' || normalizedPath === '/farmer/supply-chain') return <MyProduce />;
    if (normalizedPath === '/farmer/price-prediction') return <PricePrediction />;
    if (normalizedPath === '/farmer/transactions') return <FarmerTransactions />;
    if (normalizedPath === '/farmer/qr-codes') return <FarmerQRGen />;
    if (normalizedPath === '/farmer/trust') return <FarmerTrust />;
    if (normalizedPath === '/farmer/notifications') return <FarmerNotifications />;
    if (normalizedPath === '/farmer/profile') return <ProfilePage />;
    if (normalizedPath.startsWith('/farmer')) {
      return (
        <div className="max-w-lg mx-auto my-16 p-8 bg-white border border-slate-200 rounded-3xl shadow-sm text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Coming Soon</h2>
          <p className="text-sm text-slate-600 mb-6">
            This farmer workspace module is currently under development.
          </p>
          <button
            onClick={() => navigate('/farmer/dashboard')}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Return to Farmer Dashboard
          </button>
        </div>
      );
    }

    // 4. DISTRIBUTOR PARTICIPANT ROUTES
    if (normalizedPath === '/distributor/dashboard') return <DistributorDashboard />;
    if (normalizedPath === '/distributor/available-produce') return <AvailableProduce />;
    if (normalizedPath === '/distributor/shipments' || normalizedPath === '/distributor/receive-produce' || normalizedPath === '/distributor/ownership-transfer') {
      return <InTransitBatches />;
    }
    if (normalizedPath === '/distributor/transportation') return <ColdChainMonitor />;
    if (normalizedPath === '/distributor/update-price') return <DistributorDashboard />;
    if (normalizedPath === '/distributor/transactions') return <FarmerTransactions />;
    if (normalizedPath === '/distributor/profile') return <ProfilePage />;

    // 5. RETAILER PARTICIPANT ROUTES
    if (normalizedPath === '/retailer/dashboard' || normalizedPath === '/retailer/inventory' || normalizedPath === '/retailer/receive-produce' || normalizedPath === '/retailer/update-price' || normalizedPath === '/retailer/product-history' || normalizedPath === '/retailer/ownership-transfer') {
      return <RetailerDashboard />;
    }
    if (normalizedPath === '/retailer/transactions') return <FarmerTransactions />;
    if (normalizedPath === '/retailer/qr-codes') return <FarmerQRGen />;
    if (normalizedPath === '/retailer/profile') return <ProfilePage />;

    // 6. CONSUMER PARTICIPANT ROUTES
    if (normalizedPath === '/consumer/dashboard') return <ConsumerDashboard onOpenQRScanner={() => setIsQRScannerOpen(true)} />;
    if (normalizedPath === '/consumer/scan') return <QRVerificationPage onOpenQRScanner={() => setIsQRScannerOpen(true)} />;
    if (normalizedPath === '/consumer/history') return <ConsumerHistory onOpenQRScanner={() => setIsQRScannerOpen(true)} />;
    if (normalizedPath === '/consumer/profile') return <ProfilePage />;

    // 7. ADMIN GOVERNANCE ROUTES
    if (normalizedPath.startsWith('/admin/profile')) return <ProfilePage />;
    if (normalizedPath.startsWith('/admin')) return <AdminDashboard />;

    // Default Fallback
    if (isAuthenticated) {
      if (currentRole === 'farmer') return <FarmerDashboard />;
      if (currentRole === 'distributor') return <DistributorDashboard />;
      if (currentRole === 'retailer') return <RetailerDashboard />;
      if (currentRole === 'consumer') return <ConsumerDashboard onOpenQRScanner={() => setIsQRScannerOpen(true)} />;
      if (currentRole === 'admin') return <AdminDashboard />;
    }

    return <LandingPage onOpenQRScanner={() => setIsQRScannerOpen(true)} />;
  };

  const showSidebar = isAuthenticated && isProtectedRoute;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
      {/* Global Navigation Header */}
      <Header 
        onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)} 
        onOpenQRScanner={() => setIsQRScannerOpen(true)} 
      />

      {/* App Body with Sidebar (Only for authenticated workspaces) & Content Region */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        
        {/* Role Workspace Sidebar (Rendered strictly when authenticated) */}
        {showSidebar && (
          <Sidebar 
            isMobileOpen={isMobileSidebarOpen} 
            onCloseMobile={() => setIsMobileSidebarOpen(false)} 
          />
        )}

        {/* Dynamic Content Region */}
        <main className={`flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-full ${!showSidebar ? 'w-full' : ''}`}>
          {renderCurrentView()}
        </main>
      </div>

      {/* Commercial SaaS Footer */}
      <Footer />

      {/* Packaging QR Scanner Modal */}
      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
      />

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

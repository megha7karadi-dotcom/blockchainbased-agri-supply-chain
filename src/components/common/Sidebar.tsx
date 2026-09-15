import React from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Package, 
  TrendingUp, 
  History, 
  Award, 
  QrCode, 
  Bell, 
  Truck, 
  ArrowRightLeft, 
  Store, 
  ShieldCheck, 
  Users, 
  AlertTriangle, 
  BarChart3, 
  CheckCircle2, 
  FileCheck2, 
  User, 
  LogOut,
  BadgePercent,
  Layers,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types/produce';

interface Props {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
}

export const Sidebar: React.FC<Props> = ({ isMobileOpen, onCloseMobile }) => {
  const { 
    isAuthenticated,
    currentRole, 
    currentPath,
    navigate,
    logoutUser,
    unreadNotificationCount, 
    fraudAlerts, 
    batches,
    currentUser,
  } = useApp();

  if (!isAuthenticated || currentRole === 'public') {
    return null;
  }

  const handleLogout = () => {
    logoutUser();
    onCloseMobile();
  };

  const safeBatches = Array.isArray(batches) ? batches : [];
  const safeFraudAlerts = Array.isArray(fraudAlerts) ? fraudAlerts : [];

  const getNavItems = (role: UserRole): NavItem[] => {
    switch (role) {
      case 'farmer':
        return [
          { path: '/farmer/dashboard', label: 'Home', icon: <LayoutDashboard className="w-4 h-4" /> },
          { path: '/farmer/register-produce', label: 'Add Produce', icon: <PlusCircle className="w-4 h-4" /> },
          { path: '/farmer/price-prediction', label: 'Price Prediction', icon: <TrendingUp className="w-4 h-4" /> },
          { path: '/farmer/my-produce', label: 'My Produce', icon: <Package className="w-4 h-4" />, badge: safeBatches.filter(b => b.farmerId === currentUser?.id || b.farmerId === 'usr-farmer-01').length },
          { path: '/farmer/transfers', label: 'Transfers', icon: <ArrowRightLeft className="w-4 h-4" /> },
          { path: '/farmer/qr-codes', label: 'QR Codes', icon: <QrCode className="w-4 h-4" /> },
          { path: '/farmer/profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
        ];
      case 'distributor':
        return [
          { path: '/distributor/dashboard', label: 'Home', icon: <LayoutDashboard className="w-4 h-4" /> },
          { path: '/distributor/incoming', label: 'Incoming Produce', icon: <Truck className="w-4 h-4" />, badge: safeBatches.filter(b => b.status === 'Transferred to Distributor' || b.status === 'Ready for Dispatch').length || undefined },
          { path: '/distributor/inventory', label: 'Inventory', icon: <Package className="w-4 h-4" /> },
          { path: '/distributor/update-price', label: 'Update Price', icon: <BadgePercent className="w-4 h-4" /> },
          { path: '/distributor/transfer-to-retailer', label: 'Transfer to Retailer', icon: <ArrowRightLeft className="w-4 h-4" /> },
          { path: '/distributor/history', label: 'History', icon: <History className="w-4 h-4" /> },
          { path: '/distributor/profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
        ];
      case 'retailer':
        return [
          { path: '/retailer/dashboard', label: 'Home', icon: <LayoutDashboard className="w-4 h-4" /> },
          { path: '/retailer/incoming', label: 'Incoming Shipments', icon: <Truck className="w-4 h-4" />, badge: safeBatches.filter(b => b.status === 'In Transit to Retailer' || b.status === 'Delivered to Retailer').length || undefined },
          { path: '/retailer/inventory', label: 'Store Inventory', icon: <Store className="w-4 h-4" />, badge: safeBatches.filter(b => b.status === 'On Retail Shelf' || b.status === 'Delivered to Retailer' || b.status === 'At Retailer').length || undefined },
          { path: '/retailer/set-price', label: 'Set Final Price', icon: <BadgePercent className="w-4 h-4" /> },
          { path: '/retailer/sell', label: 'Sell / Record Sale', icon: <CheckCircle2 className="w-4 h-4" /> },
          { path: '/retailer/qr-labels', label: 'QR Shelf Labels', icon: <QrCode className="w-4 h-4" /> },
          { path: '/retailer/history', label: 'History', icon: <History className="w-4 h-4" /> },
          { path: '/retailer/profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
        ];
      case 'consumer':
        return [
          { path: '/consumer/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
          { path: '/consumer/scan', label: 'Scan Produce QR', icon: <QrCode className="w-4 h-4" /> },
          { path: '/consumer/history', label: 'Verification History', icon: <History className="w-4 h-4" /> },
          { path: '/consumer/profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
        ];
      case 'admin':
        return [
          { path: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
          { path: '/admin/users', label: 'User Verification (KYC)', icon: <Users className="w-4 h-4" /> },
          { path: '/admin/products', label: 'Produce Batches', icon: <Package className="w-4 h-4" />, badge: safeBatches.length },
          { path: '/admin/transactions', label: 'Blockchain Ledger', icon: <Layers className="w-4 h-4" /> },
          { path: '/admin/fraud-alerts', label: 'Fraud Alerts', icon: <AlertTriangle className="w-4 h-4" />, badge: safeFraudAlerts.filter(a => a.status === 'Open').length || undefined },
          { path: '/admin/ai-analytics', label: 'AI & Price Analytics', icon: <BarChart3 className="w-4 h-4" /> },
          { path: '/admin/profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems(currentRole);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white text-slate-700 border-r border-slate-200 w-64 shadow-2xs">
      
      {/* Header in Sidebar */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/70">
        <div className="text-sm font-bold text-slate-900 capitalize truncate">
          {currentUser ? currentUser.name : `${currentRole} Workspace`}
        </div>
        <p className="text-xs text-slate-500 truncate mt-0.5">
          {currentUser?.organization || 'Authorized Participant'}
        </p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          if (item.path === 'logout') {
            return (
              <button
                key="logout-item"
                onClick={handleLogout}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-rose-500">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              </button>
            );
          }

          const isActive = currentPath === item.path;

          return (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                isActive
                  ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200/80 shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={isActive ? 'text-emerald-700' : 'text-slate-400'}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold ${
                  isActive 
                    ? 'bg-emerald-200/80 text-emerald-900' 
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Profile & Logout controls for authenticated users */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50 space-y-1">
        <button
          onClick={() => {
            navigate(`/${currentRole}/profile`);
            onCloseMobile();
          }}
          className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition flex items-center gap-2 cursor-pointer"
        >
          <User className="w-3.5 h-3.5 text-slate-400" />
          <span>Profile & Account</span>
        </button>
        <button
          onClick={handleLogout}
          className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition flex items-center gap-2 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-500" />
          <span>Logout</span>
        </button>
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden lg:block h-[calc(100vh-4rem)] sticky top-16 flex-shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            onClick={onCloseMobile}
            className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs transition-opacity" 
          />
          {/* Drawer content */}
          <div className="relative w-64 max-w-[80vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

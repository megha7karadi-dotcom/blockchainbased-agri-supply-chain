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

  const getNavItems = (role: UserRole): NavItem[] => {
    switch (role) {
      case 'farmer':
        return [
          { path: '/farmer/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
          { path: '/farmer/register-produce', label: 'Register Produce', icon: <PlusCircle className="w-4 h-4" /> },
          { path: '/farmer/my-produce', label: 'My Produce', icon: <Package className="w-4 h-4" />, badge: batches.filter(b => b.farmerId === 'usr-farmer-01').length },
          { path: '/farmer/price-prediction', label: 'Price Prediction', icon: <TrendingUp className="w-4 h-4" /> },
          { path: '/farmer/transactions', label: 'Transaction History', icon: <History className="w-4 h-4" /> },
          { path: '/farmer/qr-codes', label: 'QR Codes', icon: <QrCode className="w-4 h-4" /> },
          { path: '/farmer/trust', label: 'Trust & Reputation', icon: <Award className="w-4 h-4" />, badge: '98%' },
          { path: '/farmer/notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" />, badge: unreadNotificationCount || undefined },
          { path: '/farmer/profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
          { path: 'logout', label: 'Logout', icon: <LogOut className="w-4 h-4 text-rose-400" /> },
        ];
      case 'distributor':
        return [
          { path: '/distributor/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
          { path: '/distributor/available-produce', label: 'Available Produce', icon: <Package className="w-4 h-4" />, badge: batches.filter(b => b.status === 'Ready for Dispatch').length },
          { path: '/distributor/shipments', label: 'Shipments', icon: <Package className="w-4 h-4" /> },
          { path: '/distributor/transportation', label: 'Cold-Chain Transport', icon: <Truck className="w-4 h-4" />, badge: 'IoT' },
          { path: '/distributor/receive-produce', label: 'Receive Produce', icon: <CheckCircle2 className="w-4 h-4" /> },
          { path: '/distributor/update-price', label: 'Update Price & Margin', icon: <BadgePercent className="w-4 h-4" /> },
          { path: '/distributor/ownership-transfer', label: 'Transfer Ownership', icon: <ArrowRightLeft className="w-4 h-4" /> },
          { path: '/distributor/transactions', label: 'Transaction History', icon: <History className="w-4 h-4" /> },
          { path: '/distributor/profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
        ];
      case 'retailer':
        return [
          { path: '/retailer/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
          { path: '/retailer/inventory', label: 'Store Inventory', icon: <Store className="w-4 h-4" />, badge: batches.filter(b => b.status === 'On Retail Shelf' || b.status === 'Delivered to Retailer').length },
          { path: '/retailer/receive-produce', label: 'Receive Produce', icon: <CheckCircle2 className="w-4 h-4" /> },
          { path: '/retailer/update-price', label: 'Update Shelf Price', icon: <BadgePercent className="w-4 h-4" /> },
          { path: '/retailer/product-history', label: 'Product Provenance', icon: <FileCheck2 className="w-4 h-4" /> },
          { path: '/retailer/ownership-transfer', label: 'Transfer Ownership', icon: <ArrowRightLeft className="w-4 h-4" /> },
          { path: '/retailer/transactions', label: 'Transaction History', icon: <History className="w-4 h-4" /> },
          { path: '/retailer/qr-codes', label: 'Consumer QR Display', icon: <QrCode className="w-4 h-4" /> },
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
          { path: '/admin/products', label: 'Produce Batches', icon: <Package className="w-4 h-4" />, badge: batches.length },
          { path: '/admin/transactions', label: 'Blockchain Ledger', icon: <Layers className="w-4 h-4" /> },
          { path: '/admin/fraud-alerts', label: 'Fraud Alerts', icon: <AlertTriangle className="w-4 h-4" />, badge: fraudAlerts.filter(a => a.status === 'Open').length || undefined },
          { path: '/admin/ai-analytics', label: 'AI & Price Analytics', icon: <BarChart3 className="w-4 h-4" /> },
          { path: '/admin/profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems(currentRole);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'farmer': return { name: 'Farmer Node', color: 'bg-emerald-100 text-emerald-800' };
      case 'distributor': return { name: 'Distributor Node', color: 'bg-blue-100 text-blue-800' };
      case 'retailer': return { name: 'Retailer Node', color: 'bg-purple-100 text-purple-800' };
      case 'consumer': return { name: 'Consumer Node', color: 'bg-teal-100 text-teal-800' };
      case 'admin': return { name: 'Admin Console', color: 'bg-amber-100 text-amber-800' };
      default: return { name: 'Public Portal', color: 'bg-slate-100 text-slate-700' };
    }
  };

  const roleBadge = getRoleBadge(currentRole);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200 border-r border-slate-800 w-64">
      
      {/* Role Header in Sidebar */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">Workspace</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${roleBadge.color}`}>
            {roleBadge.name}
          </span>
        </div>
        <div className="text-sm font-bold text-white capitalize truncate">
          {currentUser ? currentUser.name : `${currentRole} Workspace`}
        </div>
        <p className="text-xs text-slate-400 truncate mt-0.5">
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
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-rose-400">{item.icon}</span>
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
                  ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold ${
                  isActive 
                    ? 'bg-emerald-800 text-emerald-100' 
                    : 'bg-slate-800 text-slate-300'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Profile & Logout controls for authenticated users */}
      <div className="p-3 border-t border-slate-800 space-y-1">
        <button
          onClick={() => {
            navigate(`/${currentRole}/profile`);
            onCloseMobile();
          }}
          className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-2 cursor-pointer"
        >
          <User className="w-3.5 h-3.5 text-slate-400" />
          <span>Profile & Account</span>
        </button>
        <button
          onClick={handleLogout}
          className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-rose-300 hover:text-rose-200 hover:bg-rose-950/40 transition flex items-center gap-2 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
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

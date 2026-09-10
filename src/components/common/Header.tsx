import React, { useState } from 'react';
import { 
  Leaf, 
  QrCode, 
  Bell, 
  Search, 
  Menu, 
  X, 
  User, 
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  Sprout,
  Truck,
  Store,
  Shield
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types/produce';

interface Props {
  onOpenMobileSidebar: () => void;
  onOpenQRScanner: () => void;
}

export const Header: React.FC<Props> = ({ onOpenMobileSidebar, onOpenQRScanner }) => {
  const { 
    isAuthenticated,
    currentRole, 
    currentUser, 
    unreadNotificationCount, 
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    currentPath,
    navigate,
    logoutUser,
    searchBatchQuery,
    setSearchBatchQuery,
    navigateToVerification,
    batches
  } = useApp();

  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchBatchQuery.trim()) return;

    const matched = batches.find(b => 
      b.batchId.toLowerCase().includes(searchBatchQuery.toLowerCase()) ||
      b.name.toLowerCase().includes(searchBatchQuery.toLowerCase())
    );

    if (matched) {
      navigateToVerification(matched.id);
    } else {
      navigateToVerification('batch-001');
    }
    setSearchFocused(false);
  };

  const publicNavLinks = [
    { path: '/', label: 'Home' },
    { path: '/trace-products', label: 'Trace Products' },
    { path: '/for-farmers', label: 'For Farmers' },
    { path: '/for-businesses', label: 'For Businesses' },
    { path: '/resources', label: 'Resources' },
    { path: '/about', label: 'About' },
  ];

  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case 'farmer': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'distributor': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'retailer': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'consumer': return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'admin': return 'bg-amber-100 text-amber-800 border-amber-300';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <button
                onClick={onOpenMobileSidebar}
                className="lg:hidden p-2 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                aria-label="Toggle workspace sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <button 
              onClick={() => {
                if (isAuthenticated) {
                  navigate(`/${currentRole}/dashboard`);
                } else {
                  navigate('/');
                }
              }}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition">
                <Leaf className="w-5 h-5" />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-slate-900 flex items-center justify-center text-[9px] border border-white">
                  ⛓️
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="font-black text-lg tracking-tight text-slate-900">
                    Agri<span className="text-emerald-700">Trace</span>
                  </span>
                  {isAuthenticated && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ml-1 hidden sm:inline-block ${getRoleBadgeStyle(currentRole)}`}>
                      {currentRole}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 font-medium tracking-tight mt-0.5">
                  Transparent. Traceable. Trusted.
                </p>
              </div>
            </button>
          </div>

          {/* STATE 1: Public Desktop Navigation (Only when unauthenticated) */}
          {!isAuthenticated ? (
            <nav className="hidden xl:flex items-center gap-1">
              {publicNavLinks.map(link => {
                const isActive = currentPath === link.path;
                return (
                  <button
                    key={link.path}
                    onClick={() => navigate(link.path)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      isActive 
                        ? 'bg-slate-100 text-emerald-800' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </nav>
          ) : (
            /* Authenticated Workspace Indicator */
            <div className="hidden md:flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Workspace:</span>
              <span className="text-xs font-bold text-slate-800 capitalize bg-slate-100 px-2.5 py-1 rounded-lg">
                {currentUser?.organization || `${currentRole} Node`}
              </span>
            </div>
          )}

          {/* Quick Batch Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-xs relative">
            <div className="relative w-full">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchBatchQuery}
                onChange={(e) => setSearchBatchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                placeholder="Search batch ID or crop..."
                className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-slate-100 border border-transparent hover:border-slate-300 focus:border-emerald-600 focus:bg-white rounded-xl outline-none transition"
              />
            </div>
            {searchFocused && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 text-xs animate-in fade-in">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                  Active Verified Batches
                </div>
                {batches.slice(0, 3).map(b => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      navigateToVerification(b.id);
                      setSearchBatchQuery(b.batchId);
                    }}
                    className="w-full text-left px-2 py-1.5 hover:bg-emerald-50 rounded-xl flex items-center justify-between transition cursor-pointer"
                  >
                    <div>
                      <div className="font-semibold text-slate-800">{b.name}</div>
                      <div className="font-mono text-[10px] text-emerald-700">{b.batchId}</div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                      {b.status}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </form>

          {/* Right Controls: Scan QR, Notifications, Auth */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* Quick Scan QR Button */}
            <button
              onClick={onOpenQRScanner}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition cursor-pointer"
              title="Open QR Scanner"
            >
              <QrCode className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden sm:inline">Scan QR</span>
            </button>

            {/* Authenticated Notifications */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifMenu(!showNotifMenu)}
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl relative transition cursor-pointer"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotificationCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                      {unreadNotificationCount}
                    </span>
                  )}
                </button>

                {showNotifMenu && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="p-2.5 border-b border-slate-100 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">Ledger & Price Alerts</h4>
                        <p className="text-[10px] text-slate-500">{unreadNotificationCount} unread events</p>
                      </div>
                      {unreadNotificationCount > 0 && (
                        <button
                          onClick={markAllNotificationsRead}
                          className="text-[11px] text-emerald-700 hover:underline font-semibold cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 py-1">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-400">No active alerts</div>
                      ) : (
                        notifications.map(n => (
                          <div 
                            key={n.id} 
                            onClick={() => markNotificationRead(n.id)}
                            className={`p-2.5 rounded-xl cursor-pointer hover:bg-slate-50 transition text-xs ${!n.read ? 'bg-emerald-50/50' : ''}`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-slate-800">{n.title}</span>
                              <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                            </div>
                            <p className="text-[11px] text-slate-600 leading-relaxed">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Authentication State */}
            {!isAuthenticated ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => navigate('/login')}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Log In
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                >
                  Get Started
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {/* Direct Dashboard Shortcut */}
                <button
                  onClick={() => navigate(`/${currentRole}/dashboard`)}
                  className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Dashboard</span>
                </button>

                {/* Profile & Role Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2 p-1.5 sm:px-2 sm:py-1 rounded-xl hover:bg-slate-100 border border-transparent hover:border-slate-200 transition cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold flex items-center justify-center overflow-hidden text-xs">
                      {currentUser?.avatar ? (
                        <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                      ) : (
                        <span>{currentUser?.name?.charAt(0) || 'U'}</span>
                      )}
                    </div>
                    <div className="hidden lg:block text-left">
                      <div className="font-bold text-slate-900 text-xs truncate max-w-[110px]">
                        {currentUser?.name || 'User'}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md border uppercase ${getRoleBadgeStyle(currentRole)}`}>
                          {currentRole}
                        </span>
                      </div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95">
                      
                      {/* User Info Header */}
                      <div className="p-3 border-b border-slate-100">
                        <div className="font-bold text-slate-900 text-sm">{currentUser?.name}</div>
                        <div className="text-xs text-slate-500 truncate">{currentUser?.email}</div>
                        <div className="mt-1.5 flex items-center justify-between">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${getRoleBadgeStyle(currentRole)}`}>
                            {currentRole} Node
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">
                            {currentUser?.walletAddress}
                          </span>
                        </div>
                      </div>

                      {/* User Account Info */}
                      <div className="py-2 border-b border-slate-100 text-xs px-3 space-y-1.5 text-slate-600">
                        {currentUser?.organization && (
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 font-medium">Org:</span>
                            <span className="font-semibold text-slate-800 truncate">{currentUser.organization}</span>
                          </div>
                        )}
                        {currentUser?.location && (
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 font-medium">Location:</span>
                            <span className="text-slate-700 truncate">{currentUser.location}</span>
                          </div>
                        )}
                      </div>

                      {/* Account Actions */}
                      <div className="py-1">
                        <button
                          onClick={() => {
                            navigate(`/${currentRole}/dashboard`);
                            setShowProfileMenu(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition cursor-pointer"
                        >
                          <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                          <span>Go to Workspace Dashboard</span>
                        </button>
                        <button
                          onClick={() => {
                            navigate(`/${currentRole}/profile`);
                            setShowProfileMenu(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition cursor-pointer"
                        >
                          <User className="w-4 h-4 text-blue-600" />
                          <span>My Participant Profile</span>
                        </button>
                        <button
                          onClick={() => {
                            navigate('/trace-products');
                            setShowProfileMenu(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition cursor-pointer"
                        >
                          <ShieldCheck className="w-4 h-4 text-slate-400" />
                          <span>Public Produce Directory</span>
                        </button>
                        <button
                          onClick={() => {
                            logoutUser();
                            setShowProfileMenu(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-semibold transition cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>

                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mobile menu toggle for unauthenticated pages */}
            {!isAuthenticated && (
              <button
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                className="xl:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl"
              >
                {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}

          </div>

        </div>
      </div>

      {/* Unauthenticated Mobile Dropdown Menu */}
      {!isAuthenticated && mobileNavOpen && (
        <div className="xl:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-2 animate-in slide-in-from-top-2">
          {publicNavLinks.map(link => (
            <button
              key={link.path}
              onClick={() => {
                navigate(link.path);
                setMobileNavOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold block ${
                currentPath === link.path ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-700'
              }`}
            >
              {link.label}
            </button>
          ))}
          <div className="pt-2 border-t border-slate-100 flex gap-2">
            <button
              onClick={() => {
                navigate('/login');
                setMobileNavOpen(false);
              }}
              className="flex-1 py-2 text-center text-xs font-semibold bg-slate-100 rounded-xl"
            >
              Log In
            </button>
            <button
              onClick={() => {
                navigate('/signup');
                setMobileNavOpen(false);
              }}
              className="flex-1 py-2 text-center text-xs font-bold text-white bg-emerald-700 rounded-xl"
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

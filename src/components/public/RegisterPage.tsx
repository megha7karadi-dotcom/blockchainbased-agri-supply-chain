import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Sprout, 
  Truck, 
  Store, 
  User, 
  ArrowRight, 
  Lock, 
  Mail, 
  Phone, 
  AlertCircle,
  CheckCircle2,
  KeyRound,
  RotateCcw,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useApp, RegisterFormData, RegisterMobileFormData } from '../../context/AppContext';

export const RegisterPage: React.FC = () => {
  const { registerUser, registerWithOtp, sendOtp, navigate, isAuthenticated, currentRole } = useApp();

  // Automatic redirect if user is already authenticated
  useEffect(() => {
    if (isAuthenticated && currentRole && currentRole !== 'public') {
      navigate(`/${currentRole}/dashboard`);
    }
  }, [isAuthenticated, currentRole, navigate]);
  
  // Registration Method: 'otp' | 'email'
  const [authMethod, setAuthMethod] = useState<'otp' | 'email'>('otp');

  // Common Role Selection
  const [selectedRole, setSelectedRole] = useState<'farmer' | 'distributor' | 'retailer' | 'consumer'>('farmer');

  // Mobile OTP Sign Up State
  const [mobileData, setMobileData] = useState<{
    fullName: string;
    phoneCountryCode: string;
    phoneNumber: string;
    otpCode: string;
    organizationName: string;
    location: string;
    primaryCrops: string;
    certificationNumber: string;
  }>({
    fullName: '',
    phoneCountryCode: '+91',
    phoneNumber: '',
    otpCode: '',
    organizationName: '',
    location: '',
    primaryCrops: '',
    certificationNumber: '',
  });

  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpLoading, setOtpLoading] = useState<boolean>(false);
  const [demoOtpHint, setDemoOtpHint] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState<number>(0);

  // Email & Password Sign Up State
  const [emailData, setEmailData] = useState<RegisterFormData>({
    role: 'farmer',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    organizationName: '',
    location: '',
    primaryCrops: '',
    certificationNumber: '',
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string>('');
  const [successNotice, setSuccessNotice] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Resend Countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  // Handle role switch
  const handleRoleChange = (role: 'farmer' | 'distributor' | 'retailer' | 'consumer') => {
    setSelectedRole(role);
    setEmailData(prev => ({ ...prev, role }));
    if (fieldErrors.role) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next.role;
        return next;
      });
    }
  };

  // Update Mobile Data field
  const updateMobileField = (field: keyof typeof mobileData, value: string) => {
    setMobileData(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Update Email Data field
  const updateEmailField = (field: keyof RegisterFormData, value: string) => {
    setEmailData(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Send OTP for Mobile Signup
  const handleSendMobileOtp = async () => {
    setGeneralError('');
    setFieldErrors({});

    if (!mobileData.fullName.trim()) {
      setFieldErrors(prev => ({ ...prev, fullName: 'Please enter your full name first.' }));
      return;
    }

    const rawPhone = mobileData.phoneNumber.replace(/[^0-9]/g, '');
    if (rawPhone.length < 10) {
      setFieldErrors(prev => ({ ...prev, phoneNumber: 'Please enter a valid 10-digit mobile number.' }));
      return;
    }

    const fullPhone = `${mobileData.phoneCountryCode} ${mobileData.phoneNumber.trim()}`;
    setOtpLoading(true);

    try {
      const result = await sendOtp(fullPhone, 'signup');
      if (!result.success) {
        if (result.alreadyRegistered) {
          setGeneralError('An account with this mobile number already exists. Please sign in instead.');
        } else {
          setGeneralError(result.error || 'Failed to dispatch verification code.');
        }
      } else {
        setOtpSent(true);
        setResendCountdown(30);
        const code = result.otp || '123456';
        setDemoOtpHint(code);
        setSuccessNotice(`Verification code sent to ${fullPhone}. Valid for 5 minutes.`);
      }
    } catch (err: any) {
      setGeneralError(err?.message || 'Verification service temporarily unavailable.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Submit Mobile & OTP Sign Up
  const handleMobileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    setSuccessNotice('');

    const errors: Record<string, string> = {};

    if (!mobileData.fullName.trim()) {
      errors.fullName = 'Full name is required.';
    }

    const rawPhone = mobileData.phoneNumber.replace(/[^0-9]/g, '');
    if (rawPhone.length < 10) {
      errors.phoneNumber = 'Valid 10-digit mobile number is required.';
    }

    if (!otpSent) {
      errors.otpCode = 'Please request and enter your OTP verification code.';
    } else if (!mobileData.otpCode.trim() || mobileData.otpCode.trim().length < 6) {
      errors.otpCode = 'Please enter the 6-digit verification code.';
    }

    // Role-specific validation
    if (selectedRole === 'farmer') {
      if (!mobileData.organizationName.trim()) errors.organizationName = 'Farm / Collective name is required.';
      if (!mobileData.location.trim()) errors.location = 'Farm location is required.';
      if (!mobileData.primaryCrops.trim()) errors.primaryCrops = 'Primary crops are required.';
    } else if (selectedRole === 'distributor') {
      if (!mobileData.organizationName.trim()) errors.organizationName = 'Logistics / Fleet company name is required.';
      if (!mobileData.location.trim()) errors.location = 'Business location is required.';
      if (!mobileData.certificationNumber.trim()) errors.certificationNumber = 'License / Registration number is required.';
    } else if (selectedRole === 'retailer') {
      if (!mobileData.organizationName.trim()) errors.organizationName = 'Store / Company name is required.';
      if (!mobileData.location.trim()) errors.location = 'Store location is required.';
      if (!mobileData.certificationNumber.trim()) errors.certificationNumber = 'Business registration number is required.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setGeneralError('Please fill out all required fields.');
      return;
    }

    setIsLoading(true);

    try {
      const payload: RegisterMobileFormData = {
        name: mobileData.fullName.trim(),
        phone: `${mobileData.phoneCountryCode} ${mobileData.phoneNumber.trim()}`,
        otp: mobileData.otpCode.trim(),
        role: selectedRole,
        organizationName: mobileData.organizationName.trim(),
        location: mobileData.location.trim() || 'Maharashtra, India',
        primaryCrops: mobileData.primaryCrops.trim(),
        certificationNumber: mobileData.certificationNumber.trim(),
      };

      const result = await registerWithOtp(payload);
      if (!result.success) {
        setGeneralError(result.error || 'Mobile registration failed. Please check your verification code.');
      }
    } catch (err: any) {
      setGeneralError(err?.message || 'An unexpected error occurred during account creation.');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Email & Password Sign Up
  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGeneralError('');
    setSuccessNotice('');

    const errors: Record<string, string> = {};

    if (!emailData.fullName.trim()) errors.fullName = 'Please enter your full name.';
    if (!emailData.email.trim()) {
      errors.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailData.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!emailData.password) {
      errors.password = 'Please enter your password.';
    } else if (emailData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long.';
    }

    if (!emailData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (emailData.password !== emailData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (selectedRole !== 'consumer' && !emailData.phone?.trim()) {
      errors.phone = 'Please provide a valid contact phone number.';
    }

    // Role-specific validation
    if (selectedRole === 'farmer') {
      if (!emailData.organizationName?.trim()) errors.organizationName = 'Please enter farm / collective name.';
      if (!emailData.location?.trim()) errors.location = 'Please enter farm location.';
      if (!emailData.primaryCrops?.trim()) errors.primaryCrops = 'Please enter primary crops grown.';
    } else if (selectedRole === 'distributor') {
      if (!emailData.organizationName?.trim()) errors.organizationName = 'Please enter company name.';
      if (!emailData.location?.trim()) errors.location = 'Please enter business location.';
      if (!emailData.certificationNumber?.trim()) errors.certificationNumber = 'Please enter license number.';
    } else if (selectedRole === 'retailer') {
      if (!emailData.organizationName?.trim()) errors.organizationName = 'Please enter store / company name.';
      if (!emailData.location?.trim()) errors.location = 'Please enter store location.';
      if (!emailData.certificationNumber?.trim()) errors.certificationNumber = 'Please enter business registration number.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setGeneralError('Please correct the highlighted errors before submitting.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await registerUser({ ...emailData, role: selectedRole });
      if (!result.success) {
        setGeneralError(result.error || 'Registration could not be completed.');
        setIsLoading(false);
        return;
      }
      navigate('/login');
    } catch (err: any) {
      setGeneralError(err?.message || 'An unexpected error occurred during account creation.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
            <UserPlus className="w-6 h-6 text-emerald-700" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Create Your AgriTrace Account
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Join the decentralized agricultural supply-chain and transparent pricing network
          </p>
        </div>

        {/* Method Switcher Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-100/90 rounded-2xl border border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setAuthMethod('otp');
              setGeneralError('');
              setFieldErrors({});
            }}
            className={`py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
              authMethod === 'otp'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Sign Up with Mobile & OTP</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMethod('email');
              setGeneralError('');
              setFieldErrors({});
            }}
            className={`py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
              authMethod === 'email'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Sign Up with Email & Password</span>
          </button>
        </div>

        {/* Error / Success Notifications */}
        {generalError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{generalError}</span>
          </div>
        )}

        {successNotice && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Step 1: Select Stakeholder Role */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
              1. Select Your Stakeholder Role
            </label>
            <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Role-Based Access</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { role: 'farmer' as const, label: 'Farmer', icon: <Sprout className="w-5 h-5 text-emerald-600" />, desc: 'Grow & Mint Batches' },
              { role: 'distributor' as const, label: 'Distributor', icon: <Truck className="w-5 h-5 text-blue-600" />, desc: 'Cold-Chain Logistics' },
              { role: 'retailer' as const, label: 'Retailer', icon: <Store className="w-5 h-5 text-purple-600" />, desc: 'Store & Inventory' },
              { role: 'consumer' as const, label: 'Consumer', icon: <User className="w-5 h-5 text-teal-600" />, desc: 'Verify Produce' },
            ].map((item) => (
              <button
                key={item.role}
                type="button"
                onClick={() => handleRoleChange(item.role)}
                className={`p-3.5 rounded-2xl border text-left transition flex flex-col items-start gap-1 cursor-pointer ${
                  selectedRole === item.role
                    ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                {item.icon}
                <div className="font-bold text-xs text-slate-900 mt-1">{item.label}</div>
                <div className="text-[10px] text-slate-500 leading-tight">{item.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* METHOD 1: MOBILE & OTP REGISTRATION */}
        {authMethod === 'otp' ? (
          <form onSubmit={handleMobileSubmit} className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>2. Mobile Verification ({selectedRole.toUpperCase()})</span>
                <span className="text-[11px] text-slate-500 font-normal">SMS OTP Verification</span>
              </h2>

              {/* Full Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Full Name / Contact Lead *
                  </label>
                  <div className="relative flex items-center">
                    <User className="absolute left-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={mobileData.fullName}
                      onChange={(e) => updateMobileField('fullName', e.target.value)}
                      placeholder={selectedRole === 'farmer' ? 'e.g. Ramesh Patil' : selectedRole === 'distributor' ? 'e.g. Vikram Mehra' : 'Your full name'}
                      className={`w-full pl-10 pr-3 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none transition ${
                        fieldErrors.fullName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 focus:border-emerald-600'
                      }`}
                    />
                  </div>
                  {fieldErrors.fullName && (
                    <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Mobile Phone Number *
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={mobileData.phoneCountryCode}
                      onChange={(e) => updateMobileField('phoneCountryCode', e.target.value)}
                      disabled={otpSent}
                      className="px-2.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-emerald-600 focus:outline-none transition disabled:opacity-60"
                    >
                      <option value="+91">🇮🇳 +91</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+61">🇦🇺 +61</option>
                    </select>
                    <div className="relative flex-1 flex items-center">
                      <Phone className="absolute left-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="tel"
                        disabled={otpSent}
                        value={mobileData.phoneNumber}
                        onChange={(e) => updateMobileField('phoneNumber', e.target.value)}
                        placeholder="98230 45678"
                        className={`w-full pl-10 pr-3 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none transition font-mono ${
                          fieldErrors.phoneNumber ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 focus:border-emerald-600'
                        }`}
                      />
                    </div>
                  </div>
                  {fieldErrors.phoneNumber && (
                    <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.phoneNumber}</p>
                  )}
                </div>
              </div>

              {/* OTP Action Area */}
              {!otpSent ? (
                <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-emerald-900">
                    <div className="font-bold">Verify your mobile to proceed</div>
                    <div className="text-[11px] text-emerald-700">We will dispatch a 6-digit OTP code to confirm your device.</div>
                  </div>
                  <button
                    type="button"
                    onClick={handleSendMobileOtp}
                    disabled={otpLoading || !mobileData.phoneNumber.trim()}
                    className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0 shadow-xs"
                  >
                    {otpLoading ? (
                      <span>Sending OTP...</span>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        <span>Send Verification OTP</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-emerald-50/80 border border-emerald-300 rounded-2xl space-y-3">
                  {/* Demo Code Helper */}
                  {demoOtpHint && (
                    <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-emerald-200 shadow-2xs">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <div className="text-[11px] font-bold text-slate-900">Simulated SMS Delivery</div>
                          <div className="text-xs font-mono font-bold text-emerald-800">Verification Code: {demoOtpHint}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateMobileField('otpCode', demoOtpHint)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition cursor-pointer"
                      >
                        Auto-Fill
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Enter 6-Digit OTP Code *
                      </label>
                      <div className="relative flex items-center">
                        <KeyRound className="absolute left-3.5 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          maxLength={6}
                          value={mobileData.otpCode}
                          onChange={(e) => updateMobileField('otpCode', e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder="••••••"
                          className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-mono tracking-widest text-slate-900 focus:border-emerald-600 focus:outline-none transition"
                        />
                      </div>
                      {fieldErrors.otpCode && (
                        <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.otpCode}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs pb-2">
                      <span className="text-slate-500">
                        {resendCountdown > 0 ? (
                          `Resend code in ${resendCountdown}s`
                        ) : (
                          <button
                            type="button"
                            onClick={handleSendMobileOtp}
                            className="text-emerald-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Resend OTP</span>
                          </button>
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false);
                          updateMobileField('otpCode', '');
                          setDemoOtpHint(null);
                        }}
                        className="text-slate-500 hover:text-slate-800 font-medium hover:underline cursor-pointer"
                      >
                        Edit Number
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Role Specific Details */}
              <div className="pt-2 border-t border-slate-100 space-y-4">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  3. Stakeholder Details ({selectedRole.toUpperCase()})
                </h3>

                {selectedRole === 'farmer' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Farm / Collective Name *</label>
                      <input
                        type="text"
                        value={mobileData.organizationName}
                        onChange={(e) => updateMobileField('organizationName', e.target.value)}
                        placeholder="e.g. Sahyadri Organic Producers"
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none transition"
                      />
                      {fieldErrors.organizationName && <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.organizationName}</p>}
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Farm Location / District *</label>
                      <input
                        type="text"
                        value={mobileData.location}
                        onChange={(e) => updateMobileField('location', e.target.value)}
                        placeholder="e.g. Nashik, Maharashtra"
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none transition"
                      />
                      {fieldErrors.location && <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.location}</p>}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-slate-700 block mb-1">Primary Crops Grown *</label>
                      <input
                        type="text"
                        value={mobileData.primaryCrops}
                        onChange={(e) => updateMobileField('primaryCrops', e.target.value)}
                        placeholder="e.g. Alphonso Mangoes, Organic Tomatoes, Basmati Rice"
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none transition"
                      />
                      {fieldErrors.primaryCrops && <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.primaryCrops}</p>}
                    </div>
                  </div>
                )}

                {selectedRole === 'distributor' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Logistics / Fleet Company Name *</label>
                      <input
                        type="text"
                        value={mobileData.organizationName}
                        onChange={(e) => updateMobileField('organizationName', e.target.value)}
                        placeholder="e.g. Kisan Logistics Cold-Chain Ltd"
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none transition"
                      />
                      {fieldErrors.organizationName && <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.organizationName}</p>}
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Hub Location *</label>
                      <input
                        type="text"
                        value={mobileData.location}
                        onChange={(e) => updateMobileField('location', e.target.value)}
                        placeholder="e.g. Pune Hub, Maharashtra"
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none transition"
                      />
                      {fieldErrors.location && <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.location}</p>}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-slate-700 block mb-1">FSSAI / Transport License Number *</label>
                      <input
                        type="text"
                        value={mobileData.certificationNumber}
                        onChange={(e) => updateMobileField('certificationNumber', e.target.value)}
                        placeholder="e.g. FSSAI-11519018000342"
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none transition font-mono"
                      />
                      {fieldErrors.certificationNumber && <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.certificationNumber}</p>}
                    </div>
                  </div>
                )}

                {selectedRole === 'retailer' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Retail Store / Company Name *</label>
                      <input
                        type="text"
                        value={mobileData.organizationName}
                        onChange={(e) => updateMobileField('organizationName', e.target.value)}
                        placeholder="e.g. FreshRoot Organics"
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none transition"
                      />
                      {fieldErrors.organizationName && <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.organizationName}</p>}
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Store Location / City *</label>
                      <input
                        type="text"
                        value={mobileData.location}
                        onChange={(e) => updateMobileField('location', e.target.value)}
                        placeholder="e.g. Bandra West, Mumbai"
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none transition"
                      />
                      {fieldErrors.location && <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.location}</p>}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-slate-700 block mb-1">GSTIN / Business Registration Number *</label>
                      <input
                        type="text"
                        value={mobileData.certificationNumber}
                        onChange={(e) => updateMobileField('certificationNumber', e.target.value)}
                        placeholder="e.g. 27AABCF1234F1Z5"
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none transition font-mono"
                      />
                      {fieldErrors.certificationNumber && <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.certificationNumber}</p>}
                    </div>
                  </div>
                )}

                {selectedRole === 'consumer' && (
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">City / Region (Optional)</label>
                    <input
                      type="text"
                      value={mobileData.location}
                      onChange={(e) => updateMobileField('location', e.target.value)}
                      placeholder="e.g. Mumbai, Bengaluru"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none transition"
                    />
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !otpSent || mobileData.otpCode.length < 6}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Verifying & Creating Account...</span>
                ) : (
                  <>
                    <span>Verify Mobile & Open Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* METHOD 2: STANDARD EMAIL & PASSWORD REGISTRATION */
          <form onSubmit={handleEmailSubmit} noValidate className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                2. Enter Credentials ({selectedRole.toUpperCase()})
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Full Name / Contact Lead *
                  </label>
                  <div className="relative flex items-center">
                    <User className="absolute left-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={emailData.fullName}
                      onChange={(e) => updateEmailField('fullName', e.target.value)}
                      placeholder={selectedRole === 'farmer' ? 'e.g. Ramesh Patil' : 'Your full name'}
                      className={`w-full pl-10 pr-3 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none transition ${
                        fieldErrors.fullName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 focus:border-emerald-600'
                      }`}
                    />
                  </div>
                  {fieldErrors.fullName && <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.fullName}</p>}
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Email Address *
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={emailData.email}
                      onChange={(e) => updateEmailField('email', e.target.value)}
                      placeholder="name@example.com"
                      className={`w-full pl-10 pr-3 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none transition ${
                        fieldErrors.email ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 focus:border-emerald-600'
                      }`}
                    />
                  </div>
                  {fieldErrors.email && <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.email}</p>}
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Password *
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      value={emailData.password}
                      onChange={(e) => updateEmailField('password', e.target.value)}
                      placeholder="••••••••••••"
                      className={`w-full pl-10 pr-3 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none transition font-mono ${
                        fieldErrors.password ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 focus:border-emerald-600'
                      }`}
                    />
                  </div>
                  {fieldErrors.password && <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.password}</p>}
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      value={emailData.confirmPassword}
                      onChange={(e) => updateEmailField('confirmPassword', e.target.value)}
                      placeholder="••••••••••••"
                      className={`w-full pl-10 pr-3 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none transition font-mono ${
                        fieldErrors.confirmPassword ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 focus:border-emerald-600'
                      }`}
                    />
                  </div>
                  {fieldErrors.confirmPassword && <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.confirmPassword}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Contact Phone Number {selectedRole !== 'consumer' && '*'}
                  </label>
                  <div className="relative flex items-center">
                    <Phone className="absolute left-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      value={emailData.phone || ''}
                      onChange={(e) => updateEmailField('phone', e.target.value)}
                      placeholder="+91 98230 45678"
                      className={`w-full pl-10 pr-3 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none transition font-mono ${
                        fieldErrors.phone ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 focus:border-emerald-600'
                      }`}
                    />
                  </div>
                  {fieldErrors.phone && <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.phone}</p>}
                </div>
              </div>

              {/* Role Details */}
              {selectedRole === 'farmer' && (
                <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Farm / Collective Name *</label>
                    <input
                      type="text"
                      value={emailData.organizationName || ''}
                      onChange={(e) => updateEmailField('organizationName', e.target.value)}
                      placeholder="e.g. Sahyadri Organic Collective"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none transition"
                    />
                    {fieldErrors.organizationName && <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.organizationName}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Farm Location / District *</label>
                    <input
                      type="text"
                      value={emailData.location || ''}
                      onChange={(e) => updateEmailField('location', e.target.value)}
                      placeholder="e.g. Nashik, Maharashtra"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none transition"
                    />
                    {fieldErrors.location && <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.location}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 block mb-1">Primary Crops Grown *</label>
                    <input
                      type="text"
                      value={emailData.primaryCrops || ''}
                      onChange={(e) => updateEmailField('primaryCrops', e.target.value)}
                      placeholder="e.g. Alphonso Mangoes, Organic Tomatoes"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none transition"
                    />
                    {fieldErrors.primaryCrops && <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.primaryCrops}</p>}
                  </div>
                </div>
              )}

              {selectedRole === 'distributor' && (
                <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Company Name *</label>
                    <input
                      type="text"
                      value={emailData.organizationName || ''}
                      onChange={(e) => updateEmailField('organizationName', e.target.value)}
                      placeholder="e.g. Kisan Logistics Cold-Chain"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none transition"
                    />
                    {fieldErrors.organizationName && <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.organizationName}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Hub Location *</label>
                    <input
                      type="text"
                      value={emailData.location || ''}
                      onChange={(e) => updateEmailField('location', e.target.value)}
                      placeholder="e.g. Pune Hub, Maharashtra"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none transition"
                    />
                    {fieldErrors.location && <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.location}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 block mb-1">FSSAI / Registration Number *</label>
                    <input
                      type="text"
                      value={emailData.certificationNumber || ''}
                      onChange={(e) => updateEmailField('certificationNumber', e.target.value)}
                      placeholder="e.g. FSSAI-11519018000342"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none transition font-mono"
                    />
                    {fieldErrors.certificationNumber && <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.certificationNumber}</p>}
                  </div>
                </div>
              )}

              {selectedRole === 'retailer' && (
                <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Store / Company Name *</label>
                    <input
                      type="text"
                      value={emailData.organizationName || ''}
                      onChange={(e) => updateEmailField('organizationName', e.target.value)}
                      placeholder="e.g. FreshRoot Organics"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none transition"
                    />
                    {fieldErrors.organizationName && <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.organizationName}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Store Location *</label>
                    <input
                      type="text"
                      value={emailData.location || ''}
                      onChange={(e) => updateEmailField('location', e.target.value)}
                      placeholder="e.g. Bandra West, Mumbai"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none transition"
                    />
                    {fieldErrors.location && <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.location}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 block mb-1">GSTIN / Registration Number *</label>
                    <input
                      type="text"
                      value={emailData.certificationNumber || ''}
                      onChange={(e) => updateEmailField('certificationNumber', e.target.value)}
                      placeholder="e.g. 27AABCF1234F1Z5"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none transition font-mono"
                    />
                    {fieldErrors.certificationNumber && <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.certificationNumber}</p>}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>Complete Registration & Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Existing Account Footer */}
        <div className="text-center pt-4 border-t border-slate-100 text-xs text-slate-500">
          <span>Already have an authenticated account? </span>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
          >
            Sign In Here
          </button>
        </div>

      </div>
    </div>
  );
};

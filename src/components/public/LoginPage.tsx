import React, { useState, useEffect } from 'react';
import { 
  LogIn, 
  Lock, 
  Mail, 
  Phone,
  ArrowRight, 
  AlertCircle,
  CheckCircle2,
  KeyRound,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LoginPage: React.FC = () => {
  const { loginUser, sendOtp, loginWithOtp, navigate, authNotice, setAuthNotice, isAuthenticated, currentRole } = useApp();

  // Automatic redirect if user is already authenticated or just logged in
  useEffect(() => {
    if (isAuthenticated && currentRole && currentRole !== 'public') {
      navigate(`/${currentRole}/dashboard`);
    }
  }, [isAuthenticated, currentRole, navigate]);
  
  // Tab: 'otp' | 'password'
  const [authMethod, setAuthMethod] = useState<'otp' | 'password'>('otp');

  // Mobile OTP States
  const [phoneCountryCode, setPhoneCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [demoOtpHint, setDemoOtpHint] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Email & Password States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  
  // Feedback Messages
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [notRegisteredNotice, setNotRegisteredNotice] = useState(false);

  // Demo accounts for email login
  const demoEmailAccounts = [
    { label: 'Farmer', email: 'ramesh.farmer@agritrace.org', password: 'password123' },
    { label: 'Distributor', email: 'vikram.logistics@kisanlogix.com', password: 'password123' },
    { label: 'Retailer', email: 'ananya@freshrootorganics.in', password: 'password123' },
    { label: 'Consumer', email: 'priya.nair@gmail.com', password: 'password123' },
    { label: 'Admin', email: 'admin@agritrace.org', password: 'password123' },
  ];

  // Demo accounts for mobile OTP login
  const demoMobileAccounts = [
    { label: 'Farmer', phone: '9823045678', display: '+91 98230 45678', name: 'Ramesh Patil' },
    { label: 'Distributor', phone: '9811234567', display: '+91 98112 34567', name: 'Vikram Mehra' },
    { label: 'Retailer', phone: '9845012389', display: '+91 98450 12389', name: 'Ananya Sharma' },
    { label: 'Consumer', phone: '9741099881', display: '+91 97410 99881', name: 'Priya Nair' },
    { label: 'Admin', phone: '9422011223', display: '+91 94220 11223', name: 'System Admin' },
  ];

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  // Request OTP Handler
  const handleSendOtp = async (overridePhone?: string) => {
    const rawNumber = overridePhone || phoneNumber;
    setErrorMessage('');
    setInfoMessage('');
    setNotRegisteredNotice(false);

    const digitsOnly = rawNumber.replace(/[^0-9]/g, '');
    if (digitsOnly.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    const fullPhone = `${phoneCountryCode} ${rawNumber.trim()}`;
    setOtpLoading(true);

    try {
      const result = await sendOtp(fullPhone, 'login');
      if (!result.success) {
        if (result.notRegistered) {
          setNotRegisteredNotice(true);
          setErrorMessage('No AgriTrace account is linked to this mobile number.');
        } else {
          setErrorMessage(result.error || 'Failed to dispatch OTP. Please check the number.');
        }
        setOtpSent(false);
      } else {
        setOtpSent(true);
        setResendCountdown(30);
        const code = result.otp || '123456';
        setDemoOtpHint(code);
        setInfoMessage(`Verification code sent to ${fullPhone}. Valid for 5 minutes.`);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Verification service temporarily unavailable.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Verify OTP & Sign In Handler
  const handleVerifyOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!otpCode.trim()) {
      setErrorMessage('Please enter the 6-digit OTP verification code.');
      return;
    }

    const fullPhone = `${phoneCountryCode} ${phoneNumber.trim()}`;
    setIsLoading(true);

    try {
      const result = await loginWithOtp(fullPhone, otpCode.trim());
      if (!result.success) {
        setErrorMessage(result.error || 'Invalid or expired OTP code. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to authenticate via mobile OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  // Standard Email/Password Login Handler
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your registered email address.');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Please enter your account password.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await loginUser(email, password);
      if (result && !result.success) {
        setErrorMessage(result.error || 'Invalid credentials or user not found.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Authentication service temporarily unavailable.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 space-y-6">
      {/* Auth Guard Notice */}
      {authNotice && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{authNotice}</span>
          </div>
          <button 
            type="button"
            onClick={() => setAuthNotice(null)}
            className="text-amber-700 hover:text-amber-900 font-bold text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Login Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
            {authMethod === 'otp' ? (
              <Phone className="w-6 h-6 text-emerald-700" />
            ) : (
              <LogIn className="w-6 h-6 text-emerald-700" />
            )}
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Sign In to AgriTrace
          </h1>
          <p className="text-xs text-slate-500">
            Agricultural Provenance & Value-Chain Platform
          </p>
        </div>

        {/* Auth Method Switcher Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-100/90 rounded-2xl border border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setAuthMethod('otp');
              setErrorMessage('');
              setInfoMessage('');
              setNotRegisteredNotice(false);
            }}
            className={`py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
              authMethod === 'otp'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Mobile & OTP</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMethod('password');
              setErrorMessage('');
              setInfoMessage('');
              setNotRegisteredNotice(false);
            }}
            className={`py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
              authMethod === 'password'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email & Password</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            {notRegisteredNotice && (
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Sign Up with this Number</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Info Alert */}
        {infoMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* METHOD 1: MOBILE & OTP LOGIN */}
        {authMethod === 'otp' ? (
          <div className="space-y-5">
            {/* Quick Demo Mobile Numbers */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>Quick-Fill Seeded Accounts</span>
                <span className="text-[10px] text-emerald-700 font-normal">Registered Numbers</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {demoMobileAccounts.map((acc) => (
                  <button
                    key={acc.phone}
                    type="button"
                    onClick={() => {
                      setPhoneNumber(acc.phone);
                      setOtpSent(false);
                      setOtpCode('');
                      setErrorMessage('');
                      setInfoMessage(`Selected ${acc.label} (${acc.name} - ${acc.display})`);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium text-left border transition cursor-pointer shadow-2xs ${
                      phoneNumber === acc.phone
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold ring-1 ring-emerald-400'
                        : 'bg-white hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="font-bold text-[11px]">{acc.label}</div>
                    <div className="text-[10px] text-slate-500 font-mono truncate">{acc.phone}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Form */}
            <form onSubmit={otpSent ? handleVerifyOtpLogin : (e) => { e.preventDefault(); handleSendOtp(); }} className="space-y-4">
              {/* Phone Input */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Registered Mobile Number
                </label>
                <div className="flex gap-2">
                  <select
                    value={phoneCountryCode}
                    onChange={(e) => setPhoneCountryCode(e.target.value)}
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
                      required
                      disabled={otpSent}
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="98230 45678"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-600 focus:outline-none transition font-mono disabled:opacity-75"
                    />
                  </div>
                </div>
                {otpSent && (
                  <div className="mt-1.5 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">
                      Code sent to <span className="font-semibold text-slate-800">{phoneCountryCode} {phoneNumber}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setOtpCode('');
                        setDemoOtpHint(null);
                        setInfoMessage('You can change your mobile number and request a new code.');
                      }}
                      className="text-emerald-700 font-bold hover:underline cursor-pointer"
                    >
                      Change Number
                    </button>
                  </div>
                )}
              </div>

              {/* Step 1: Send OTP Button (if not sent) */}
              {!otpSent ? (
                <button
                  type="submit"
                  disabled={otpLoading || !phoneNumber.trim()}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {otpLoading ? (
                    <span>Sending Verification Code...</span>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Request One-Time Password (OTP)</span>
                    </>
                  )}
                </button>
              ) : (
                /* Step 2: OTP Verification Field & Demo Helper */
                <div className="space-y-4 pt-1">
                  {/* Demo Helper Banner with 1-click Auto Fill */}
                  {demoOtpHint && (
                    <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between gap-2 shadow-2xs">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <div className="text-[11px] font-bold text-emerald-900">
                            Simulated SMS Received
                          </div>
                          <div className="text-xs font-mono font-extrabold text-emerald-800 tracking-wider">
                            Code: {demoOtpHint}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpCode(demoOtpHint);
                          setErrorMessage('');
                        }}
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition cursor-pointer shadow-2xs shrink-0"
                      >
                        Auto-Fill
                      </button>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Enter 6-Digit OTP Code
                    </label>
                    <div className="relative flex items-center">
                      <KeyRound className="absolute left-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        maxLength={6}
                        required
                        autoFocus
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="••••••"
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono tracking-widest text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-600 focus:outline-none transition"
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                      <span>Standard test OTP: <strong className="font-mono text-slate-700">123456</strong></span>
                      {resendCountdown > 0 ? (
                        <span>Resend in {resendCountdown}s</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSendOtp()}
                          className="text-emerald-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Resend OTP</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || otpCode.length < 6}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span>Verifying & Signing In...</span>
                    ) : (
                      <>
                        <span>Verify & Sign In</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>
        ) : (
          /* METHOD 2: STANDARD EMAIL & PASSWORD LOGIN */
          <div className="space-y-5">
            {/* Demo Accounts Quick-Fill */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Quick Fill Demo Email Credentials
              </div>
              <div className="flex flex-wrap gap-1.5">
                {demoEmailAccounts.map((acc) => (
                  <button
                    key={acc.label}
                    type="button"
                    onClick={() => {
                      setEmail(acc.email);
                      setPassword(acc.password);
                      setErrorMessage('');
                      setInfoMessage(`Filled ${acc.label} credentials (${acc.email})`);
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium transition cursor-pointer shadow-2xs"
                  >
                    {acc.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-600 focus:outline-none transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setInfoMessage('For demo accounts, use password "password123".')}
                    className="text-[11px] text-emerald-700 hover:underline font-medium cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-600 focus:outline-none transition font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="text-xs text-slate-600">Remember Me</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In with Password</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Consumer Verification Note */}
        <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-[11px] text-emerald-900 flex items-center justify-between gap-2">
          <span>Are you a consumer verifying produce?</span>
          <button
            type="button"
            onClick={() => navigate('/trace-products')}
            className="font-bold text-emerald-800 hover:underline shrink-0 cursor-pointer"
          >
            Trace Produce →
          </button>
        </div>

        {/* Create Account Link */}
        <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
          <span>New to AgriTrace? </span>
          <button
            type="button"
            onClick={() => navigate('/signup')}
            className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
          >
            Create Your Account
          </button>
        </div>
      </div>
    </div>
  );
};

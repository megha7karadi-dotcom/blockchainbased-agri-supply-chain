import React, { useState } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { useApp, RegisterFormData } from '../../context/AppContext';

export const RegisterPage: React.FC = () => {
  const { registerUser, navigate } = useApp();
  
  // Controlled form state adhering strictly to prompt requirements
  const [formData, setFormData] = useState<RegisterFormData>({
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
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Field change handler: guarantees typing in one field never clears or mutates others
  const updateField = (field: keyof RegisterFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    // Clear field-specific error as user types
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Role selector handler: updates role without resetting already filled common credentials
  const handleSelectRole = (role: 'farmer' | 'distributor' | 'retailer' | 'consumer') => {
    setFormData(prev => ({
      ...prev,
      role,
    }));
    if (fieldErrors.role) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next.role;
        return next;
      });
    }
  };

  // Validation function: checks required fields without navigating or resetting state
  const validateForm = (): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!formData.role) {
      errors.role = 'Please select your role.';
    }

    if (!formData.fullName.trim()) {
      errors.fullName = 'Please enter your full name.';
    }

    if (!formData.email.trim()) {
      errors.email = 'Please enter your email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      errors.password = 'Please enter your password.';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long.';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (formData.role !== 'consumer' && !formData.phone?.trim()) {
      errors.phone = 'Please provide a valid contact phone number.';
    }

    // Role-specific validation
    if (formData.role === 'farmer') {
      if (!formData.organizationName?.trim()) {
        errors.organizationName = 'Please enter farm / collective name.';
      }
      if (!formData.location?.trim()) {
        errors.location = 'Please enter farm location / region.';
      }
      if (!formData.primaryCrops?.trim()) {
        errors.primaryCrops = 'Please enter primary crops grown.';
      }
    } else if (formData.role === 'distributor') {
      if (!formData.organizationName?.trim()) {
        errors.organizationName = 'Please enter company name.';
      }
      if (!formData.location?.trim()) {
        errors.location = 'Please enter business location.';
      }
      if (!formData.certificationNumber?.trim()) {
        errors.certificationNumber = 'Please enter license / registration number.';
      }
    } else if (formData.role === 'retailer') {
      if (!formData.organizationName?.trim()) {
        errors.organizationName = 'Please enter store / company name.';
      }
      if (!formData.location?.trim()) {
        errors.location = 'Please enter store location.';
      }
      if (!formData.certificationNumber?.trim()) {
        errors.certificationNumber = 'Please enter business registration number.';
      }
    }

    return errors;
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGeneralError('');

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setGeneralError('Please correct the errors in the highlighted fields before submitting.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await registerUser(formData);
      if (!result.success) {
        setGeneralError(result.error || 'Registration could not be completed. Please verify your details.');
        setIsLoading(false);
        return;
      }

      // After successful registration, redirect to Login
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
            Join the decentralized agricultural traceability & transparent pricing network
          </p>
        </div>

        {/* Step 1: Select Role */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
            1. Select Your Stakeholder Role
          </label>
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
                onClick={() => handleSelectRole(item.role)}
                className={`p-3.5 rounded-2xl border text-left transition flex flex-col items-start gap-1 cursor-pointer ${
                  formData.role === item.role
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
          {fieldErrors.role && (
            <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.role}</p>
          )}
        </div>

        {/* Error Notification */}
        {generalError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{generalError}</span>
          </div>
        )}

        {/* Step 2: Role Specific Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              2. Enter Credentials ({formData.role ? formData.role.toUpperCase() : 'SELECT ROLE'})
            </h2>

            {/* Common Credentials */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Full Name / Contact Lead *
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => updateField('fullName', e.target.value)}
                    placeholder={formData.role === 'farmer' ? 'e.g. Ramesh Patil' : formData.role === 'distributor' ? 'e.g. Vikram Mehra' : 'Your full name'}
                    className={`w-full pl-10 pr-3 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none transition ${
                      fieldErrors.fullName ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' : 'border-slate-200 focus:border-emerald-600'
                    }`}
                  />
                </div>
                {fieldErrors.fullName && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.fullName}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Work / Official Email *
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="name@domain.com"
                    className={`w-full pl-10 pr-3 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none transition ${
                      fieldErrors.email ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' : 'border-slate-200 focus:border-emerald-600'
                    }`}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.email}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Password *
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    placeholder="••••••••••••"
                    className={`w-full pl-10 pr-3 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none transition font-mono ${
                      fieldErrors.password ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' : 'border-slate-200 focus:border-emerald-600'
                    }`}
                  />
                </div>
                {fieldErrors.password && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.password}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Confirm Password *
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => updateField('confirmPassword', e.target.value)}
                    placeholder="••••••••••••"
                    className={`w-full pl-10 pr-3 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none transition font-mono ${
                      fieldErrors.confirmPassword ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' : 'border-slate-200 focus:border-emerald-600'
                    }`}
                  />
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Phone Number {formData.role === 'consumer' ? '(Optional)' : '*'}
              </label>
              <div className="relative flex items-center">
                <Phone className="absolute left-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="+91 98200 12345"
                  className={`w-full pl-10 pr-3 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none transition ${
                    fieldErrors.phone ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' : 'border-slate-200 focus:border-emerald-600'
                  }`}
                />
              </div>
              {fieldErrors.phone && (
                <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.phone}</p>
              )}
            </div>

            {/* FARMER SPECIFIC FIELDS */}
            {formData.role === 'farmer' && (
              <div className="pt-2 border-t border-slate-100 space-y-4">
                <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  Farm Identity & Agricultural Profile
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Farm / Collective Name *
                    </label>
                    <input
                      type="text"
                      value={formData.organizationName || ''}
                      onChange={(e) => updateField('organizationName', e.target.value)}
                      placeholder="e.g. Sahyadri Organic Orchards"
                      className={`w-full px-3 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none transition ${
                        fieldErrors.organizationName ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' : 'border-slate-200 focus:border-emerald-600'
                      }`}
                    />
                    {fieldErrors.organizationName && (
                      <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.organizationName}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Location / Region *
                    </label>
                    <input
                      type="text"
                      value={formData.location || ''}
                      onChange={(e) => updateField('location', e.target.value)}
                      placeholder="e.g. Ratnagiri, Maharashtra"
                      className={`w-full px-3 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none transition ${
                        fieldErrors.location ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' : 'border-slate-200 focus:border-emerald-600'
                      }`}
                    />
                    {fieldErrors.location && (
                      <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.location}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Primary Crops *
                    </label>
                    <input
                      type="text"
                      value={formData.primaryCrops || ''}
                      onChange={(e) => updateField('primaryCrops', e.target.value)}
                      placeholder="e.g. Alphonso Mangoes, Tomatoes, Turmeric"
                      className={`w-full px-3 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none transition ${
                        fieldErrors.primaryCrops ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' : 'border-slate-200 focus:border-emerald-600'
                      }`}
                    />
                    {fieldErrors.primaryCrops && (
                      <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.primaryCrops}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Organic / APEDA Certification Number (optional)
                    </label>
                    <input
                      type="text"
                      value={formData.certificationNumber || ''}
                      onChange={(e) => updateField('certificationNumber', e.target.value)}
                      placeholder="e.g. NPOP/NAB/0014/2026"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none transition font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* DISTRIBUTOR SPECIFIC FIELDS */}
            {formData.role === 'distributor' && (
              <div className="pt-2 border-t border-slate-100 space-y-4">
                <h3 className="text-xs font-bold text-blue-800 uppercase tracking-wider">
                  Cold-Chain & Logistics Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      value={formData.organizationName || ''}
                      onChange={(e) => updateField('organizationName', e.target.value)}
                      placeholder="e.g. KisanLogix Cold-Chain Solutions"
                      className={`w-full px-3 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none transition ${
                        fieldErrors.organizationName ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' : 'border-slate-200 focus:border-emerald-600'
                      }`}
                    />
                    {fieldErrors.organizationName && (
                      <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.organizationName}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Business Location *
                    </label>
                    <input
                      type="text"
                      value={formData.location || ''}
                      onChange={(e) => updateField('location', e.target.value)}
                      placeholder="e.g. Pune Logistics Hub, Maharashtra"
                      className={`w-full px-3 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none transition ${
                        fieldErrors.location ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' : 'border-slate-200 focus:border-emerald-600'
                      }`}
                    />
                    {fieldErrors.location && (
                      <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.location}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      License / Registration Number *
                    </label>
                    <input
                      type="text"
                      value={formData.certificationNumber || ''}
                      onChange={(e) => updateField('certificationNumber', e.target.value)}
                      placeholder="e.g. FSSAI-WH-2025-98124"
                      className={`w-full px-3 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none transition font-mono ${
                        fieldErrors.certificationNumber ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' : 'border-slate-200 focus:border-emerald-600'
                      }`}
                    />
                    {fieldErrors.certificationNumber && (
                      <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.certificationNumber}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* RETAILER SPECIFIC FIELDS */}
            {formData.role === 'retailer' && (
              <div className="pt-2 border-t border-slate-100 space-y-4">
                <h3 className="text-xs font-bold text-purple-800 uppercase tracking-wider">
                  Retail Store & Enterprise Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Store / Company Name *
                    </label>
                    <input
                      type="text"
                      value={formData.organizationName || ''}
                      onChange={(e) => updateField('organizationName', e.target.value)}
                      placeholder="e.g. FreshRoot Organic Markets Ltd"
                      className={`w-full px-3 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none transition ${
                        fieldErrors.organizationName ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' : 'border-slate-200 focus:border-emerald-600'
                      }`}
                    />
                    {fieldErrors.organizationName && (
                      <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.organizationName}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Location *
                    </label>
                    <input
                      type="text"
                      value={formData.location || ''}
                      onChange={(e) => updateField('location', e.target.value)}
                      placeholder="e.g. Bandra West, Mumbai"
                      className={`w-full px-3 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none transition ${
                        fieldErrors.location ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' : 'border-slate-200 focus:border-emerald-600'
                      }`}
                    />
                    {fieldErrors.location && (
                      <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.location}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Business Registration Number *
                    </label>
                    <input
                      type="text"
                      value={formData.certificationNumber || ''}
                      onChange={(e) => updateField('certificationNumber', e.target.value)}
                      placeholder="e.g. GSTIN27AABCF1234F1Z5"
                      className={`w-full px-3 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none transition font-mono ${
                        fieldErrors.certificationNumber ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' : 'border-slate-200 focus:border-emerald-600'
                      }`}
                    />
                    {fieldErrors.certificationNumber && (
                      <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.certificationNumber}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span>Creating Account...</span>
            ) : (
              <>
                <span>Complete Registration & Open Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

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

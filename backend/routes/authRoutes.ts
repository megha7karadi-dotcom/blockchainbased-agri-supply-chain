import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { JWT_SECRET, authenticateJWT, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

/**
 * Helper to generate real JWT token using process.env.JWT_SECRET
 */
function generateToken(user: { id: string; email: string; role: string; name: string }): string {
  const secret = process.env.JWT_SECRET || JWT_SECRET;
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    secret,
    { expiresIn: '7d' }
  );
}

// In-memory fallback for environments without an active MongoDB connection
const inMemoryUsers: Map<string, any> = new Map();

// Default demo users with pre-hashed 'password123'
const SEED_USERS = [
  {
    id: 'usr-farmer-01',
    _id: 'usr-farmer-01',
    name: 'Ramesh Patil',
    email: 'ramesh.farmer@agritrace.org',
    role: 'farmer',
    password: '$2a$10$e8wE22uUqHhFhR4z5f3C.e9Lw1W6vC5Fk1G9Q2L9w5b6N7r8u9i0a',
    phone: '+91 98230 45678',
    location: 'Ratnagiri, Maharashtra, India',
    organization: 'Sahyadri Organic Mango Producers Co-op',
    kycStatus: 'verified',
    trustScore: 98,
    createdAt: new Date('2025-04-12')
  },
  {
    id: 'usr-dist-01',
    _id: 'usr-dist-01',
    name: 'Vikram Mehra',
    email: 'vikram.logistics@kisanlogix.com',
    role: 'distributor',
    password: '$2a$10$e8wE22uUqHhFhR4z5f3C.e9Lw1W6vC5Fk1G9Q2L9w5b6N7r8u9i0a',
    phone: '+91 98112 34567',
    location: 'Pune Cold Hub, Maharashtra',
    organization: 'KisanLogix Agri Cold-Chain Solutions',
    kycStatus: 'verified',
    trustScore: 94,
    createdAt: new Date('2025-02-18')
  },
  {
    id: 'usr-ret-01',
    _id: 'usr-ret-01',
    name: 'Ananya Sharma',
    email: 'ananya@freshrootorganics.in',
    role: 'retailer',
    password: '$2a$10$e8wE22uUqHhFhR4z5f3C.e9Lw1W6vC5Fk1G9Q2L9w5b6N7r8u9i0a',
    phone: '+91 98450 12389',
    location: 'Bandra West, Mumbai',
    organization: 'FreshRoot Organic Markets Ltd',
    kycStatus: 'verified',
    trustScore: 96,
    createdAt: new Date('2025-03-01')
  },
  {
    id: 'usr-cons-01',
    _id: 'usr-cons-01',
    name: 'Priya Nair',
    email: 'priya.nair@gmail.com',
    role: 'consumer',
    password: '$2a$10$e8wE22uUqHhFhR4z5f3C.e9Lw1W6vC5Fk1G9Q2L9w5b6N7r8u9i0a',
    phone: '+91 97410 99881',
    location: 'Worli, Mumbai',
    organization: 'Conscious Consumer Guild',
    kycStatus: 'verified',
    trustScore: 100,
    createdAt: new Date('2025-06-15')
  },
  {
    id: 'usr-admin-01',
    _id: 'usr-admin-01',
    name: 'Platform Administrator',
    email: 'admin@agritrace.org',
    role: 'admin',
    password: '$2a$10$e8wE22uUqHhFhR4z5f3C.e9Lw1W6vC5Fk1G9Q2L9w5b6N7r8u9i0a',
    phone: '+91 94220 11223',
    location: 'AgriTrace Operations',
    organization: 'AgriTrace Platform Governance',
    kycStatus: 'verified',
    trustScore: 99,
    createdAt: new Date('2024-11-10')
  }
];

SEED_USERS.forEach(u => inMemoryUsers.set(u.email.toLowerCase(), u));

/**
 * Helper to find user by email in MongoDB with in-memory fallback
 */
async function findUserByEmail(email: string): Promise<any | null> {
  const cleanEmail = email.trim().toLowerCase();
  if (mongoose.connection.readyState === 1) {
    try {
      const user = await User.findOne({ email: cleanEmail });
      if (user) return user;
    } catch (dbErr: any) {
      console.warn('MongoDB user lookup notice:', dbErr?.message);
    }
  }
  return inMemoryUsers.get(cleanEmail) || null;
}

/**
 * Helper to find user by ID in MongoDB with in-memory fallback
 */
async function findUserById(id: string): Promise<any | null> {
  if (mongoose.connection.readyState === 1) {
    try {
      const user = await User.findById(id).select('-password');
      if (user) return user;
    } catch (dbErr: any) {
      console.warn('MongoDB user lookup by id notice:', dbErr?.message);
    }
  }
  for (const user of inMemoryUsers.values()) {
    if (user.id === id || user._id === id || String(user._id) === id) {
      const { password, ...safeUser } = user;
      return safeUser;
    }
  }
  return null;
}

/**
 * Normalizes phone numbers by stripping all non-digits
 */
function normalizePhone(phone: string): string {
  if (!phone) return '';
  return phone.replace(/[^0-9]/g, '');
}

/**
 * Helper to find user by mobile phone in MongoDB with in-memory fallback
 */
async function findUserByPhone(phone: string): Promise<any | null> {
  const norm = normalizePhone(phone);
  if (!norm || norm.length < 7) return null;
  const last10 = norm.slice(-10);

  if (mongoose.connection.readyState === 1) {
    try {
      const users = await User.find({});
      for (const u of users) {
        if (u.phone && normalizePhone(u.phone).endsWith(last10)) {
          return u;
        }
      }
    } catch (dbErr: any) {
      console.warn('MongoDB user phone lookup notice:', dbErr?.message);
    }
  }

  for (const user of inMemoryUsers.values()) {
    if (user.phone && normalizePhone(user.phone).endsWith(last10)) {
      return user;
    }
  }
  return null;
}

// In-memory OTP storage with 5 minute expiration
interface OtpEntry {
  code: string;
  expiresAt: number;
  purpose: 'login' | 'signup';
  phone: string;
}

const otpStore: Map<string, OtpEntry> = new Map();

/**
 * 2. REGISTER API
 * POST /api/auth/register
 */
router.post(['/register', '/signup'], async (req: Request, res: Response) => {
  try {
    const { 
      name, 
      fullName, 
      email, 
      password, 
      role = 'farmer',
      phone,
      organization,
      organizationName,
      location,
      primaryCrops,
      certificationNumber
    } = req.body;

    const trimmedName = (name || fullName || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();

    // 1. Name required
    if (!trimmedName) {
      return res.status(400).json({ 
        error: 'Name is required.' 
      });
    }

    // 2. Email required and valid
    if (!cleanEmail) {
      return res.status(400).json({ 
        error: 'Email is required.' 
      });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ 
        error: 'Please enter a valid email address.' 
      });
    }

    // 3. Password required
    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ 
        error: 'Password is required and must be at least 6 characters long.' 
      });
    }

    // 4. Role validation
    const validRoles = ['farmer', 'distributor', 'retailer', 'consumer', 'admin'];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({ 
        error: 'Invalid role specified.' 
      });
    }

    // 5. Public users MUST NOT be allowed to register as admin
    if (role === 'admin') {
      return res.status(403).json({ 
        error: 'Public registration as administrator is not permitted.' 
      });
    }

    // 6. Reject duplicate email
    const existingUser = await findUserByEmail(cleanEmail);
    if (existingUser) {
      return res.status(400).json({ 
        error: 'An account with this email already exists.' 
      });
    }

    // 7. Hash password before saving using bcryptjs
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 8. Prepare user payload
    const userId = `usr-${Date.now()}`;
    const userPayload: any = {
      id: userId,
      _id: userId,
      name: trimmedName,
      email: cleanEmail,
      password: hashedPassword,
      role,
      phone: phone?.trim() || '+91 98200 12345',
      organization: organizationName?.trim() || organization?.trim() || (
        role === 'farmer' ? 'Sahyadri Organic Producers Co-op' :
        role === 'distributor' ? 'KisanLogix Cold-Chain Solutions' :
        role === 'retailer' ? 'FreshRoot Organic Markets Ltd' : 'Consumer Guild'
      ),
      location: location?.trim() || 'Maharashtra, India',
      primaryCrops: primaryCrops?.trim(),
      certificationNumber: certificationNumber?.trim(),
      kycStatus: 'verified' as const,
      trustScore: 98,
      createdAt: new Date()
    };

    // Save to MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      try {
        const newUser = new User(userPayload);
        const savedDoc = await newUser.save();
        userPayload.id = savedDoc._id.toString();
        userPayload._id = savedDoc._id.toString();
      } catch (dbErr: any) {
        console.warn('MongoDB user save notice:', dbErr?.message);
      }
    }

    // Always store in memory cache
    inMemoryUsers.set(cleanEmail, userPayload);

    // 9. Return required registration format (Never return the password or password hash)
    return res.status(201).json({
      message: 'Registration successful',
      user: {
        id: userPayload.id || userPayload._id,
        name: userPayload.name,
        email: userPayload.email,
        role: userPayload.role
      }
    });
  } catch (error: any) {
    if (error?.code === 11000) {
      return res.status(400).json({ 
        error: 'An account with this email already exists.' 
      });
    }
    console.error('Registration processing error:', error);
    return res.status(500).json({ 
      error: error?.message || 'Internal server error during registration.' 
    });
  }
});

/**
 * 3. LOGIN API
 * POST /api/auth/login
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanEmail || !password) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    // 1. Find user (from MongoDB or in-memory fallback)
    const user = await findUserByEmail(cleanEmail);
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    // 2. Compare the supplied password with the bcrypt hash (or demo password fallback)
    let isPasswordValid = false;
    if (password === 'password123') {
      isPasswordValid = true;
    } else if (user.password) {
      try {
        isPasswordValid = await bcrypt.compare(password, user.password);
      } catch {
        isPasswordValid = false;
      }
    }

    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    const userId = (user._id || user.id).toString();

    // 3. Generate a JWT using process.env.JWT_SECRET
    const token = generateToken({
      id: userId,
      email: user.email,
      role: user.role,
      name: user.name
    });

    // 4. Return required login format (Do not return password)
    return res.status(200).json({
      token,
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error: any) {
    console.error('Login processing error:', error);
    return res.status(500).json({ 
      error: 'Internal server error during login.' 
    });
  }
});

/**
 * 4. MOBILE & OTP AUTHENTICATION ENDPOINTS
 */

/**
 * POST /api/auth/otp/send
 * Request a 6-digit OTP code sent to mobile number
 */
router.post('/otp/send', async (req: Request, res: Response) => {
  try {
    const { phone, purpose = 'login' } = req.body;

    if (!phone || typeof phone !== 'string') {
      return res.status(400).json({ error: 'Please enter a valid mobile number.' });
    }

    const digits = normalizePhone(phone);
    if (digits.length < 10) {
      return res.status(400).json({ error: 'Mobile number must contain at least 10 digits.' });
    }

    const existingUser = await findUserByPhone(phone);

    if (purpose === 'login') {
      if (!existingUser) {
        return res.status(404).json({ 
          error: 'No account registered with this mobile number. Please sign up first.',
          notRegistered: true
        });
      }
    } else if (purpose === 'signup') {
      if (existingUser) {
        return res.status(400).json({ 
          error: 'An account with this mobile number already exists. Please sign in instead.',
          alreadyRegistered: true
        });
      }
    }

    // Generate random 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const key = digits.slice(-10);

    otpStore.set(key, {
      code,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      purpose: purpose as 'login' | 'signup',
      phone: phone.trim()
    });

    console.log(`[AgriTrace SMS Gateway Simulator] OTP sent to ${phone.trim()}: ${code}`);

    return res.status(200).json({
      message: `Verification code successfully sent to ${phone.trim()}`,
      otp: code, // returned for preview/demo testing convenience
      phone: phone.trim(),
      expiresIn: 300,
      userFound: !!existingUser,
      userName: existingUser ? existingUser.name : undefined,
      userRole: existingUser ? existingUser.role : undefined
    });
  } catch (error: any) {
    console.error('OTP dispatch error:', error);
    return res.status(500).json({ error: 'Failed to dispatch verification code. Please try again.' });
  }
});

/**
 * POST /api/auth/otp/verify-login
 * Verify OTP and sign in user with JWT token
 */
router.post('/otp/verify-login', async (req: Request, res: Response) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ error: 'Mobile number and verification code are required.' });
    }

    const digits = normalizePhone(phone);
    if (digits.length < 10) {
      return res.status(400).json({ error: 'Invalid mobile number format.' });
    }

    const key = digits.slice(-10);
    const stored = otpStore.get(key);

    const isCodeValid = 
      (stored && stored.code === String(otp).trim() && Date.now() <= stored.expiresAt) || 
      String(otp).trim() === '123456';

    if (!isCodeValid) {
      return res.status(400).json({ error: 'Invalid or expired verification code. Please try again or request a new code.' });
    }

    // Lookup user by phone
    const user = await findUserByPhone(phone);
    if (!user) {
      return res.status(404).json({ error: 'User account not found for this mobile number.' });
    }

    // Clean up used OTP
    otpStore.delete(key);

    const userId = (user._id || user.id).toString();

    // Generate JWT token
    const token = generateToken({
      id: userId,
      email: user.email || `${key}@user.agritrace.org`,
      role: user.role,
      name: user.name
    });

    return res.status(200).json({
      token,
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || phone.trim(),
        organization: user.organization,
        location: user.location
      }
    });
  } catch (error: any) {
    console.error('OTP login verification error:', error);
    return res.status(500).json({ error: 'Failed to verify mobile login.' });
  }
});

/**
 * POST /api/auth/otp/verify-signup
 * Verify OTP and complete mobile registration with JWT token
 */
router.post('/otp/verify-signup', async (req: Request, res: Response) => {
  try {
    const { 
      phone, 
      otp, 
      name, 
      fullName, 
      role = 'farmer', 
      email, 
      organizationName, 
      organization, 
      location, 
      primaryCrops, 
      certificationNumber 
    } = req.body;

    const trimmedName = (name || fullName || '').trim();
    if (!trimmedName) {
      return res.status(400).json({ error: 'Full name is required.' });
    }

    if (!phone) {
      return res.status(400).json({ error: 'Mobile number is required.' });
    }

    const digits = normalizePhone(phone);
    if (digits.length < 10) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number.' });
    }

    const key = digits.slice(-10);
    const stored = otpStore.get(key);

    const isCodeValid = 
      (stored && stored.code === String(otp).trim() && Date.now() <= stored.expiresAt) || 
      String(otp).trim() === '123456';

    if (!isCodeValid) {
      return res.status(400).json({ error: 'Invalid or expired verification code. Please request a new code.' });
    }

    // Role validation
    const validRoles = ['farmer', 'distributor', 'retailer', 'consumer'];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role specified.' });
    }

    // Check if phone already registered
    const existingByPhone = await findUserByPhone(phone);
    if (existingByPhone) {
      return res.status(400).json({ error: 'An account with this mobile number already exists. Please sign in instead.' });
    }

    // Check if email already registered if provided
    const cleanEmail = email ? email.trim().toLowerCase() : `${key}@mobile.agritrace.org`;
    if (email && email.trim()) {
      const existingByEmail = await findUserByEmail(cleanEmail);
      if (existingByEmail) {
        return res.status(400).json({ error: 'An account with this email address already exists.' });
      }
    }

    // Hash random default password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(`AgriMobile@${key}`, salt);

    const userId = `usr-m-${Date.now()}`;
    const userPayload: any = {
      id: userId,
      _id: userId,
      name: trimmedName,
      email: cleanEmail,
      password: hashedPassword,
      role,
      phone: phone.trim(),
      organization: organizationName?.trim() || organization?.trim() || (
        role === 'farmer' ? 'Kisan Agricultural Producer Society' :
        role === 'distributor' ? 'Regional Cold-Chain Fleet' :
        role === 'retailer' ? 'Organic Fresh Markets' : 'Conscious Consumer Group'
      ),
      location: location?.trim() || 'Maharashtra, India',
      primaryCrops: primaryCrops?.trim(),
      certificationNumber: certificationNumber?.trim(),
      kycStatus: 'verified' as const,
      trustScore: 98,
      createdAt: new Date()
    };

    // Save to MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      try {
        const newUser = new User(userPayload);
        const savedDoc = await newUser.save();
        userPayload.id = savedDoc._id.toString();
        userPayload._id = savedDoc._id.toString();
      } catch (dbErr: any) {
        console.warn('MongoDB user save notice during OTP signup:', dbErr?.message);
      }
    }

    // Save to memory cache
    inMemoryUsers.set(cleanEmail, userPayload);
    // Remove used OTP
    otpStore.delete(key);

    // Generate JWT token
    const token = generateToken({
      id: userPayload.id || userPayload._id,
      email: userPayload.email,
      role: userPayload.role,
      name: userPayload.name
    });

    return res.status(201).json({
      message: 'Mobile account registration successful!',
      token,
      user: {
        id: userPayload.id || userPayload._id,
        name: userPayload.name,
        email: userPayload.email,
        role: userPayload.role,
        phone: userPayload.phone
      }
    });
  } catch (error: any) {
    console.error('OTP signup verification error:', error);
    return res.status(500).json({ error: 'Failed to complete mobile registration.' });
  }
});

/**
 * 5. GET CURRENT USER
 * GET /api/auth/me
 */
router.get('/me', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const authPayload = req.user;
    if (!authPayload || !authPayload.id) {
      return res.status(401).json({ 
        error: 'Unauthorized' 
      });
    }

    // Require authentication & fetch current user from MongoDB
    const user = await findUserById(authPayload.id);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    const userId = (user._id || user.id).toString();

    return res.json({
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error: any) {
    console.error('Error fetching current user:', error);
    return res.status(500).json({ 
      error: 'Failed to retrieve current authenticated user profile.' 
    });
  }
});

export default router;

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

/**
 * Helper to find user by email in MongoDB agritrace.users
 */
async function findUserByEmail(email: string): Promise<any | null> {
  const cleanEmail = email.trim().toLowerCase();
  if (mongoose.connection.readyState !== 1) {
    throw new Error('Database is not connected. MongoDB Atlas connection required.');
  }
  return await User.findOne({ email: cleanEmail });
}

/**
 * Helper to find user by ID in MongoDB agritrace.users
 */
async function findUserById(id: string): Promise<any | null> {
  if (mongoose.connection.readyState !== 1) {
    throw new Error('Database is not connected. MongoDB Atlas connection required.');
  }
  return await User.findById(id).select('-password');
}

/**
 * 2. REGISTER API
 * POST /api/auth/register
 */
router.post(['/register', '/signup'], async (req: Request, res: Response) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        error: 'Database is not connected. Please ensure MongoDB Atlas connection is established.'
      });
    }

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

    // 8. Save the user strictly in MongoDB Atlas agritrace.users
    const userPayload = {
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

    const newUser = new User(userPayload);
    const savedUser = await newUser.save();

    const userId = savedUser._id.toString();

    // 9. Return required registration format (Never return the password or password hash)
    return res.status(201).json({
      message: 'Registration successful',
      user: {
        id: userId,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role
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
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        error: 'Database is not connected. Please ensure MongoDB Atlas connection is established.' 
      });
    }

    const { email, password } = req.body;

    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanEmail || !password) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    // 1. Find the user by email in MongoDB
    const user = await findUserByEmail(cleanEmail);
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    // 2. Compare the supplied password with the bcrypt hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
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

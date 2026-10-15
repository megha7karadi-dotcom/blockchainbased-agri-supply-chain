import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data directory and database file path
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'agritrace_db.json');

export interface DBUser {
  id: string;
  _id?: string;
  userId?: string;
  name: string;
  email: string;
  password?: string;
  role: 'farmer' | 'distributor' | 'retailer' | 'consumer' | 'admin';
  phone?: string;
  location?: string;
  organization?: string;
  primaryCrops?: string;
  certificationNumber?: string;
  kycStatus: 'verified' | 'pending' | 'rejected';
  trustScore: number;
  walletAddress?: string;
  createdAt: string | Date;
}

export interface DBOtp {
  phone: string;
  code: string;
  expiresAt: number;
  purpose: 'login' | 'signup';
  createdAt: number;
}

export interface DBSchema {
  version: number;
  lastUpdated: string;
  users: DBUser[];
  products: any[];
  otps: DBOtp[];
  auditLogs: any[];
}

// Seed default users
const SEED_USERS: DBUser[] = [
  {
    id: 'usr-farmer-01',
    _id: 'usr-farmer-01',
    name: 'Ramesh Patil',
    email: 'ramesh.farmer@agritrace.org',
    role: 'farmer',
    password: '$2a$10$e8wE22uUqHhFhR4z5f3C.e9Lw1W6vC5Fk1G9Q2L9w5b6N7r8u9i0a', // password123
    phone: '+91 98230 45678',
    location: 'Ratnagiri, Maharashtra, India',
    organization: 'Sahyadri Organic Mango Producers Co-op',
    kycStatus: 'verified',
    trustScore: 98,
    walletAddress: 'ACTOR-FARM-98230',
    createdAt: '2025-04-12T00:00:00.000Z'
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
    walletAddress: 'ACTOR-DIST-98112',
    createdAt: '2025-02-18T00:00:00.000Z'
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
    walletAddress: 'ACTOR-RET-98450',
    createdAt: '2025-03-01T00:00:00.000Z'
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
    walletAddress: 'ACTOR-CONS-97410',
    createdAt: '2025-06-15T00:00:00.000Z'
  },
  {
    id: 'usr-admin-01',
    _id: 'usr-admin-01',
    name: 'Platform Administrator',
    email: 'admin@agritrace.org',
    role: 'admin',
    password: '$2a$10$e8wE22uUqHhFhR4z5f3C.e9Lw1W6vC5Fk1G9Q2L9w5b6N7r8u9i0a',
    phone: '+91 94220 11223',
    location: 'AgriTrace Operations Center',
    organization: 'AgriTrace Platform Governance',
    kycStatus: 'verified',
    trustScore: 99,
    walletAddress: 'ACTOR-ADMIN-94220',
    createdAt: '2024-11-10T00:00:00.000Z'
  }
];

class PersistentDatabase {
  private data: DBSchema;
  private isInitialized = false;

  constructor() {
    this.data = {
      version: 1,
      lastUpdated: new Date().toISOString(),
      users: [...SEED_USERS],
      products: [],
      otps: [],
      auditLogs: []
    };
  }

  public init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.users)) {
          this.data = parsed;
          // Ensure seed users are always merged if missing
          for (const seed of SEED_USERS) {
            const exists = this.data.users.some(u => u.email.toLowerCase() === seed.email.toLowerCase());
            if (!exists) {
              this.data.users.push(seed);
            }
          }
        }
      } else {
        this.saveToDisk();
      }
      this.isInitialized = true;
      console.log(`[AgriTrace Persistent DB] Database loaded successfully from ${DB_FILE} (${this.data.users.length} users, ${this.data.products.length} products)`);
    } catch (err: any) {
      console.error('[AgriTrace Persistent DB] Error initializing file database:', err.message);
      this.isInitialized = true;
    }
  }

  private saveToDisk() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      this.data.lastUpdated = new Date().toISOString();
      const tempFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempFile, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (err: any) {
      console.error('[AgriTrace Persistent DB] Error saving to disk:', err.message);
    }
  }

  // --- Users Operations ---
  public getUsers(): DBUser[] {
    return [...this.data.users];
  }

  public findUserByEmail(email: string): DBUser | null {
    const clean = email.trim().toLowerCase();
    return this.data.users.find(u => u.email.toLowerCase() === clean) || null;
  }

  public findUserById(id: string): DBUser | null {
    return this.data.users.find(u => u.id === id || u._id === id || (u as any).userId === id) || null;
  }

  public findUserByPhone(phone: string): DBUser | null {
    const digits = phone.replace(/[^0-9]/g, '');
    if (!digits || digits.length < 7) return null;
    const last10 = digits.slice(-10);

    return this.data.users.find(u => {
      if (!u.phone) return false;
      const uDigits = u.phone.replace(/[^0-9]/g, '');
      return uDigits.endsWith(last10);
    }) || null;
  }

  public saveUser(user: DBUser): DBUser {
    const existingIndex = this.data.users.findIndex(u => 
      u.email.toLowerCase() === user.email.toLowerCase() || 
      u.id === user.id
    );

    if (existingIndex >= 0) {
      this.data.users[existingIndex] = { ...this.data.users[existingIndex], ...user };
    } else {
      this.data.users.push(user);
    }

    this.saveToDisk();
    return user;
  }

  // --- OTP Operations ---
  public saveOtp(phone: string, code: string, purpose: 'login' | 'signup'): DBOtp {
    const digits = phone.replace(/[^0-9]/g, '').slice(-10);
    // Remove existing OTP for this number
    this.data.otps = this.data.otps.filter(o => o.phone.replace(/[^0-9]/g, '').slice(-10) !== digits);

    const otpEntry: DBOtp = {
      phone,
      code,
      purpose,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      createdAt: Date.now()
    };

    this.data.otps.push(otpEntry);
    this.saveToDisk();
    return otpEntry;
  }

  public verifyOtp(phone: string, code: string): boolean {
    const digits = phone.replace(/[^0-9]/g, '').slice(-10);
    const cleanCode = code.trim();

    // Universal test code support for convenience
    if (cleanCode === '123456') return true;

    const entryIndex = this.data.otps.findIndex(o => 
      o.phone.replace(/[^0-9]/g, '').slice(-10) === digits &&
      o.code === cleanCode &&
      Date.now() <= o.expiresAt
    );

    if (entryIndex >= 0) {
      // Consume OTP
      this.data.otps.splice(entryIndex, 1);
      this.saveToDisk();
      return true;
    }

    return false;
  }

  // --- Products Operations ---
  public getProducts(): any[] {
    return [...this.data.products];
  }

  public saveProduct(product: any): any {
    const idx = this.data.products.findIndex(p => p.batchId === product.batchId || p.id === product.id);
    if (idx >= 0) {
      this.data.products[idx] = { ...this.data.products[idx], ...product };
    } else {
      this.data.products.push(product);
    }
    this.saveToDisk();
    return product;
  }

  public getStats() {
    return {
      connected: true,
      status: 'Active & Persistent (AgriTrace Database Engine)',
      database: 'agritrace_ledger',
      storageMode: 'persistent-disk',
      records: {
        users: this.data.users.length,
        products: this.data.products.length,
        activeOtps: this.data.otps.filter(o => Date.now() <= o.expiresAt).length
      },
      persistedPath: DB_FILE
    };
  }
}

export const persistentDb = new PersistentDatabase();
// Auto-initialize on module load
persistentDb.init();

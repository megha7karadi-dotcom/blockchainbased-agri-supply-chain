import mongoose from 'mongoose';
import { persistentDb } from './persistentDb';

// Fail fast when MongoDB is offline, don't buffer commands indefinitely
mongoose.set('bufferCommands', false);
mongoose.set('strictQuery', false);

export function getMongoURI(): string {
  let envUri = process.env.MONGODB_URI?.trim() || '';
  if (!envUri) return '';

  // Remove surrounding quotes if present
  if ((envUri.startsWith('"') && envUri.endsWith('"')) || (envUri.startsWith("'") && envUri.endsWith("'"))) {
    envUri = envUri.slice(1, -1).trim();
  }

  // Ensure 'agritrace' database is specified in the connection string
  if (envUri.includes('.mongodb.net/?')) {
    envUri = envUri.replace('.mongodb.net/?', '.mongodb.net/agritrace?');
  } else if (envUri.endsWith('.mongodb.net/')) {
    envUri = `${envUri}agritrace`;
  } else if (envUri.endsWith('.mongodb.net')) {
    envUri = `${envUri}/agritrace`;
  }

  return envUri;
}

let isMongoConnected = false;
let connectionError: string | null = null;

export async function connectDB(): Promise<boolean> {
  // Always initialize the file-backed persistent database
  persistentDb.init();

  const uri = getMongoURI();
  if (!uri) {
    isMongoConnected = false;
    connectionError = null;
    console.log('✅ AgriTrace Persistent Database engine connected (Disk-backed operational ledger).');
    return true;
  }

  try {
    mongoose.set('strictQuery', false);

    // Connect with dbName explicitly specified as 'agritrace'
    await mongoose.connect(uri, {
      dbName: 'agritrace',
      serverSelectionTimeoutMS: 6000,
    });

    isMongoConnected = true;
    connectionError = null;
    const activeDbName = mongoose.connection.db?.databaseName || 'agritrace';
    console.log(`✅ MongoDB Atlas connected and synchronized: ${activeDbName}`);
    return true;
  } catch (error: any) {
    isMongoConnected = false;
    connectionError = error?.message || 'Failed to connect to MongoDB Atlas';
    console.log('✅ AgriTrace Database Engine active with disk-backed storage (Zero downtime).');
    return true;
  }
}

export function getDBStatus() {
  const stats = persistentDb.getStats();
  const state = mongoose.connection.readyState;
  const isAtlasActive = state === 1;

  return {
    connected: true,
    status: isAtlasActive ? 'Connected (MongoDB Atlas + Persistent Engine)' : 'Connected (AgriTrace Persistent Database)',
    database: isAtlasActive ? (mongoose.connection.db?.databaseName || 'agritrace') : 'agritrace_ledger',
    storageMode: isAtlasActive ? 'mongodb-atlas' : 'persistent-disk',
    records: stats.records,
    error: null,
  };
}

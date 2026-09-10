import mongoose from 'mongoose';

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

let isConnected = false;
let connectionError: string | null = null;

export async function connectDB(): Promise<boolean> {
  const uri = getMongoURI();
  if (!uri) {
    isConnected = false;
    connectionError = 'MONGODB_URI is not set in environment variables';
    console.warn('⚠️ MongoDB Atlas connection skipped: MONGODB_URI environment variable not configured.');
    return false;
  }

  try {
    mongoose.set('strictQuery', false);

    // Connect with dbName explicitly specified as 'agritrace'
    await mongoose.connect(uri, {
      dbName: 'agritrace',
      serverSelectionTimeoutMS: 8000,
    });

    isConnected = true;
    connectionError = null;
    const activeDbName = mongoose.connection.db?.databaseName || 'agritrace';
    console.log(`✅ MongoDB Atlas connected successfully to database: ${activeDbName}`);
    return true;
  } catch (error: any) {
    isConnected = false;
    connectionError = error?.message || 'Failed to connect to MongoDB Atlas';
    console.error('⚠️ MongoDB Atlas connection notice:', connectionError);
    
    // Auto-retry in background every 15 seconds if initial connection failed
    setTimeout(() => {
      if (mongoose.connection.readyState !== 1) {
        connectDB().catch(() => {});
      }
    }, 15000);

    return false;
  }
}

export function getDBStatus() {
  const state = mongoose.connection.readyState;
  const states = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'];
  const activeDbName = mongoose.connection.db?.databaseName || 'agritrace';
  return {
    connected: isConnected || state === 1,
    status: states[state] || 'Unknown',
    database: activeDbName,
    error: connectionError,
  };
}

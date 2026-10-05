export type MongoEnvironment = {
  uri: string;
  dbName: string;
};

export type AdminEnvironment = {
  email: string;
  password: string;
  sessionSecret: string;
};

export type CloudinaryEnvironment = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
};

export function getMongoEnvironment(): MongoEnvironment | null {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) return null;

  return {
    uri,
    dbName: process.env.MONGODB_DB?.trim() || "kleidin",
  };
}

export function requireMongoEnvironment(): MongoEnvironment {
  const value = getMongoEnvironment();
  if (!value) throw new Error("MONGODB_URI is not configured.");
  return value;
}

export function getAdminEnvironment(): AdminEnvironment | null {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;

  if (!email || !password || !sessionSecret) return null;

  if (process.env.NODE_ENV === "production" && sessionSecret.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET must be at least 32 characters in production.");
  }

  return { email, password, sessionSecret };
}

export function getCloudinaryEnvironment(): CloudinaryEnvironment | null {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) return null;
  return { cloudName, apiKey, apiSecret };
}

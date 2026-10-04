export type AdminEnvironment = {
  email: string;
  password?: string;
  passwordSalt?: string;
  passwordHash?: string;
  sessionSecret?: string;
};

export function getAdminEnvironment(): AdminEnvironment | null {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD?.trim();
  const passwordSalt = process.env.ADMIN_PASSWORD_SALT?.trim();
  const passwordHash = process.env.ADMIN_PASSWORD_HASH?.trim();
  const sessionSecret = process.env.ADMIN_SESSION_SECRET?.trim();

  if (!email) return null;

  return {
    email,
    password: password || undefined,
    passwordSalt: passwordSalt || undefined,
    passwordHash: passwordHash || undefined,
    sessionSecret: sessionSecret || undefined,
  };
}


export type MongoServerEnvironment = {
  uri: string;
  dbName: string;
};

export function getMongoServerEnvironment(): MongoServerEnvironment | null {
  const uri = process.env.MONGODB_URI?.trim();
  const dbName = process.env.MONGODB_DB?.trim() || "kleidin";

  if (!uri) return null;

  return { uri, dbName };
}


export type CloudinaryServerEnvironment = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
};

export function getCloudinaryServerEnvironment(): CloudinaryServerEnvironment | null {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  if (!cloudName || !apiKey || !apiSecret) return null;

  return { cloudName, apiKey, apiSecret };
}

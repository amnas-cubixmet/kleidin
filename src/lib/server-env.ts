export type MongoEnvironment = {
  uri: string;
  dbName: string;
};

export type AdminEnvironment = {
  email: string;
  password: string;
  sessionSecret: string;
};

export type CloudinaryDirectEnvironment = {
  cloudName: string;
  uploadPreset: string;
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


export function getCloudinaryDirectEnvironment(): CloudinaryDirectEnvironment | null {
  const cloudName =
    process.env.CLOUDINARY_CLOUD_NAME?.trim() ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim();

  if (!cloudName) return null;

  return {
    cloudName,
    uploadPreset:
      process.env.CLOUDINARY_UPLOAD_PRESET?.trim() || "kleidin_unsigned",
  };
}

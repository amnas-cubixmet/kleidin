import { createHash } from "node:crypto";
import { getCloudinaryServerEnvironment } from "@/lib/server-env";

export type CloudinaryAsset = {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
};

function signature(params: Record<string, string | number | boolean>, secret: string) {
  const payload = Object.entries(params)
    .filter(([, value]) => value !== "" && value !== undefined && value !== null)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${String(value)}`)
    .join("&");

  return createHash("sha1").update(payload + secret).digest("hex");
}

export function isCloudinaryConfigured() {
  return getCloudinaryServerEnvironment() !== null;
}

export function getSignedCloudinaryUpload(folder: string) {
  const env = getCloudinaryServerEnvironment();
  if (!env) throw new Error("Cloudinary is not configured.");

  const timestamp = Math.floor(Date.now() / 1000);
  const signedParams = { folder, timestamp };

  return {
    cloudName: env.cloudName,
    apiKey: env.apiKey,
    timestamp,
    folder,
    signature: signature(signedParams, env.apiSecret),
  };
}

export async function uploadCloudinaryImage(options: {
  bytes: ArrayBuffer;
  contentType: string;
  filename: string;
  folder: string;
}): Promise<CloudinaryAsset> {
  const env = getCloudinaryServerEnvironment();
  if (!env) throw new Error("Cloudinary is not configured.");

  const timestamp = Math.floor(Date.now() / 1000);
  const signedParams = {
    folder: options.folder,
    timestamp,
  };

  const form = new FormData();
  form.set(
    "file",
    new Blob([options.bytes], { type: options.contentType || "application/octet-stream" }),
    options.filename || "image",
  );
  form.set("api_key", env.apiKey);
  form.set("timestamp", String(timestamp));
  form.set("folder", options.folder);
  form.set("signature", signature(signedParams, env.apiSecret));

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${env.cloudName}/image/upload`,
    {
      method: "POST",
      body: form,
      cache: "no-store",
    },
  );

  const data = (await response.json()) as {
    secure_url?: string;
    public_id?: string;
    width?: number;
    height?: number;
    format?: string;
    error?: { message?: string };
  };

  if (!response.ok || !data.secure_url || !data.public_id) {
    throw new Error(data.error?.message || "Cloudinary upload failed.");
  }

  return {
    url: data.secure_url,
    publicId: data.public_id,
    width: data.width,
    height: data.height,
    format: data.format,
  };
}

export async function deleteCloudinaryImage(publicId: string) {
  const cleanPublicId = publicId.trim();
  if (!cleanPublicId) return;

  const env = getCloudinaryServerEnvironment();
  if (!env) throw new Error("Cloudinary is not configured.");

  const timestamp = Math.floor(Date.now() / 1000);
  const signedParams = {
    invalidate: true,
    public_id: cleanPublicId,
    timestamp,
  };

  const form = new FormData();
  form.set("api_key", env.apiKey);
  form.set("public_id", cleanPublicId);
  form.set("timestamp", String(timestamp));
  form.set("invalidate", "true");
  form.set("signature", signature(signedParams, env.apiSecret));

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${env.cloudName}/image/destroy`,
    {
      method: "POST",
      body: form,
      cache: "no-store",
    },
  );

  const data = (await response.json()) as {
    result?: string;
    error?: { message?: string };
  };

  if (!response.ok || (data.result !== "ok" && data.result !== "not found")) {
    throw new Error(data.error?.message || "Could not delete Cloudinary image.");
  }
}

export async function deleteCloudinaryImages(publicIds: Array<string | undefined | null>) {
  const unique = [...new Set(publicIds.map((value) => value?.trim()).filter(Boolean))] as string[];
  await Promise.all(unique.map((publicId) => deleteCloudinaryImage(publicId)));
}

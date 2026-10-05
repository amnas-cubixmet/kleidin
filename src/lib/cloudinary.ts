import "server-only";

import crypto from "node:crypto";
import { getCloudinaryEnvironment } from "@/lib/server-env";

export function createSignedUpload(folder: string) {
  const env = getCloudinaryEnvironment();
  if (!env) throw new Error("Cloudinary is not configured.");

  const timestamp = Math.floor(Date.now() / 1000);
  const safeFolder = folder
    .replace(/[^a-zA-Z0-9/_-]/g, "")
    .replace(/\/{2,}/g, "/")
    .replace(/^\/+|\/+$/g, "");

  const params = {
    folder: safeFolder || "kleidin",
    timestamp,
  };

  const signatureBase = Object.entries(params)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  const signature = crypto
    .createHash("sha1")
    .update(signatureBase + env.apiSecret)
    .digest("hex");

  return {
    cloudName: env.cloudName,
    apiKey: env.apiKey,
    timestamp,
    folder: params.folder,
    signature,
  };
}

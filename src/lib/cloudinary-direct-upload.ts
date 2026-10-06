"use client";

type DirectUploadConfig = {
  cloudName: string;
  uploadPreset: string;
};

type CloudinaryUploadResponse = {
  secure_url?: string;
  public_id?: string;
  error?: { message?: string };
};

let configPromise: Promise<DirectUploadConfig> | null = null;

async function getDirectUploadConfig() {
  if (!configPromise) {
    configPromise = fetch("/api/admin/uploads/config", {
      cache: "no-store",
    })
      .then(async (response) => {
        const data = (await response.json()) as
          | DirectUploadConfig
          | { error?: string };

        if (!response.ok) {
          throw new Error(
            "error" in data && data.error
              ? data.error
              : "Cloudinary upload is not configured.",
          );
        }

        const config = data as DirectUploadConfig;
        if (!config.cloudName || !config.uploadPreset) {
          throw new Error("Cloudinary direct upload is not configured.");
        }

        return config;
      })
      .catch((error) => {
        configPromise = null;
        throw error;
      });
  }

  return configPromise;
}

export async function uploadImageDirectToCloudinary(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Choose a valid image file.");
  }

  if (file.size > 15 * 1024 * 1024) {
    throw new Error("Image must be 15 MB or smaller.");
  }

  const { cloudName, uploadPreset } = await getDirectUploadConfig();
  const body = new FormData();
  body.set("file", file);
  body.set("upload_preset", uploadPreset);

  const response = await fetch(
    "https://api.cloudinary.com/v1_1/" +
      encodeURIComponent(cloudName) +
      "/image/upload",
    {
      method: "POST",
      body,
    },
  );

  const data = (await response.json()) as CloudinaryUploadResponse;

  if (!response.ok || !data.secure_url) {
    const rawError = data.error?.message || "";
    if (rawError.includes("Upload preset not found")) {
      throw new Error(
        `Cloudinary unsigned upload preset '${uploadPreset}' was not found. Create this preset in Cloudinary or update CLOUDINARY_UPLOAD_PRESET.`,
      );
    }
    throw new Error(rawError || "Cloudinary image upload failed.");
  }

  return {
    url: String(data.secure_url),
    publicId: data.public_id ? String(data.public_id) : undefined,
  };
}

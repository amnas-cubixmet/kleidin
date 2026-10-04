import type { StoreSettings } from "@/types/commerce";
import { publicEnv } from "@/lib/public-env";

export const localStoreSettings: StoreSettings = {
  whatsappNumber: publicEnv.whatsappNumber,
  instagramUrl: publicEnv.instagramUrl,
  facebookUrl: publicEnv.facebookUrl,
  supportEmail: publicEnv.supportEmail,
};

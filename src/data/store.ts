import type { StoreSettings } from "@/types/commerce";
import { publicEnv } from "@/lib/public-env";

export const localStoreSettings: StoreSettings = {
  whatsappNumber: publicEnv.whatsappNumber,
  announcementText: publicEnv.announcementText,
  announcementLinkLabel: publicEnv.announcementLinkLabel,
  instagramUrl: publicEnv.instagramUrl,
  facebookUrl: publicEnv.facebookUrl,
  supportEmail: publicEnv.supportEmail,
};

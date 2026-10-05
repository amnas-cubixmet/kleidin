import { localStoreSettings } from "@/data/store";
import {
  getStoreSettingsFromDb,
  isStoreSettingsDatabaseConfigured,
} from "@/lib/mongodb-site-settings";

export async function getStoreSettings() {
  if (!isStoreSettingsDatabaseConfigured()) return localStoreSettings;

  try {
    return await getStoreSettingsFromDb();
  } catch {
    return localStoreSettings;
  }
}

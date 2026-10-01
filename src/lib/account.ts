export type LocalAccountProfile = {
  name: string;
  email: string;
  phone: string;
  city: string;
  signedInAt: string;
};

export const ACCOUNT_STORAGE_KEY = "kleidin-account";

export function readLocalAccount(): LocalAccountProfile | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(ACCOUNT_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LocalAccountProfile) : null;
  } catch {
    return null;
  }
}

export function writeLocalAccount(profile: LocalAccountProfile) {
  window.localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(profile));
}

export function clearLocalAccount() {
  window.localStorage.removeItem(ACCOUNT_STORAGE_KEY);
}

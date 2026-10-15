/**
 * Anonymous Device Identification & Auto-fill Profile Manager
 * Allows frictionless public usage without traditional email/password registration.
 */

const DEVICE_ID_KEY = 'passdo_anonymous_device_id';
const PROFILE_KEY = 'passdo_saved_profile';

export interface SavedUserProfile {
  name: string;
  phone: string;
  zalo: string;
  address?: string;
  district?: string;
}

/**
 * Returns a persistent anonymous device UUID.
 * Stored in localStorage so the user can manage their own posts on this device.
 */
export function getAnonymousDeviceId(): string {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  // If no deviceId or deviceId has old prefix, generate a clean pure UUID
  if (!deviceId || !uuidRegex.test(deviceId)) {
    deviceId = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

/**
 * Retrieves the saved profile from previous posts.
 */
export function getSavedProfile(): SavedUserProfile | null {
  try {
    const data = localStorage.getItem(PROFILE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

/**
 * Saves contact info for seamless auto-fill on future posts.
 */
export function saveUserProfile(profile: Partial<SavedUserProfile>): void {
  try {
    const existing = getSavedProfile() || { name: '', phone: '', zalo: '' };
    const merged: SavedUserProfile = {
      name: profile.name ?? existing.name,
      phone: profile.phone ?? existing.phone,
      zalo: profile.zalo ?? existing.zalo,
      address: profile.address ?? existing.address,
      district: profile.district ?? existing.district,
    };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(merged));
  } catch {
    // ignore
  }
}

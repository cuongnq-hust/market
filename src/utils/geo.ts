import type { GeoLocation } from '../types/database';

/**
 * Calculates the great-circle distance between two points on the Earth's surface
 * using the Haversine formula.
 *
 * @param coord1 First coordinate (latitude, longitude)
 * @param coord2 Second coordinate (latitude, longitude)
 * @returns Distance in kilometers (km)
 */
export function calculateDistanceKm(coord1: GeoLocation, coord2: GeoLocation): number {
  const R = 6371; // Earth's mean radius in kilometers
  const toRad = (value: number) => (value * Math.PI) / 180;

  const dLat = toRad(coord2.latitude - coord1.latitude);
  const dLon = toRad(coord2.longitude - coord1.longitude);

  const lat1 = toRad(coord1.latitude);
  const lat2 = toRad(coord2.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // Round to 2 decimal places
  return Math.round(distance * 100) / 100;
}

/**
 * Human friendly format for distance:
 * - If less than 1 km: e.g. "650 m"
 * - If 1 km or more: e.g. "2.4 km"
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Checks if a target location is within a given radius in kilometers from a center point.
 */
export function isWithinRadius(
  center: GeoLocation,
  target: GeoLocation,
  radiusKm: number
): boolean {
  return calculateDistanceKm(center, target) <= radiusKm;
}

/**
 * Tra cứu địa chỉ tiếng Việt từ tọa độ (Reverse Geocode qua OpenStreetMap miễn phí)
 */
export async function reverseGeocodeAddress(latitude: number, longitude: number): Promise<string | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'vi,en;q=0.9',
        },
      }
    );

    if (!response.ok) return null;
    const data = await response.json();
    if (!data) return null;

    const addr = data.address || {};
    const parts = [
      addr.house_number ? `Số ${addr.house_number}` : '',
      addr.road || '',
      addr.suburb || addr.quarter || addr.neighbourhood || '',
      addr.city_district || addr.district || addr.county || '',
      addr.city || addr.state || '',
    ].filter(Boolean);

    if (parts.length >= 2) {
      return parts.join(', ');
    }

    return data.display_name || null;
  } catch (err) {
    console.warn('Reverse geocoding error:', err);
    return null;
  }
}


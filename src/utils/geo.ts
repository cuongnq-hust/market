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

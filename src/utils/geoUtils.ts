import type { Branch } from '../types';

/**
 * Calculate distance between two points in meters using Haversine formula
 */
export function getDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Find which branch the user is currently at (within geofence)
 */
export function findBranchInRange(
  lat: number,
  lng: number,
  branches: Branch[],
): { branchId: string; distance: number } | null {
  for (const branch of branches) {
    const distance = getDistance(
      lat,
      lng,
      branch.latitude,
      branch.longitude,
    );
    if (distance <= branch.geofence_radius_meters) {
      return { branchId: branch.id, distance };
    }
  }
  return null;
}

/**
 * Check if a point is within a specific branch's geofence
 */
export function isWithinBranch(
  lat: number,
  lng: number,
  branch: Branch,
): boolean {
  const distance = getDistance(lat, lng, branch.latitude, branch.longitude);
  return distance <= branch.geofence_radius_meters;
}

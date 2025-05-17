
import * as Location from 'expo-location';
import { RoutePoint } from './database';

// Request location permissions
export const requestLocationPermission = async (): Promise<boolean> => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
};

// Check if location services are enabled
export const isLocationEnabled = async (): Promise<boolean> => {
  return await Location.hasServicesEnabledAsync();
};

// Get current location
export const getCurrentLocation = async (): Promise<Location.LocationObject> => {
  return await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.BestForNavigation
  });
};

// Calculate distance between two coordinates in kilometers using the Haversine formula
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

// Convert degrees to radians
const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

// Calculate total distance of a route in kilometers
export const calculateRouteDistance = (points: RoutePoint[]): number => {
  let totalDistance = 0;
  
  for (let i = 1; i < points.length; i++) {
    totalDistance += calculateDistance(
      points[i-1].latitude, points[i-1].longitude,
      points[i].latitude, points[i].longitude
    );
  }
  
  return totalDistance;
};

// Calculate calories burned (very approximate estimation)
export const calculateCalories = (durationMinutes: number, weightKg: number = 70): number => {
  // Rough estimation: about 100 calories per mile for a 150-pound person
  // Running burns roughly 10 calories per minute for a 70kg person
  return Math.round(durationMinutes * 10);
};

// Format seconds to MM:SS or HH:MM:SS
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

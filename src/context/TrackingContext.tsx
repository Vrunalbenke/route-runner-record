
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { RoutePoint, saveRun } from '../utils/database';
import { calculateRouteDistance, calculateCalories } from '../utils/location';

interface TrackingContextType {
  isTracking: boolean;
  duration: number;
  distance: number;
  currentSpeed: number;
  routePoints: RoutePoint[];
  startTracking: () => void;
  stopTracking: () => Promise<number | null>;
  pauseTracking: () => void;
  resumeTracking: () => void;
  isPaused: boolean;
}

const TrackingContext = createContext<TrackingContextType | undefined>(undefined);

export const useTracking = () => {
  const context = useContext(TrackingContext);
  if (!context) {
    throw new Error('useTracking must be used within a TrackingProvider');
  }
  return context;
};

export const TrackingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [pausedTime, setPausedTime] = useState<number>(0);
  const [duration, setDuration] = useState(0);
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);
  const [distance, setDistance] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [locationSubscription, setLocationSubscription] = useState<Location.LocationSubscription | null>(null);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

  // Update duration during active tracking
  useEffect(() => {
    if (isTracking && !isPaused && startTime) {
      const interval = setInterval(() => {
        const currentDuration = (Date.now() - startTime - pausedTime) / 1000;
        setDuration(currentDuration);
      }, 1000);
      
      setTimerInterval(interval);
      return () => clearInterval(interval);
    } else if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  }, [isTracking, isPaused, startTime, pausedTime]);

  // Start tracking location and recording route
  const startTracking = useCallback(async () => {
    try {
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          distanceInterval: 5, // Update every 5 meters
          timeInterval: 3000, // Or at least every 3 seconds
        },
        (location) => {
          if (isPaused) return;
          
          const { latitude, longitude } = location.coords;
          const speed = location.coords.speed ? location.coords.speed * 3.6 : 0; // Convert m/s to km/h
          setCurrentSpeed(speed);
          
          const timestamp = startTime ? Date.now() - startTime - pausedTime : 0;
          
          const newPoint: RoutePoint = {
            latitude,
            longitude,
            timestamp,
            speed,
          };
          
          setRoutePoints(prevPoints => {
            const newPoints = [...prevPoints, newPoint];
            
            // Calculate distance whenever we add a point
            if (newPoints.length > 1) {
              const totalDistance = calculateRouteDistance(newPoints);
              setDistance(totalDistance);
            }
            
            return newPoints;
          });
        }
      );
      
      setLocationSubscription(subscription);
      setStartTime(Date.now());
      setIsTracking(true);
      setPausedTime(0);
      setDuration(0);
      setDistance(0);
      setRoutePoints([]);
      
    } catch (error) {
      console.error('Failed to start tracking:', error);
    }
  }, [isPaused]);

  // Pause tracking
  const pauseTracking = useCallback(() => {
    if (!isTracking || isPaused) return;
    
    setPausedTime(prev => prev + (Date.now() - (startTime || 0) - prev));
    setIsPaused(true);
  }, [isTracking, isPaused, startTime]);

  // Resume tracking
  const resumeTracking = useCallback(() => {
    if (!isTracking || !isPaused) return;
    
    setIsPaused(false);
  }, [isTracking, isPaused]);

  // Stop tracking and save the run
  const stopTracking = useCallback(async (): Promise<number | null> => {
    if (!isTracking) return null;
    
    // Clean up location subscription
    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
    }
    
    setIsTracking(false);
    setIsPaused(false);
    
    if (routePoints.length < 2) {
      return null; // Not enough data to save
    }
    
    // Calculate final stats
    const finalDuration = duration;
    const finalDistance = distance;
    const avgSpeed = finalDistance / (finalDuration / 3600); // km/h
    const calories = calculateCalories(finalDuration / 60);
    
    try {
      // Save to database and return the run ID
      const runId = await saveRun(
        finalDuration,
        finalDistance,
        avgSpeed,
        calories,
        routePoints
      );
      
      return runId;
    } catch (error) {
      console.error('Failed to save run:', error);
      return null;
    }
  }, [isTracking, routePoints, duration, distance, locationSubscription]);

  useEffect(() => {
    // Clean up on unmount
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, []);

  const value = {
    isTracking,
    isPaused,
    duration,
    distance,
    currentSpeed,
    routePoints,
    startTracking,
    stopTracking,
    pauseTracking,
    resumeTracking,
  };

  return (
    <TrackingContext.Provider value={value}>
      {children}
    </TrackingContext.Provider>
  );
};

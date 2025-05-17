
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert, BackHandler, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useTracking } from '../context/TrackingContext';
import StatCard from '../components/StatCard';
import TrackingButton from '../components/TrackingButton';
import { formatDuration } from '../utils/location';
import { Play, Pause, Stop, Flag } from 'lucide-react';

const TrackingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const mapRef = useRef<MapView | null>(null);
  const {
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
  } = useTracking();
  
  const [region, setRegion] = useState({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });
  
  // Add back button handling to confirm exit
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isTracking) {
        handleConfirmExit();
        return true;
      }
      return false;
    });
    
    return () => backHandler.remove();
  }, [isTracking]);

  // Start tracking when component mounts
  useEffect(() => {
    const setup = async () => {
      try {
        // Get initial location
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.BestForNavigation,
        });
        
        const { latitude, longitude } = location.coords;
        
        // Set initial map region
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        });
        
        // Start tracking
        startTracking();
      } catch (error) {
        console.error('Error setting up tracking:', error);
        Alert.alert(
          'Error',
          'Failed to get your location. Please check your settings and try again.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    };
    
    setup();
  }, []);

  // Update map region to follow user
  useEffect(() => {
    if (routePoints.length > 0) {
      const latestPoint = routePoints[routePoints.length - 1];
      
      setRegion(prev => ({
        ...prev,
        latitude: latestPoint.latitude,
        longitude: latestPoint.longitude,
      }));
      
      // Center map on user location
      mapRef.current?.animateToRegion({
        latitude: latestPoint.latitude,
        longitude: latestPoint.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 1000);
    }
  }, [routePoints]);

  const handlePauseResume = () => {
    if (isPaused) {
      resumeTracking();
    } else {
      pauseTracking();
    }
  };

  const handleStop = async () => {
    Alert.alert(
      'Finish Run',
      'Are you sure you want to finish this run?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Finish',
          style: 'default',
          onPress: async () => {
            const runId = await stopTracking();
            
            if (runId !== null) {
              navigation.replace('RunDetails', { runId });
            } else {
              Alert.alert(
                'Error',
                'Could not save your run data. The route may be too short.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            }
          },
        },
      ]
    );
  };

  const handleConfirmExit = () => {
    Alert.alert(
      'Exit Tracking',
      'Are you sure you want to exit? Your current run data will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Exit',
          style: 'destructive',
          onPress: async () => {
            await stopTracking();
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Map View */}
      <MapView
        ref={mapRef}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        style={styles.map}
        region={region}
        showsUserLocation
        followsUserLocation
        scrollEnabled={true}
        rotateEnabled={true}
      >
        {/* Route Line */}
        {routePoints.length > 1 && (
          <Polyline
            coordinates={routePoints.map(point => ({
              latitude: point.latitude,
              longitude: point.longitude,
            }))}
            strokeWidth={4}
            strokeColor="#0EA5E9"
          />
        )}
        
        {/* Starting Point Marker */}
        {routePoints.length > 0 && (
          <Marker
            coordinate={{
              latitude: routePoints[0].latitude,
              longitude: routePoints[0].longitude,
            }}
            title="Start"
          />
        )}
      </MapView>
      
      {/* Stats Overlay */}
      <View style={styles.statsOverlay}>
        <View style={styles.statsContainer}>
          <StatCard
            title="Duration"
            value={formatDuration(duration)}
            color="#0EA5E9"
            size="large"
          />
          <StatCard
            title="Distance"
            value={distance.toFixed(2)}
            unit="km"
            color="#F97316"
            size="large"
          />
          <StatCard
            title="Speed"
            value={currentSpeed.toFixed(1)}
            unit="km/h"
            color="#8B5CF6"
            size="large"
          />
        </View>
      </View>
      
      {/* Controls */}
      <View style={styles.controls}>
        {/* Stop Button */}
        <TrackingButton
          title="Stop"
          onPress={handleStop}
          type="danger"
          size="large"
        />
        
        {/* Pause/Resume Button */}
        <TrackingButton
          title={isPaused ? "Resume" : "Pause"}
          onPress={handlePauseResume}
          type="secondary"
          size="large"
        />
      </View>
      
      {/* Status Indicator */}
      <View style={[styles.statusIndicator, isPaused && styles.statusPaused]}>
        <Text style={styles.statusText}>
          {isPaused ? "PAUSED" : "RECORDING"}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  statsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingHorizontal: 16,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 120,
    alignSelf: 'center',
    backgroundColor: 'rgba(14, 165, 233, 0.8)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  statusPaused: {
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default TrackingScreen;

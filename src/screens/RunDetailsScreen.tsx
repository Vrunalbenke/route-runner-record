
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { format, parseISO } from 'date-fns';
import { getRunDetails, deleteRun, RoutePoint } from '../utils/database';
import { formatDuration } from '../utils/location';
import StatCard from '../components/StatCard';
import { ArrowLeft, Trash2 } from 'lucide-react';

interface RouteParams {
  runId: number;
}

const RunDetailsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { runId } = route.params as RouteParams;
  
  const [loading, setLoading] = useState(true);
  const [runData, setRunData] = useState<any>(null);
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);
  const [region, setRegion] = useState({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  
  useEffect(() => {
    loadRunDetails();
  }, [runId]);

  const loadRunDetails = async () => {
    try {
      setLoading(true);
      const details = await getRunDetails(runId);
      setRunData(details.run);
      setRoutePoints(details.routePoints);
      
      if (details.routePoints.length > 0) {
        // Calculate center point of the route
        const lats = details.routePoints.map(p => p.latitude);
        const lngs = details.routePoints.map(p => p.longitude);
        
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);
        
        setRegion({
          latitude: (minLat + maxLat) / 2,
          longitude: (minLng + maxLng) / 2,
          latitudeDelta: (maxLat - minLat) * 1.5 || 0.01,
          longitudeDelta: (maxLng - minLng) * 1.5 || 0.01,
        });
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to load run details:', error);
      Alert.alert(
        'Error',
        'Could not load run details.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  };

  const handleDeleteRun = () => {
    Alert.alert(
      'Delete Run',
      'Are you sure you want to delete this run? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRun(runId);
              navigation.goBack();
            } catch (error) {
              console.error('Failed to delete run:', error);
              Alert.alert('Error', 'Could not delete the run.');
            }
          },
        },
      ]
    );
  };

  if (loading || !runData) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading run details...</Text>
      </View>
    );
  }

  // Calculate speed statistics
  const speeds = routePoints.map(point => point.speed).filter(speed => speed > 0);
  const maxSpeed = speeds.length > 0 ? Math.max(...speeds) : 0;
  const minSpeed = speeds.length > 0 ? Math.min(...speeds) : 0;
  
  const date = parseISO(runData.date);
  const formattedDate = format(date, 'EEEE, MMMM d, yyyy');
  const formattedTime = format(date, 'h:mm a');

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with back button and delete button */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Run Details</Text>
          
          <TouchableOpacity 
            style={styles.deleteButton} 
            onPress={handleDeleteRun}
          >
            <Trash2 size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
        
        {/* Date and Time */}
        <View style={styles.dateContainer}>
          <Text style={styles.date}>{formattedDate}</Text>
          <Text style={styles.time}>{formattedTime}</Text>
        </View>
        
        {/* Map */}
        <View style={styles.mapContainer}>
          <MapView
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
            style={styles.map}
            region={region}
            scrollEnabled={true}
            zoomEnabled={true}
            rotateEnabled={true}
          >
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
            
            {routePoints.length > 0 && (
              <>
                <Marker
                  coordinate={{
                    latitude: routePoints[0].latitude,
                    longitude: routePoints[0].longitude,
                  }}
                  title="Start"
                  pinColor="green"
                />
                
                <Marker
                  coordinate={{
                    latitude: routePoints[routePoints.length - 1].latitude,
                    longitude: routePoints[routePoints.length - 1].longitude,
                  }}
                  title="Finish"
                  pinColor="red"
                />
              </>
            )}
          </MapView>
        </View>
        
        {/* Primary Stats */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Distance"
            value={runData.distance.toFixed(2)}
            unit="km"
            color="#0EA5E9"
            size="large"
          />
          
          <StatCard
            title="Duration"
            value={formatDuration(runData.duration)}
            color="#F97316"
            size="large"
          />
          
          <StatCard
            title="Avg Speed"
            value={runData.avg_speed.toFixed(1)}
            unit="km/h"
            color="#8B5CF6"
            size="large"
          />
          
          <StatCard
            title="Calories"
            value={runData.calories.toString()}
            unit="kcal"
            color="#10B981"
            size="large"
          />
        </View>
        
        {/* Secondary Stats */}
        <View style={styles.secondaryStats}>
          <Text style={styles.sectionTitle}>Speed Details</Text>
          
          <View style={styles.speedStats}>
            <StatCard
              title="Max Speed"
              value={maxSpeed.toFixed(1)}
              unit="km/h"
              color="#F97316"
              size="medium"
            />
            
            <StatCard
              title="Min Speed"
              value={minSpeed.toFixed(1)}
              unit="km/h"
              color="#6B7280"
              size="medium"
            />
          </View>
        </View>
        
        {/* Bottom padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingBottom: 8,
    backgroundColor: 'white',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  deleteButton: {
    padding: 8,
  },
  dateContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  date: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  time: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  mapContainer: {
    height: 240,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  secondaryStats: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  speedStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bottomPadding: {
    height: 40,
  },
});

export default RunDetailsScreen;

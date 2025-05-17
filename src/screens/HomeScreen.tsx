
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getRuns, Run, initDatabase } from '../utils/database';
import RunItem from '../components/RunItem';
import TrackingButton from '../components/TrackingButton';
import { requestLocationPermission, isLocationEnabled } from '../utils/location';
import StatCard from '../components/StatCard';
import { Play } from 'lucide-react';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRuns: 0,
    totalDistance: 0,
    avgSpeed: 0,
  });

  // Initialize database and load runs
  useEffect(() => {
    const setup = async () => {
      try {
        await initDatabase();
        await loadRuns();
      } catch (error) {
        console.error('Database setup error:', error);
        Alert.alert(
          'Error',
          'Failed to set up the database. Please restart the app.'
        );
      }
    };
    
    setup();
  }, []);

  // Refresh runs when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadRuns();
    }, [])
  );

  const loadRuns = async () => {
    try {
      setLoading(true);
      const runData = await getRuns();
      setRuns(runData);
      
      // Calculate overall stats
      if (runData.length > 0) {
        const totalDistance = runData.reduce((sum, run) => sum + run.distance, 0);
        const totalSpeed = runData.reduce((sum, run) => sum + run.avg_speed, 0);
        
        setStats({
          totalRuns: runData.length,
          totalDistance: totalDistance,
          avgSpeed: totalSpeed / runData.length,
        });
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to load runs:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to load your runs.');
    }
  };

  const handleStartTracking = async () => {
    try {
      // Check location permissions
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'This app needs location access to track your runs.'
        );
        return;
      }
      
      // Check if location services are enabled
      const locationEnabled = await isLocationEnabled();
      if (!locationEnabled) {
        Alert.alert(
          'Location Services Disabled',
          'Please enable location services to track your runs.'
        );
        return;
      }
      
      // Navigate to tracking screen
      navigation.navigate('Tracking');
    } catch (error) {
      console.error('Error starting tracking:', error);
      Alert.alert('Error', 'Could not start tracking.');
    }
  };

  const handleRunPress = (runId: number) => {
    navigation.navigate('RunDetails', { runId });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Runs</Text>
        <TrackingButton
          title="New Run"
          onPress={handleStartTracking}
          type="primary"
          size="medium"
        />
      </View>
      
      {runs.length > 0 && (
        <View style={styles.statsContainer}>
          <StatCard 
            title="Total Runs"
            value={stats.totalRuns.toString()}
            color="#0EA5E9"
          />
          <StatCard 
            title="Total Distance"
            value={stats.totalDistance.toFixed(1)}
            unit="km"
            color="#F97316"
          />
          <StatCard 
            title="Avg Speed"
            value={stats.avgSpeed.toFixed(1)}
            unit="km/h"
            color="#8B5CF6"
          />
        </View>
      )}
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0EA5E9" />
        </View>
      ) : runs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Play size={48} color="#CBD5E0" />
          <Text style={styles.emptyText}>No runs recorded yet</Text>
          <Text style={styles.emptySubtext}>
            Start your first run by tapping the "New Run" button
          </Text>
          <TrackingButton
            title="Start Running"
            onPress={handleStartTracking}
            type="primary"
            size="large"
            style={styles.startButton}
          />
        </View>
      ) : (
        <FlatList
          data={runs}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <RunItem run={item} onPress={handleRunPress} />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  startButton: {
    marginTop: 16,
  },
});

export default HomeScreen;

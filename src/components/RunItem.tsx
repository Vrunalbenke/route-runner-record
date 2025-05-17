
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { format, parseISO } from 'date-fns';
import { Run } from '../utils/database';
import { formatDuration } from '../utils/location';
import { MapPin } from 'lucide-react';

interface RunItemProps {
  run: Run;
  onPress: (runId: number) => void;
}

const RunItem: React.FC<RunItemProps> = ({ run, onPress }) => {
  const date = parseISO(run.date);
  const formattedDate = format(date, 'MMM d, yyyy');
  const formattedTime = format(date, 'h:mm a');
  
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(run.id)}
      activeOpacity={0.7}
    >
      <View style={styles.dateContainer}>
        <Text style={styles.date}>{formattedDate}</Text>
        <Text style={styles.time}>{formattedTime}</Text>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statRow}>
          <MapPin size={16} color="#0EA5E9" />
          <Text style={styles.distance}>{run.distance.toFixed(2)} km</Text>
        </View>
        
        <View style={styles.detailsRow}>
          <Text style={styles.detail}>{formatDuration(run.duration)}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.detail}>{run.avg_speed.toFixed(1)} km/h</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.detail}>{run.calories} cal</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dateContainer: {
    marginRight: 16,
  },
  date: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  time: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  statsContainer: {
    flex: 1,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  distance: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0EA5E9',
    marginLeft: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detail: {
    fontSize: 13,
    color: '#6B7280',
  },
  dot: {
    fontSize: 13,
    color: '#CBD5E0',
    paddingHorizontal: 4,
  },
});

export default RunItem;

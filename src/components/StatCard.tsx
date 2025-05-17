
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatCardProps {
  title: string;
  value: string;
  unit?: string;
  color?: string;
  size?: 'small' | 'medium' | 'large';
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  color = '#0EA5E9',
  size = 'medium'
}) => {
  return (
    <View style={[
      styles.container,
      size === 'small' && styles.containerSmall,
      size === 'large' && styles.containerLarge
    ]}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.valueContainer}>
        <Text style={[
          styles.value,
          { color },
          size === 'small' && styles.valueSmall,
          size === 'large' && styles.valueLarge
        ]}>
          {value}
        </Text>
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    minWidth: 100,
  },
  containerSmall: {
    padding: 8,
  },
  containerLarge: {
    padding: 16,
    minWidth: 140,
  },
  title: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0EA5E9',
  },
  valueSmall: {
    fontSize: 18,
  },
  valueLarge: {
    fontSize: 32,
  },
  unit: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 2,
    marginBottom: 4,
  },
});

export default StatCard;

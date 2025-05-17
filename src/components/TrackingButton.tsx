
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

interface TrackingButtonProps {
  title: string;
  onPress: () => void;
  type?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  disabled?: boolean;
}

const TrackingButton: React.FC<TrackingButtonProps> = ({
  title,
  onPress,
  type = 'primary',
  size = 'medium',
  isLoading = false,
  disabled = false,
}) => {
  const getButtonStyle = () => {
    switch (type) {
      case 'secondary':
        return styles.buttonSecondary;
      case 'danger':
        return styles.buttonDanger;
      default:
        return styles.buttonPrimary;
    }
  };

  const getTextStyle = () => {
    switch (type) {
      case 'secondary':
        return styles.textSecondary;
      case 'danger':
        return styles.textDanger;
      default:
        return styles.textPrimary;
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case 'small':
        return styles.buttonSmall;
      case 'large':
        return styles.buttonLarge;
      default:
        return styles.buttonMedium;
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return styles.textSmall;
      case 'large':
        return styles.textLarge;
      default:
        return styles.textMedium;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        getButtonSize(),
        disabled && styles.buttonDisabled,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={isLoading || disabled}
    >
      {isLoading ? (
        <ActivityIndicator color={type === 'primary' ? 'white' : '#0EA5E9'} />
      ) : (
        <Text style={[styles.text, getTextStyle(), getTextSize()]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#0EA5E9',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#0EA5E9',
  },
  buttonDanger: {
    backgroundColor: '#EF4444',
  },
  buttonDisabled: {
    backgroundColor: '#CBD5E0',
    borderColor: '#CBD5E0',
  },
  buttonSmall: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    minWidth: 80,
  },
  buttonMedium: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    minWidth: 120,
  },
  buttonLarge: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    minWidth: 160,
  },
  text: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  textPrimary: {
    color: 'white',
  },
  textSecondary: {
    color: '#0EA5E9',
  },
  textDanger: {
    color: 'white',
  },
  textSmall: {
    fontSize: 14,
  },
  textMedium: {
    fontSize: 16,
  },
  textLarge: {
    fontSize: 18,
  },
});

export default TrackingButton;

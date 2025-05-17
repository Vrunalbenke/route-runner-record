
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TrackingProvider } from '../context/TrackingContext';
import HomeScreen from '../screens/HomeScreen';
import TrackingScreen from '../screens/TrackingScreen';
import RunDetailsScreen from '../screens/RunDetailsScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <TrackingProvider>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen 
            name="Tracking" 
            component={TrackingScreen} 
            options={{
              gestureEnabled: false, // Prevent accidental back gesture during tracking
            }}
          />
          <Stack.Screen name="RunDetails" component={RunDetailsScreen} />
        </Stack.Navigator>
      </TrackingProvider>
    </NavigationContainer>
  );
};

export default AppNavigator;

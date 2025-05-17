
import React, { useEffect, useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { initDatabase } from './utils/database';
import AppNavigator from './navigation/AppNavigator';

const App = () => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const prepare = async () => {
      try {
        // Initialize database
        await initDatabase();
        setIsReady(true);
      } catch (e) {
        console.error('Failed to initialize app:', e);
        setError('Failed to initialize database. Please restart the app.');
      }
    };

    prepare();
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <>
            <ActivityIndicator size="large" color="#0EA5E9" />
            <Text style={styles.loadingText}>Loading...</Text>
          </>
        )}
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      <SafeAreaView style={styles.container}>
        <AppNavigator />
      </SafeAreaView>
    </>
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
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    padding: 16,
  },
});

export default App;

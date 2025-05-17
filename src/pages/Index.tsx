
import React from 'react';
import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const [showInfo, setShowInfo] = useState(true);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="bg-blue-500 text-white rounded-t-lg">
          <CardTitle className="text-2xl font-bold">JogTracker App</CardTitle>
          <CardDescription className="text-blue-100">
            Track your jogging routes, distance, and pace
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Text style={styles.paragraph}>
              This is a mobile application for tracking your jogging activity. 
              It records your route, speed, distance, and provides detailed statistics of your runs.
            </Text>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-700 mb-2">Features:</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>GPS route tracking with interactive maps</li>
                <li>Speed monitoring during runs</li>
                <li>Detailed statistics for each workout</li>
                <li>Run history with saved routes</li>
                <li>Local storage with SQLite (no backend required)</li>
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-4">
          <p className="text-sm text-gray-500">
            Note: This is a React Native app intended for mobile devices.
          </p>
        </CardFooter>
      </Card>
      
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          To run this app, you'll need to export it to a React Native project.
        </p>
      </div>
    </div>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f9ff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#0EA5E9',
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 20,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 20,
    marginBottom: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#4B5563',
  },
  button: {
    marginTop: 30,
    backgroundColor: '#0EA5E9',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Index;

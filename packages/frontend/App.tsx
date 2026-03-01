import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { enableFreeze, enableScreens } from "react-native-screens";

// RN 0.81 Canary crashes when react-freeze or native screens try to use Suspense/Animated interactions.
enableFreeze(false);
enableScreens(false);

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
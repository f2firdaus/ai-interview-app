import React from "react";
import AppNavigator from "./src/navigation/AppNavigator";
import { enableFreeze, enableScreens } from "react-native-screens";

// RN 0.81 Canary crashes when react-freeze or native screens try to use Suspense/Animated interactions.
enableFreeze(false);
enableScreens(false);

export default function App() {
  return <AppNavigator />;
}
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/LoginScreen";
import OtpScreen from "../screens/OtpScreen";
import UploadScreen from "../screens/UploadScreen";
import InterviewScreen from "../screens/InterviewScreen";
const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="OTP" component={OtpScreen} />
        <Stack.Screen name="Upload" component={UploadScreen} />
        <Stack.Screen name="Interview" component={InterviewScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

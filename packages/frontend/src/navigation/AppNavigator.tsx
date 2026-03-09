import React, { useEffect, useState } from "react";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import OtpScreen from "../screens/OtpScreen";
import UploadScreen from "../screens/UploadScreen";
import InterviewScreen from "../screens/InterviewScreen";
import InterviewDetailScreen from "../screens/InterviewDetailScreen";
import HomeScreen from "../screens/HomeScreen";
import HistoryScreen from "../screens/HistoryScreen";
import ScheduleScreen from "../screens/ScheduleScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: "#0A0E17", // Matches the deep background to eliminate white flashes
  },
};

// Create the Main Tab Navigator for inside the app
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#0F1623",
          borderTopWidth: 1,
          borderTopColor: "#1F2937",
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: "#3B82F6",
        tabBarInactiveTintColor: "#6B7280",
        tabBarIcon: ({ color, size }) => {
          let iconName: any = "alert";
          if (route.name === "Home") iconName = "home";
          else if (route.name === "History") iconName = "time";
          else if (route.name === "Schedule") iconName = "calendar";
          else if (route.name === "Profile") iconName = "person";
          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Schedule" component={ScheduleScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const [initRoute, setInitRoute] = useState<"Login" | "Main" | null>(null);

  useEffect(() => {
    AsyncStorage.getItem("userToken").then((token) => {
      if (token) {
        setInitRoute("Main");
      } else {
        setInitRoute("Login");
      }
    });
  }, []);

  if (initRoute === null) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0A0E17", justifyContent: "center", alignItems: "center" }}>
        <View style={{ width: 72, height: 72, borderRadius: 20, backgroundColor: "#1D2D49", justifyContent: "center", alignItems: "center", marginBottom: 20 }}>
          <Ionicons name="mic" size={36} color="#3B82F6" />
        </View>
        <View style={{ alignItems: "center" }}>
          <ActivityIndicator size="small" color="#3B82F6" style={{ marginTop: 40 }} />
        </View>
      </View>
    );
  }

  return (
    <NavigationContainer theme={CustomDarkTheme}>
      <Stack.Navigator
        initialRouteName={initRoute}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0A0E17' },
          animation: 'slide_from_right'
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="OTP" component={OtpScreen} />
        <Stack.Screen name="Upload" component={UploadScreen} />
        <Stack.Screen name="Interview" component={InterviewScreen} />
        <Stack.Screen name="InterviewDetail" component={InterviewDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

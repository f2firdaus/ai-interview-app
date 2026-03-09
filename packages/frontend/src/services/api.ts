import axios from "axios";
import { Platform } from "react-native";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Auto-detect backend URL:
// - Android emulator uses 10.0.2.2 to reach host machine
// - iOS simulator uses localhost
// - Physical device uses the dev machine IP from Expo
function getBaseUrl(): string {
  // Try to get the debuggerHost from Expo (works on physical devices)
  const debuggerHost = Constants.expoConfig?.hostUri ?? Constants.manifest2?.extra?.expoGo?.debuggerHost;

  if (debuggerHost) {
    const ip = debuggerHost.split(":")[0];
    return `http://${ip}:5000/api`;
  }

  // Fallback for emulators
  if (Platform.OS === "android") {
    return "http://10.0.2.2:5000/api";
  }

  return "http://localhost:5000/api";
}

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 120000,
});

console.log("🌐 Axios baseURL configured as:", api.defaults.baseURL);

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("userToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.log("API Error Data:", error.response.data);
      console.log("API Error Status:", error.response.status);
    } else if (error.request) {
      console.log("API No Response:", error.request._url || error.message);
    } else {
      console.log("API Error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
  StatusBar,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import api from "../services/api";
import { useCustomAlert } from "../context/AlertContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showAlert } = useCustomAlert();

  const handleLogin = async () => {
    if (!email || !password) {
      showAlert("Error", "Please fill in all fields", [{ text: "OK", style: "cancel" }]);
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });

      if (response.data.token) {
        await AsyncStorage.setItem("userToken", response.data.token);
        navigation.reset({
          index: 0,
          routes: [{ name: "Main" }],
        });
      }
    } catch (err: any) {
      console.log("LOGIN ERROR:", err?.response?.data || err.message);
      const msg = err.response?.data?.error || "Login failed";
      showAlert("Failed to login", msg, [{ text: "OK", style: "destructive" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.logoRow}>
              <View style={styles.logoBox}>
                <MaterialCommunityIcons name="head-cog" size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.logoText}>HireAI</Text>
            </View>
          </View>

          <View style={styles.content}>
            {/* Titles */}
            <Text style={styles.mainTitle}>Welcome back</Text>
            <Text style={styles.subTitle}>
              Log in to continue your AI-powered interview preparation and land your dream job.
            </Text>

            {/* Email Input */}
            <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="name@example.com"
                placeholderTextColor="#6B7280"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Password Input */}
            <Text style={styles.inputLabel}>PASSWORD</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="••••••••"
                placeholderTextColor="#6B7280"
                secureTextEntry={!isPasswordVisible}
                autoCapitalize="none"
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                style={{ padding: 4 }}
              >
                <Ionicons
                  name={isPasswordVisible ? "eye-off" : "eye"}
                  size={20}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>

            {/* Button */}
            <TouchableOpacity style={styles.submitButton} onPress={handleLogin} disabled={loading}>
              <Text style={styles.submitButtonText}>{loading ? "Logging in..." : "Log In"}</Text>
            </TouchableOpacity>

          </View>

          {/* Footer */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>
              New here?{" "}
              <Text
                style={styles.linkText}
                onPress={() => navigation.navigate("Signup")}
              >
                Create an account
              </Text>
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView >
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#10141E",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    marginBottom: 40,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  logoText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  mainTitle: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  subTitle: {
    color: "#9CA3AF",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 40,
  },
  inputLabel: {
    color: "#E5E7EB",
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#161925",
    borderWidth: 1,
    borderColor: "#282F3E",
    borderRadius: 14,
    height: 56,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: "#3B82F6",
    height: 56,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },

  footerContainer: {
    borderTopWidth: 1,
    borderTopColor: "#1B2232",
    paddingVertical: 24,
    backgroundColor: "#0D111A", // Slight darker footer matching the image bottom cut
  },
  footerText: {
    textAlign: "center",
    color: "#9CA3AF",
    fontSize: 14,
  },
  linkText: {
    color: "#3B82F6",
    fontWeight: "bold",
  },
});

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
import { useAuth } from "../context/AuthContext";

export default function LoginScreen({ navigation }: any) {
  const [phone, setPhone] = useState("");
  const { loginWithGoogle } = useAuth();

  const handleSendOtp = async () => {
    if (phone.length < 10) return;
    try {
      await api.post("/auth/request", { phone });
      navigation.navigate("OTP", { phone });
    } catch (err: any) {
      console.log("OTP ERROR:", err?.response?.data || err.message);
      Alert.alert("Failed to send OTP");
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
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
            </TouchableOpacity>
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

            {/* Input */}
            <Text style={styles.inputLabel}>PHONE NUMBER</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="call" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="+1 (555) 000-0000"
                placeholderTextColor="#6B7280"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            {/* Button */}
            <TouchableOpacity style={styles.submitButton} onPress={handleSendOtp}>
              <Text style={styles.submitButtonText}>Send OTP</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Buttons */}
            <View style={styles.socialRow}>
              <TouchableOpacity
                style={styles.socialBtn}
                onPress={async () => {
                  try {
                    await loginWithGoogle();
                    navigation.navigate("Main");
                  } catch (e) {
                    console.error(e);
                  }
                }}
              >
                <Ionicons name="logo-google" size={20} color="#FFFFFF" />
                <Text style={styles.socialBtnText}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn} onPress={() => navigation.navigate("Main")}>
                <Ionicons name="logo-apple" size={20} color="#FFFFFF" />
                <Text style={styles.socialBtnText}>Apple</Text>
              </TouchableOpacity>
            </View>
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
    </SafeAreaView>
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    marginBottom: 40,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1B2232",
    justifyContent: "center",
    alignItems: "center",
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
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#282F3E",
  },
  dividerText: {
    color: "#9CA3AF",
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 1,
    paddingHorizontal: 16,
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  socialBtn: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#161925",
    borderWidth: 1,
    borderColor: "#282F3E",
    borderRadius: 14,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 8,
  },
  socialBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
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

import React, { useState } from "react";
import api from "../services/api";
import { Alert } from "react-native";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function OtpScreen({ navigation, route }: any) {
  const [otp, setOtp] = useState("");

  const verifyOtp = async () => {
    if (otp.length < 4) return;

    try {
      await api.post("/auth/verify", {
        phone: route.params.phone,
        otp,
      });

      navigation.navigate("Main");
    } catch (err: any) {
      console.log(err?.response?.data || err.message);
      Alert.alert("Invalid OTP");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="shield-checkmark" size={40} color="#3B82F6" />
          </View>
        </View>

        <Text style={styles.title}>Verify Your Number</Text>
        <Text style={styles.subtitle}>
          We sent a verification code to{"\n"}
          <Text style={styles.phoneText}>{route?.params?.phone}</Text>
        </Text>

        <Text style={styles.inputLabel}>VERIFICATION CODE</Text>
        <TextInput
          placeholder="Enter OTP"
          placeholderTextColor="#6B7280"
          keyboardType="number-pad"
          value={otp}
          onChangeText={setOtp}
          style={styles.input}
          maxLength={6}
        />

        <TouchableOpacity style={styles.button} onPress={verifyOtp}>
          <Text style={styles.buttonText}>Verify OTP</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.resendRow}>
          <Text style={styles.resendText}>Didn't receive the code? </Text>
          <Text style={styles.resendLink}>Resend</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0A0E17",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  headerRow: {
    paddingTop: 16,
    marginBottom: 40,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#161B28",
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#15244A",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1E3A8A",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    color: "#9CA3AF",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 40,
  },
  phoneText: {
    color: "#3B82F6",
    fontWeight: "bold",
  },
  inputLabel: {
    color: "#E5E7EB",
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#161925",
    borderWidth: 1,
    borderColor: "#282F3E",
    borderRadius: 14,
    height: 56,
    paddingHorizontal: 16,
    color: "#FFFFFF",
    fontSize: 20,
    letterSpacing: 8,
    textAlign: "center",
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#3B82F6",
    height: 56,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  resendRow: {
    flexDirection: "row",
    justifyContent: "center",
  },
  resendText: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  resendLink: {
    color: "#3B82F6",
    fontSize: 14,
    fontWeight: "bold",
  },
});

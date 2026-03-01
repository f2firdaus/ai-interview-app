import React, { useState } from "react";
import api from "../services/api";
import { Alert } from "react-native";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

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
    <View style={styles.container}>

      <Text style={styles.title}>
        OTP sent to {route?.params.phone}
      </Text>

      <TextInput
        placeholder="Enter OTP"
        keyboardType="number-pad"
        value={otp}
        onChangeText={setOtp}
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={verifyOtp}>
        <Text style={styles.buttonText}>Verify OTP</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#f9fafb",
  },

  title: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },

  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
  },

  button: {
    backgroundColor: "#16a34a",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});

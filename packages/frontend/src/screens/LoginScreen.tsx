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

export default function LoginScreen({ navigation }: any) {
  const [phone, setPhone] = useState("");

 const handleLogin = async () => {
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
    <View style={styles.container}>
      <Text style={styles.title}>AI Interview App</Text>

      <TextInput
        placeholder="Enter mobile number"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Send OTP</Text>
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
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
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
    backgroundColor: "#2563eb",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

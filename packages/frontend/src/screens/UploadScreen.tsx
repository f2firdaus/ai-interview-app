import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  StatusBar,
  Platform
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import api from "../services/api";

const UploadScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    try {
      const file = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
      });

      if (file.canceled) return;

      const asset = file.assets[0];
      const formData = new FormData();

      formData.append("resume", {
        uri: asset.uri,
        name: asset.name || "resume.pdf",
        type: asset.mimeType || "application/pdf",
      } as any);

      setLoading(true);

      const response = await api.post("/resume/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        transformRequest: (data) => data,
      });

      if (response.data && response.data.questions) {
        setLoading(false);
        navigation.navigate("Interview", {
          questions: response.data.questions
        });
      } else {
        setLoading(false);
        Alert.alert("Error", "AI couldn't generate questions. Try a different resume.");
      }
    } catch (error: any) {
      setLoading(false);
      console.error("Upload Error:", error);
      const errorMsg = error.response?.data?.error || "Network Error: Check your connection";
      Alert.alert("Upload Failed", errorMsg);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <View style={styles.content}>

        {/* Glowing Icon Container */}
        <View style={styles.iconGlowWrap}>
          <LinearGradient
            colors={["rgba(59, 130, 246, 0.2)", "rgba(139, 92, 246, 0.2)"]}
            style={styles.iconBackground}
          >
            <Ionicons name="document-text" size={70} color="#60a5fa" />
          </LinearGradient>
        </View>

        <Text style={styles.title}>AI Interview Coach</Text>
        <Text style={styles.subtitle}>
          Upload your resume and our AI will generate personalized technical interview questions.
        </Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#60a5fa" />
            <Text style={styles.loadingText}>Analyzing Resume</Text>
            <Text style={styles.subLoadingText}>Generating tailored questions...</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.touchableArea}
            activeOpacity={0.8}
            onPress={handleUpload}
          >
            <LinearGradient
              colors={["#3b82f6", "#6366f1"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.uploadBtn}
            >
              <Ionicons name="cloud-upload" size={24} color="#fff" style={styles.btnIcon} />
              <Text style={styles.btnText}>Upload Resume (PDF)</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

export default UploadScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a", // Deep Slate
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  iconGlowWrap: {
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 40,
  },
  iconBackground: {
    padding: 35,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(96, 165, 250, 0.3)",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#f8fafc",
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 26,
    marginBottom: 50,
    paddingHorizontal: 10,
  },
  touchableArea: {
    width: "100%",
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },
  uploadBtn: {
    width: "100%",
    paddingVertical: 18,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  btnIcon: {
    marginRight: 10,
  },
  btnText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "bold",
    color: "#e2e8f0",
  },
  subLoadingText: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 8,
  },
});
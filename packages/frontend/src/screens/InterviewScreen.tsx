import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  Platform,
  SafeAreaView,
} from "react-native";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";

// Log the detected API URL on load
console.log("🌐 API Base URL:", api.defaults.baseURL);

type FeedbackItem = {
  question: string;
  answer: string;
  score: number;
  strength: string;
  improvement: string;
  betterAnswer?: string;
};

export default function InterviewScreen({ route, navigation }: any) {
  const { questions } = route.params || { questions: [] };
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [allResults, setAllResults] = useState<FeedbackItem[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [savedInterviewId, setSavedInterviewId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const recordingRef = useRef<Audio.Recording | null>(null);


  // --- Recording Functions (using expo-av) ---
  async function startRecording() {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission", "Microphone permission is required.");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Android: use AMR format (native, small files, supported by HF Whisper)
      // iOS: use WAV/PCM (native, supported by HF Whisper)
      const recordingOptions = Platform.OS === "android"
        ? {
          isMeteringEnabled: false,
          android: {
            extension: ".amr",
            outputFormat: Audio.AndroidOutputFormat.AMR_NB,
            audioEncoder: Audio.AndroidAudioEncoder.AMR_NB,
            sampleRate: 8000,
            numberOfChannels: 1,
            bitRate: 12200,
          },
          ios: {
            extension: ".wav",
            outputFormat: Audio.IOSOutputFormat.LINEARPCM,
            audioQuality: Audio.IOSAudioQuality.MEDIUM,
            sampleRate: 16000,
            numberOfChannels: 1,
            bitRate: 128000,
            linearPCMBitDepth: 16,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false,
          },
          web: { mimeType: "audio/webm", bitsPerSecond: 128000 },
        }
        : {
          isMeteringEnabled: false,
          android: {
            extension: ".amr",
            outputFormat: Audio.AndroidOutputFormat.AMR_NB,
            audioEncoder: Audio.AndroidAudioEncoder.AMR_NB,
            sampleRate: 8000,
            numberOfChannels: 1,
            bitRate: 12200,
          },
          ios: {
            extension: ".wav",
            outputFormat: Audio.IOSOutputFormat.LINEARPCM,
            audioQuality: Audio.IOSAudioQuality.MEDIUM,
            sampleRate: 16000,
            numberOfChannels: 1,
            bitRate: 128000,
            linearPCMBitDepth: 16,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false,
          },
          web: { mimeType: "audio/webm", bitsPerSecond: 128000 },
        };

      const { recording } = await Audio.Recording.createAsync(recordingOptions);
      recordingRef.current = recording;
      setIsRecording(true);
      console.log("🎙️ Recording started (format:", Platform.OS === "android" ? "AMR" : "WAV", ")");
    } catch (err) {
      console.error("Failed to start recording:", err);
      Alert.alert("Error", "Could not start recording. Please check microphone permissions.");
      setIsRecording(false);
    }
  }

  async function stopRecording() {
    try {
      setIsRecording(false);
      setIsProcessing(true);

      const recording = recordingRef.current;
      if (!recording) {
        console.log("❌ No active recording found");
        Alert.alert("Error", "No active recording found.");
        setIsProcessing(false);
        return;
      }

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      recordingRef.current = null;

      console.log("🎤 Recording stopped. URI:", uri);
      if (uri) {
        await transcribeAudio(uri);
      } else {
        console.log("❌ No recording URI available");
        Alert.alert("Error", "Recording failed - no audio file was created. Please try again.");
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Stop error:", error);
      Alert.alert("Error", "Failed to stop recording. Please try again.");
      setIsProcessing(false);
    }
  }

  function toggleRecording() {
    if (isRecording) stopRecording();
    else startRecording();
  }

  // --- Transcribe Audio ---
  const transcribeAudio = async (uri: string) => {
    try {
      setIsProcessing(true);
      console.log("📤 Sending audio for transcription, URI:", uri);

      // Detect format from URI or platform
      const isAmr = Platform.OS === "android";
      const fileName = isAmr ? "answer.amr" : "answer.wav";
      const mimeType = isAmr ? "audio/amr" : "audio/wav";

      const formData = new FormData();
      formData.append("audio", {
        uri,
        name: fileName,
        type: mimeType,
      } as any);

      const res = await api.post("/ai/transcribe", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("📥 Transcription response:", JSON.stringify(res.data));
      const newText = res.data.text;
      if (newText && newText.trim()) {
        setAnswer((prev: string) => (prev ? prev + " " + newText : newText));
        console.log("✅ Answer updated with transcribed text");
      } else {
        console.log("⚠️ Transcription returned empty text");
        Alert.alert("Notice", "Could not recognize speech. Please speak clearly and try again.");
      }
    } catch (e: any) {
      console.error("Transcription error:", e?.response?.data || e?.message || e);
      Alert.alert("Error", "Speech recognition failed. Make sure the backend has ffmpeg installed.");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- Evaluate Answer ---
  const handleEvaluate = async () => {
    if (!answer.trim()) return Alert.alert("Wait", "Please provide an answer.");
    setIsProcessing(true);
    try {
      const res = await api.post("/ai/evaluate", {
        question: questions[currentIndex],
        answer,
      });

      const fb = res.data.feedback;
      setFeedback(fb);

      setAllResults((prev) => [
        ...prev,
        {
          question: questions[currentIndex],
          answer,
          score: fb.score || 0,
          strength: fb.strength || "",
          improvement: fb.improvement || "",
          betterAnswer: fb.betterAnswer || "",
        },
      ]);

      // Score feedback saved silently (no speech)
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Evaluation failed");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- Save Results to Backend ---
  const saveResults = async (results: FeedbackItem[]) => {
    try {
      setIsSaving(true);
      // 1. Create an interview record
      const createRes = await api.post("/interviews", {
        title: `Interview - ${new Date().toLocaleDateString()}`,
        date: new Date().toISOString(),
      });
      const interviewId = createRes.data._id;

      // 2. Calculate overall score
      const answered = results.filter((r) => r.score > 0);
      const avgScore = answered.length > 0
        ? Math.round((answered.reduce((s, r) => s + r.score, 0) / answered.length) * 10) / 10
        : 0;

      // 3. Complete it with results
      await api.put(`/interviews/${interviewId}/complete`, {
        score: avgScore,
        feedback: `Completed ${answered.length}/${results.length} questions with an average score of ${avgScore}/10.`,
        questions: results,
      });

      setSavedInterviewId(interviewId);
    } catch (err) {
      console.log("Error saving results:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // --- Next Question or Finish ---
  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      setIsComplete(true);
      // Save all results (the current feedback was already added to allResults)
      const finalResults = [...allResults];
      saveResults(finalResults);
    } else {
      setCurrentIndex(currentIndex + 1);
      setFeedback(null);
      setAnswer("");
    }
  };

  // --- Skip Question ---
  const handleSkip = () => {
    setAllResults((prev) => [
      ...prev,
      {
        question: questions[currentIndex],
        answer: "(Skipped)",
        score: 0,
        strength: "-",
        improvement: "Question was skipped",
      },
    ]);
    handleNext();
  };

  // --- Calculate Overall Stats ---
  const getOverallScore = () => {
    const answered = allResults.filter((r) => r.score > 0);
    if (answered.length === 0) return 0;
    const total = answered.reduce((sum, r) => sum + r.score, 0);
    return (total / answered.length).toFixed(1);
  };

  // =================== FINAL RESULTS SCREEN ===================
  if (isComplete) {
    const avgScore = getOverallScore();
    const answered = allResults.filter((r) => r.score > 0);
    const skipped = allResults.filter((r) => r.score === 0);

    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
        <ScrollView style={styles.container} contentContainerStyle={{ padding: 25 }}>
          <Text style={styles.resultTitle}>🎉 Interview Complete!</Text>

          <View style={styles.scoreCard}>
            <Text style={styles.bigScore}>{avgScore}</Text>
            <Text style={styles.outOf}>/10</Text>
          </View>
          <Text style={styles.scoreLabel}>Average Score</Text>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{answered.length}</Text>
              <Text style={styles.statLabel}>Answered</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{skipped.length}</Text>
              <Text style={styles.statLabel}>Skipped</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{questions.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Question-by-Question Results</Text>

          {allResults.map((r, i) => (
            <View key={i} style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultQ}>Q{i + 1}</Text>
                <Text
                  style={[
                    styles.resultScore,
                    { color: r.score >= 7 ? "#10b981" : r.score >= 4 ? "#f59e0b" : "#ef4444" },
                  ]}
                >
                  {r.score}/10
                </Text>
              </View>
              <Text style={styles.resultQuestion} numberOfLines={2}>
                {r.question}
              </Text>
              {r.strength && r.strength !== "-" && (
                <Text style={styles.resultStrength}>✅ {r.strength}</Text>
              )}
              {r.improvement && r.improvement !== "Question was skipped" && (
                <Text style={styles.resultImprove}>📈 {r.improvement}</Text>
              )}
            </View>
          ))}

          {isSaving ? (
            <View style={{ alignItems: "center", marginTop: 20, marginBottom: 40 }}>
              <ActivityIndicator size="small" color="#3B82F6" />
              <Text style={{ color: "#94a3b8", marginTop: 10 }}>Saving results...</Text>
            </View>
          ) : (
            <View style={{ marginTop: 20, marginBottom: 40 }}>
              <TouchableOpacity
                style={[styles.submitBtn, { marginBottom: 12 }]}
                onPress={() => navigation.navigate("Upload")}
              >
                <Text style={styles.btnText}>Start New Interview</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.skipBtn, { alignItems: "center" }]}
                onPress={() => navigation.navigate("Main")}
              >
                <Text style={styles.skipBtnText}>Back to Home</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // =================== INTERVIEW SCREEN ===================
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${((currentIndex + 1) / questions.length) * 100}%` as any },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {currentIndex + 1} / {questions.length}
          </Text>
        </View>

        {/* Question */}
        <Text style={styles.qText}>{questions[currentIndex]}</Text>

        {/* Answer Input */}
        <TextInput
          style={styles.input}
          multiline
          value={answer}
          onChangeText={setAnswer}
          placeholder="Your answer will appear here..."
          placeholderTextColor="#64748b"
        />

        {/* Mic Button */}
        <View style={styles.micContainer}>
          <TouchableOpacity
            style={[styles.micBtn, isRecording && styles.micActive]}
            onPress={toggleRecording}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Ionicons
                name={isRecording ? "stop" : "mic"}
                size={32}
                color="#fff"
              />
            )}
          </TouchableOpacity>
          <Text style={styles.hintText}>
            {isProcessing ? "Processing..." : isRecording ? "Tap to Stop" : "Tap to Speak"}
          </Text>
        </View>

        {/* Feedback Box */}
        {feedback && (
          <View style={styles.feedbackBox}>
            <Text style={styles.scoreText}>Score: {feedback.score}/10</Text>
            <Text style={styles.feedbackItem}>✅ {feedback.strength}</Text>
            {feedback.improvement && (
              <Text style={styles.feedbackItem}>📈 {feedback.improvement}</Text>
            )}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          {!feedback && (
            <TouchableOpacity
              style={styles.skipBtn}
              onPress={handleSkip}
              disabled={isProcessing}
            >
              <Text style={styles.skipBtnText}>Skip</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.submitBtn, { flex: 1 }]}
            onPress={feedback ? handleNext : handleEvaluate}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>
                {feedback
                  ? currentIndex + 1 >= questions.length
                    ? "See Results"
                    : "Next Question"
                  : "Submit Answer"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0f172a",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  scrollContent: {
    padding: 25,
    justifyContent: "center",
    flexGrow: 1,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: "#1e293b",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3b82f6",
    borderRadius: 4,
  },
  progressText: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: "700",
    color: "#94a3b8",
  },
  qText: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 24,
    textAlign: "center",
    color: "#f8fafc",
    lineHeight: 30,
  },
  input: {
    backgroundColor: "#1e293b",
    color: "#f8fafc",
    borderRadius: 16,
    padding: 18,
    height: 140,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#334155",
    fontSize: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  micContainer: { alignItems: "center", marginVertical: 30 },
  micBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  micActive: {
    backgroundColor: "#ef4444",
    shadowColor: "#ef4444",
    transform: [{ scale: 1.15 }]
  },
  hintText: { marginTop: 15, color: "#94a3b8", fontSize: 14, fontWeight: "600" },
  buttonRow: {
    flexDirection: "row",
    gap: 15,
    marginTop: 10,
  },
  submitBtn: {
    backgroundColor: "#10b981",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  skipBtn: {
    backgroundColor: "#334155",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    paddingHorizontal: 28,
  },
  skipBtnText: { color: "#cbd5e1", fontWeight: "700", fontSize: 16 },
  btnText: { color: "#ffffff", fontWeight: "bold", fontSize: 16, letterSpacing: 0.5 },
  feedbackBox: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    padding: 18,
    borderRadius: 16,
    marginTop: 15,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  scoreText: { fontWeight: "900", fontSize: 20, color: "#34d399", marginBottom: 10 },
  feedbackItem: { fontSize: 15, color: "#e2e8f0", marginTop: 6, lineHeight: 22 },
  resultTitle: {
    fontSize: 32,
    fontWeight: "900",
    textAlign: "center",
    color: "#f8fafc",
    marginTop: 30,
    marginBottom: 10,
  },
  scoreCard: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "baseline",
    marginTop: 10,
  },
  bigScore: { fontSize: 72, fontWeight: "900", color: "#60a5fa" },
  outOf: { fontSize: 24, color: "#64748b", marginLeft: 8, fontWeight: "700" },
  scoreLabel: {
    textAlign: "center",
    fontSize: 16,
    color: "#94a3b8",
    marginBottom: 30,
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 40,
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#334155",
  },
  statBox: { alignItems: "center" },
  statNum: { fontSize: 28, fontWeight: "800", color: "#f8fafc" },
  statLabel: { fontSize: 13, color: "#94a3b8", marginTop: 6, fontWeight: "600" },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#f8fafc",
    marginBottom: 20,
  },
  resultCard: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    alignItems: "center",
  },
  resultQ: { fontWeight: "800", color: "#60a5fa", fontSize: 16 },
  resultScore: { fontWeight: "900", fontSize: 18 },
  resultQuestion: { fontSize: 15, color: "#cbd5e1", marginBottom: 12, lineHeight: 22 },
  resultStrength: { fontSize: 14, color: "#34d399", marginTop: 4, fontWeight: "500" },
  resultImprove: { fontSize: 14, color: "#fbbf24", marginTop: 6, fontWeight: "500" },
});

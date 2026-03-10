import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";

export default function HistoryScreen({ navigation }: any) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await api.get("/interviews?status=completed");
      setHistory(res.data);
    } catch (err) {
      console.log("Error fetching history");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchHistory();
    });
    return unsubscribe;
  }, [navigation, fetchHistory]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Past Interviews</Text>
        <TouchableOpacity onPress={() => { setRefreshing(true); fetchHistory(); }} style={styles.headerBtn}>
          <Ionicons name="refresh" size={22} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchHistory(); }} tintColor="#3B82F6" />
          }
        >
          {history.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={64} color="#374151" />
              <Text style={styles.emptyText}>No completed interviews yet.</Text>
              <Text style={styles.emptySubtext}>Complete a mock interview to see your results here.</Text>
            </View>
          ) : (
            history.map((item) => (
              <View key={item._id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <View style={styles.scoreBadge}>
                    <Text style={styles.scoreText}>{item.score || 0}/10</Text>
                  </View>
                </View>
                <Text style={styles.cardDate}>
                  {new Date(item.date).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", year: "numeric"
                  })}
                </Text>

                {item.feedback ? (
                  <Text style={styles.feedbackText} numberOfLines={2}>
                    {item.feedback}
                  </Text>
                ) : null}

                <TouchableOpacity
                  style={styles.viewDetailsBtn}
                  onPress={() => navigation.navigate("InterviewDetail", { interview: item })}
                >
                  <Text style={styles.viewDetailsText}>View AI Feedback</Text>
                  <Ionicons name="arrow-forward" size={16} color="#3B82F6" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0A0E17",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#1F2937",
  },
  headerBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#161B28", justifyContent: "center", alignItems: "center" },
  headerTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "bold" },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContainer: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },
  emptyState: { alignItems: "center", marginTop: 80 },
  emptyText: { color: "#9CA3AF", fontSize: 16, marginTop: 16 },
  emptySubtext: { color: "#6B7280", fontSize: 13, marginTop: 8, textAlign: "center", paddingHorizontal: 40 },

  card: {
    backgroundColor: "#101623",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#1F2937",
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  cardTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "bold", flex: 1, paddingRight: 12 },
  scoreBadge: { backgroundColor: "#15244A", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: "#1E3A8A" },
  scoreText: { color: "#3B82F6", fontSize: 14, fontWeight: "bold" },
  cardDate: { color: "#9CA3AF", fontSize: 13, marginBottom: 12 },
  feedbackText: { color: "#D1D5DB", fontSize: 14, lineHeight: 20, marginBottom: 16 },

  viewDetailsBtn: { flexDirection: "row", alignItems: "center", paddingTop: 16, borderTopWidth: 1, borderTopColor: "#1F2937" },
  viewDetailsText: { color: "#3B82F6", fontSize: 14, fontWeight: "bold", marginRight: 8 },
});

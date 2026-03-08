import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import api from "../services/api";

interface Stats {
  avgScore: number;
  totalCompleted: number;
  totalUpcoming: number;
  sessionsThisWeek: number;
  nextSession: any;
  recentUpcoming: any[];
}

export default function HomeScreen({ navigation }: any) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get("/interviews/stats");
      setStats(res.data);
    } catch (err) {
      console.log("Error fetching stats:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Refresh when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchStats();
    });
    return unsubscribe;
  }, [navigation, fetchStats]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const completionPercent =
    stats && stats.totalCompleted + stats.totalUpcoming > 0
      ? Math.round(
        (stats.totalCompleted / (stats.totalCompleted + stats.totalUpcoming)) * 100
      )
      : 0;

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <View style={styles.logoBox}>
              <MaterialCommunityIcons name="head-cog" size={20} color="#3B82F6" />
            </View>
            <Text style={styles.headerTitle}>InterviewAI</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="notifications" size={20} color="#3B82F6" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={16} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Welcome Section */}
        <Text style={styles.welcomeTitle}>Welcome back! 👋</Text>
        <Text style={styles.welcomeSubtitle}>
          {stats && stats.totalCompleted > 0
            ? `Your preparation is ${completionPercent}% complete. Keep going!`
            : "Ready to ace your next big interview? Upload a resume to get started."}
        </Text>

        {/* Primary Action Card */}
        <View style={styles.actionCard}>
          <View style={styles.actionCardTop}>
            <Ionicons name="mic-outline" size={48} color="#3B82F6" style={styles.cardIcon} />
            <View style={styles.tag}>
              <Text style={styles.tagText}>RECOMMENDED</Text>
            </View>
          </View>
          <View style={styles.actionCardBottom}>
            <Text style={styles.cardTitle}>Start Mock Interview</Text>
            <Text style={styles.cardSubtitle}>
              Upload your resume and practice with AI-generated questions tailored to your experience.
            </Text>
            <View style={styles.cardFooter}>
              <View style={styles.sessionsRow}>
                <View style={[styles.overlapCircle, { backgroundColor: "#60A5FA", left: 0, zIndex: 3 }]} />
                <View style={[styles.overlapCircle, { backgroundColor: "#3B82F6", left: -10, zIndex: 2 }]} />
                <View style={[styles.overlapCircle, { backgroundColor: "#2563EB", left: -20, zIndex: 1 }]} />
                <Text style={styles.sessionsText}>
                  {stats?.sessionsThisWeek || 0} sessions this week
                </Text>
              </View>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => navigation.navigate("Upload")}
              >
                <Text style={styles.primaryButtonText}>Start Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Performance Summary */}
        <Text style={styles.sectionTitle}>PERFORMANCE SUMMARY</Text>
        <View style={styles.performanceRow}>
          <View style={styles.statsCard}>
            <Ionicons name="bar-chart" size={24} color="#3B82F6" style={styles.statsIcon} />
            <Text style={styles.statsLabel}>Avg. Score</Text>
            <Text style={styles.statsValue}>{stats?.avgScore || 0}%</Text>
            <Text style={styles.statsGrowth}>
              {stats && stats.totalCompleted > 0 ? "Based on all interviews" : "No data yet"}
            </Text>
          </View>
          <View style={styles.statsCard}>
            <Ionicons name="checkmark-done" size={24} color="#3B82F6" style={styles.statsIcon} />
            <Text style={styles.statsLabel}>Completed</Text>
            <Text style={styles.statsValue}>{stats?.totalCompleted || 0}</Text>
            <Text style={styles.statsSublabel}>Total interviews</Text>
          </View>
        </View>

        {/* Upcoming Sessions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>UPCOMING SESSIONS</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Schedule")}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {stats?.recentUpcoming && stats.recentUpcoming.length > 0 ? (
          stats.recentUpcoming.map((item: any, index: number) => {
            const dateObj = new Date(item.date);
            const month = dateObj
              .toLocaleDateString("en-US", { month: "short" })
              .toUpperCase();
            const day = dateObj.getDate();
            const time = dateObj.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <TouchableOpacity
                key={item._id || index}
                style={styles.sessionCard}
                onPress={() => navigation.navigate("Upload")}
              >
                <View style={styles.dateBox}>
                  <Text style={styles.dateMonth}>{month}</Text>
                  <Text style={styles.dateDay}>{day}</Text>
                </View>
                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionTitle}>{item.title}</Text>
                  <Text style={styles.sessionTime}>With AI Coach • {time}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color="#374151" />
            <Text style={styles.emptyText}>No upcoming sessions</Text>
            <TouchableOpacity
              style={styles.scheduleBtn}
              onPress={() => navigation.navigate("Schedule")}
            >
              <Text style={styles.scheduleBtnText}>Schedule One</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0A0E17",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  scrollContainer: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 10 },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 30 },
  logoRow: { flexDirection: "row", alignItems: "center" },
  logoBox: { width: 32, height: 32, borderRadius: 8, backgroundColor: "#1D2D49", justifyContent: "center", alignItems: "center", marginRight: 10 },
  headerTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "bold" },
  headerIcons: { flexDirection: "row", alignItems: "center" },
  iconButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#161B28", justifyContent: "center", alignItems: "center", marginRight: 12 },
  avatarPlaceholder: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#374151", justifyContent: "center", alignItems: "center" },
  welcomeTitle: { color: "#FFFFFF", fontSize: 28, fontWeight: "bold", marginBottom: 8 },
  welcomeSubtitle: { color: "#9CA3AF", fontSize: 15, lineHeight: 22, paddingRight: 20, marginBottom: 30 },

  actionCard: { backgroundColor: "#101623", borderRadius: 20, overflow: "hidden", marginBottom: 40, borderWidth: 1, borderColor: "#1F2937" },
  actionCardTop: { backgroundColor: "#15244A", height: 100, justifyContent: "center", alignItems: "center", position: "relative" },
  cardIcon: { opacity: 0.8 },
  tag: { position: "absolute", bottom: -12, right: 16, backgroundColor: "#3B82F6", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  tagText: { color: "#FFFFFF", fontSize: 10, fontWeight: "bold", letterSpacing: 1 },
  actionCardBottom: { padding: 20, paddingTop: 24 },
  cardTitle: { color: "#FFFFFF", fontSize: 22, fontWeight: "bold", marginBottom: 8 },
  cardSubtitle: { color: "#9CA3AF", fontSize: 14, lineHeight: 20, marginBottom: 20 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sessionsRow: { flexDirection: "row", alignItems: "center" },
  overlapCircle: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: "#101623", position: "relative" },
  sessionsText: { color: "#6B7280", fontSize: 12, marginLeft: -10 },
  primaryButton: { backgroundColor: "#3B82F6", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  primaryButtonText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 14 },

  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16, marginTop: 10 },
  sectionTitle: { color: "#F3F4F6", fontSize: 13, fontWeight: "bold", letterSpacing: 1, marginBottom: 16 },
  viewAllText: { color: "#3B82F6", fontSize: 13, fontWeight: "bold", marginBottom: 14 },

  performanceRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 30 },
  statsCard: { flex: 0.48, backgroundColor: "#101623", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#1F2937" },
  statsIcon: { marginBottom: 16 },
  statsLabel: { color: "#9CA3AF", fontSize: 13, marginBottom: 4 },
  statsValue: { color: "#FFFFFF", fontSize: 32, fontWeight: "bold", marginBottom: 4 },
  statsGrowth: { color: "#10B981", fontSize: 12, fontWeight: "bold" },
  statsSublabel: { color: "#6B7280", fontSize: 12 },

  sessionCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#101623", borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#1F2937" },
  dateBox: { backgroundColor: "#15244A", borderRadius: 12, width: 54, height: 54, justifyContent: "center", alignItems: "center", marginRight: 16 },
  dateMonth: { color: "#3B82F6", fontSize: 12, fontWeight: "bold" },
  dateDay: { color: "#FFFFFF", fontSize: 20, fontWeight: "bold" },
  sessionInfo: { flex: 1 },
  sessionTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  sessionTime: { color: "#9CA3AF", fontSize: 13 },

  emptyState: { alignItems: "center", marginTop: 20, marginBottom: 20 },
  emptyText: { color: "#9CA3AF", fontSize: 15, marginTop: 12, marginBottom: 16 },
  scheduleBtn: { backgroundColor: "#3B82F6", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  scheduleBtnText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 14 },
});

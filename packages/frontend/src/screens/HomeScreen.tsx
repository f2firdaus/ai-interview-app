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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Modal } from "react-native";

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
  const [notifVisible, setNotifVisible] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [hasUnread, setHasUnread] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get("/interviews/stats");
      setStats(res.data);
      // Cache for instant display on next app open
      AsyncStorage.setItem("cached_stats", JSON.stringify(res.data));
    } catch (err) {
      console.log("Error fetching stats:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const buildNotifications = useCallback(async () => {
    try {
      const [upcomingRes, completedRes] = await Promise.all([
        api.get("/interviews?status=upcoming"),
        api.get("/interviews?status=completed"),
      ]);

      const items: any[] = [];

      // Upcoming session reminders
      (upcomingRes.data || []).slice(0, 3).forEach((s: any) => {
        const daysLeft = Math.ceil(
          (new Date(s.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        items.push({
          id: `upcoming-${s._id}`,
          icon: "calendar",
          iconColor: "#3B82F6",
          title: "Upcoming Interview",
          body: `"${s.title}" is scheduled ${daysLeft <= 1 ? "tomorrow" : `in ${daysLeft} days`}.`,
          time: new Date(s.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          type: "upcoming",
        });
      });

      // Recent results
      (completedRes.data || []).slice(0, 3).forEach((s: any) => {
        items.push({
          id: `result-${s._id}`,
          icon: "checkmark-circle",
          iconColor: "#10B981",
          title: "Interview Results Ready",
          body: `You scored ${s.score || 0}/10 in "${s.title}". Tap History to review.`,
          time: new Date(s.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          type: "result",
        });
      });

      // Tips — always present
      const tips = [
        "💡 Tip: Practice answering in STAR format (Situation, Task, Action, Result).",
        "💡 Tip: Record yourself answering and watch it back to improve confidence.",
        "💡 Tip: Research the company before your interview — show genuine interest.",
      ];
      const tip = tips[new Date().getDate() % tips.length];
      items.push({
        id: "tip",
        icon: "bulb",
        iconColor: "#F59E0B",
        title: "Daily Tip",
        body: tip,
        time: "Today",
        type: "tip",
      });

      setNotifications(items);
      setHasUnread(items.length > 0);
    } catch (err) {
      console.log("Notification fetch error:", err);
    }
  }, []);

  useEffect(() => {
    // 1. Show cached data INSTANTLY before network responds
    AsyncStorage.getItem("cached_stats").then((cached) => {
      if (cached) {
        setStats(JSON.parse(cached));
        setLoading(false); // Hide spinner immediately
      }
    });

    // 2. Fetch fresh data in background
    fetchStats();

    // 3. Defer notifications so they don't race with primary stats load
    const notifTimer = setTimeout(() => {
      buildNotifications();
    }, 2000);

    return () => clearTimeout(notifTimer);
  }, [fetchStats, buildNotifications]);

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
        {/* Notification Modal */}
        <Modal
          visible={notifVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setNotifVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setNotifVisible(false)}
          />
          <View style={styles.notifDrawer}>
            <View style={styles.notifHeader}>
              <Text style={styles.notifTitle}>Notifications</Text>
              <TouchableOpacity onPress={() => setNotifVisible(false)}>
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {notifications.length === 0 ? (
                <View style={styles.notifEmpty}>
                  <Ionicons name="notifications-off-outline" size={48} color="#374151" />
                  <Text style={styles.notifEmptyText}>No notifications yet</Text>
                </View>
              ) : (
                notifications.map((n) => (
                  <View key={n.id} style={styles.notifItem}>
                    <View style={[styles.notifIconBox, { backgroundColor: n.iconColor + "20" }]}>
                      <Ionicons name={n.icon} size={22} color={n.iconColor} />
                    </View>
                    <View style={styles.notifContent}>
                      <Text style={styles.notifItemTitle}>{n.title}</Text>
                      <Text style={styles.notifItemBody}>{n.body}</Text>
                      <Text style={styles.notifItemTime}>{n.time}</Text>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </Modal>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <View style={styles.logoBox}>
              <MaterialCommunityIcons name="head-cog" size={20} color="#3B82F6" />
            </View>
            <Text style={styles.headerTitle}>InterviewAI</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => { setNotifVisible(true); setHasUnread(false); }}
            >
              <Ionicons name="notifications" size={20} color="#3B82F6" />
              {hasUnread && <View style={styles.notifBadge} />}
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
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate("Upload")}
            >
              <Ionicons name="arrow-forward-circle" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.primaryButtonText}>Start Now</Text>
            </TouchableOpacity>
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
  notifBadge: { position: "absolute", top: 6, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: "#EF4444", borderWidth: 1, borderColor: "#0A0E17" },
  avatarPlaceholder: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#374151", justifyContent: "center", alignItems: "center" },

  // Notification Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  notifDrawer: {
    backgroundColor: "#0F1623",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "75%",
    borderTopWidth: 1,
    borderColor: "#1F2937",
  },
  notifHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  notifTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "bold" },
  notifEmpty: { alignItems: "center", paddingVertical: 40 },
  notifEmptyText: { color: "#6B7280", fontSize: 15, marginTop: 12 },
  notifItem: { flexDirection: "row", alignItems: "flex-start", marginBottom: 18 },
  notifIconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: "center", alignItems: "center", marginRight: 14 },
  notifContent: { flex: 1 },
  notifItemTitle: { color: "#FFFFFF", fontSize: 15, fontWeight: "bold", marginBottom: 3 },
  notifItemBody: { color: "#9CA3AF", fontSize: 13, lineHeight: 18, marginBottom: 4 },
  notifItemTime: { color: "#4B5563", fontSize: 11 },
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
  primaryButton: { backgroundColor: "#3B82F6", paddingVertical: 16, borderRadius: 14, alignItems: "center", justifyContent: "center", flexDirection: "row", marginTop: 8 },
  primaryButtonText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 16 },

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

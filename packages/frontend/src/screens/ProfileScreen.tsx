import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";

export default function ProfileScreen({ navigation }: any) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/interviews/stats");
        setStats(res.data);
      } catch (err) {
        console.log("Error fetching profile stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleLogout = () => {
    // Clear any local state and go back to Login
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity style={styles.headerBtn}>
            <Ionicons name="settings-sharp" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={60} color="#6B7280" />
            </View>
            <TouchableOpacity style={styles.editBadge}>
              <Ionicons name="pencil" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>Interview User</Text>
          <Text style={styles.userEmail}>AI Interview App</Text>
        </View>

        {/* Stats Cards */}
        <Text style={styles.sectionTitle}>YOUR STATS</Text>
        {loading ? (
          <ActivityIndicator size="small" color="#3B82F6" style={{ marginBottom: 30 }} />
        ) : (
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Ionicons name="checkmark-done" size={24} color="#3B82F6" />
              <Text style={styles.statValue}>{stats?.totalCompleted || 0}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="bar-chart" size={24} color="#10B981" />
              <Text style={styles.statValue}>{stats?.avgScore || 0}%</Text>
              <Text style={styles.statLabel}>Avg Score</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="calendar" size={24} color="#F59E0B" />
              <Text style={styles.statValue}>{stats?.totalUpcoming || 0}</Text>
              <Text style={styles.statLabel}>Upcoming</Text>
            </View>
          </View>
        )}

        {/* Account Settings */}
        <Text style={styles.sectionTitle}>ACCOUNT SETTINGS</Text>
        <View style={styles.cardContainer}>
          <TouchableOpacity style={styles.listItem}>
            <View style={styles.iconBox}>
              <Ionicons name="person" size={20} color="#3B82F6" />
            </View>
            <View style={styles.listTextContainer}>
              <Text style={styles.listTitle}>Account Details</Text>
              <Text style={styles.listSubtitle}>Name, email, and password</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.listItem}>
            <View style={styles.iconBox}>
              <Ionicons name="options" size={20} color="#3B82F6" />
            </View>
            <View style={styles.listTextContainer}>
              <Text style={styles.listTitle}>Interview Preferences</Text>
              <Text style={styles.listSubtitle}>Roles, difficulty, and AI tone</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#EF4444" style={{ marginRight: 10 }} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.versionText}>AI Interview App v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#0A0E17" },
  scrollContainer: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 30 },
  headerBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#161B28", justifyContent: "center", alignItems: "center" },
  headerTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "bold" },

  profileSection: { alignItems: "center", marginBottom: 40 },
  avatarContainer: { position: "relative", marginBottom: 20 },
  avatarCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: "#1F2937", justifyContent: "center", alignItems: "center", borderWidth: 4, borderColor: "#1E2A45" },
  editBadge: { position: "absolute", bottom: 0, right: 8, width: 32, height: 32, borderRadius: 16, backgroundColor: "#3B82F6", justifyContent: "center", alignItems: "center", borderWidth: 3, borderColor: "#0A0E17" },
  userName: { color: "#FFFFFF", fontSize: 24, fontWeight: "bold", marginBottom: 6 },
  userEmail: { color: "#9CA3AF", fontSize: 16, marginBottom: 16 },

  sectionTitle: { color: "#9CA3AF", fontSize: 13, fontWeight: "bold", letterSpacing: 1, marginBottom: 12 },

  statsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 30 },
  statCard: { flex: 0.31, backgroundColor: "#101623", borderRadius: 16, padding: 16, alignItems: "center", borderWidth: 1, borderColor: "#1F2937" },
  statValue: { color: "#FFFFFF", fontSize: 24, fontWeight: "bold", marginTop: 8, marginBottom: 4 },
  statLabel: { color: "#9CA3AF", fontSize: 12 },

  cardContainer: { backgroundColor: "#101623", borderRadius: 16, borderWidth: 1, borderColor: "#1F2937", marginBottom: 30 },
  listItem: { flexDirection: "row", alignItems: "center", padding: 16 },
  iconBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: "#15244A", justifyContent: "center", alignItems: "center", marginRight: 16 },
  listTextContainer: { flex: 1 },
  listTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "600", marginBottom: 4 },
  listSubtitle: { color: "#9CA3AF", fontSize: 13 },
  divider: { height: 1, backgroundColor: "#1F2937", marginLeft: 72 },

  logoutButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 56, borderRadius: 14, borderWidth: 1, borderColor: "#374151", backgroundColor: "#0A0E17", marginBottom: 24 },
  logoutText: { color: "#EF4444", fontSize: 16, fontWeight: "bold" },
  versionText: { textAlign: "center", color: "#6B7280", fontSize: 13 },
});

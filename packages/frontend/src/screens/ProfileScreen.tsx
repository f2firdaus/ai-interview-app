import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileScreen({ navigation }: any) {
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
          <Text style={styles.userName}>Alex Johnson</Text>
          <Text style={styles.userEmail}>alex.johnson@example.ai</Text>
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumText}>Premium Member</Text>
          </View>
        </View>

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

        {/* Subscription Settings */}
        <Text style={styles.sectionTitle}>SUBSCRIPTION</Text>
        <View style={styles.cardContainer}>
          <TouchableOpacity style={styles.listItem}>
            <View style={styles.iconBox}>
              <Ionicons name="card" size={20} color="#3B82F6" />
            </View>
            <View style={styles.listTextContainer}>
              <Text style={styles.listTitle}>Subscription Plan</Text>
              <Text style={styles.listSubtitle}>Pro Plan • Renews Oct 24, 2024</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={22} color="#EF4444" style={{ marginRight: 10 }} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.versionText}>App Version 2.4.0 (Build 108)</Text>
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
  premiumBadge: { backgroundColor: "#15244A", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: "#1E3A8A" },
  premiumText: { color: "#3B82F6", fontSize: 13, fontWeight: "bold" },

  sectionTitle: { color: "#9CA3AF", fontSize: 13, fontWeight: "bold", letterSpacing: 1, marginBottom: 12 },
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

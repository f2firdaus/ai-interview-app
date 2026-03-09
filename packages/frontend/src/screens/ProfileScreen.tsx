import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Modal,
  TextInput,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCustomAlert } from "../context/AlertContext";

export default function ProfileScreen({ navigation }: any) {
  const [stats, setStats] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Edit Profile Modal
  const [editVisible, setEditVisible] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  // Change Password Modal
  const [pwVisible, setPwVisible] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSaving, setPwSaving] = useState(false);

  const { showAlert } = useCustomAlert();

  const fetchData = async () => {
    try {
      const [statsRes, userRes] = await Promise.all([
        api.get("/interviews/stats"),
        api.get("/auth/me"),
      ]);
      setStats(statsRes.data);
      setUser(userRes.data);
      setEditName(userRes.data?.name || "");
      setEditEmail(userRes.data?.email || "");
    } catch (err) {
      console.log("Error fetching profile data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    showAlert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem("userToken");
            navigation.reset({ index: 0, routes: [{ name: "Login" }] });
          },
        },
      ]
    );
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      showAlert("Error", "Name cannot be empty.", [{ text: "OK" }]);
      return;
    }
    setEditSaving(true);
    try {
      const res = await api.put("/auth/me", { name: editName.trim() });
      setUser(res.data);
      setEditVisible(false);
      showAlert("Success", "Name updated successfully.", [{ text: "OK" }]);
    } catch (err: any) {
      showAlert("Error", err.response?.data?.error || "Failed to update profile.", [{ text: "OK" }]);
    } finally {
      setEditSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPw || !newPw || !confirmPw) {
      showAlert("Error", "Please fill in all fields.", [{ text: "OK" }]);
      return;
    }
    if (newPw !== confirmPw) {
      showAlert("Error", "New passwords do not match.", [{ text: "OK" }]);
      return;
    }
    if (newPw.length < 8) {
      showAlert("Error", "New password must be at least 8 characters.", [{ text: "OK" }]);
      return;
    }
    setPwSaving(true);
    try {
      await api.put("/auth/password", { currentPassword: currentPw, newPassword: newPw });
      setPwVisible(false);
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      showAlert("Success", "Password changed successfully.", [{ text: "OK" }]);
    } catch (err: any) {
      showAlert("Error", err.response?.data?.error || "Failed to change password.", [{ text: "OK" }]);
    } finally {
      setPwSaving(false);
    }
  };

  const initials = user?.name
    ? user.name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <SafeAreaView style={styles.safeArea}>

      {/* ─── Edit Profile Modal ─── */}
      <Modal visible={editVisible} transparent animationType="slide" onRequestClose={() => setEditVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setEditVisible(false)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditVisible(false)}>
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.textInput}
              value={editName}
              onChangeText={setEditName}
              placeholder="Your name"
              placeholderTextColor="#4B5563"
              autoCapitalize="words"
            />
            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={styles.lockedEmailRow}>
              <Ionicons name="lock-closed" size={16} color="#4B5563" style={{ marginRight: 8 }} />
              <Text style={styles.lockedEmailText}>{user?.email || ""}</Text>
            </View>
            <Text style={styles.lockedEmailHint}>Email cannot be changed for security reasons.</Text>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile} disabled={editSaving}>
              {editSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ─── Change Password Modal ─── */}
      <Modal visible={pwVisible} transparent animationType="slide" onRequestClose={() => setPwVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setPwVisible(false)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TouchableOpacity onPress={() => setPwVisible(false)}>
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            <Text style={styles.inputLabel}>Current Password</Text>
            <TextInput style={styles.textInput} value={currentPw} onChangeText={setCurrentPw} placeholder="••••••••" placeholderTextColor="#4B5563" secureTextEntry />
            <Text style={styles.inputLabel}>New Password</Text>
            <TextInput style={styles.textInput} value={newPw} onChangeText={setNewPw} placeholder="••••••••" placeholderTextColor="#4B5563" secureTextEntry />
            <Text style={styles.inputLabel}>Confirm New Password</Text>
            <TextInput style={styles.textInput} value={confirmPw} onChangeText={setConfirmPw} placeholder="••••••••" placeholderTextColor="#4B5563" secureTextEntry />
            <TouchableOpacity style={styles.saveBtn} onPress={handleChangePassword} disabled={pwSaving}>
              {pwSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Update Password</Text>}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity style={styles.headerBtn} onPress={() => { setEditName(user?.name || ""); setEditEmail(user?.email || ""); setEditVisible(true); }}>
            <Ionicons name="create-outline" size={22} color="#3B82F6" />
          </TouchableOpacity>
        </View>

        {/* Avatar */}
        <View style={styles.profileSection}>
          <TouchableOpacity style={styles.avatarContainer} onPress={() => { setEditName(user?.name || ""); setEditEmail(user?.email || ""); setEditVisible(true); }}>
            <View style={styles.avatarCircle}>
              <Text style={styles.initialsText}>{initials}</Text>
            </View>
            <View style={styles.editBadge}>
              <Ionicons name="pencil" size={13} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          <Text style={styles.userName}>{user?.name || (loading ? "Loading..." : "User")}</Text>
          <Text style={styles.userEmail}>{user?.email || (loading ? "" : "No email")}</Text>
        </View>

        {/* Stats */}
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
              <Text style={styles.statValue}>{stats?.avgScore || 0}<Text style={styles.statUnit}>/10</Text></Text>
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
          <TouchableOpacity style={styles.listItem} onPress={() => { setEditName(user?.name || ""); setEditEmail(user?.email || ""); setEditVisible(true); }}>
            <View style={styles.iconBox}>
              <Ionicons name="person" size={20} color="#3B82F6" />
            </View>
            <View style={styles.listTextContainer}>
              <Text style={styles.listTitle}>Edit Profile</Text>
              <Text style={styles.listSubtitle}>Change your name and email address</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.listItem} onPress={() => setPwVisible(true)}>
            <View style={styles.iconBox}>
              <Ionicons name="lock-closed" size={20} color="#3B82F6" />
            </View>
            <View style={styles.listTextContainer}>
              <Text style={styles.listTitle}>Change Password</Text>
              <Text style={styles.listSubtitle}>Update your account password</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.listItem} onPress={() => navigation.navigate("History")}>
            <View style={styles.iconBox}>
              <Ionicons name="time" size={20} color="#10B981" />
            </View>
            <View style={styles.listTextContainer}>
              <Text style={styles.listTitle}>Interview History</Text>
              <Text style={styles.listSubtitle}>View all past sessions and scores</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#EF4444" style={{ marginRight: 10 }} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>AI Interview Coach v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#0A0E17", paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 },
  scrollContainer: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40 },

  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 30 },
  headerBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#161B28", justifyContent: "center", alignItems: "center" },
  headerTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "bold" },

  profileSection: { alignItems: "center", marginBottom: 40 },
  avatarContainer: { position: "relative", marginBottom: 16 },
  avatarCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: "#1E3A8A", justifyContent: "center", alignItems: "center", borderWidth: 3, borderColor: "#3B82F6" },
  initialsText: { color: "#FFFFFF", fontSize: 36, fontWeight: "bold" },
  editBadge: { position: "absolute", bottom: 0, right: 0, width: 30, height: 30, borderRadius: 15, backgroundColor: "#3B82F6", justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: "#0A0E17" },
  userName: { color: "#FFFFFF", fontSize: 22, fontWeight: "bold", marginBottom: 4 },
  userEmail: { color: "#9CA3AF", fontSize: 14 },

  sectionTitle: { color: "#6B7280", fontSize: 12, fontWeight: "bold", letterSpacing: 1.2, marginBottom: 12 },

  statsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 32 },
  statCard: { flex: 0.31, backgroundColor: "#101623", borderRadius: 16, padding: 14, alignItems: "center", borderWidth: 1, borderColor: "#1F2937" },
  statValue: { color: "#FFFFFF", fontSize: 22, fontWeight: "bold", marginTop: 8, marginBottom: 2 },
  statUnit: { color: "#6B7280", fontSize: 14 },
  statLabel: { color: "#6B7280", fontSize: 11 },

  cardContainer: { backgroundColor: "#101623", borderRadius: 16, borderWidth: 1, borderColor: "#1F2937", marginBottom: 28 },
  listItem: { flexDirection: "row", alignItems: "center", padding: 16 },
  iconBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: "#15244A", justifyContent: "center", alignItems: "center", marginRight: 14 },
  listTextContainer: { flex: 1 },
  listTitle: { color: "#FFFFFF", fontSize: 15, fontWeight: "600", marginBottom: 3 },
  listSubtitle: { color: "#6B7280", fontSize: 12 },
  divider: { height: 1, backgroundColor: "#1F2937", marginLeft: 70 },

  logoutButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 54, borderRadius: 14, borderWidth: 1, borderColor: "#374151", marginBottom: 24 },
  logoutText: { color: "#EF4444", fontSize: 16, fontWeight: "bold" },
  versionText: { textAlign: "center", color: "#374151", fontSize: 12 },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)" },
  modalSheet: { backgroundColor: "#0F1623", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 28, borderTopWidth: 1, borderColor: "#1F2937" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  modalTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "bold" },
  inputLabel: { color: "#9CA3AF", fontSize: 13, fontWeight: "600", marginBottom: 8 },
  textInput: { backgroundColor: "#161B28", color: "#FFFFFF", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, borderWidth: 1, borderColor: "#1F2937", marginBottom: 16 },
  saveBtn: { backgroundColor: "#3B82F6", height: 52, borderRadius: 14, justifyContent: "center", alignItems: "center", marginTop: 8 },
  saveBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },

  lockedEmailRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#0D1219", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: "#1F2937", marginBottom: 8 },
  lockedEmailText: { color: "#4B5563", fontSize: 15, flex: 1 },
  lockedEmailHint: { color: "#374151", fontSize: 12, marginBottom: 16 },
});

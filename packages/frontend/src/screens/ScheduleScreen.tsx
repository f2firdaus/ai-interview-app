import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  RefreshControl,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";
import { useCustomAlert } from "../context/AlertContext";

export default function ScheduleScreen({ navigation }: any) {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [daysFromNow, setDaysFromNow] = useState("2");
  const [category, setCategory] = useState("general");
  const [difficulty, setDifficulty] = useState("medium");
  const { showAlert } = useCustomAlert();

  const CATEGORIES = [
    { key: "general", label: "General", icon: "apps" },
    { key: "technical", label: "Technical", icon: "code-slash" },
    { key: "behavioral", label: "Behavioral", icon: "people" },
    { key: "system-design", label: "System Design", icon: "git-network" },
    { key: "hr", label: "HR Round", icon: "briefcase" },
  ];

  const DIFFICULTIES = [
    { key: "easy", label: "Easy", color: "#10B981" },
    { key: "medium", label: "Medium", color: "#F59E0B" },
    { key: "hard", label: "Hard", color: "#EF4444" },
  ];

  const fetchSchedule = async () => {
    try {
      const res = await api.get("/interviews?status=upcoming");
      setSchedule(res.data);
    } catch (err) {
      console.log("Error fetching schedule");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchSchedule();
    });
    return unsubscribe;
  }, [navigation]);

  const handleCreateInterview = async () => {
    if (!newTitle.trim()) {
      showAlert("Error", "Please enter a title", [{ text: "OK", style: "cancel" }]);
      return;
    }

    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + (parseInt(daysFromNow) || 2));

      await api.post("/interviews", {
        title: newTitle.trim(),
        date: futureDate.toISOString(),
        category,
        difficulty,
      });

      setModalVisible(false);
      setNewTitle("");
      setDaysFromNow("2");
      setCategory("general");
      setDifficulty("medium");
      fetchSchedule();
    } catch (error) {
      showAlert("Error", "Failed to schedule interview", [{ text: "OK", style: "destructive" }]);
    }
  };

  const handleDelete = async (id: string) => {
    showAlert("Delete Interview", "Are you sure you want to remove this session?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/interviews/${id}`);
            fetchSchedule();
          } catch (err) {
            showAlert("Error", "Failed to delete", [{ text: "OK", style: "destructive" }]);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Upcoming Sessions</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addBtn}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
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
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchSchedule(); }} tintColor="#3B82F6" />
          }
        >
          {schedule.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={64} color="#374151" />
              <Text style={styles.emptyText}>No upcoming interviews scheduled.</Text>
              <TouchableOpacity style={styles.scheduleEmptyBtn} onPress={() => setModalVisible(true)}>
                <Text style={styles.scheduleEmptyText}>Schedule One Now</Text>
              </TouchableOpacity>
            </View>
          ) : (
            schedule.map((item) => {
              const dateObj = new Date(item.date);
              const month = dateObj.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
              const day = dateObj.getDate();
              const time = dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

              return (
                <View key={item._id} style={styles.sessionCard}>
                  <View style={styles.dateBox}>
                    <Text style={styles.dateMonth}>{month}</Text>
                    <Text style={styles.dateDay}>{day}</Text>
                  </View>
                  <View style={styles.sessionInfo}>
                    <Text style={styles.sessionTitle}>{item.title}</Text>
                    <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                      <Text style={styles.sessionTime}>With AI Coach • {time}</Text>
                      {item.category && item.category !== "general" && (
                        <View style={{ backgroundColor: "#15244A", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, marginLeft: 8 }}>
                          <Text style={{ color: "#3B82F6", fontSize: 10, fontWeight: "bold" }}>{item.category.toUpperCase()}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <View style={styles.actionBtns}>
                    <TouchableOpacity style={styles.joinBtn} onPress={() => navigation.navigate("Upload")}>
                      <Text style={styles.joinText}>Join</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item._id)}>
                      <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}

      {/* Create Interview Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Schedule Interview</Text>

            <Text style={styles.inputLabel}>Interview Title</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., System Design Practice"
              placeholderTextColor="#6B7280"
              value={newTitle}
              onChangeText={setNewTitle}
            />

            <Text style={styles.inputLabel}>Days from Now</Text>
            <TextInput
              style={styles.input}
              placeholder="2"
              placeholderTextColor="#6B7280"
              keyboardType="number-pad"
              value={daysFromNow}
              onChangeText={setDaysFromNow}
            />

            <Text style={styles.inputLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {CATEGORIES.map((c) => (
                <TouchableOpacity
                  key={c.key}
                  onPress={() => setCategory(c.key)}
                  style={{
                    flexDirection: "row", alignItems: "center",
                    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, marginRight: 8,
                    backgroundColor: category === c.key ? "#1E3A8A" : "#161B28",
                    borderWidth: 1, borderColor: category === c.key ? "#3B82F6" : "#1F2937",
                  }}
                >
                  <Ionicons name={c.icon as any} size={16} color={category === c.key ? "#3B82F6" : "#6B7280"} style={{ marginRight: 6 }} />
                  <Text style={{ color: category === c.key ? "#FFFFFF" : "#9CA3AF", fontSize: 13, fontWeight: "600" }}>{c.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.inputLabel}>Difficulty</Text>
            <View style={{ flexDirection: "row", marginBottom: 16 }}>
              {DIFFICULTIES.map((d) => (
                <TouchableOpacity
                  key={d.key}
                  onPress={() => setDifficulty(d.key)}
                  style={{
                    flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 10, marginRight: 8,
                    backgroundColor: difficulty === d.key ? d.color + "22" : "#161B28",
                    borderWidth: 1, borderColor: difficulty === d.key ? d.color : "#1F2937",
                  }}
                >
                  <Text style={{ color: difficulty === d.key ? d.color : "#9CA3AF", fontSize: 13, fontWeight: "bold" }}>{d.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => { setModalVisible(false); setNewTitle(""); }}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.createBtn} onPress={handleCreateInterview}>
                <Text style={styles.createBtnText}>Schedule</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  addBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#3B82F6", justifyContent: "center", alignItems: "center" },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContainer: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },

  emptyState: { alignItems: "center", marginTop: 80 },
  emptyText: { color: "#9CA3AF", fontSize: 16, marginTop: 16, marginBottom: 24 },
  scheduleEmptyBtn: { backgroundColor: "#3B82F6", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  scheduleEmptyText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 16 },

  sessionCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#101623", borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#1F2937" },
  dateBox: { backgroundColor: "#15244A", borderRadius: 12, width: 54, height: 54, justifyContent: "center", alignItems: "center", marginRight: 16 },
  dateMonth: { color: "#3B82F6", fontSize: 12, fontWeight: "bold" },
  dateDay: { color: "#FFFFFF", fontSize: 20, fontWeight: "bold" },
  sessionInfo: { flex: 1 },
  sessionTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  sessionTime: { color: "#9CA3AF", fontSize: 13 },
  actionBtns: { flexDirection: "row", alignItems: "center" },
  joinBtn: { backgroundColor: "#3B82F6", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, marginRight: 8 },
  joinText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 14 },
  deleteBtn: { width: 36, height: 36, borderRadius: 8, backgroundColor: "#1B1215", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#3B1A1A" },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#101623", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { color: "#FFFFFF", fontSize: 22, fontWeight: "bold", marginBottom: 24 },
  inputLabel: { color: "#9CA3AF", fontSize: 13, fontWeight: "bold", letterSpacing: 1, marginBottom: 8 },
  input: { backgroundColor: "#0A0E17", borderWidth: 1, borderColor: "#1F2937", borderRadius: 12, height: 52, paddingHorizontal: 16, color: "#FFFFFF", fontSize: 16, marginBottom: 20 },
  modalBtnRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  cancelBtn: { flex: 0.45, height: 50, borderRadius: 12, borderWidth: 1, borderColor: "#374151", justifyContent: "center", alignItems: "center" },
  cancelBtnText: { color: "#9CA3AF", fontWeight: "bold", fontSize: 16 },
  createBtn: { flex: 0.45, height: 50, borderRadius: 12, backgroundColor: "#3B82F6", justifyContent: "center", alignItems: "center" },
  createBtnText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 16 },
});

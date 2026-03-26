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
  LogBox,
} from "react-native";

LogBox.ignoreLogs([
  "expo-notifications: Android Push notifications",
]);

import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import api from "../services/api";
import { useCustomAlert } from "../context/AlertContext";

// Configure how notifications appear when the app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function registerForPushNotifications() {
  if (!Device.isDevice) {
    console.log("⚠️ Push notifications require a physical device");
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("❌ Notification permission denied");
    return;
  }

  // Android needs a notification channel
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("interview-reminders", {
      name: "Interview Reminders",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#3B82F6",
      sound: "default",
    });
  }

  console.log("✅ Notifications enabled");
}

async function scheduleNotification(title: string, date: Date) {
  try {
    const now = new Date();

    // Schedule 30 minutes before
    const thirtyMinBefore = new Date(date.getTime() - 30 * 60 * 1000);
    if (thirtyMinBefore > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🎯 Interview in 30 minutes",
          body: `"${title}" starts soon. Get ready!`,
          sound: "default",
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: thirtyMinBefore, channelId: Platform.OS === "android" ? "interview-reminders" : undefined },
      });
    }

    // Schedule at the exact time
    if (date > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🚀 Interview starting now!",
          body: `"${title}" is scheduled right now. Let's go!`,
          sound: "default",
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date, channelId: Platform.OS === "android" ? "interview-reminders" : undefined },
      });
    }

    // Schedule 1 day before (if it's more than 24h away)
    const oneDayBefore = new Date(date.getTime() - 24 * 60 * 60 * 1000);
    if (oneDayBefore > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "📅 Interview tomorrow",
          body: `"${title}" is scheduled for tomorrow. Prepare well!`,
          sound: "default",
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: oneDayBefore, channelId: Platform.OS === "android" ? "interview-reminders" : undefined },
      });
    }

    console.log("✅ Notifications scheduled for:", title);
  } catch (err) {
    console.log("⚠️ Could not schedule notifications:", err);
  }
}

export default function ScheduleScreen({ navigation }: any) {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [category, setCategory] = useState("general");
  const [difficulty, setDifficulty] = useState("medium");
  const { showAlert } = useCustomAlert();

  // Date/Time picker state
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);
    return d;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

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

  // Request notification permissions on mount
  useEffect(() => {
    registerForPushNotifications();
  }, []);

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

  const onDateChange = (event: DateTimePickerEvent, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      // Keep the existing time, just change the date
      const newDate = new Date(selectedDate);
      newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
      setSelectedDate(newDate);
    }
  };

  const onTimeChange = (event: DateTimePickerEvent, date?: Date) => {
    setShowTimePicker(false);
    if (date) {
      // Keep the existing date, just change the time
      const newDate = new Date(selectedDate);
      newDate.setHours(date.getHours(), date.getMinutes(), 0, 0);
      setSelectedDate(newDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleCreateInterview = async () => {
    if (!newTitle.trim()) {
      showAlert("Error", "Please enter a title", [{ text: "OK", style: "cancel" }]);
      return;
    }

    if (selectedDate <= new Date()) {
      showAlert("Error", "Please select a future date and time", [{ text: "OK", style: "cancel" }]);
      return;
    }

    try {
      await api.post("/interviews", {
        title: newTitle.trim(),
        date: selectedDate.toISOString(),
        category,
        difficulty,
      });

      // Schedule push notifications
      await scheduleNotification(newTitle.trim(), selectedDate);

      setModalVisible(false);
      setNewTitle("");
      setCategory("general");
      setDifficulty("medium");
      // Reset date to tomorrow 10 AM
      const d = new Date();
      d.setDate(d.getDate() + 1);
      d.setHours(10, 0, 0, 0);
      setSelectedDate(d);
      fetchSchedule();

      showAlert("Scheduled! 🎯", "Interview scheduled. You'll get reminders before it starts.", [
        { text: "OK", style: "cancel" },
      ]);
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
                    <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4, flexWrap: "wrap", gap: 6 }}>
                      <Text style={styles.sessionTime}>With AI • {time}</Text>
                      {item.category && item.category !== "general" && (
                        <View style={{ backgroundColor: "#15244A", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
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
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <Text style={styles.modalTitle}>Schedule Interview</Text>

                <Text style={styles.inputLabel}>Interview Title</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., System Design Practice"
                  placeholderTextColor="#6B7280"
                  value={newTitle}
                  onChangeText={setNewTitle}
                />

                {/* Date Picker */}
                <Text style={styles.inputLabel}>Date</Text>
                <TouchableOpacity
                  style={styles.pickerBtn}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Ionicons name="calendar" size={20} color="#3B82F6" />
                  <Text style={styles.pickerText}>{formatDate(selectedDate)}</Text>
                  <Ionicons name="chevron-forward" size={18} color="#6B7280" />
                </TouchableOpacity>

                {showDatePicker && (
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    minimumDate={new Date()}
                    onChange={onDateChange}
                    themeVariant="dark"
                  />
                )}

                {/* Time Picker */}
                <Text style={styles.inputLabel}>Time</Text>
                <TouchableOpacity
                  style={styles.pickerBtn}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Ionicons name="time" size={20} color="#3B82F6" />
                  <Text style={styles.pickerText}>{formatTime(selectedDate)}</Text>
                  <Ionicons name="chevron-forward" size={18} color="#6B7280" />
                </TouchableOpacity>

                {showTimePicker && (
                  <DateTimePicker
                    value={selectedDate}
                    mode="time"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={onTimeChange}
                    themeVariant="dark"
                  />
                )}

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

                {/* Notification Info */}
                <View style={styles.notifInfo}>
                  <Ionicons name="notifications" size={16} color="#3B82F6" />
                  <Text style={styles.notifText}>You'll get reminders 1 day before, 30 min before, and at start time</Text>
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
            </ScrollView>
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
  headerTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "bold" },
  addBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#3B82F6", justifyContent: "center", alignItems: "center" },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContainer: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },

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

  // Date/Time picker buttons
  pickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0A0E17",
    borderWidth: 1,
    borderColor: "#1F2937",
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 16,
    marginBottom: 20,
    gap: 12,
  },
  pickerText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
  },

  // Notification info box
  notifInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0D1B3C",
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: "#1E3A6E",
  },
  notifText: {
    flex: 1,
    color: "#94A3B8",
    fontSize: 12,
    lineHeight: 18,
  },

  modalBtnRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  cancelBtn: { flex: 0.45, height: 50, borderRadius: 12, borderWidth: 1, borderColor: "#374151", justifyContent: "center", alignItems: "center" },
  cancelBtnText: { color: "#9CA3AF", fontWeight: "bold", fontSize: 16 },
  createBtn: { flex: 0.45, height: 50, borderRadius: 12, backgroundColor: "#3B82F6", justifyContent: "center", alignItems: "center" },
  createBtnText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 16 },
});

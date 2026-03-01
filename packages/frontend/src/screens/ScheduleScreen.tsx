import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";

export default function ScheduleScreen({ navigation }: any) {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const res = await api.get("/interviews?status=upcoming");
      setSchedule(res.data);
    } catch (err) {
      console.log("Error fetching schedule");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMock = async () => {
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 2); // default 2 days from now

      await api.post("/interviews", {
        title: "Mock System Design",
        date: futureDate.toISOString()
      });
      fetchSchedule(); // refresh
    } catch (error) {
       console.log("Failed to schedule mock");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
            <Text style={styles.headerTitle}>Upcoming Sessions</Text>
            <TouchableOpacity onPress={handleCreateMock} style={styles.addBtn}>
                <Ionicons name="add" size={24} color="#FFFFFF" />
            </TouchableOpacity>
        </View>

        {loading ? (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
            </View>
        ) : (
            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                {schedule.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="calendar-outline" size={64} color="#374151" />
                        <Text style={styles.emptyText}>No upcoming interviews scheduled.</Text>
                        <TouchableOpacity style={styles.scheduleEmptyBtn} onPress={handleCreateMock}>
                            <Text style={styles.scheduleEmptyText}>Schedule One Now</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    schedule.map((item, index) => {
                        const dateObj = new Date(item.date);
                        const month = dateObj.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
                        const day = dateObj.getDate();
                        const time = dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

                        return (
                            <View key={index} style={styles.sessionCard}>
                                <View style={styles.dateBox}>
                                    <Text style={styles.dateMonth}>{month}</Text>
                                    <Text style={styles.dateDay}>{day}</Text>
                                </View>
                                <View style={styles.sessionInfo}>
                                    <Text style={styles.sessionTitle}>{item.title}</Text>
                                    <Text style={styles.sessionTime}>With AI Coach • {time}</Text>
                                </View>
                                <TouchableOpacity style={styles.joinBtn} onPress={() => navigation.navigate("Upload")}>
                                    <Text style={styles.joinText}>Join</Text>
                                </TouchableOpacity>
                            </View>
                        );
                    })
                )}
            </ScrollView>
        )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#0A0E17" },
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
  headerTitle: { color: "#FFFFFF", fontSize: 24, fontWeight: "bold" },
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#3B82F6", justifyContent: "center", alignItems: "center" },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContainer: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 80 },
  
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
  
  joinBtn: { backgroundColor: "#3B82F6", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  joinText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 14 }
});

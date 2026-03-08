import React from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Platform,
    StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function InterviewDetailScreen({ route, navigation }: any) {
    const { interview } = route.params;

    const getScoreColor = (score: number) => {
        if (score >= 8) return "#10B981";
        if (score >= 5) return "#F59E0B";
        return "#EF4444";
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>
                    {interview.title}
                </Text>
                <View style={styles.backBtn} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                {/* Overall Score Card */}
                <View style={styles.scoreCard}>
                    <View style={styles.scoreCircle}>
                        <Text style={styles.scoreValue}>{interview.score || 0}</Text>
                        <Text style={styles.scoreMax}>/10</Text>
                    </View>
                    <View style={styles.scoreInfo}>
                        <Text style={styles.scoreLabel}>Overall Score</Text>
                        <Text style={styles.scoreDate}>
                            {new Date(interview.date).toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                            })}
                        </Text>
                    </View>
                </View>

                {/* General Feedback */}
                {interview.feedback ? (
                    <View style={styles.feedbackCard}>
                        <View style={styles.feedbackHeader}>
                            <Ionicons name="chatbubble-ellipses" size={20} color="#3B82F6" />
                            <Text style={styles.feedbackTitle}>AI Summary</Text>
                        </View>
                        <Text style={styles.feedbackText}>{interview.feedback}</Text>
                    </View>
                ) : null}

                {/* Per-Question Breakdown */}
                {interview.questions && interview.questions.length > 0 ? (
                    <>
                        <Text style={styles.sectionTitle}>
                            QUESTION BREAKDOWN ({interview.questions.length})
                        </Text>
                        {interview.questions.map((q: any, index: number) => (
                            <View key={index} style={styles.questionCard}>
                                <View style={styles.questionHeader}>
                                    <Text style={styles.questionNumber}>Q{index + 1}</Text>
                                    <View
                                        style={[
                                            styles.questionScoreBadge,
                                            { backgroundColor: getScoreColor(q.score || 0) + "20", borderColor: getScoreColor(q.score || 0) },
                                        ]}
                                    >
                                        <Text style={[styles.questionScoreText, { color: getScoreColor(q.score || 0) }]}>
                                            {q.score || 0}/10
                                        </Text>
                                    </View>
                                </View>

                                <Text style={styles.questionText}>{q.question}</Text>

                                {q.answer ? (
                                    <View style={styles.answerSection}>
                                        <Text style={styles.answerLabel}>YOUR ANSWER</Text>
                                        <Text style={styles.answerText}>{q.answer}</Text>
                                    </View>
                                ) : (
                                    <View style={styles.answerSection}>
                                        <Text style={styles.skippedText}>⏭ Skipped</Text>
                                    </View>
                                )}

                                {q.strength ? (
                                    <View style={styles.feedbackRow}>
                                        <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                                        <Text style={styles.strengthText}>{q.strength}</Text>
                                    </View>
                                ) : null}

                                {q.improvement ? (
                                    <View style={styles.feedbackRow}>
                                        <Ionicons name="alert-circle" size={16} color="#F59E0B" />
                                        <Text style={styles.improvementText}>{q.improvement}</Text>
                                    </View>
                                ) : null}

                                {q.betterAnswer ? (
                                    <View style={styles.betterAnswerSection}>
                                        <Text style={styles.betterAnswerLabel}>💡 BETTER ANSWER</Text>
                                        <Text style={styles.betterAnswerText}>{q.betterAnswer}</Text>
                                    </View>
                                ) : null}
                            </View>
                        ))}
                    </>
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons name="document-text-outline" size={48} color="#374151" />
                        <Text style={styles.emptyText}>No detailed breakdown available</Text>
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
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#1F2937",
    },
    backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#161B28", justifyContent: "center", alignItems: "center" },
    headerTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "bold", flex: 1, textAlign: "center", marginHorizontal: 12 },
    scrollContainer: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },

    scoreCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#101623",
        borderRadius: 20,
        padding: 24,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#1F2937",
    },
    scoreCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#15244A",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 3,
        borderColor: "#3B82F6",
        flexDirection: "row",
        marginRight: 20,
    },
    scoreValue: { color: "#3B82F6", fontSize: 28, fontWeight: "bold" },
    scoreMax: { color: "#6B7280", fontSize: 14, marginTop: 8 },
    scoreInfo: { flex: 1 },
    scoreLabel: { color: "#FFFFFF", fontSize: 20, fontWeight: "bold", marginBottom: 4 },
    scoreDate: { color: "#9CA3AF", fontSize: 14 },

    feedbackCard: {
        backgroundColor: "#101623",
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "#1F2937",
    },
    feedbackHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
    feedbackTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold", marginLeft: 10 },
    feedbackText: { color: "#D1D5DB", fontSize: 14, lineHeight: 22 },

    sectionTitle: { color: "#9CA3AF", fontSize: 13, fontWeight: "bold", letterSpacing: 1, marginBottom: 16 },

    questionCard: {
        backgroundColor: "#101623",
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#1F2937",
    },
    questionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    questionNumber: { color: "#3B82F6", fontSize: 14, fontWeight: "bold" },
    questionScoreBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
    questionScoreText: { fontSize: 13, fontWeight: "bold" },
    questionText: { color: "#FFFFFF", fontSize: 15, lineHeight: 22, marginBottom: 16 },

    answerSection: { backgroundColor: "#0A0E17", borderRadius: 12, padding: 14, marginBottom: 12 },
    answerLabel: { color: "#6B7280", fontSize: 11, fontWeight: "bold", letterSpacing: 1, marginBottom: 6 },
    answerText: { color: "#D1D5DB", fontSize: 14, lineHeight: 20 },
    skippedText: { color: "#6B7280", fontSize: 14, fontStyle: "italic" },

    feedbackRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 8 },
    strengthText: { color: "#10B981", fontSize: 13, marginLeft: 8, flex: 1, lineHeight: 18 },
    improvementText: { color: "#F59E0B", fontSize: 13, marginLeft: 8, flex: 1, lineHeight: 18 },

    betterAnswerSection: { backgroundColor: "#0F1A2E", borderRadius: 12, padding: 14, marginTop: 8, borderWidth: 1, borderColor: "#1E3A8A" },
    betterAnswerLabel: { color: "#60A5FA", fontSize: 11, fontWeight: "bold", letterSpacing: 1, marginBottom: 6 },
    betterAnswerText: { color: "#D1D5DB", fontSize: 13, lineHeight: 20 },

    emptyState: { alignItems: "center", marginTop: 40 },
    emptyText: { color: "#9CA3AF", fontSize: 15, marginTop: 12 },
});

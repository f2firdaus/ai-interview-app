import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Platform,
    StatusBar,
    Dimensions,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

const SLIDES = [
    {
        icon: "mic-outline",
        iconLib: "ionicons",
        color: "#3B82F6",
        title: "AI-Powered Mock Interviews",
        subtitle: "Practice with realistic, AI-generated questions tailored to your resume and experience.",
    },
    {
        icon: "analytics-outline",
        iconLib: "ionicons",
        color: "#10B981",
        title: "Smart Feedback & Scoring",
        subtitle: "Get instant feedback, strengths, improvements, and better answers for every question.",
    },
    {
        icon: "rocket-outline",
        iconLib: "ionicons",
        color: "#F59E0B",
        title: "Track Your Progress",
        subtitle: "See your score trends, practice streaks, and focus on your weakest areas to improve fast.",
    },
];

export default function OnboardingScreen({ onDone }: { onDone: () => void }) {
    const [currentSlide, setCurrentSlide] = useState(0);

    const handleNext = async () => {
        if (currentSlide < SLIDES.length - 1) {
            setCurrentSlide(currentSlide + 1);
        } else {
            await AsyncStorage.setItem("onboarding_done", "true");
            onDone();
        }
    };

    const handleSkip = async () => {
        await AsyncStorage.setItem("onboarding_done", "true");
        onDone();
    };

    const slide = SLIDES[currentSlide];

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Skip */}
            <View style={styles.topRow}>
                <View />
                {currentSlide < SLIDES.length - 1 && (
                    <TouchableOpacity onPress={handleSkip}>
                        <Text style={styles.skipText}>Skip</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Content */}
            <View style={styles.content}>
                <View style={[styles.iconCircle, { backgroundColor: slide.color + "18" }]}>
                    <Ionicons name={slide.icon as any} size={72} color={slide.color} />
                </View>
                <Text style={styles.title}>{slide.title}</Text>
                <Text style={styles.subtitle}>{slide.subtitle}</Text>
            </View>

            {/* Dots + Button */}
            <View style={styles.bottomArea}>
                <View style={styles.dotsRow}>
                    {SLIDES.map((_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.dot,
                                i === currentSlide ? styles.dotActive : styles.dotInactive,
                            ]}
                        />
                    ))}
                </View>
                <TouchableOpacity style={[styles.nextBtn, { backgroundColor: slide.color }]} onPress={handleNext}>
                    <Text style={styles.nextText}>
                        {currentSlide === SLIDES.length - 1 ? "Get Started" : "Next"}
                    </Text>
                    <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#0A0E17",
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },
    topRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 24,
        paddingTop: 16,
    },
    skipText: {
        color: "#6B7280",
        fontSize: 16,
        fontWeight: "600",
    },
    content: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
    },
    iconCircle: {
        width: 160,
        height: 160,
        borderRadius: 80,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 48,
    },
    title: {
        color: "#FFFFFF",
        fontSize: 28,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 16,
        lineHeight: 36,
    },
    subtitle: {
        color: "#9CA3AF",
        fontSize: 16,
        textAlign: "center",
        lineHeight: 24,
        paddingHorizontal: 10,
    },
    bottomArea: {
        paddingHorizontal: 24,
        paddingBottom: 40,
        alignItems: "center",
    },
    dotsRow: {
        flexDirection: "row",
        marginBottom: 32,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginHorizontal: 5,
    },
    dotActive: {
        backgroundColor: "#3B82F6",
        width: 28,
    },
    dotInactive: {
        backgroundColor: "#374151",
    },
    nextBtn: {
        flexDirection: "row",
        height: 56,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
    },
    nextText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "bold",
    },
});

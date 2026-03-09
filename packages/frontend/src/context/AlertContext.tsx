import React, { createContext, useContext, useState } from "react";
import { View, Text, Modal, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type AlertButton = {
    text: string;
    onPress?: () => void;
    style?: "default" | "cancel" | "destructive";
};

type AlertOptions = {
    title: string;
    message: string;
    buttons?: AlertButton[];
};

type AlertContextType = {
    showAlert: (title: string, message?: string, buttons?: AlertButton[]) => void;
};

const AlertContext = createContext<AlertContextType | null>(null);

export const AlertProvider = ({ children }: { children: React.ReactNode }) => {
    const [visible, setVisible] = useState(false);
    const [options, setOptions] = useState<AlertOptions | null>(null);

    const showAlert = (title: string, message = "", buttons: AlertButton[] = [{ text: "OK" }]) => {
        setOptions({ title, message, buttons });
        setVisible(true);
    };

    const closeAlert = () => setVisible(false);

    return (
        <AlertContext.Provider value={{ showAlert }}>
            {children}
            <Modal transparent visible={visible} animationType="fade" onRequestClose={closeAlert}>
                <View style={styles.overlay}>
                    <View style={styles.alertBox}>

                        {/* Icon / Warning Shield based on destructive actions or general alerts */}
                        <View style={styles.iconContainer}>
                            {options?.buttons?.some(b => b.style === "destructive") ? (
                                <Ionicons name="warning" size={36} color="#EF4444" />
                            ) : (
                                <Ionicons name="information-circle" size={36} color="#3B82F6" />
                            )}
                        </View>

                        {/* Content */}
                        <Text style={styles.title}>{options?.title}</Text>
                        {!!options?.message && <Text style={styles.message}>{options.message}</Text>}

                        {/* Action Buttons */}
                        <View style={styles.buttonContainer}>
                            {options?.buttons?.map((btn, index) => {
                                const isDestructive = btn.style === "destructive";
                                const isCancel = btn.style === "cancel";

                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.button,
                                            isDestructive ? styles.buttonDestructive : isCancel ? styles.buttonCancel : styles.buttonPrimary,
                                            { flex: options.buttons!.length > 1 ? 0.48 : 1 }
                                        ]}
                                        onPress={() => {
                                            closeAlert();
                                            if (btn.onPress) setTimeout(btn.onPress, 100);
                                        }}
                                    >
                                        <Text
                                            style={[
                                                styles.buttonText,
                                                isDestructive ? styles.textDestructive : isCancel ? styles.textCancel : styles.textPrimary
                                            ]}
                                        >
                                            {btn.text}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                </View>
            </Modal>
        </AlertContext.Provider>
    );
};

export const useCustomAlert = () => {
    const ctx = useContext(AlertContext);
    if (!ctx) throw new Error("useCustomAlert must be used within AlertProvider");
    return ctx;
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    alertBox: {
        width: Dimensions.get("window").width * 0.85,
        backgroundColor: "#101623",
        borderRadius: 20,
        padding: 24,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#1F2937",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 10,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "#15244A",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },
    title: {
        color: "#FFFFFF",
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 8,
    },
    message: {
        color: "#9CA3AF",
        fontSize: 15,
        textAlign: "center",
        lineHeight: 22,
        marginBottom: 24,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },
    button: {
        height: 48,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    buttonPrimary: {
        backgroundColor: "#3B82F6",
    },
    buttonDestructive: {
        backgroundColor: "#EF4444",
    },
    buttonCancel: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: "#374151",
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "bold",
    },
    textPrimary: {
        color: "#FFFFFF",
    },
    textDestructive: {
        color: "#FFFFFF",
    },
    textCancel: {
        color: "#9CA3AF",
    },
});

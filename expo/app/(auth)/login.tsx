import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  I18nManager,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/lib/auth-context";
import { LinearGradient } from "expo-linear-gradient";
import { Heart } from "lucide-react-native";

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

type TabType = "login" | "register";

export default function LoginScreen() {
  const [activeTab, setActiveTab] = useState<TabType>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"admin" | "family_member" | "caregiver">("family_member");

  const { login } = useAuth();

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async (data) => {
      await login(data.token, data.user);
    },
    onError: (error) => {
      console.error("Login error:", error);
      const errorMessage = error.message || "";
      const isNetworkError = errorMessage.includes("fetch") || 
                            errorMessage.includes("offline") || 
                            errorMessage.includes("404") ||
                            errorMessage.includes("NGROK") ||
                            errorMessage.toLowerCase().includes("לא ניתן להתחבר");
      
      const message = isNetworkError
        ? "⚠️ השרת אינו זמין כרגע\n\nהשרת צריך להיות פעיל כדי להתחבר. אנא נסה שוב מאוחר יותר."
        : errorMessage || "התחברות נכשלה";
      
      Alert.alert("שגיאת התחברות", message, [
        { text: "אישור", style: "default" }
      ]);
    },
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: async (data) => {
      await login(data.token, data.user);
    },
    onError: (error) => {
      console.error("Register error:", error);
      const errorMessage = error.message || "";
      const isNetworkError = errorMessage.includes("fetch") || 
                            errorMessage.includes("offline") || 
                            errorMessage.includes("404") ||
                            errorMessage.includes("NGROK") ||
                            errorMessage.toLowerCase().includes("לא ניתן להתחבר");
      
      const message = isNetworkError
        ? "⚠️ השרת אינו זמין כרגע\n\nהשרת צריך להיות פעיל כדי להירשם. אנא נסה שוב מאוחר יותר."
        : errorMessage || "הרשמה נכשלה";
      
      Alert.alert("שגיאת הרשמה", message, [
        { text: "אישור", style: "default" }
      ]);
    },
  });

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("שגיאה", "נא למלא את כל השדות");
      return;
    }
    loginMutation.mutate({ email, password });
  };

  const handleRegister = () => {
    if (!email || !password || !name) {
      Alert.alert("שגיאה", "נא למלא את כל השדות");
      return;
    }
    registerMutation.mutate({ email, password, name, role });
  };

  const getRoleLabel = (r: string) => {
    switch (r) {
      case "admin":
        return "מנהל משפחה";
      case "family_member":
        return "בן משפחה";
      case "caregiver":
        return "מטפל/ת";
      default:
        return r;
    }
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={["#6366f1", "#8b5cf6", "#d946ef"]} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Heart size={60} color="#fff" fill="#fff" />
            <Text style={styles.title}>הסבתא שלי</Text>
            <Text style={styles.subtitle}>ניהול טיפול משפחתי חכם</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.tabs}>
              <TouchableOpacity
                style={[styles.tab, activeTab === "login" && styles.activeTab]}
                onPress={() => setActiveTab("login")}
              >
                <Text style={[styles.tabText, activeTab === "login" && styles.activeTabText]}>
                  התחברות
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === "register" && styles.activeTab]}
                onPress={() => setActiveTab("register")}
              >
                <Text style={[styles.tabText, activeTab === "register" && styles.activeTabText]}>
                  הרשמה
                </Text>
              </TouchableOpacity>
            </View>

            {activeTab === "register" && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>שם מלא</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="הכנס שם מלא"
                  placeholderTextColor="#9ca3af"
                  textAlign="right"
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>אימייל</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="הכנס אימייל"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
                textAlign="right"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>סיסמה</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="הכנס סיסמה"
                placeholderTextColor="#9ca3af"
                secureTextEntry
                textAlign="right"
              />
            </View>

            {activeTab === "register" && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>תפקיד</Text>
                <View style={styles.roleButtons}>
                  {(["admin", "family_member", "caregiver"] as const).map((r) => (
                    <TouchableOpacity
                      key={r}
                      style={[styles.roleButton, role === r && styles.roleButtonActive]}
                      onPress={() => setRole(r)}
                    >
                      <Text style={[styles.roleButtonText, role === r && styles.roleButtonTextActive]}>
                        {getRoleLabel(r)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={activeTab === "login" ? handleLogin : handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>
                  {activeTab === "login" ? "התחבר" : "הירשם"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 20,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#e9d5ff",
    marginTop: 8,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  tabs: {
    flexDirection: "row",
    marginBottom: 24,
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "600",
  },
  activeTabText: {
    color: "#6366f1",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    textAlign: "right",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#f9fafb",
    color: "#111827",
  },
  roleButtons: {
    gap: 8,
  },
  roleButton: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  roleButtonActive: {
    backgroundColor: "#6366f1",
    borderColor: "#6366f1",
  },
  roleButtonText: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "600",
  },
  roleButtonTextActive: {
    color: "#fff",
  },
  button: {
    backgroundColor: "#6366f1",
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

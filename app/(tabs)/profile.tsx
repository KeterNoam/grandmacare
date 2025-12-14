import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { User, LogOut, Shield, Heart } from "lucide-react-native";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert("התנתקות", "האם אתה בטוח שברצונך להתנתק?", [
      { text: "ביטול", style: "cancel" },
      {
        text: "התנתק",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "מנהל משפחה";
      case "family_member":
        return "בן משפחה";
      case "caregiver":
        return "מטפל/ת";
      default:
        return role;
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case "admin":
        return "הרשאות מלאות לניהול המערכת והמשפחה";
      case "family_member":
        return "צפייה בנתונים, הוספת הודעות ולקיחת אחריות על משימות";
      case "caregiver":
        return "רישום מדדים, מתן תרופות והוספת הערות";
      default:
        return "";
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <LinearGradient colors={["#6366f1", "#8b5cf6", "#d946ef"]} style={styles.header}>
          <View style={styles.avatarContainer}>
            <User size={60} color="#fff" />
          </View>
          <Text style={styles.userName}>{user?.name || "משתמש"}</Text>
          <Text style={styles.userEmail}>{user?.email || ""}</Text>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Shield size={24} color="#6366f1" />
              <Text style={styles.cardTitle}>תפקיד במערכת</Text>
            </View>
            <View style={styles.roleContainer}>
              <Text style={styles.roleLabel}>{getRoleLabel(user?.role || "")}</Text>
              <Text style={styles.roleDescription}>
                {getRoleDescription(user?.role || "")}
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Heart size={24} color="#ec4899" />
              <Text style={styles.cardTitle}>מידע משפחתי</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoValue}>{user?.familyId || ""}</Text>
              <Text style={styles.infoLabel}>מזהה משפחה:</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>על האפליקציה</Text>
            <Text style={styles.infoCardText}>
              &ldquo;הסבתא שלי&rdquo; היא מערכת לניהול טיפול משפחתי חכם. המערכת מאפשרת למשפחות לנהל,
              לעקוב ולתעד את הטיפול הרפואי והיומיומי של קרובי משפחה קשישים במערכת אחת ומשותפת.
            </Text>
          </View>

          {user?.role === "admin" && (
            <View style={styles.adminCard}>
              <Text style={styles.adminCardTitle}>הרשאות מנהל</Text>
              <Text style={styles.adminCardText}>
                כמנהל משפחה, יש לך הרשאות להוספת תרופות, תורים, ומחיקת נתונים. השתמש בהרשאות
                אלו באחריות.
              </Text>
            </View>
          )}

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={24} color="#fff" />
            <Text style={styles.logoutButtonText}>התנתקות</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    padding: 32,
    alignItems: "center",
    paddingTop: 48,
    paddingBottom: 48,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 4,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  userName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: "#e9d5ff",
    textAlign: "center",
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  roleContainer: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
  },
  roleLabel: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6366f1",
    marginBottom: 8,
    textAlign: "right",
  },
  roleDescription: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
    textAlign: "right",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
  },
  infoLabel: {
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "600",
  },
  infoValue: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
  },
  infoCard: {
    backgroundColor: "#dbeafe",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  infoCardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e40af",
    marginBottom: 12,
    textAlign: "right",
  },
  infoCardText: {
    fontSize: 14,
    color: "#1e3a8a",
    lineHeight: 22,
    textAlign: "right",
  },
  adminCard: {
    backgroundColor: "#fef3c7",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderRightWidth: 4,
    borderRightColor: "#f59e0b",
  },
  adminCardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#b45309",
    marginBottom: 12,
    textAlign: "right",
  },
  adminCardText: {
    fontSize: 14,
    color: "#92400e",
    lineHeight: 22,
    textAlign: "right",
  },
  logoutButton: {
    backgroundColor: "#ef4444",
    borderRadius: 12,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/lib/auth-context";
import { LinearGradient } from "expo-linear-gradient";
import { Activity, Pill, Calendar, CheckSquare, MessageSquare, Heart } from "lucide-react-native";

export default function HomeScreen() {
  const { user, setUser } = useAuth();

  const currentUserQuery = trpc.auth.getCurrentUser.useQuery(undefined, {
    enabled: !user,
  });

  const vitalsQuery = trpc.vitals.list.useQuery({});
  const medicationsQuery = trpc.medications.list.useQuery({ isActive: true });
  const appointmentsQuery = trpc.appointments.list.useQuery();
  const tasksQuery = trpc.tasks.list.useQuery();
  const messagesQuery = trpc.messages.list.useQuery();

  useEffect(() => {
    if (currentUserQuery.data && !user) {
      setUser(currentUserQuery.data);
    }
  }, [currentUserQuery.data, user, setUser]);

  const refetch = async () => {
    await Promise.all([
      vitalsQuery.refetch(),
      medicationsQuery.refetch(),
      appointmentsQuery.refetch(),
      tasksQuery.refetch(),
      messagesQuery.refetch(),
    ]);
  };

  const isLoading =
    vitalsQuery.isLoading ||
    medicationsQuery.isLoading ||
    appointmentsQuery.isLoading ||
    tasksQuery.isLoading ||
    messagesQuery.isLoading;

  const isRefreshing =
    vitalsQuery.isFetching ||
    medicationsQuery.isFetching ||
    appointmentsQuery.isFetching ||
    tasksQuery.isFetching ||
    messagesQuery.isFetching;

  const latestVital = vitalsQuery.data?.[0];
  const todayAppointments = appointmentsQuery.data?.filter((a) => {
    const appointmentDate = new Date(a.dateTime);
    const today = new Date();
    return appointmentDate.toDateString() === today.toDateString();
  });
  const openTasks = tasksQuery.data?.filter((t) => t.status !== "done");
  const openMessages = messagesQuery.data?.filter((m) => m.status === "open");

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refetch} />}
    >
      <LinearGradient colors={["#6366f1", "#8b5cf6"]} style={styles.headerGradient}>
        <Heart size={40} color="#fff" fill="#fff" />
        <Text style={styles.welcomeText}>שלום, {user?.name || "משתמש"}</Text>
        <Text style={styles.roleText}>
          {user?.role === "admin"
            ? "מנהל משפחה"
            : user?.role === "family_member"
            ? "בן משפחה"
            : "מטפל/ת"}
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>סקירה כללית</Text>

        <View style={styles.grid}>
          <View style={styles.card}>
            <View style={[styles.iconContainer, { backgroundColor: "#dbeafe" }]}>
              <Activity size={24} color="#2563eb" />
            </View>
            <Text style={styles.cardTitle}>מדד אחרון</Text>
            {latestVital ? (
              <>
                <Text style={styles.cardValue}>
                  {latestVital.type === "blood_pressure"
                    ? `${latestVital.systolic}/${latestVital.diastolic}`
                    : latestVital.value}
                </Text>
                <Text style={styles.cardSubtitle}>
                  {latestVital.type === "blood_pressure"
                    ? "לחץ דם"
                    : latestVital.type === "sugar"
                    ? "סוכר"
                    : "דופק"}
                </Text>
              </>
            ) : (
              <Text style={styles.cardEmpty}>אין מדדים</Text>
            )}
          </View>

          <View style={styles.card}>
            <View style={[styles.iconContainer, { backgroundColor: "#fce7f3" }]}>
              <Pill size={24} color="#db2777" />
            </View>
            <Text style={styles.cardTitle}>תרופות פעילות</Text>
            <Text style={styles.cardValue}>{medicationsQuery.data?.length || 0}</Text>
            <Text style={styles.cardSubtitle}>תרופות</Text>
          </View>

          <View style={styles.card}>
            <View style={[styles.iconContainer, { backgroundColor: "#dcfce7" }]}>
              <Calendar size={24} color="#16a34a" />
            </View>
            <Text style={styles.cardTitle}>תורים היום</Text>
            <Text style={styles.cardValue}>{todayAppointments?.length || 0}</Text>
            <Text style={styles.cardSubtitle}>תורים</Text>
          </View>

          <View style={styles.card}>
            <View style={[styles.iconContainer, { backgroundColor: "#fef3c7" }]}>
              <CheckSquare size={24} color="#d97706" />
            </View>
            <Text style={styles.cardTitle}>משימות פתוחות</Text>
            <Text style={styles.cardValue}>{openTasks?.length || 0}</Text>
            <Text style={styles.cardSubtitle}>משימות</Text>
          </View>
        </View>

        {openMessages && openMessages.length > 0 && (
          <View style={styles.messagesSection}>
            <View style={styles.messagesSectionHeader}>
              <MessageSquare size={24} color="#6366f1" />
              <Text style={styles.messagesSectionTitle}>הודעות אחרונות</Text>
            </View>
            {openMessages.slice(0, 3).map((message) => (
              <View key={message.id} style={styles.messageCard}>
                <Text style={styles.messageContent}>{message.content}</Text>
                <Text style={styles.messageAuthor}>
                  {message.createdByUserName} • {new Date(message.createdAt).toLocaleDateString("he-IL")}
                </Text>
              </View>
            ))}
          </View>
        )}

        {todayAppointments && todayAppointments.length > 0 && (
          <View style={styles.appointmentsSection}>
            <Text style={styles.sectionTitle}>תורים להיום</Text>
            {todayAppointments.map((appointment) => (
              <View key={appointment.id} style={styles.appointmentCard}>
                <Text style={styles.appointmentType}>{appointment.type}</Text>
                <Text style={styles.appointmentTime}>
                  {new Date(appointment.dateTime).toLocaleTimeString("he-IL", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
                <Text style={styles.appointmentLocation}>{appointment.location}</Text>
                {appointment.responsibleUserName && (
                  <Text style={styles.appointmentResponsible}>
                    אחראי: {appointment.responsibleUserName}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  headerGradient: {
    padding: 24,
    alignItems: "center",
    paddingTop: 32,
    paddingBottom: 32,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 12,
    textAlign: "center",
  },
  roleText: {
    fontSize: 16,
    color: "#e9d5ff",
    marginTop: 4,
    textAlign: "center",
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
    textAlign: "right",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    width: "48%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
    textAlign: "right",
  },
  cardValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "right",
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 4,
    textAlign: "right",
  },
  cardEmpty: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "right",
  },
  messagesSection: {
    marginBottom: 24,
  },
  messagesSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  messagesSectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  messageCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderRightWidth: 4,
    borderRightColor: "#6366f1",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  messageContent: {
    fontSize: 16,
    color: "#111827",
    marginBottom: 8,
    textAlign: "right",
  },
  messageAuthor: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "right",
  },
  appointmentsSection: {
    marginBottom: 24,
  },
  appointmentCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appointmentType: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
    textAlign: "right",
  },
  appointmentTime: {
    fontSize: 16,
    color: "#6366f1",
    marginBottom: 4,
    textAlign: "right",
  },
  appointmentLocation: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
    textAlign: "right",
  },
  appointmentResponsible: {
    fontSize: 14,
    color: "#16a34a",
    textAlign: "right",
  },
});

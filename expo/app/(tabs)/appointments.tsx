import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/lib/auth-context";
import { Calendar, Plus, X, MapPin, UserCheck } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function AppointmentsScreen() {
  const { user } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [patientName, setPatientName] = useState("סבתא");
  const [type, setType] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  const appointmentsQuery = trpc.appointments.list.useQuery();
  const createMutation = trpc.appointments.create.useMutation({
    onSuccess: () => {
      appointmentsQuery.refetch();
      setShowAddModal(false);
      resetForm();
      Alert.alert("הצלחה", "התור נוסף בהצלחה");
    },
    onError: (error) => {
      Alert.alert("שגיאה", error.message || "נכשל להוסיף תור");
    },
  });

  const assignMutation = trpc.appointments.assignResponsible.useMutation({
    onSuccess: () => {
      appointmentsQuery.refetch();
      Alert.alert("הצלחה", "נרשמת כאחראי על התור");
    },
    onError: (error) => {
      Alert.alert("שגיאה", error.message || "נכשל לשייך אחראי");
    },
  });

  const resetForm = () => {
    setType("");
    setDate("");
    setTime("");
    setLocation("");
    setNotes("");
  };

  const handleSubmit = () => {
    if (!type || !date || !time || !location) {
      Alert.alert("שגיאה", "נא למלא את כל השדות");
      return;
    }

    const dateTime = new Date(`${date}T${time}`);
    if (isNaN(dateTime.getTime())) {
      Alert.alert("שגיאה", "תאריך או שעה לא תקינים");
      return;
    }

    createMutation.mutate({
      patientName,
      type,
      dateTime,
      location,
      notes,
    });
  };

  const handleAssign = (appointmentId: string) => {
    assignMutation.mutate({ appointmentId, userId: user?.id });
  };

  const isAdmin = user?.role === "admin";

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={appointmentsQuery.isFetching}
            onRefresh={() => appointmentsQuery.refetch()}
          />
        }
      >
        <LinearGradient colors={["#dcfce7", "#f9fafb"]} style={styles.header}>
          <Calendar size={40} color="#16a34a" />
          <Text style={styles.headerTitle}>ניהול תורים</Text>
          <Text style={styles.headerSubtitle}>מעקב אחר פגישות רפואיות</Text>
        </LinearGradient>

        <View style={styles.content}>
          {appointmentsQuery.isLoading ? (
            <ActivityIndicator size="large" color="#6366f1" />
          ) : appointmentsQuery.data && appointmentsQuery.data.length > 0 ? (
            appointmentsQuery.data.map((appointment) => {
              const appointmentDate = new Date(appointment.dateTime);
              const isPast = appointmentDate < new Date();
              
              return (
                <View key={appointment.id} style={[styles.appointmentCard, isPast && styles.pastAppointment]}>
                  <View style={styles.appointmentHeader}>
                    <View style={styles.calendarIcon}>
                      <Calendar size={24} color="#16a34a" />
                    </View>
                    <View style={styles.appointmentInfo}>
                      <Text style={styles.appointmentType}>{appointment.type}</Text>
                      <Text style={styles.appointmentDate}>
                        {appointmentDate.toLocaleDateString("he-IL")} • {appointmentDate.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.locationContainer}>
                    <MapPin size={16} color="#6b7280" />
                    <Text style={styles.locationText}>{appointment.location}</Text>
                  </View>

                  {appointment.notes && (
                    <Text style={styles.notesText}>{appointment.notes}</Text>
                  )}

                  {appointment.responsibleUserName ? (
                    <View style={styles.responsibleContainer}>
                      <UserCheck size={16} color="#16a34a" />
                      <Text style={styles.responsibleText}>
                        אחראי: {appointment.responsibleUserName}
                      </Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.assignButton}
                      onPress={() => handleAssign(appointment.id)}
                      disabled={assignMutation.isPending}
                    >
                      <UserCheck size={20} color="#fff" />
                      <Text style={styles.assignButtonText}>אני אקח אחריות</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Calendar size={60} color="#d1d5db" />
              <Text style={styles.emptyText}>אין תורים מתוכננים</Text>
              <Text style={styles.emptySubtext}>הוסף תור ראשון</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {isAdmin && (
        <TouchableOpacity style={styles.fab} onPress={() => setShowAddModal(true)}>
          <Plus size={28} color="#fff" />
        </TouchableOpacity>
      )}

      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>הוספת תור חדש</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>שם המטופל</Text>
                <TextInput
                  style={styles.input}
                  value={patientName}
                  onChangeText={setPatientName}
                  placeholder="שם המטופל"
                  textAlign="right"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>סוג התור</Text>
                <TextInput
                  style={styles.input}
                  value={type}
                  onChangeText={setType}
                  placeholder="לדוגמה: רופא עיניים, קרדיולוג"
                  textAlign="right"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>תאריך (YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.input}
                  value={date}
                  onChangeText={setDate}
                  placeholder="2024-12-31"
                  textAlign="right"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>שעה (HH:MM)</Text>
                <TextInput
                  style={styles.input}
                  value={time}
                  onChangeText={setTime}
                  placeholder="14:30"
                  textAlign="right"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>מיקום</Text>
                <TextInput
                  style={styles.input}
                  value={location}
                  onChangeText={setLocation}
                  placeholder="כתובת המרפאה"
                  textAlign="right"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>הערות (אופציונלי)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="הערות נוספות..."
                  multiline
                  numberOfLines={3}
                  textAlign="right"
                />
              </View>

              <TouchableOpacity
                style={[styles.submitButton, createMutation.isPending && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>הוסף תור</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    padding: 24,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#15803d",
    marginTop: 12,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
    textAlign: "center",
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  appointmentCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pastAppointment: {
    opacity: 0.6,
  },
  appointmentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  calendarIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentType: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "right",
  },
  appointmentDate: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
    textAlign: "right",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
    justifyContent: "flex-end",
  },
  locationText: {
    fontSize: 14,
    color: "#4b5563",
  },
  notesText: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 12,
    textAlign: "right",
  },
  responsibleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#dcfce7",
    padding: 12,
    borderRadius: 12,
    justifyContent: "flex-end",
  },
  responsibleText: {
    fontSize: 14,
    color: "#15803d",
    fontWeight: "600",
  },
  assignButton: {
    backgroundColor: "#6366f1",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  assignButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#6b7280",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 8,
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    bottom: 24,
    left: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#6366f1",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
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
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#6366f1",
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

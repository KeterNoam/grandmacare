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
import { Pill, Plus, X, Check } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function MedicationsScreen() {
  const { user } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [patientName, setPatientName] = useState("סבתא");
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequencyPerDay, setFrequencyPerDay] = useState("");
  const [instructions, setInstructions] = useState("");
  const [timesOfDay, setTimesOfDay] = useState<string[]>([]);

  const medicationsQuery = trpc.medications.list.useQuery({ isActive: true });
  const createMutation = trpc.medications.create.useMutation({
    onSuccess: () => {
      medicationsQuery.refetch();
      setShowAddModal(false);
      resetForm();
      Alert.alert("הצלחה", "התרופה נוספה בהצלחה");
    },
    onError: (error) => {
      Alert.alert("שגיאה", error.message || "נכשל להוסיף תרופה");
    },
  });

  const logIntakeMutation = trpc.medications.logIntake.useMutation({
    onSuccess: () => {
      medicationsQuery.refetch();
      Alert.alert("הצלחה", "נרשם מתן תרופה");
    },
    onError: (error) => {
      Alert.alert("שגיאה", error.message || "נכשל לרשום מתן תרופה");
    },
  });

  const resetForm = () => {
    setName("");
    setDosage("");
    setFrequencyPerDay("");
    setInstructions("");
    setTimesOfDay([]);
  };

  const handleSubmit = () => {
    if (!name || !dosage || !frequencyPerDay || !instructions) {
      Alert.alert("שגיאה", "נא למלא את כל השדות");
      return;
    }
    createMutation.mutate({
      patientName,
      name,
      dosage,
      frequencyPerDay: parseInt(frequencyPerDay),
      instructions,
      timesOfDay: timesOfDay.length > 0 ? timesOfDay : ["בוקר"],
    });
  };

  const toggleTimeOfDay = (time: string) => {
    if (timesOfDay.includes(time)) {
      setTimesOfDay(timesOfDay.filter((t) => t !== time));
    } else {
      setTimesOfDay([...timesOfDay, time]);
    }
  };

  const handleLogIntake = (medicationId: string) => {
    logIntakeMutation.mutate({ medicationId });
  };

  const isAdmin = user?.role === "admin";

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={medicationsQuery.isFetching}
            onRefresh={() => medicationsQuery.refetch()}
          />
        }
      >
        <LinearGradient colors={["#fce7f3", "#f9fafb"]} style={styles.header}>
          <Pill size={40} color="#db2777" />
          <Text style={styles.headerTitle}>ניהול תרופות</Text>
          <Text style={styles.headerSubtitle}>מעקב אחר נטילת תרופות</Text>
        </LinearGradient>

        <View style={styles.content}>
          {medicationsQuery.isLoading ? (
            <ActivityIndicator size="large" color="#6366f1" />
          ) : medicationsQuery.data && medicationsQuery.data.length > 0 ? (
            medicationsQuery.data.map((medication) => (
              <View key={medication.id} style={styles.medicationCard}>
                <View style={styles.medicationHeader}>
                  <View style={styles.pillIcon}>
                    <Pill size={24} color="#db2777" />
                  </View>
                  <View style={styles.medicationInfo}>
                    <Text style={styles.medicationName}>{medication.name}</Text>
                    <Text style={styles.medicationDosage}>{medication.dosage}</Text>
                  </View>
                </View>

                <View style={styles.medicationDetails}>
                  <Text style={styles.detailLabel}>תדירות:</Text>
                  <Text style={styles.detailValue}>{medication.frequencyPerDay} פעמים ביום</Text>
                </View>

                <View style={styles.medicationDetails}>
                  <Text style={styles.detailLabel}>הוראות:</Text>
                  <Text style={styles.detailValue}>{medication.instructions}</Text>
                </View>

                <View style={styles.timesOfDayContainer}>
                  {medication.timesOfDay.map((time) => (
                    <View key={time} style={styles.timeChip}>
                      <Text style={styles.timeChipText}>{time}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  style={styles.logButton}
                  onPress={() => handleLogIntake(medication.id)}
                  disabled={logIntakeMutation.isPending}
                >
                  <Check size={20} color="#fff" />
                  <Text style={styles.logButtonText}>סמן כניתנה</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Pill size={60} color="#d1d5db" />
              <Text style={styles.emptyText}>אין תרופות רשומות</Text>
              <Text style={styles.emptySubtext}>הוסף תרופה ראשונה להתחיל במעקב</Text>
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
              <Text style={styles.modalTitle}>הוספת תרופה חדשה</Text>
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
                <Text style={styles.label}>שם התרופה</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="שם התרופה"
                  textAlign="right"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>מינון</Text>
                <TextInput
                  style={styles.input}
                  value={dosage}
                  onChangeText={setDosage}
                  placeholder="לדוגמה: 500 מ״ג"
                  textAlign="right"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>תדירות ביום</Text>
                <TextInput
                  style={styles.input}
                  value={frequencyPerDay}
                  onChangeText={setFrequencyPerDay}
                  placeholder="מספר פעמים ביום"
                  keyboardType="numeric"
                  textAlign="right"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>הוראות נטילה</Text>
                <TextInput
                  style={styles.input}
                  value={instructions}
                  onChangeText={setInstructions}
                  placeholder="לפני/אחרי האוכל"
                  textAlign="right"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>זמני נטילה</Text>
                <View style={styles.timesButtons}>
                  {["בוקר", "צהריים", "ערב", "לפני השינה"].map((time) => (
                    <TouchableOpacity
                      key={time}
                      style={[styles.timeButton, timesOfDay.includes(time) && styles.timeButtonActive]}
                      onPress={() => toggleTimeOfDay(time)}
                    >
                      <Text
                        style={[
                          styles.timeButtonText,
                          timesOfDay.includes(time) && styles.timeButtonTextActive,
                        ]}
                      >
                        {time}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={[styles.submitButton, createMutation.isPending && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>הוסף תרופה</Text>
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
    color: "#be185d",
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
  medicationCard: {
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
  medicationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  pillIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fce7f3",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "right",
  },
  medicationDosage: {
    fontSize: 16,
    color: "#6b7280",
    marginTop: 2,
    textAlign: "right",
  },
  medicationDetails: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginLeft: 8,
  },
  detailValue: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "600",
  },
  timesOfDayContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
    justifyContent: "flex-end",
  },
  timeChip: {
    backgroundColor: "#dbeafe",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  timeChipText: {
    fontSize: 12,
    color: "#1e40af",
    fontWeight: "600",
  },
  logButton: {
    backgroundColor: "#16a34a",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  logButtonText: {
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
  timesButtons: {
    gap: 8,
  },
  timeButton: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  timeButtonActive: {
    backgroundColor: "#6366f1",
    borderColor: "#6366f1",
  },
  timeButtonText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "600",
  },
  timeButtonTextActive: {
    color: "#fff",
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

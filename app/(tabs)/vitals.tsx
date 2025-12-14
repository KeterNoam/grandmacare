import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { trpc } from "@/lib/trpc";
import { Activity, Plus, X } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

type VitalType = "blood_pressure" | "sugar" | "heart_rate";

export default function VitalsScreen() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [patientName, setPatientName] = useState("סבתא");
  const [type, setType] = useState<VitalType>("blood_pressure");
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [value, setValue] = useState("");
  const [note, setNote] = useState("");

  const vitalsQuery = trpc.vitals.list.useQuery({});
  const createMutation = trpc.vitals.create.useMutation({
    onSuccess: () => {
      vitalsQuery.refetch();
      setShowAddModal(false);
      resetForm();
      Alert.alert("הצלחה", "המדד נוסף בהצלחה");
    },
    onError: (error) => {
      Alert.alert("שגיאה", error.message || "נכשל להוסיף מדד");
    },
  });

  const resetForm = () => {
    setSystolic("");
    setDiastolic("");
    setValue("");
    setNote("");
  };

  const handleSubmit = () => {
    if (type === "blood_pressure") {
      if (!systolic || !diastolic) {
        Alert.alert("שגיאה", "נא למלא את כל השדות");
        return;
      }
      createMutation.mutate({
        patientName,
        type,
        systolic: parseFloat(systolic),
        diastolic: parseFloat(diastolic),
        note,
      });
    } else {
      if (!value) {
        Alert.alert("שגיאה", "נא למלא את כל השדות");
        return;
      }
      createMutation.mutate({
        patientName,
        type,
        value: parseFloat(value),
        note,
      });
    }
  };

  const getTypeLabel = (t: VitalType) => {
    switch (t) {
      case "blood_pressure":
        return "לחץ דם";
      case "sugar":
        return "רמת סוכר";
      case "heart_rate":
        return "דופק";
    }
  };

  const getTypeColor = (t: VitalType) => {
    switch (t) {
      case "blood_pressure":
        return "#3b82f6";
      case "sugar":
        return "#f59e0b";
      case "heart_rate":
        return "#ef4444";
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={vitalsQuery.isFetching} onRefresh={() => vitalsQuery.refetch()} />
        }
      >
        <LinearGradient colors={["#dbeafe", "#f9fafb"]} style={styles.header}>
          <Activity size={40} color="#3b82f6" />
          <Text style={styles.headerTitle}>מעקב מדדים רפואיים</Text>
          <Text style={styles.headerSubtitle}>תיעוד ומעקב אחר מדדים חיוניים</Text>
        </LinearGradient>

        <View style={styles.content}>
          {vitalsQuery.isLoading ? (
            <ActivityIndicator size="large" color="#6366f1" />
          ) : vitalsQuery.data && vitalsQuery.data.length > 0 ? (
            vitalsQuery.data.map((vital) => (
              <View key={vital.id} style={styles.vitalCard}>
                <View style={styles.vitalHeader}>
                  <View style={[styles.typeIndicator, { backgroundColor: getTypeColor(vital.type) }]} />
                  <View style={styles.vitalInfo}>
                    <Text style={styles.vitalType}>{getTypeLabel(vital.type)}</Text>
                    <Text style={styles.vitalDate}>
                      {new Date(vital.createdAt).toLocaleString("he-IL")}
                    </Text>
                  </View>
                </View>
                <View style={styles.vitalValue}>
                  <Text style={styles.valueText}>
                    {vital.type === "blood_pressure"
                      ? `${vital.systolic}/${vital.diastolic}`
                      : vital.value}
                  </Text>
                  <Text style={styles.valueUnit}>
                    {vital.type === "blood_pressure"
                      ? "mmHg"
                      : vital.type === "sugar"
                      ? "mg/dL"
                      : "bpm"}
                  </Text>
                </View>
                {vital.note && <Text style={styles.vitalNote}>{vital.note}</Text>}
                <Text style={styles.vitalCreator}>נרשם על ידי: {vital.createdByUserName}</Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Activity size={60} color="#d1d5db" />
              <Text style={styles.emptyText}>אין מדדים רפואיים</Text>
              <Text style={styles.emptySubtext}>הוסף מדד ראשון כדי להתחיל במעקב</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => setShowAddModal(true)}>
        <Plus size={28} color="#fff" />
      </TouchableOpacity>

      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>הוספת מדד חדש</Text>
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
                <Text style={styles.label}>סוג המדד</Text>
                <View style={styles.typeButtons}>
                  {(["blood_pressure", "sugar", "heart_rate"] as const).map((t) => (
                    <TouchableOpacity
                      key={t}
                      style={[styles.typeButton, type === t && styles.typeButtonActive]}
                      onPress={() => setType(t)}
                    >
                      <Text style={[styles.typeButtonText, type === t && styles.typeButtonTextActive]}>
                        {getTypeLabel(t)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {type === "blood_pressure" ? (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>לחץ סיסטולי (עליון)</Text>
                    <TextInput
                      style={styles.input}
                      value={systolic}
                      onChangeText={setSystolic}
                      placeholder="120"
                      keyboardType="numeric"
                      textAlign="right"
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>לחץ דיאסטולי (תחתון)</Text>
                    <TextInput
                      style={styles.input}
                      value={diastolic}
                      onChangeText={setDiastolic}
                      placeholder="80"
                      keyboardType="numeric"
                      textAlign="right"
                    />
                  </View>
                </>
              ) : (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>ערך</Text>
                  <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={setValue}
                    placeholder={type === "sugar" ? "90" : "70"}
                    keyboardType="numeric"
                    textAlign="right"
                  />
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>הערות (אופציונלי)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={note}
                  onChangeText={setNote}
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
                  <Text style={styles.submitButtonText}>הוסף מדד</Text>
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
    color: "#1e40af",
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
  vitalCard: {
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
  vitalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  typeIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginLeft: 12,
  },
  vitalInfo: {
    flex: 1,
  },
  vitalType: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "right",
  },
  vitalDate: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
    textAlign: "right",
  },
  vitalValue: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "flex-end",
    marginBottom: 8,
  },
  valueText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#111827",
    marginLeft: 8,
  },
  valueUnit: {
    fontSize: 16,
    color: "#6b7280",
  },
  vitalNote: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 8,
    textAlign: "right",
  },
  vitalCreator: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "right",
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
  typeButtons: {
    gap: 8,
  },
  typeButton: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  typeButtonActive: {
    backgroundColor: "#6366f1",
    borderColor: "#6366f1",
  },
  typeButtonText: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "600",
  },
  typeButtonTextActive: {
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

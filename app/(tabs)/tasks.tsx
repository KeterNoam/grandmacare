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
import { CheckSquare, Plus, X, Circle, Clock, CheckCircle } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

type TaskStatus = "open" | "in_progress" | "done";

export default function TasksScreen() {
  const { user } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [patientName, setPatientName] = useState("סבתא");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const tasksQuery = trpc.tasks.list.useQuery();
  const createMutation = trpc.tasks.create.useMutation({
    onSuccess: () => {
      tasksQuery.refetch();
      setShowAddModal(false);
      resetForm();
      Alert.alert("הצלחה", "המשימה נוספה בהצלחה");
    },
    onError: (error) => {
      Alert.alert("שגיאה", error.message || "נכשל להוסיף משימה");
    },
  });

  const updateStatusMutation = trpc.tasks.updateStatus.useMutation({
    onSuccess: () => {
      tasksQuery.refetch();
    },
    onError: (error) => {
      Alert.alert("שגיאה", error.message || "נכשל לעדכן סטטוס");
    },
  });

  const assignMutation = trpc.tasks.assign.useMutation({
    onSuccess: () => {
      tasksQuery.refetch();
      Alert.alert("הצלחה", "המשימה נשייכה אליך");
    },
    onError: (error) => {
      Alert.alert("שגיאה", error.message || "נכשל לשייך משימה");
    },
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
  };

  const handleSubmit = () => {
    if (!title) {
      Alert.alert("שגיאה", "נא למלא את שם המשימה");
      return;
    }
    createMutation.mutate({
      patientName,
      title,
      description,
    });
  };

  const handleStatusChange = (taskId: string, currentStatus: TaskStatus) => {
    const statusMap: Record<TaskStatus, TaskStatus> = {
      open: "in_progress",
      in_progress: "done",
      done: "open",
    };
    updateStatusMutation.mutate({ id: taskId, status: statusMap[currentStatus] });
  };

  const handleAssign = (taskId: string) => {
    assignMutation.mutate({ taskId, userId: user?.id });
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case "open":
        return <Circle size={20} color="#6b7280" />;
      case "in_progress":
        return <Clock size={20} color="#f59e0b" />;
      case "done":
        return <CheckCircle size={20} color="#16a34a" />;
    }
  };

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case "open":
        return "פתוח";
      case "in_progress":
        return "בביצוע";
      case "done":
        return "בוצע";
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case "open":
        return "#6b7280";
      case "in_progress":
        return "#f59e0b";
      case "done":
        return "#16a34a";
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={tasksQuery.isFetching}
            onRefresh={() => tasksQuery.refetch()}
          />
        }
      >
        <LinearGradient colors={["#fef3c7", "#f9fafb"]} style={styles.header}>
          <CheckSquare size={40} color="#d97706" />
          <Text style={styles.headerTitle}>ניהול משימות</Text>
          <Text style={styles.headerSubtitle}>מעקב אחר משימות יומיומיות</Text>
        </LinearGradient>

        <View style={styles.content}>
          {tasksQuery.isLoading ? (
            <ActivityIndicator size="large" color="#6366f1" />
          ) : tasksQuery.data && tasksQuery.data.length > 0 ? (
            tasksQuery.data.map((task) => (
              <View key={task.id} style={[styles.taskCard, task.status === "done" && styles.doneTask]}>
                <TouchableOpacity
                  style={styles.statusButton}
                  onPress={() => handleStatusChange(task.id, task.status)}
                >
                  {getStatusIcon(task.status)}
                </TouchableOpacity>

                <View style={styles.taskContent}>
                  <Text style={[styles.taskTitle, task.status === "done" && styles.taskTitleDone]}>
                    {task.title}
                  </Text>
                  {task.description && (
                    <Text style={styles.taskDescription}>{task.description}</Text>
                  )}

                  <View style={styles.taskMeta}>
                    <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(task.status)}20` }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(task.status) }]}>
                        {getStatusLabel(task.status)}
                      </Text>
                    </View>

                    {task.assignedToUserName ? (
                      <Text style={styles.assignedText}>
                        אחראי: {task.assignedToUserName}
                      </Text>
                    ) : (
                      <TouchableOpacity
                        style={styles.assignSelfButton}
                        onPress={() => handleAssign(task.id)}
                        disabled={assignMutation.isPending}
                      >
                        <Text style={styles.assignSelfText}>אני אטפל</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <CheckSquare size={60} color="#d1d5db" />
              <Text style={styles.emptyText}>אין משימות</Text>
              <Text style={styles.emptySubtext}>הוסף משימה ראשונה</Text>
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
              <Text style={styles.modalTitle}>הוספת משימה חדשה</Text>
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
                <Text style={styles.label}>שם המשימה</Text>
                <TextInput
                  style={styles.input}
                  value={title}
                  onChangeText={setTitle}
                  placeholder='לדוגמה: "לקנות חלב לסבתא"'
                  textAlign="right"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>תיאור (אופציונלי)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="פרטים נוספים על המשימה..."
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
                  <Text style={styles.submitButtonText}>הוסף משימה</Text>
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
    color: "#b45309",
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
  taskCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  doneTask: {
    opacity: 0.6,
  },
  statusButton: {
    padding: 4,
    marginLeft: 12,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
    textAlign: "right",
  },
  taskTitleDone: {
    textDecorationLine: "line-through",
    color: "#6b7280",
  },
  taskDescription: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 12,
    textAlign: "right",
  },
  taskMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "flex-end",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  assignedText: {
    fontSize: 12,
    color: "#16a34a",
    fontWeight: "600",
  },
  assignSelfButton: {
    backgroundColor: "#6366f1",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  assignSelfText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
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

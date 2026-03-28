import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { trpc } from "@/lib/trpc";
import { MessageSquare, Send, Check } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function MessagesScreen() {
  const [patientName] = useState("סבתא");
  const [content, setContent] = useState("");

  const messagesQuery = trpc.messages.list.useQuery();
  const createMutation = trpc.messages.create.useMutation({
    onSuccess: () => {
      messagesQuery.refetch();
      setContent("");
      Alert.alert("הצלחה", "ההודעה נוספה בהצלחה");
    },
    onError: (error) => {
      Alert.alert("שגיאה", error.message || "נכשל להוסיף הודעה");
    },
  });

  const markAsHandledMutation = trpc.messages.markAsHandled.useMutation({
    onSuccess: () => {
      messagesQuery.refetch();
    },
    onError: (error) => {
      Alert.alert("שגיאה", error.message || "נכשל לסמן כטופל");
    },
  });

  const handleSubmit = () => {
    if (!content.trim()) {
      Alert.alert("שגיאה", "נא להזין תוכן הודעה");
      return;
    }
    createMutation.mutate({
      patientName,
      content: content.trim(),
    });
  };

  const handleMarkAsHandled = (messageId: string) => {
    markAsHandledMutation.mutate({ id: messageId });
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#e0e7ff", "#f9fafb"]} style={styles.header}>
        <MessageSquare size={40} color="#6366f1" />
        <Text style={styles.headerTitle}>לוח הודעות משפחתי</Text>
        <Text style={styles.headerSubtitle}>תקשורת ותיעוד משפחתי</Text>
      </LinearGradient>

      <ScrollView
        style={styles.messagesContainer}
        refreshControl={
          <RefreshControl
            refreshing={messagesQuery.isFetching}
            onRefresh={() => messagesQuery.refetch()}
          />
        }
      >
        <View style={styles.content}>
          {messagesQuery.isLoading ? (
            <ActivityIndicator size="large" color="#6366f1" />
          ) : messagesQuery.data && messagesQuery.data.length > 0 ? (
            messagesQuery.data.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.messageCard,
                  message.status === "handled" && styles.handledMessage,
                ]}
              >
                <View style={styles.messageHeader}>
                  <Text style={styles.messageAuthor}>{message.createdByUserName}</Text>
                  <Text style={styles.messageDate}>
                    {new Date(message.createdAt).toLocaleString("he-IL", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>

                <Text style={styles.messageContent}>{message.content}</Text>

                <View style={styles.messageFooter}>
                  {message.status === "handled" ? (
                    <View style={styles.handledBadge}>
                      <Check size={16} color="#16a34a" />
                      <Text style={styles.handledText}>טופל</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.handleButton}
                      onPress={() => handleMarkAsHandled(message.id)}
                      disabled={markAsHandledMutation.isPending}
                    >
                      <Check size={16} color="#fff" />
                      <Text style={styles.handleButtonText}>סמן כטופל</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <MessageSquare size={60} color="#d1d5db" />
              <Text style={styles.emptyText}>אין הודעות</Text>
              <Text style={styles.emptySubtext}>שלח הודעה ראשונה למשפחה</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={[styles.sendButton, createMutation.isPending && styles.sendButtonDisabled]}
          onPress={handleSubmit}
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Send size={24} color="#fff" />
          )}
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={content}
          onChangeText={setContent}
          placeholder='לדוגמה: "חשוב לזכור להתקלח היום" או "צריך לקנות חלב לסבתא"'
          placeholderTextColor="#9ca3af"
          multiline
          textAlign="right"
        />
      </View>
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
    color: "#4338ca",
    marginTop: 12,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
    textAlign: "center",
  },
  messagesContainer: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 120,
  },
  messageCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderRightWidth: 4,
    borderRightColor: "#6366f1",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  handledMessage: {
    borderRightColor: "#16a34a",
    opacity: 0.7,
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  messageAuthor: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  messageDate: {
    fontSize: 12,
    color: "#6b7280",
  },
  messageContent: {
    fontSize: 16,
    color: "#374151",
    marginBottom: 12,
    lineHeight: 24,
    textAlign: "right",
  },
  messageFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  handledBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#dcfce7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  handledText: {
    fontSize: 14,
    color: "#16a34a",
    fontWeight: "600",
  },
  handleButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#6366f1",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  handleButtonText: {
    fontSize: 14,
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
  inputContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    left: 0,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9fafb",
    color: "#111827",
    minHeight: 48,
    maxHeight: 120,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#6366f1",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
});

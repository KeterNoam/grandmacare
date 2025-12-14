import { Tabs } from "expo-router";
import { Home, Activity, Pill, Calendar, CheckSquare, MessageSquare, User } from "lucide-react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: "#6366f1",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#e5e7eb",
          paddingTop: 8,
          paddingBottom: 8,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "בית",
          tabBarLabel: "בית",
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          headerTitle: "הסבתא שלי",
        }}
      />
      <Tabs.Screen
        name="vitals"
        options={{
          title: "מדדים",
          tabBarLabel: "מדדים",
          tabBarIcon: ({ color, size }) => <Activity size={size} color={color} />,
          headerTitle: "מדדים רפואיים",
        }}
      />
      <Tabs.Screen
        name="medications"
        options={{
          title: "תרופות",
          tabBarLabel: "תרופות",
          tabBarIcon: ({ color, size }) => <Pill size={size} color={color} />,
          headerTitle: "תרופות",
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: "תורים",
          tabBarLabel: "תורים",
          tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
          headerTitle: "תורים",
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: "משימות",
          tabBarLabel: "משימות",
          tabBarIcon: ({ color, size }) => <CheckSquare size={size} color={color} />,
          headerTitle: "משימות",
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "הודעות",
          tabBarLabel: "הודעות",
          tabBarIcon: ({ color, size }) => <MessageSquare size={size} color={color} />,
          headerTitle: "לוח הודעות משפחתי",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "פרופיל",
          tabBarLabel: "פרופיל",
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
          headerTitle: "פרופיל",
        }}
      />
    </Tabs>
  );
}

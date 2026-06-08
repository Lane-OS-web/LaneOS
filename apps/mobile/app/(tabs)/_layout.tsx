import { Redirect, Tabs } from "expo-router";
import { useAuth } from "../../lib/auth-context";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../lib/theme";

function TabIcon({
  label,
  focused,
}: {
  label: string;
  focused: boolean;
}) {
  const icons: Record<string, string> = {
    Home: "H",
    Loads: "L",
    Docs: "D",
    Profile: "P",
  };

  return (
    <View
      style={[
        styles.tabIcon,
        focused && styles.tabIconActive,
      ]}
    >
      <Text
        style={[
          styles.tabIconText,
          focused && styles.tabIconTextActive,
        ]}
      >
        {icons[label] ?? "•"}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  const { session } = useAuth();

  if (!session) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          const labels: Record<string, string> = {
            index: "Home",
            loads: "Loads",
            documents: "Docs",
            profile: "Profile",
          };
          return (
            <TabIcon label={labels[route.name] ?? ""} focused={focused} />
          );
        },
        tabBarActiveTintColor: colors.white,
        tabBarInactiveTintColor: colors.slate500,
        tabBarStyle: {
          backgroundColor: colors.navy950,
          borderTopColor: "rgba(255,255,255,0.08)",
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
        },
        headerStyle: { backgroundColor: colors.navy900 },
        headerTintColor: colors.slate100,
        headerTitleStyle: { fontWeight: "600", fontSize: 16 },
        headerShadowVisible: false,
      })}
    >
      <Tabs.Screen name="index" options={{ title: "Today" }} />
      <Tabs.Screen name="loads" options={{ title: "My Loads" }} />
      <Tabs.Screen name="documents" options={{ title: "Documents" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  tabIconActive: {
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  tabIconText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.slate500,
  },
  tabIconTextActive: {
    color: colors.white,
  },
});

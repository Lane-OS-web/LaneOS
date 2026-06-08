import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useAuth } from "../../lib/auth-context";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  async function handleSignOut() {
    try {
      await signOut();
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "Sign out failed");
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user?.email}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>User ID</Text>
        <Text style={styles.valueSmall}>{user?.id}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSignOut}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    padding: 20,
  },
  card: {
    backgroundColor: "#0f172a",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  label: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: "#f1f5f9",
  },
  valueSmall: {
    fontSize: 12,
    color: "#94a3b8",
    fontFamily: "monospace",
  },
  button: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 24,
  },
  buttonText: {
    color: "#f87171",
    fontSize: 16,
    fontWeight: "600",
  },
});

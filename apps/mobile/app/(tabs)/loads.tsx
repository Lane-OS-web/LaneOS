import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
} from "react-native";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth-context";
import { colors } from "../../lib/theme";

interface Load {
  id: string;
  load_number?: string;
  status: string;
  rate?: number;
  pickup_date?: string;
}

const statusStyles: Record<string, { bg: string; text: string }> = {
  booked: { bg: "#ede9fe", text: "#6d28d9" },
  dispatched: { bg: "#e0e7ff", text: "#4338ca" },
  in_transit: { bg: "#fef3c7", text: "#b45309" },
  delivered: { bg: colors.emerald50, text: colors.emerald600 },
  paid: { bg: "#dcfce7", text: "#15803d" },
};

export default function LoadsScreen() {
  const { user } = useAuth();
  const [loads, setLoads] = useState<Load[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchLoads() {
    const { data: membership } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", user!.id)
      .limit(1)
      .single();

    if (!membership) return;

    const { data } = await supabase
      .from("loads")
      .select("id, load_number, status, rate, pickup_date")
      .eq("organization_id", membership.organization_id)
      .order("created_at", { ascending: false });

    setLoads(data ?? []);
  }

  useEffect(() => {
    if (user) fetchLoads();
  }, [user]);

  const formatCurrency = (n?: number) =>
    n != null
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(n)
      : "—";

  const formatDate = (d?: string) =>
    d
      ? new Date(d).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      : "—";

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={loads}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={async () => {
            setRefreshing(true);
            await fetchLoads();
            setRefreshing(false);
          }}
          tintColor={colors.emerald500}
        />
      }
      ListHeaderComponent={
        <Text style={styles.header}>
          {loads.length} load{loads.length !== 1 ? "s" : ""} assigned
        </Text>
      }
      ListEmptyComponent={
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No loads yet</Text>
          <Text style={styles.emptyText}>
            Loads assigned by your dispatcher will show up here.
          </Text>
        </View>
      }
      renderItem={({ item }) => {
        const status = statusStyles[item.status] ?? {
          bg: colors.slate100,
          text: colors.slate600,
        };
        return (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.loadNumber}>
                  {item.load_number ?? item.id.slice(0, 8)}
                </Text>
                <Text style={styles.pickupDate}>
                  Pickup {formatDate(item.pickup_date)}
                </Text>
              </View>
              <View style={[styles.badge, { backgroundColor: status.bg }]}>
                <Text style={[styles.badgeText, { color: status.text }]}>
                  {item.status.replace(/_/g, " ")}
                </Text>
              </View>
            </View>
            <Text style={styles.rate}>{formatCurrency(item.rate)}</Text>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.navy900,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    fontSize: 13,
    color: colors.slate400,
    marginBottom: 12,
  },
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    marginTop: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.slate900,
  },
  emptyText: {
    fontSize: 14,
    color: colors.slate500,
    marginTop: 8,
    textAlign: "center",
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  loadNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.slate900,
  },
  pickupDate: {
    fontSize: 13,
    color: colors.slate500,
    marginTop: 2,
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  rate: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.emerald600,
    marginTop: 12,
  },
});

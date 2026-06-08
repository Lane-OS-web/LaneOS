import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth-context";
import { colors } from "../../lib/theme";

interface Stats {
  activeLoads: number;
  totalRevenue: number;
  pendingClaims: number;
}

interface ActiveLoad {
  id: string;
  load_number?: string;
  status: string;
  rate?: number;
  pickup_date?: string;
}

export default function DriverHomeScreen() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    activeLoads: 0,
    totalRevenue: 0,
    pendingClaims: 0,
  });
  const [activeLoad, setActiveLoad] = useState<ActiveLoad | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [detentionMinutes, setDetentionMinutes] = useState(82);

  async function loadData() {
    const { data: membership } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", user!.id)
      .limit(1)
      .single();

    if (!membership) return;

    const orgId = membership.organization_id;

    const [loads, claims, revenue, inTransit] = await Promise.all([
      supabase
        .from("loads")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", orgId)
        .in("status", ["booked", "dispatched", "in_transit"]),
      supabase
        .from("revenue_claims")
        .select("amount")
        .eq("organization_id", orgId)
        .in("status", ["draft", "submitted"]),
      supabase
        .from("loads")
        .select("total_revenue, rate")
        .eq("organization_id", orgId)
        .in("status", ["delivered", "invoiced", "paid"]),
      supabase
        .from("loads")
        .select("id, load_number, status, rate, pickup_date")
        .eq("organization_id", orgId)
        .eq("status", "in_transit")
        .limit(1)
        .maybeSingle(),
    ]);

    const totalRevenue =
      revenue.data?.reduce((s, l) => s + (l.total_revenue ?? l.rate ?? 0), 0) ??
      0;
    const pendingClaims =
      claims.data?.reduce((s, c) => s + c.amount, 0) ?? 0;

    setStats({
      activeLoads: loads.count ?? 0,
      totalRevenue,
      pendingClaims,
    });
    setActiveLoad(inTransit.data);
  }

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  async function onRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);

  const firstName = user?.email?.split("@")[0] ?? "Driver";
  const progress = activeLoad ? 68 : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.emerald500}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerLabel}>Active Load</Text>
        <Text style={styles.loadId}>
          {activeLoad?.load_number ?? activeLoad?.id.slice(0, 8) ?? "—"}
        </Text>
        <Text style={styles.broker}>LaneOS Driver</Text>
      </View>

      {activeLoad ? (
        <>
          <View style={styles.mapPlaceholder}>
            <View style={styles.etaBadge}>
              <Text style={styles.etaLabel}>ETA</Text>
              <Text style={styles.etaValue}>2:14 PM</Text>
            </View>
            <View style={styles.mapInfo}>
              <Text style={styles.mapTime}>2h 14m</Text>
              <Text style={styles.mapDist}>91 miles remaining</Text>
            </View>
            <TouchableOpacity style={styles.navigateBtn}>
              <Text style={styles.navigateText}>Navigate</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Trip progress</Text>
              <Text style={styles.progressPct}>{progress}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
          </View>

          <View style={styles.detentionAlert}>
            <View style={styles.detentionContent}>
              <Text style={styles.detentionTitle}>Detention Timer Active</Text>
              <Text style={styles.detentionSub}>
                {Math.floor(detentionMinutes / 60)}h {detentionMinutes % 60}m
                elapsed
              </Text>
              <Text style={styles.detentionProjected}>
                Projected: $103 at $75/hr
              </Text>
            </View>
            <TouchableOpacity style={styles.fileBtn}>
              <Text style={styles.fileBtnText}>File</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.payCard}>
            <Text style={styles.payTitle}>Load Pay</Text>
            <View style={styles.payRow}>
              <Text style={styles.payLabel}>Base rate</Text>
              <Text style={styles.payValue}>
                {formatCurrency(activeLoad.rate ?? 0)}
              </Text>
            </View>
            <View style={styles.payRow}>
              <Text style={styles.payLabel}>Detention (pending)</Text>
              <Text style={[styles.payValue, styles.payGreen]}>+$103</Text>
            </View>
            <View style={[styles.payRow, styles.payTotal]}>
              <Text style={styles.payTotalLabel}>Projected total</Text>
              <Text style={styles.payTotalValue}>
                {formatCurrency((activeLoad.rate ?? 0) + 103)}
              </Text>
            </View>
          </View>
        </>
      ) : (
        <View style={styles.noLoadCard}>
          <Text style={styles.noLoadTitle}>No active load</Text>
          <Text style={styles.noLoadText}>
            Good morning, {firstName}. Your next assignment will appear here.
          </Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>Quick actions</Text>
      <View style={styles.actionsGrid}>
        {[
          { title: "Scan BOL", color: colors.blue600 },
          { title: "Upload POD", color: colors.emerald500 },
          { title: "Call Broker", color: colors.amber600 },
          { title: "Report Issue", color: colors.red },
        ].map((a) => (
          <TouchableOpacity key={a.title} style={styles.actionCard}>
            <View
              style={[
                styles.actionIcon,
                { backgroundColor: a.color + "20" },
              ]}
            >
              <View
                style={[styles.actionDot, { backgroundColor: a.color }]}
              />
            </View>
            <Text style={styles.actionTitle}>{a.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Active loads</Text>
          <Text style={styles.statValue}>{stats.activeLoads}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Revenue</Text>
          <Text style={[styles.statValue, styles.statGreen]}>
            {formatCurrency(stats.totalRevenue)}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.navy900,
  },
  content: {
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: colors.navy800,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  loadId: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.blue600,
    fontFamily: "monospace",
    marginTop: 2,
  },
  broker: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 2,
  },
  mapPlaceholder: {
    height: 180,
    backgroundColor: colors.navy700,
    position: "relative",
  },
  etaBadge: {
    position: "absolute",
    top: 12,
    alignSelf: "center",
    left: "35%",
    backgroundColor: "rgba(11,22,41,0.85)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignItems: "center",
  },
  etaLabel: {
    fontSize: 10,
    color: colors.textTertiary,
  },
  etaValue: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  mapInfo: {
    position: "absolute",
    bottom: 12,
    left: 16,
    backgroundColor: "rgba(11,22,41,0.85)",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  mapTime: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  mapDist: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  navigateBtn: {
    position: "absolute",
    bottom: 12,
    right: 16,
    backgroundColor: colors.blue600,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  navigateText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.white,
  },
  progressSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  progressPct: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.blue600,
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.navy800,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.blue600,
    borderRadius: 4,
  },
  detentionAlert: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: colors.amberDim,
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.3)",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  detentionContent: {
    flex: 1,
  },
  detentionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.amber600,
  },
  detentionSub: {
    fontSize: 12,
    color: "rgba(245,158,11,0.8)",
    marginTop: 3,
  },
  detentionProjected: {
    fontSize: 11,
    color: "rgba(245,158,11,0.7)",
    marginTop: 2,
  },
  fileBtn: {
    backgroundColor: colors.amber600,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  fileBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.navy900,
  },
  payCard: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: colors.navy700,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
  },
  payTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textSecondary,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  payRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  payLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  payValue: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  payGreen: {
    color: colors.emerald500,
  },
  payTotal: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
    marginBottom: 0,
  },
  payTotalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  payTotalValue: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.emerald500,
  },
  noLoadCard: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: colors.navy700,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  noLoadTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  noLoadText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textSecondary,
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: 20,
  },
  actionCard: {
    width: "47%",
    backgroundColor: colors.navy700,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  actionIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  actionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.navy700,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "600",
    color: colors.textPrimary,
    marginTop: 6,
  },
  statGreen: {
    color: colors.emerald500,
  },
});

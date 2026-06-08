import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth-context";
import { colors } from "../../lib/theme";

interface Document {
  id: string;
  file_name: string;
  document_type: string;
  created_at: string;
  scan_status?: string;
}

const typeLabels: Record<string, string> = {
  rate_confirmation: "Rate Con",
  bol: "BOL",
  pod: "POD",
  invoice: "Invoice",
  lumper_receipt: "Lumper",
  detention_form: "Detention",
  other: "Other",
};

export default function DocumentsScreen() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [orgId, setOrgId] = useState<string | null>(null);

  async function fetchOrgId() {
    const { data: membership } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", user!.id)
      .limit(1)
      .single();
    return membership?.organization_id ?? null;
  }

  async function fetchDocuments() {
    const oid = orgId ?? (await fetchOrgId());
    if (!oid) return;
    setOrgId(oid);

    const { data } = await supabase
      .from("documents")
      .select("id, file_name, document_type, created_at, scan_status")
      .eq("organization_id", oid)
      .order("created_at", { ascending: false });

    setDocuments(data ?? []);
  }

  useEffect(() => {
    if (user) fetchDocuments();
  }, [user]);

  async function captureDocument() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Camera access is required to scan documents.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.85,
      allowsEditing: false,
    });

    if (result.canceled || !result.assets[0]) return;

    setUploading(true);
    try {
      const oid = orgId ?? (await fetchOrgId());
      if (!oid) throw new Error("No organization");

      const asset = result.assets[0];
      const fileName = `scan-${Date.now()}.jpg`;
      const storagePath = `${oid}/${fileName}`;

      const response = await fetch(asset.uri);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(storagePath, arrayBuffer, {
          contentType: "image/jpeg",
        });

      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase.from("documents").insert({
        organization_id: oid,
        file_name: fileName,
        storage_path: storagePath,
        document_type: "other",
        mime_type: "image/jpeg",
        scan_status: "pending",
        uploaded_by: user?.id,
      });

      if (insertError) throw insertError;

      Alert.alert(
        "Document captured",
        "Uploaded for AI scanning. Open the web dashboard to review extracted key data."
      );
      await fetchDocuments();
    } catch (err) {
      Alert.alert(
        "Upload failed",
        err instanceof Error ? err.message : "Could not upload document"
      );
    } finally {
      setUploading(false);
    }
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={documents}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={async () => {
            setRefreshing(true);
            await fetchDocuments();
            setRefreshing(false);
          }}
          tintColor={colors.emerald500}
        />
      }
      ListHeaderComponent={
        <TouchableOpacity
          style={styles.uploadCard}
          onPress={captureDocument}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color={colors.emerald600} />
          ) : (
            <>
              <Text style={styles.uploadTitle}>Scan document</Text>
              <Text style={styles.uploadDesc}>
                Camera capture — BOL, POD, lumper receipt. AI extracts key data on sync.
              </Text>
            </>
          )}
        </TouchableOpacity>
      }
      ListEmptyComponent={
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No documents</Text>
          <Text style={styles.emptyText}>
            Tap above to scan your first document on the road.
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.cardTop}>
            <View style={styles.docIcon}>
              <Text style={styles.docIconText}>DOC</Text>
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.fileName} numberOfLines={1}>
                {item.file_name}
              </Text>
              <Text style={styles.meta}>
                {typeLabels[item.document_type] ?? item.document_type} ·{" "}
                {formatDate(item.created_at)}
              </Text>
            </View>
            <View style={styles.organizedBadge}>
              <Text style={styles.organizedText}>
                {item.scan_status === "completed" ? "Scanned" : "Pending"}
              </Text>
            </View>
          </View>
        </View>
      )}
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
  uploadCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.slate100,
    borderStyle: "dashed",
    alignItems: "center",
    minHeight: 88,
    justifyContent: "center",
  },
  uploadTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.slate900,
  },
  uploadDesc: {
    fontSize: 13,
    color: colors.slate500,
    marginTop: 4,
    textAlign: "center",
  },
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    marginTop: 8,
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
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  docIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.slate50,
    alignItems: "center",
    justifyContent: "center",
  },
  docIconText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.slate500,
  },
  cardInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.slate900,
  },
  meta: {
    fontSize: 12,
    color: colors.slate500,
    marginTop: 2,
    textTransform: "capitalize",
  },
  organizedBadge: {
    backgroundColor: colors.emerald50,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  organizedText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.emerald600,
  },
});

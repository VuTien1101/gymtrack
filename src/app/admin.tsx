import {
    faCalendarCheck,
    faChevronLeft,
    faTriangleExclamation,
    faUserClock,
    faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../lib/api";

export default function AdminScreen() {
  const [dashboard, setDashboard] = useState<Awaited<
    ReturnType<typeof api.getAdminDashboard>
  > | null>(null);
  const [members, setMembers] = useState<
    Awaited<ReturnType<typeof api.getAdminMembers>>["members"]
  >([]);
  const [branches, setBranches] = useState<
    Awaited<ReturnType<typeof api.getAdminBranches>>["branches"]
  >([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [branchModalVisible, setBranchModalVisible] = useState(false);
  const [editingBranchId, setEditingBranchId] = useState<number | null>(null);
  const [branchName, setBranchName] = useState("");
  const [branchAddress, setBranchAddress] = useState("");
  const [branchPhone, setBranchPhone] = useState("");
  const [branchQrCode, setBranchQrCode] = useState("");

  const load = useCallback(async () => {
    setErrorMessage("");
    try {
      const [dashboardResult, membersResult, branchesResult] =
        await Promise.all([
          api.getAdminDashboard(),
          api.getAdminMembers(),
          api.getAdminBranches(),
        ]);
      setDashboard(dashboardResult);
      setMembers(membersResult.members);
      setBranches(branchesResult.branches);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Không thể tải dashboard quản trị",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const openBranchForm = (branch?: (typeof branches)[number]) => {
    setEditingBranchId(branch?.id ?? null);
    setBranchName(branch?.name ?? "");
    setBranchAddress(branch?.address ?? "");
    setBranchPhone(branch?.phone ?? "");
    setBranchQrCode(branch?.qrCode ?? `branch-${Date.now()}`);
    setBranchModalVisible(true);
  };

  const saveBranch = async () => {
    if (!branchName.trim() || !branchAddress.trim() || !branchQrCode.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập tên, địa chỉ và mã QR.");
      return;
    }
    try {
      if (editingBranchId) {
        await api.updateAdminBranch(editingBranchId, {
          name: branchName.trim(),
          address: branchAddress.trim(),
          phone: branchPhone.trim(),
          qrCode: branchQrCode.trim(),
        });
      } else {
        await api.createAdminBranch({
          name: branchName.trim(),
          address: branchAddress.trim(),
          phone: branchPhone.trim(),
          qrCode: branchQrCode.trim(),
        });
      }
      setBranchModalVisible(false);
      await load();
    } catch (error) {
      Alert.alert(
        "Không thể lưu chi nhánh",
        error instanceof Error ? error.message : "Vui lòng thử lại",
      );
    }
  };

  const deleteMember = (member: (typeof members)[number]) => {
    Alert.alert(
      "Xóa tài khoản",
      `Bạn chắc chắn muốn xóa tài khoản ${member.fullName}? Dữ liệu gói tập, check-in và lịch sử tập cũng sẽ bị xóa.`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await api.deleteAdminMember(member.id);
              await load();
            } catch (error) {
              Alert.alert(
                "Không thể xóa",
                error instanceof Error ? error.message : "Vui lòng thử lại",
              );
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <FontAwesomeIcon icon={faChevronLeft} size={16} color="#111827" />
          </Pressable>
          <View>
            <Text style={styles.title}>Quản trị</Text>
            <Text style={styles.subtitle}>Dashboard GymTrack</Text>
          </View>
        </View>
        {isLoading && <ActivityIndicator color="#111827" />}
        {!isLoading && errorMessage ? (
          <View style={styles.state}>
            <Text style={styles.error}>{errorMessage}</Text>
            <Pressable onPress={load}>
              <Text style={styles.retry}>Thử lại</Text>
            </Pressable>
          </View>
        ) : null}
        {!isLoading && !errorMessage && dashboard && (
          <>
            <View style={styles.metrics}>
              <Metric
                icon={faUsers}
                label="Hội viên"
                value={dashboard.memberCount}
              />
              <Metric
                icon={faUserClock}
                label="Đang tập"
                value={dashboard.activeCheckIns}
              />
              <Metric
                icon={faCalendarCheck}
                label="Check-in hôm nay"
                value={dashboard.todayCheckIns}
              />
              <Metric
                icon={faTriangleExclamation}
                label="Sắp hết hạn"
                value={dashboard.expiringMemberships}
              />
            </View>
            <Text style={styles.sectionTitle}>HỘI VIÊN GẦN ĐÂY</Text>
            {members.length === 0 ? (
              <Text style={styles.muted}>Chưa có hội viên.</Text>
            ) : (
              members.slice(0, 8).map((member) => {
                const membership = member.memberships[0];
                return (
                  <View key={member.id} style={styles.row}>
                    <View style={styles.rowCopy}>
                      <Text style={styles.name}>{member.fullName}</Text>
                      <Text style={styles.detail}>
                        {member.email} · {member._count.checkIns} check-in
                      </Text>
                    </View>
                    <View style={styles.memberActions}>
                      <Text style={styles.status}>
                        {membership?.status === "ACTIVE"
                          ? "Active"
                          : "Chưa có gói"}
                      </Text>
                      <Pressable
                        onPress={() => deleteMember(member)}
                        style={styles.deleteButton}
                      >
                        <Text style={styles.deleteButtonText}>Xóa</Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })
            )}
            <Text style={styles.sectionTitle}>CHI NHÁNH</Text>
            <Pressable
              onPress={() => openBranchForm()}
              style={styles.addButton}
            >
              <Text style={styles.addButtonText}>+ Thêm chi nhánh</Text>
            </Pressable>
            {branches.map((branch) => (
              <Pressable
                key={branch.id}
                onPress={() => openBranchForm(branch)}
                style={styles.row}
              >
                <View style={styles.rowCopy}>
                  <Text style={styles.name}>{branch.name}</Text>
                  <Text style={styles.detail}>{branch.address}</Text>
                </View>
                <Text style={styles.status}>{branch._count.checkIns} lượt</Text>
              </Pressable>
            ))}
          </>
        )}
      </ScrollView>
      <Modal
        visible={branchModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setBranchModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>
              {editingBranchId ? "Sửa chi nhánh" : "Thêm chi nhánh"}
            </Text>
            <TextInput
              value={branchName}
              onChangeText={setBranchName}
              placeholder="Tên chi nhánh"
              style={styles.input}
            />
            <TextInput
              value={branchAddress}
              onChangeText={setBranchAddress}
              placeholder="Địa chỉ"
              style={styles.input}
            />
            <TextInput
              value={branchPhone}
              onChangeText={setBranchPhone}
              placeholder="Số điện thoại"
              keyboardType="phone-pad"
              style={styles.input}
            />
            <TextInput
              value={branchQrCode}
              onChangeText={setBranchQrCode}
              placeholder="Mã QR"
              style={styles.input}
              autoCapitalize="none"
            />
            <Pressable onPress={saveBranch} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Lưu chi nhánh</Text>
            </Pressable>
            <Pressable onPress={() => setBranchModalVisible(false)}>
              <Text style={styles.cancelText}>Hủy</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: number;
}) {
  return (
    <View style={styles.metric}>
      <FontAwesomeIcon icon={icon} size={18} color="#111827" />
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  content: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 27, fontWeight: "800", color: "#111827" },
  subtitle: { color: "#6B7280", marginTop: 2 },
  metrics: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 26,
  },
  metric: {
    width: "48%",
    minHeight: 110,
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    gap: 8,
  },
  metricValue: { fontSize: 26, fontWeight: "800", color: "#111827" },
  metricLabel: { color: "#6B7280", fontSize: 12 },
  sectionTitle: {
    color: "#6B7280",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 8,
  },
  row: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowCopy: { flex: 1 },
  name: { color: "#111827", fontWeight: "800", fontSize: 14 },
  detail: { color: "#6B7280", fontSize: 12, marginTop: 4 },
  status: { color: "#047857", fontSize: 11, fontWeight: "800", marginLeft: 8 },
  memberActions: { alignItems: "flex-end", gap: 8, marginLeft: 8 },
  deleteButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#FEE2E2",
  },
  deleteButtonText: { color: "#B91C1C", fontSize: 11, fontWeight: "800" },
  state: { padding: 24, alignItems: "center" },
  error: { color: "#B91C1C", textAlign: "center" },
  retry: { color: "#111827", fontWeight: "800", marginTop: 12 },
  muted: { color: "#6B7280", paddingVertical: 16 },
  addButton: { alignSelf: "flex-start", marginBottom: 10 },
  addButtonText: { color: "#111827", fontWeight: "800", fontSize: 13 },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(17,24,39,0.45)",
  },
  modal: {
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    gap: 12,
  },
  modalTitle: {
    color: "#111827",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 4,
  },
  input: {
    height: 46,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    color: "#111827",
  },
  saveButton: {
    height: 46,
    borderRadius: 10,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: { color: "#FFFFFF", fontWeight: "800" },
  cancelText: {
    textAlign: "center",
    color: "#6B7280",
    fontWeight: "700",
    padding: 8,
  },
});

import {
    faCalendarDays,
    faCheck,
    faChevronRight,
    faClock,
    faDumbbell,
    faFire,
    faLocationDot,
    faPhone,
    faQrcode,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api, Dashboard } from "../lib/api";

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [showBranches, setShowBranches] = useState(false);
  const [branchQuery, setBranchQuery] = useState("");
  const [branches, setBranches] = useState<import("../lib/api").Branch[]>([]);
  const [weekCheckIns, setWeekCheckIns] = useState<
    import("../lib/api").CheckIn[]
  >([]);

  const loadDashboard = useCallback(async () => {
    try {
      const result = await api.getDashboard();
      setDashboard(result);
      const branchResult = await api.getBranches();
      setBranches(branchResult.branches);
      const now = new Date();
      const mondayOffset = (now.getDay() + 6) % 7;
      const monday = new Date(now);
      monday.setDate(now.getDate() - mondayOffset);
      monday.setHours(0, 0, 0, 0);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 7);
      const weekResult = await api.getCheckIns(
        monday.toISOString(),
        sunday.toISOString(),
      );
      setWeekCheckIns(weekResult.checkIns);
    } catch (error) {
      console.error("Load dashboard error:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [loadDashboard]),
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

  const closeBranchSheet = () => {
    setShowBranches(false);
  };

  const membership = dashboard?.membership;
  const remainingDays = membership
    ? Math.max(
        0,
        Math.ceil(
          (new Date(membership.endDate).getTime() - Date.now()) / 86400000,
        ),
      )
    : 0;
  const membershipProgress = membership
    ? Math.min(
        100,
        Math.max(
          0,
          ((Date.now() - new Date(membership.startDate).getTime()) /
            (new Date(membership.endDate).getTime() -
              new Date(membership.startDate).getTime())) *
            100,
        ),
      )
    : 0;

  const now = new Date();
  const mondayOffset = (now.getDay() + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - mondayOffset);
  const weekDays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map(
    (day, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      const dateKey = date.toISOString().slice(0, 10);
      return {
        day,
        date: String(date.getDate()),
        checked: weekCheckIns.some(
          (item) => item.checkedInAt.slice(0, 10) === dateKey,
        ),
        isToday: dateKey === now.toISOString().slice(0, 10),
      };
    },
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        overScrollMode="always"
        bounces
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#111827"
            colors={["#111827"]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Xin chào 👋</Text>
            <Text style={styles.name}>{dashboard?.user.fullName || "Bạn"}</Text>
          </View>

          <View style={styles.avatar}>
            <Text style={styles.avatarText}>MT</Text>
          </View>
        </View>

        {/* Membership Card */}
        <View style={styles.membershipCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>GÓI TẬP HIỆN TẠI</Text>

            <View style={styles.activeBadge}>
              <View style={styles.activeDot} />
              <Text style={styles.activeText}>ĐANG HOẠT ĐỘNG</Text>
            </View>
          </View>

          <Text style={styles.planName}>
            {membership?.packageName || "Chưa có gói tập"}
          </Text>

          <View style={styles.dateRow}>
            <View>
              <Text style={styles.dateLabel}>Bắt đầu</Text>
              <Text style={styles.dateValue}>
                {membership
                  ? new Date(membership.startDate).toLocaleDateString("vi-VN")
                  : "--"}
              </Text>
            </View>

            <View style={styles.dateRight}>
              <Text style={styles.dateLabel}>Hết hạn</Text>
              <Text style={styles.dateValue}>
                {membership
                  ? new Date(membership.endDate).toLocaleDateString("vi-VN")
                  : "--"}
              </Text>
            </View>
          </View>

          <View style={styles.progressBackground}>
            <View
              style={[styles.progress, { width: `${membershipProgress}%` }]}
            />
          </View>

          <View style={styles.cardFooter}>
            <Text style={styles.remaining}>Còn {remainingDays} ngày</Text>
            <Text style={styles.usageText}>
              {dashboard
                ? `${dashboard.stats.checkInCount} buổi tháng này`
                : "Chưa có dữ liệu"}
            </Text>
          </View>
        </View>

        {/* Quick Actions (Check-in & Explore Gym) */}
        <View style={styles.quickActionsContainer}>
          <Pressable
            onPress={() => router.push({ pathname: "/scan" } as never)}
            style={({ pressed }) => [
              styles.actionButtonPrimary,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.actionIconPrimary}>
              <FontAwesomeIcon icon={faQrcode} size={18} color="#111827" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitlePrimary}>
                {dashboard?.activeCheckIn ? "CHECK-OUT" : "CHECK-IN"}
              </Text>
              <Text style={styles.actionSubtitlePrimary}>
                {dashboard?.activeCheckIn
                  ? `Đang tập tại ${dashboard.activeCheckIn.branch.name}`
                  : "Quét mã tại quầy để bắt đầu"}
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => router.push("/explore")}
            style={({ pressed }) => [
              styles.actionButtonSecondary,
              pressed && styles.pressed,
            ]}
          >
            {/* BỎ BACKGROUND XÁM CỦA ICON BÀI TẬP */}
            <View style={styles.actionIconTransparent}>
              <FontAwesomeIcon icon={faDumbbell} size={18} color="#111827" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitleSecondary}>Bài tập</Text>
              <Text style={styles.actionSubtitleSecondary}>
                Khám phá kho bài
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Current Branch */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Chi nhánh tập luyện</Text>
        </View>

        <Pressable
          style={styles.branchCard}
          onPress={() => setShowBranches(true)}
        >
          {/* BỎ BACKGROUND XÁM CỦA ICON CHI NHÁNH */}
          <View style={styles.branchIconTransparent}>
            <FontAwesomeIcon icon={faLocationDot} size={20} color="#111827" />
          </View>

          <View style={styles.branchInfo}>
            <Text style={styles.branchName}>
              {dashboard?.branch?.name || "Chưa chọn chi nhánh"}
            </Text>
            <Text style={styles.branchAddress}>
              {dashboard?.branch?.address || "Chưa có dữ liệu"}
            </Text>
          </View>

          <View style={styles.peopleBadge}>
            <Text style={styles.peopleNumber}>
              {dashboard?.branchActiveCount ?? 0}
            </Text>
            <Text style={styles.peopleLabel}>người đang tập</Text>
          </View>
        </Pressable>

        {/* Monthly Statistics */}
        <Text style={styles.sectionTitleStandalone}>Thống kê tháng 9</Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            {/* BỎ BACKGROUND XÁM CỦA ICON THỐNG KÊ */}
            <View style={styles.statIconTransparent}>
              <FontAwesomeIcon
                icon={faCalendarDays}
                size={18}
                color="#111827"
              />
            </View>
            <Text style={styles.statNumber}>
              {dashboard?.stats.checkInCount ?? 0}
            </Text>
            <Text style={styles.statLabel}>Buổi tập</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconTransparent}>
              <FontAwesomeIcon icon={faFire} size={18} color="#111827" />
            </View>
            <Text style={styles.statNumber}>
              {dashboard?.stats.streak ?? 0} ngày
            </Text>
            <Text style={styles.statLabel}>Chuỗi Streak</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconTransparent}>
              <FontAwesomeIcon icon={faClock} size={18} color="#111827" />
            </View>
            <Text style={styles.statNumber}>
              {Math.round((dashboard?.stats.totalMinutes ?? 0) / 60)} giờ
            </Text>
            <Text style={styles.statLabel}>Tổng thời gian</Text>
          </View>
        </View>

        {/* Weekly Calendar Preview */}
        <Pressable
          style={styles.sectionHeader}
          onPress={() => router.push("/calendar")}
        >
          <Text style={styles.sectionTitle}>Lịch tập tuần này</Text>
          <FontAwesomeIcon icon={faChevronRight} size={12} color="#6B7280" />
        </Pressable>

        <View style={styles.calendarCard}>
          <View style={styles.calendarRow}>
            {weekDays.map((item, index) => (
              <View
                key={index}
                style={[styles.dayColumn, item.isToday && styles.todayColumn]}
              >
                <Text
                  style={[styles.weekDayText, item.isToday && styles.todayText]}
                >
                  {item.day}
                </Text>
                <Text
                  style={[
                    styles.dateNumberText,
                    item.isToday && styles.todayText,
                  ]}
                >
                  {item.date}
                </Text>

                <View style={styles.statusDotContainer}>
                  {item.checked ? (
                    <View style={styles.checkDot}>
                      <FontAwesomeIcon
                        icon={faCheck}
                        size={8}
                        color="#FFFFFF"
                      />
                    </View>
                  ) : (
                    <View style={styles.emptyDot} />
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {showBranches && (
        <View style={styles.branchSheetOverlay}>
          <Pressable
            style={styles.branchSheetBackdrop}
            onPress={closeBranchSheet}
          />
          <View style={styles.branchSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Chi nhánh</Text>
            <TextInput
              value={branchQuery}
              onChangeText={setBranchQuery}
              placeholder="Tìm kiếm chi nhánh"
              placeholderTextColor="#9CA3AF"
              style={styles.branchSearch}
            />
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.branchOptions}
              nestedScrollEnabled
            >
              {branches
                .filter((branch) =>
                  `${branch.name} ${branch.address}`
                    .toLowerCase()
                    .includes(branchQuery.toLowerCase()),
                )
                .map((branch) => (
                  <Pressable
                    key={branch.id}
                    style={styles.branchOption}
                    onPress={async () => {
                      await api.setPreferredBranch(branch.id);
                      closeBranchSheet();
                      await loadDashboard();
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faLocationDot}
                      size={18}
                      color="#111827"
                    />
                    <View style={styles.branchOptionInfo}>
                      <Text style={styles.branchOptionName}>{branch.name}</Text>
                      <View style={styles.branchPhoneRow}>
                        <FontAwesomeIcon
                          icon={faPhone}
                          size={11}
                          color="#6B7280"
                        />
                        <Text style={styles.branchOptionPhone}>
                          {branch.phone || "Chưa cập nhật số điện thoại"}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                ))}
            </ScrollView>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    /* Bỏ đường vạch kẻ xám viền mép trên nav/header khi scroll */
    borderTopWidth: 0,
    borderBottomWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
  },

  scrollContent: {
    paddingBottom: 40,
  },

  /* Header */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: "#F8F9FA",
  },

  greeting: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },

  name: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111827",
    marginTop: 2,
    letterSpacing: -0.5,
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  /* Membership */
  membershipCard: {
    marginHorizontal: 20,
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  cardLabel: {
    color: "#9CA3AF",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },

  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
  },

  activeText: {
    color: "#10B981",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  planName: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    marginTop: 14,
  },

  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
  },

  dateRight: {
    alignItems: "flex-end",
  },

  dateLabel: {
    color: "#6B7280",
    fontSize: 11,
  },

  dateValue: {
    color: "#F3F4F6",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
  },

  progressBackground: {
    height: 6,
    backgroundColor: "#374151",
    borderRadius: 3,
    marginTop: 16,
    overflow: "hidden",
  },

  progress: {
    width: "75%",
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 3,
  },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },

  remaining: {
    color: "#D1D5DB",
    fontSize: 12,
    fontWeight: "600",
  },

  usageText: {
    color: "#9CA3AF",
    fontSize: 11,
  },

  /* Quick Actions */
  quickActionsContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    gap: 12,
    marginTop: 16,
  },

  actionButtonPrimary: {
    flex: 1,
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  /* Nút QR giữ background trắng */
  actionIconPrimary: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  actionTitlePrimary: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  actionSubtitlePrimary: {
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 1,
  },

  actionButtonSecondary: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  /* Icon bài tập bỏ background */
  actionIconTransparent: {
    width: 28,
    height: 28,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },

  actionContent: {
    marginLeft: 10,
    flex: 1,
  },

  actionTitleSecondary: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },

  actionSubtitleSecondary: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: 1,
  },

  /* Section */
  sectionHeader: {
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },

  sectionTitleStandalone: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },

  changeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4B5563",
  },

  /* Branch */
  branchCard: {
    marginHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },

  /* Icon Chi nhánh bỏ background */
  branchIconTransparent: {
    width: 28,
    height: 28,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },

  branchInfo: {
    flex: 1,
    marginLeft: 10,
  },

  branchName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },

  branchAddress: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 2,
  },

  peopleBadge: {
    alignItems: "flex-end",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },

  peopleNumber: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },

  peopleLabel: {
    fontSize: 9,
    color: "#6B7280",
    fontWeight: "500",
  },

  /* Statistics */
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginHorizontal: 20,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },

  /* Icon Thống kê bỏ background */
  statIconTransparent: {
    width: 24,
    height: 24,
    backgroundColor: "transparent",
    alignItems: "flex-start",
    justifyContent: "center",
    marginBottom: 8,
  },

  statNumber: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },

  statLabel: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 2,
  },

  /* Calendar */
  calendarCard: {
    marginHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },

  branchSheetOverlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 10,
    justifyContent: "flex-end",
  },

  branchSheetBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(17, 24, 39, 0.35)",
  },

  branchSheetBackdropPressable: {
    flex: 1,
  },

  branchSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 32,
    maxHeight: "75%",
  },

  branchOptions: {
    flexShrink: 1,
  },

  sheetHandle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D1D5DB",
    alignSelf: "center",
    marginBottom: 16,
  },

  sheetTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 14,
  },

  branchSearch: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 13,
    marginBottom: 10,
  },

  branchSearchText: {
    color: "#9CA3AF",
    fontSize: 14,
  },

  branchOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },

  branchOptionInfo: {
    flex: 1,
  },

  branchOptionName: {
    color: "#111827",
    fontWeight: "700",
    fontSize: 15,
  },

  branchOptionPhone: {
    color: "#6B7280",
    fontSize: 12,
    marginTop: 3,
  },

  branchPhoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 3,
  },

  calendarRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  dayColumn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 6,
    borderRadius: 12,
  },

  todayColumn: {
    backgroundColor: "#F3F4F6",
  },

  weekDayText: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "600",
  },

  dateNumberText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginTop: 4,
  },

  todayText: {
    color: "#111827",
    fontWeight: "800",
  },

  statusDotContainer: {
    marginTop: 8,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },

  checkDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E5E7EB",
  },

  pressed: {
    opacity: 0.8,
  },
});

import {
  faCalendarDays,
  faCheck,
  faChevronRight,
  faClock,
  faDumbbell,
  faFire,
  faLocationDot,
  faQrcode,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const weekDays = [
    { day: "T2", date: "1", checked: false, isToday: false },
    { day: "T3", date: "2", checked: false, isToday: false },
    { day: "T4", date: "3", checked: true, isToday: false },
    { day: "T5", date: "4", checked: false, isToday: true },
    { day: "T6", date: "5", checked: false, isToday: false },
    { day: "T7", date: "6", checked: true, isToday: false },
    { day: "CN", date: "7", checked: false, isToday: false },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        overScrollMode="never"
        bounces={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Xin chào 👋</Text>
            <Text style={styles.name}>Minh Tiến</Text>
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

          <Text style={styles.planName}>Premium 3 Tháng</Text>

          <View style={styles.dateRow}>
            <View>
              <Text style={styles.dateLabel}>Bắt đầu</Text>
              <Text style={styles.dateValue}>01/07/2026</Text>
            </View>

            <View style={styles.dateRight}>
              <Text style={styles.dateLabel}>Hết hạn</Text>
              <Text style={styles.dateValue}>30/09/2026</Text>
            </View>
          </View>

          <View style={styles.progressBackground}>
            <View style={styles.progress} />
          </View>

          <View style={styles.cardFooter}>
            <Text style={styles.remaining}>Còn 22 ngày</Text>
            <Text style={styles.usageText}>Đã dùng 75%</Text>
          </View>
        </View>

        {/* Quick Actions (Check-in & Explore Gym) */}
        <View style={styles.quickActionsContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.actionButtonPrimary,
              pressed && styles.pressed,
            ]}
          >
            {/* GIỮ NGUYÊN BACKGROUND TRẮNG CHO QR */}
            <View style={styles.actionIconPrimary}>
              <FontAwesomeIcon icon={faQrcode} size={18} color="#111827" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitlePrimary}>CHECK-IN</Text>
              <Text style={styles.actionSubtitlePrimary}>Mở mã quét QR</Text>
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
          <Pressable>
            <Text style={styles.changeText}>Thay đổi</Text>
          </Pressable>
        </View>

        <View style={styles.branchCard}>
          {/* BỎ BACKGROUND XÁM CỦA ICON CHI NHÁNH */}
          <View style={styles.branchIconTransparent}>
            <FontAwesomeIcon icon={faLocationDot} size={20} color="#111827" />
          </View>

          <View style={styles.branchInfo}>
            <Text style={styles.branchName}>Nguyễn Văn Linh</Text>
            <Text style={styles.branchAddress}>Chi nhánh đã lưu</Text>
          </View>

          <View style={styles.peopleBadge}>
            <Text style={styles.peopleNumber}>47</Text>
            <Text style={styles.peopleLabel}>người đang tập</Text>
          </View>
        </View>

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
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Buổi tập</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconTransparent}>
              <FontAwesomeIcon icon={faFire} size={18} color="#111827" />
            </View>
            <Text style={styles.statNumber}>4 ngày</Text>
            <Text style={styles.statLabel}>Chuỗi Streak</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconTransparent}>
              <FontAwesomeIcon icon={faClock} size={18} color="#111827" />
            </View>
            <Text style={styles.statNumber}>18 giờ</Text>
            <Text style={styles.statLabel}>Tổng thời gian</Text>
          </View>
        </View>

        {/* Weekly Calendar Preview */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Lịch tập tuần này</Text>
          <FontAwesomeIcon icon={faChevronRight} size={12} color="#6B7280" />
        </View>

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
    borderRadius: 24,
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
    borderRadius: 18,
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
    borderRadius: 18,
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
    borderRadius: 20,
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
    borderRadius: 18,
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
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
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

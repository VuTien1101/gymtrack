import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api, MembershipPlan } from "../lib/api";

export default function ServicesScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [currentMembership, setCurrentMembership] = useState<
    Awaited<ReturnType<typeof api.getMemberships>>["memberships"][number] | null
  >(null);

  const loadPlans = async () => {
    try {
      const result = await api.getPlans();
      setPlans(result.plans);
      const memberships = await api.getMemberships();
      setCurrentMembership(
        memberships.memberships.find(
          (membership) =>
            membership.status === "ACTIVE" &&
            new Date(membership.endDate).getTime() >= Date.now(),
        ) ?? null,
      );
    } catch (error) {
      console.error("Load plans error:", error);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadPlans().finally(() => setRefreshing(false));
  };

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
          <Text style={styles.title}>Gói Dịch Vụ</Text>
          <Text style={styles.subtitle}>
            Nâng cấp hội viên để trải nghiệm tốt nhất
          </Text>
        </View>

        {currentMembership && (
          <View style={styles.currentMembership}>
            <Text style={styles.currentMembershipLabel}>GÓI ĐANG SỬ DỤNG</Text>
            <Text style={styles.currentMembershipName}>
              {currentMembership.packageName}
            </Text>
            <Text style={styles.currentMembershipDate}>
              Hết hạn{" "}
              {new Date(currentMembership.endDate).toLocaleDateString("vi-VN")}
            </Text>
          </View>
        )}

        {plans.map((plan, index) => (
          <View
            key={plan.id}
            style={[styles.membershipCard, index > 0 && styles.luxuryCard]}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardLabel}>
                {index === 0 ? "GÓI KHỞI ĐỘNG" : "GÓI PHỔ BIẾN"}
              </Text>
              <View style={styles.periodBadge}>
                <Text style={styles.periodText}>{plan.durationDays} NGÀY</Text>
              </View>
            </View>

            <Text style={styles.planName}>{plan.name}</Text>

            <View style={styles.priceContainer}>
              <Text style={styles.priceText}>
                {plan.price.toLocaleString("vi-VN")}
              </Text>
              <Text style={styles.currencyText}> VNĐ</Text>
            </View>

            <View style={styles.divider} />

            {/* Danh sách quyền lợi */}
            <View style={styles.featureList}>
              <View style={styles.featureRow}>
                <FontAwesomeIcon icon={faCheck} size={13} color="#10B981" />
                <Text style={styles.featureText}>
                  Khu vực tập luyện: Gym, Cardio, Free Weights
                </Text>
              </View>
              <View style={styles.featureRow}>
                <FontAwesomeIcon icon={faCheck} size={13} color="#10B981" />
                <Text style={styles.featureText}>
                  Locker thông minh & Phòng tắm nóng lạnh
                </Text>
              </View>
              <View style={styles.featureRow}>
                <FontAwesomeIcon icon={faCheck} size={13} color="#10B981" />
                <Text style={styles.featureText}>
                  01 buổi đo chỉ số cơ thể (InBody)
                </Text>
              </View>
              <View style={styles.featureRow}>
                <FontAwesomeIcon icon={faCheck} size={13} color="#10B981" />
                <Text style={styles.featureText}>
                  01 buổi hướng dẫn kĩ thuật cùng PT
                </Text>
              </View>
            </View>

            <Pressable
              onPress={() =>
                api
                  .subscribe(plan.id)
                  .then(() => {
                    Alert.alert(
                      "Đăng ký thành công",
                      "Gói tập đã được cập nhật.",
                    );
                    loadPlans();
                  })
                  .catch((error) =>
                    Alert.alert("Không thể đăng ký", error.message),
                  )
              }
              style={({ pressed }) => [
                styles.actionButton,
                styles.standardButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.standardButtonText}>Đăng ký ngay</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: "#F8F9FA",
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.5,
  },

  subtitle: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
    marginTop: 4,
  },

  currentMembership: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },

  currentMembershipLabel: {
    color: "#047857",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },

  currentMembershipName: {
    color: "#064E3B",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 6,
  },

  currentMembershipDate: {
    color: "#047857",
    fontSize: 13,
    marginTop: 4,
  },

  /* Membership Cards */
  membershipCard: {
    marginHorizontal: 20,
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
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

  periodBadge: {
    backgroundColor: "#1F2937",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  periodText: {
    color: "#9CA3AF",
    fontSize: 10,
    fontWeight: "700",
  },

  planName: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    marginTop: 14,
  },

  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 6,
  },

  priceText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
  },

  currencyText: {
    color: "#9CA3AF",
    fontSize: 13,
    fontWeight: "600",
  },

  divider: {
    height: 1,
    backgroundColor: "#1F2937",
    marginVertical: 18,
  },

  featureList: {
    gap: 12,
  },

  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  featureText: {
    color: "#D1D5DB",
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },

  actionButton: {
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },

  standardButton: {
    backgroundColor: "#374151",
  },

  standardButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },

  /* Luxury Card Styles */
  luxuryCard: {
    backgroundColor: "#0F0F12",
    borderColor: "#D97706",
    borderWidth: 1.5,
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },

  goldBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#F59E0B",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  goldBadgeText: {
    color: "#000000",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  bonusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(245, 158, 11, 0.12)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
  },

  bonusText: {
    color: "#F59E0B",
    fontSize: 10,
    fontWeight: "700",
  },

  luxuryPlanName: {
    color: "#FEF3C7",
  },

  luxuryPriceText: {
    color: "#F59E0B",
  },

  luxuryCurrencyText: {
    color: "#D97706",
  },

  luxuryDivider: {
    backgroundColor: "rgba(245, 158, 11, 0.2)",
  },

  luxuryFeatureText: {
    color: "#E5E7EB",
  },

  highlightText: {
    color: "#F59E0B",
    fontWeight: "700",
  },

  luxuryButton: {
    backgroundColor: "#F59E0B",
  },

  luxuryButtonText: {
    color: "#000000",
    fontWeight: "800",
    fontSize: 14,
  },

  pressed: {
    opacity: 0.8,
  },
});

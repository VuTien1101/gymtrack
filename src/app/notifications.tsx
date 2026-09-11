import {
  faBell,
  faCheckDouble,
  faChevronRight,
  faCircleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../lib/api";

export default function NotificationsScreen() {
  const [items, setItems] = useState<
    {
      id: string;
      type: string;
      title: string;
      message: string;
      time: string;
      unread: boolean;
      icon: typeof faCircleExclamation;
    }[]
  >([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = useCallback(async () => {
    try {
      const result = await api.getNotifications();
      setItems(
        result.notifications.map((item) => ({
          ...item,
          id: String(item.id),
          type: item.type.toLowerCase(),
          icon: faCircleExclamation,
          time: new Date(item.createdAt).toLocaleDateString("vi-VN"),
          unread: !item.isRead,
        })),
      );
    } catch (error) {
      console.error("Load notifications error:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [loadNotifications]),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  const unreadCount = items.filter((item) => item.unread).length;

  const handleMarkAllRead = () => {
    api
      .markAllNotificationsRead()
      .then(() =>
        setItems((prev) => prev.map((item) => ({ ...item, unread: false }))),
      );
  };

  const getIconStyle = (type: string) => {
    switch (type) {
      case "warning":
        return { bg: "#FEE2E2", color: "#EF4444" };
      case "workout":
        return { bg: "#DBEAFE", color: "#3B82F6" };
      case "achievement":
        return { bg: "#FFEDD5", color: "#F97316" };
      case "calendar":
        return { bg: "#F3E8FF", color: "#A855F7" };
      default:
        return { bg: "#F3F4F6", color: "#4B5563" };
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
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
            <Text style={styles.title}>Thông báo</Text>
            <Text style={styles.subtitle}>
              Cập nhật tin tức & nhắc nhở tập luyện
            </Text>
          </View>

          <View style={styles.bellContainer}>
            <FontAwesomeIcon icon={faBell} size={18} color="#111827" />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mới nhất</Text>
          {unreadCount > 0 && (
            <Pressable onPress={handleMarkAllRead}>
              <Text style={styles.readAll}>Đánh dấu đã đọc</Text>
            </Pressable>
          )}
        </View>

        {/* List Notifications */}
        <View style={styles.notificationList}>
          {items.map((notification) => {
            const iconTheme = getIconStyle(notification.type);

            return (
              <Pressable
                key={notification.id}
                style={({ pressed }) => [
                  styles.notificationCard,
                  notification.unread && styles.unreadCard,
                  pressed && styles.pressed,
                ]}
              >
                <View
                  style={[
                    styles.notificationIcon,
                    { backgroundColor: iconTheme.bg },
                  ]}
                >
                  <FontAwesomeIcon
                    icon={notification.icon}
                    size={16}
                    color={iconTheme.color}
                  />
                </View>

                <View style={styles.notificationContent}>
                  <View style={styles.notificationTitleRow}>
                    <Text
                      style={[
                        styles.notificationTitle,
                        notification.unread && styles.unreadTitleText,
                      ]}
                    >
                      {notification.title}
                    </Text>
                    {notification.unread && <View style={styles.unreadDot} />}
                  </View>

                  <Text style={styles.notificationMessage} numberOfLines={2}>
                    {notification.message}
                  </Text>

                  <Text style={styles.notificationTime}>
                    {notification.time}
                  </Text>
                </View>

                <FontAwesomeIcon
                  icon={faChevronRight}
                  size={12}
                  color="#9CA3AF"
                />
              </Pressable>
            );
          })}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <FontAwesomeIcon icon={faCheckDouble} size={14} color="#9CA3AF" />
          <Text style={styles.footerText}>Bạn đã xem hết tất cả thông báo</Text>
        </View>
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

  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 16,
    paddingBottom: 16,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.5,
  },

  subtitle: {
    color: "#6B7280",
    marginTop: 2,
    fontSize: 13,
  },

  bellContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    position: "relative",
  },

  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    backgroundColor: "#EF4444",
    borderWidth: 2,
    borderColor: "#F8F9FA",
  },

  badgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
    textAlign: "center",
    includeFontPadding: false,
  },

  /* Section */
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },

  readAll: {
    fontSize: 12,
    color: "#4B5563",
    fontWeight: "600",
  },

  /* Notification List */
  notificationList: {
    gap: 10,
  },

  notificationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },

  unreadCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  notificationContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },

  notificationTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  notificationTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },

  unreadTitleText: {
    fontWeight: "800",
    color: "#111827",
  },

  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#F97316",
    marginLeft: 6,
  },

  notificationMessage: {
    fontSize: 12,
    lineHeight: 17,
    color: "#6B7280",
    marginTop: 3,
  },

  notificationTime: {
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 6,
    fontWeight: "500",
  },

  pressed: {
    opacity: 0.85,
  },

  /* Footer */
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 28,
    gap: 6,
  },

  footerText: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
  },
});

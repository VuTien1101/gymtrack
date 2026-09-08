import {
  faBell as faBellRegular,
  faCalendar as faCalendarRegular,
  faHouse as faHouseRegular,
  faUser as faUserRegular,
} from "@fortawesome/free-regular-svg-icons";

import {
  faBell as faBellSolid,
  faCalendarDays as faCalendarSolid,
  faHouse as faHouseSolid,
  faUser as faUserSolid,
} from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { Tabs } from "expo-router";
import { Platform, StyleSheet } from "react-native";

export default function RootLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#111827",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarStyle: styles.tabBar,
      }}
    >
      {/* 1. Trang chủ */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Trang chủ",
          tabBarIcon: ({ focused, color }) => (
            <FontAwesomeIcon
              icon={focused ? faHouseSolid : faHouseRegular}
              size={20}
              color={color as string}
            />
          ),
        }}
      />

      {/* 2. Tập luyện */}
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Tập luyện",
          tabBarIcon: ({ focused, color }) => (
            <FontAwesomeIcon
              icon={focused ? faCalendarSolid : faCalendarRegular}
              size={20}
              color={color as string}
            />
          ),
        }}
      />

      {/* 3. Thông báo */}
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Thông báo",
          tabBarBadge: 3,
          tabBarBadgeStyle: styles.badge,
          tabBarIcon: ({ focused, color }) => (
            <FontAwesomeIcon
              icon={focused ? faBellSolid : faBellRegular}
              size={20}
              color={color as string}
            />
          ),
        }}
      />

      {/* 4. Cá nhân */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Cá nhân",
          tabBarIcon: ({ focused, color }) => (
            <FontAwesomeIcon
              icon={focused ? faUserSolid : faUserRegular}
              size={20}
              color={color as string}
            />
          ),
        }}
      />

      {/* ---------------------------------------------------- */}
      {/* CÁC MÀN HÌNH PHỤ: ẨN KHỎI TAB BAR & KHÔNG HIỂN THỊ NAV */}
      {/* ---------------------------------------------------- */}

      {/* Explore */}
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />

      {/* Login */}
      <Tabs.Screen
        name="login"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />

      {/* Register */}
      <Tabs.Screen
        name="register"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />

      {/* Change Password */}
      <Tabs.Screen
        name="change-password"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    height: Platform.OS === "ios" ? 88 : 66,
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 28 : 10,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },

  tabBarLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },

  badge: {
    backgroundColor: "#EF4444",
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 2,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
    textAlign: "center",
    lineHeight: Platform.OS === "ios" ? 15 : 17,
    includeFontPadding: false,
    overflow: "hidden",
  },
});

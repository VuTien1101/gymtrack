import {
    faBell as faBellRegular,
    faCalendar as faCalendarRegular,
    faCreditCard as faCreditCardRegular,
    faHouse as faHouseRegular,
    faUser as faUserRegular,
} from "@fortawesome/free-regular-svg-icons";

import {
    faBell as faBellSolid,
    faCalendarDays as faCalendarSolid,
    faCreditCard as faCreditCardSolid,
    faHouse as faHouseSolid,
    faUser as faUserSolid,
} from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { router, Tabs, usePathname } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { Platform, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { EdgeSwipeBack } from "../components/edge-swipe-back";
import { api, subscribeToUnreadNotifications, TOKEN_KEY } from "../lib/api";

export default function RootLayout() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasToken, setHasToken] = useState<boolean | null>(null);
  const pathname = usePathname();
  const isPublicRoute = pathname === "/login" || pathname === "/register";

  useEffect(() => {
    let isMounted = true;

    SecureStore.getItemAsync(TOKEN_KEY).then((token) => {
      if (!isMounted) return;
      setHasToken(Boolean(token));
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (hasToken === false && !isPublicRoute) {
      router.replace("/login");
    }
  }, [hasToken, isPublicRoute]);

  useEffect(() => {
    if (hasToken !== true) return;

    let isMounted = true;
    api
      .getNotifications()
      .then((result) => {
        if (isMounted) {
          setUnreadCount(
            result.notifications.filter((item) => !item.isRead).length,
          );
        }
      })
      .catch(() => {
        if (isMounted) setUnreadCount(0);
      });

    const unsubscribe = subscribeToUnreadNotifications(setUnreadCount);
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [hasToken]);

  if (hasToken === null || (!hasToken && !isPublicRoute)) {
    return <GestureHandlerRootView style={styles.root} />;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <EdgeSwipeBack>
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

          {/* 2. Dịch vụ (Nằm ngay bên phải trang index) */}
          <Tabs.Screen
            name="services"
            options={{
              title: "Dịch vụ",
              tabBarIcon: ({ focused, color }) => (
                <FontAwesomeIcon
                  icon={focused ? faCreditCardSolid : faCreditCardRegular}
                  size={20}
                  color={color as string}
                />
              ),
            }}
          />

          {/* 3. Tập luyện */}
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

          {/* 4. Thông báo */}
          <Tabs.Screen
            name="notifications"
            options={{
              title: "Thông báo",
              ...(unreadCount > 0
                ? { tabBarBadge: unreadCount, tabBarBadgeStyle: styles.badge }
                : { tabBarBadge: undefined }),
              tabBarIcon: ({ focused, color }) => (
                <FontAwesomeIcon
                  icon={focused ? faBellSolid : faBellRegular}
                  size={20}
                  color={color as string}
                />
              ),
            }}
          />

          {/* 5. Cá nhân */}
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
          <Tabs.Screen
            name="branches"
            options={{ href: null, tabBarStyle: { display: "none" } }}
          />
          <Tabs.Screen
            name="scan"
            options={{ href: null, tabBarStyle: { display: "none" } }}
          />
          <Tabs.Screen
            name="admin"
            options={{ href: null, tabBarStyle: { display: "none" } }}
          />
        </Tabs>
      </EdgeSwipeBack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
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

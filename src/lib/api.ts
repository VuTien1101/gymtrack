import * as SecureStore from "expo-secure-store";

export const API_URL = "http://192.168.88.174:5000";
export const TOKEN_KEY = "gymtrack_token";
export const USER_KEY = "gymtrack_user";

export type ApiError = Error & { status?: number };

export type CheckIn = {
  id: number;
  checkedInAt: string;
  checkedOutAt: string | null;
  branch: { id: number; name: string; address: string };
};

export type Dashboard = {
  user: {
    id: number;
    email: string;
    fullName: string;
    avatarUrl: string | null;
  };
  membership: {
    packageName: string;
    startDate: string;
    endDate: string;
    status: string;
  } | null;
  activeCheckIn: CheckIn | null;
  branch: CheckIn["branch"] | null;
  branchActiveCount: number;
  stats: {
    checkInCount: number;
    workoutDays: number;
    streak: number;
    totalMinutes: number;
  };
};

export type AuthResponse = {
  token: string;
  user: Record<string, unknown>;
};

export type MembershipPlan = {
  id: number;
  name: string;
  durationDays: number;
  price: number;
  description: string | null;
};

export type Membership = {
  id: number;
  packageName: string;
  startDate: string;
  endDate: string;
  status: string;
  plan: MembershipPlan | null;
};

export type Branch = {
  id: number;
  name: string;
  address: string;
  phone: string | null;
  qrCode: string;
};

export type Workout = {
  id: number;
  name: string;
  workoutDate: string;
  duration: number | null;
  exercises: {
    exercise: { name: string; muscleGroup: string };
    sets: number | null;
    reps: number | null;
    weight: number | null;
  }[];
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const result = await response.json();
  if (!response.ok) {
    const error = new Error(result.message || "Yêu cầu thất bại") as ApiError;
    error.status = response.status;
    throw error;
  }

  return result.data as T;
}

type NotificationListener = (count: number) => void;
const notificationListeners = new Set<NotificationListener>();

export function subscribeToUnreadNotifications(listener: NotificationListener) {
  notificationListeners.add(listener);
  return () => notificationListeners.delete(listener);
}

function notifyUnreadCount(count: number) {
  notificationListeners.forEach((listener) => listener(count));
}

export const api = {
  login: (email: string, password: string) =>
    request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (payload: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    dateOfBirth: string;
    password: string;
  }) =>
    request<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getDashboard: () => request<Dashboard>("/api/users/dashboard"),
  getMe: () => request<{ user: Record<string, unknown> }>("/api/users/me"),
  getCheckIns: (from: string, to: string) =>
    request<{ checkIns: CheckIn[] }>(
      `/api/check-ins?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    ),
  createCheckIn: (branchId: number) =>
    request<{ checkIn: CheckIn }>("/api/check-ins", {
      method: "POST",
      body: JSON.stringify({ branchId }),
    }),
  checkout: (id: number) =>
    request<{ checkIn: CheckIn }>(`/api/check-ins/${id}/checkout`, {
      method: "POST",
    }),
  scanCheckIn: (qrCode: string) =>
    request<{ action: "check-in" | "check-out"; checkIn: CheckIn }>(
      "/api/check-ins/scan",
      {
        method: "POST",
        body: JSON.stringify({ qrCode }),
      },
    ),
  getPlans: () =>
    request<{ plans: MembershipPlan[] }>("/api/memberships/plans"),
  getMemberships: () =>
    request<{ memberships: Membership[] }>("/api/memberships/me"),
  subscribe: (planId: number) =>
    request<{ membership: unknown }>("/api/memberships/subscribe", {
      method: "POST",
      body: JSON.stringify({ planId }),
    }),
  getBranches: () => request<{ branches: Branch[] }>("/api/branches"),
  setPreferredBranch: (branchId: number) =>
    request<{ branch: Branch }>("/api/branches/preferred", {
      method: "PUT",
      body: JSON.stringify({ branchId }),
    }),
  getExercises: () =>
    request<{
      exercises: {
        id: number;
        name: string;
        muscleGroup: string;
        description: string | null;
      }[];
    }>("/api/workouts/exercises"),
  getWorkouts: (from: string, to: string) =>
    request<{ workouts: Workout[] }>(
      `/api/workouts?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    ),
  getStatistics: (month: string) =>
    request<{
      workoutDays: number;
      checkInCount: number;
      totalMinutes: number;
      streak: number;
      usualHour: number | null;
      favoriteBranch: { name: string; count: number } | null;
    }>(`/api/statistics/monthly?month=${month}`),
  getNotifications: () =>
    request<{
      notifications: {
        id: number;
        type: string;
        title: string;
        message: string;
        isRead: boolean;
        createdAt: string;
      }[];
    }>("/api/notifications"),
  markNotificationRead: async (id: number) => {
    const result = await request<void>(`/api/notifications/${id}/read`, {
      method: "PATCH",
    });
    notifyUnreadCount(0);
    return result;
  },
  markAllNotificationsRead: async () => {
    const result = await request<void>("/api/notifications/read-all", {
      method: "PATCH",
    });
    notifyUnreadCount(0);
    return result;
  },
};

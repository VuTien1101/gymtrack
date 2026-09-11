import {
  faChevronLeft,
  faChevronRight,
  faDumbbell,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api, Branch, CheckIn, Workout } from "../lib/api";

const WEEK_DAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

function formatDate(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(
    2,
    "0",
  )}`;
}

export default function CalendarScreen() {
  const today = new Date();

  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [refreshing, setRefreshing] = useState(false);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [statistics, setStatistics] = useState<Awaited<
    ReturnType<typeof api.getStatistics>
  > | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const loadCheckIns = useCallback(async () => {
    try {
      const from = new Date(year, month, 1).toISOString();
      const to = new Date(year, month + 1, 1).toISOString();
      const result = await api.getCheckIns(from, to);
      setCheckIns(result.checkIns);
      const branchResult = await api.getBranches();
      setBranches(branchResult.branches);
      const workoutResult = await api.getWorkouts(from, to);
      setWorkouts(workoutResult.workouts);
      const statisticResult = await api.getStatistics(
        `${year}-${String(month + 1).padStart(2, "0")}`,
      );
      setStatistics(statisticResult);
    } catch (error) {
      console.error("Load calendar check-ins error:", error);
    }
  }, [year, month]);

  useFocusEffect(
    useCallback(() => {
      loadCheckIns();
    }, [loadCheckIns]),
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCheckIns();
    setRefreshing(false);
  };

  const monthName = currentDate.toLocaleDateString("vi-VN", {
    month: "long",
    year: "numeric",
  });

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: (number | null)[] = [];

    for (let i = 0; i < startOffset; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  }, [year, month]);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const isToday = (day: number) => {
    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    );
  };

  const isWorkoutDay = (day: number) => {
    return visibleCheckIns.some(
      (checkIn) =>
        checkIn.checkedInAt.slice(0, 10) === formatDate(year, month, day),
    );
  };

  const workoutCount = new Set(
    checkIns
      .filter(
        (checkIn) =>
          selectedBranchId === null || checkIn.branch.id === selectedBranchId,
      )
      .map((checkIn) => checkIn.checkedInAt.slice(0, 10)),
  ).size;

  const visibleCheckIns = checkIns.filter(
    (checkIn) =>
      selectedBranchId === null || checkIn.branch.id === selectedBranchId,
  );

  const formatDuration = (checkIn: CheckIn) => {
    if (!checkIn.checkedOutAt) return "Đang tập";
    const minutes = Math.max(
      0,
      Math.round(
        (new Date(checkIn.checkedOutAt).getTime() -
          new Date(checkIn.checkedInAt).getTime()) /
          60000,
      ),
    );
    return `${Math.floor(minutes / 60)} giờ ${minutes % 60} phút`;
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
          <Text style={styles.title}>Lịch tập</Text>
          <Text style={styles.subtitle}>Theo dõi tiến trình tập luyện</Text>
        </View>

        {/* Calendar Card */}
        <View style={styles.calendarCard}>
          <View style={styles.monthHeader}>
            <Text style={styles.monthTitle}>{monthName}</Text>

            <View style={styles.monthControls}>
              <Pressable onPress={goToPreviousMonth} style={styles.arrowButton}>
                <FontAwesomeIcon
                  icon={faChevronLeft}
                  size={12}
                  color="#111827"
                />
              </Pressable>

              <Pressable onPress={goToNextMonth} style={styles.arrowButton}>
                <FontAwesomeIcon
                  icon={faChevronRight}
                  size={12}
                  color="#111827"
                />
              </Pressable>
            </View>
          </View>

          {/* Week Days Header */}
          <View style={styles.weekRow}>
            {WEEK_DAYS.map((day) => (
              <Text key={day} style={styles.weekDay}>
                {day}
              </Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {calendarDays.map((day, index) => {
              if (day === null) {
                return <View key={`empty-${index}`} style={styles.dayCell} />;
              }

              const workout = isWorkoutDay(day);
              const todayCell = isToday(day);

              return (
                <Pressable
                  key={day}
                  style={styles.dayCell}
                  onPress={() => setSelectedDate(formatDate(year, month, day))}
                >
                  <View
                    style={[
                      styles.dayCircle,
                      workout && styles.workoutDay,
                      todayCell && !workout && styles.todayDay,
                      todayCell && workout && styles.todayWorkoutDay,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        workout && styles.workoutDayText,
                        todayCell && !workout && styles.todayDayText,
                      ]}
                    >
                      {day}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={styles.legendWorkout} />
              <Text style={styles.legendText}>Đã tập luyện</Text>
            </View>

            <View style={styles.legendItem}>
              <View style={styles.legendToday} />
              <Text style={styles.legendText}>Hôm nay</Text>
            </View>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.branchFilters}
        >
          <Pressable
            onPress={() => setSelectedBranchId(null)}
            style={[
              styles.branchFilter,
              selectedBranchId === null && styles.branchFilterActive,
            ]}
          >
            <Text
              style={[
                styles.branchFilterText,
                selectedBranchId === null && styles.branchFilterTextActive,
              ]}
            >
              Tất cả chi nhánh
            </Text>
          </Pressable>
          {branches.map((branch) => (
            <Pressable
              key={branch.id}
              onPress={() => setSelectedBranchId(branch.id)}
              style={[
                styles.branchFilter,
                selectedBranchId === branch.id && styles.branchFilterActive,
              ]}
            >
              <Text
                style={[
                  styles.branchFilterText,
                  selectedBranchId === branch.id &&
                    styles.branchFilterTextActive,
                ]}
              >
                {branch.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Statistics */}
        <View style={styles.statsCard}>
          <Text style={styles.cardTitle}>TỔNG QUAN THÁNG NÀY</Text>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{workoutCount}</Text>
              <Text style={styles.statLabel}>Buổi đã tập</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.stat}>
              <View style={styles.streakRow}>
                <Text style={styles.statNumber}>{statistics?.streak ?? 0}</Text>
              </View>
              <Text style={styles.statLabel}>Chuỗi Streak</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.stat}>
              <Text style={styles.statNumber}>
                {statistics
                  ? `${Math.round((statistics.workoutDays / new Date(year, month + 1, 0).getDate()) * 100)}%`
                  : "0%"}
              </Text>
              <Text style={styles.statLabel}>Tần suất tập</Text>
            </View>
          </View>
        </View>

        {selectedDate && (
          <View style={styles.noteCard}>
            <View style={styles.noteContent}>
              <Text style={styles.noteTitle}>Chi tiết {selectedDate}</Text>
              {visibleCheckIns
                .filter(
                  (item) => item.checkedInAt.slice(0, 10) === selectedDate,
                )
                .map((item) => (
                  <Text key={item.id} style={styles.noteText}>
                    {item.branch.name}:{" "}
                    {new Date(item.checkedInAt).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    -{" "}
                    {item.checkedOutAt
                      ? new Date(item.checkedOutAt).toLocaleTimeString(
                          "vi-VN",
                          { hour: "2-digit", minute: "2-digit" },
                        )
                      : "đang tập"}{" "}
                    ({formatDuration(item)})
                  </Text>
                ))}
              {workouts
                .filter(
                  (item) => item.workoutDate.slice(0, 10) === selectedDate,
                )
                .map((workout) => (
                  <Text key={workout.id} style={styles.noteText}>
                    {workout.name}:{" "}
                    {workout.exercises
                      .map((item) => item.exercise.name)
                      .join(", ") || "Chưa có bài tập"}
                  </Text>
                ))}
              {!visibleCheckIns.some(
                (item) => item.checkedInAt.slice(0, 10) === selectedDate,
              ) &&
                !workouts.some(
                  (item) => item.workoutDate.slice(0, 10) === selectedDate,
                ) && (
                  <Text style={styles.noteText}>
                    Chưa có dữ liệu tập luyện.
                  </Text>
                )}
            </View>
          </View>
        )}

        {/* Motivation Note Card */}
        <View style={styles.noteCard}>
          <View style={styles.noteIconTransparent}>
            <FontAwesomeIcon icon={faDumbbell} size={20} color="#111827" />
          </View>

          <View style={styles.noteContent}>
            <Text style={styles.noteTitle}>Tiếp tục duy trì nhé!</Text>
            <Text style={styles.noteText}>
              Bạn đã hoàn thành {workoutCount} buổi tập trong tháng. Hãy giữ
              vững phong độ để đạt mục tiêu sức khỏe.
            </Text>
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

  /* Calendar Card */
  calendarCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },

  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  monthTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
    textTransform: "capitalize",
  },

  monthControls: {
    flexDirection: "row",
    gap: 8,
  },

  arrowButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },

  weekRow: {
    flexDirection: "row",
    marginBottom: 12,
  },

  weekDay: {
    flex: 1,
    textAlign: "center",
    color: "#9CA3AF",
    fontSize: 11,
    fontWeight: "700",
  },

  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  dayCell: {
    width: "14.2857%",
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },

  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  dayText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },

  workoutDay: {
    backgroundColor: "#111827",
  },

  workoutDayText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  todayDay: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1.5,
    borderColor: "#111827",
  },

  todayWorkoutDay: {
    backgroundColor: "#111827",
    borderWidth: 2,
    borderColor: "#10B981",
  },

  todayDayText: {
    fontWeight: "800",
    color: "#111827",
  },

  /* Legend */
  legend: {
    flexDirection: "row",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    gap: 20,
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  legendWorkout: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#111827",
  },

  legendToday: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: "#10B981",
    backgroundColor: "#F3F4F6",
  },

  legendText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },

  branchFilters: {
    gap: 8,
    paddingVertical: 14,
  },

  branchFilter: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    paddingVertical: 9,
  },

  branchFilterActive: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },

  branchFilterText: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "600",
  },

  branchFilterTextActive: {
    color: "#FFFFFF",
  },

  /* Statistics Card */
  statsCard: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },

  cardTitle: {
    color: "#9CA3AF",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },

  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },

  stat: {
    flex: 1,
    alignItems: "center",
  },

  streakRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  streakIcon: {
    marginLeft: 4,
  },

  statNumber: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
  },

  statLabel: {
    color: "#9CA3AF",
    fontSize: 11,
    marginTop: 4,
  },

  divider: {
    width: 1,
    height: 32,
    backgroundColor: "#374151",
  },

  /* Note Card */
  noteCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },

  noteIconTransparent: {
    width: 32,
    height: 32,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  noteContent: {
    flex: 1,
  },

  noteTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },

  noteText: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
});

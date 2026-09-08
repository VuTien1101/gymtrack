import {
  faChevronLeft,
  faChevronRight,
  faDumbbell,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const WEEK_DAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

const WORKOUT_DAYS = [
  "2026-09-01",
  "2026-09-02",
  "2026-09-04",
  "2026-09-05",
  "2026-09-07",
  "2026-09-09",
  "2026-09-10",
  "2026-09-12",
  "2026-09-15",
  "2026-09-16",
  "2026-09-18",
  "2026-09-21",
];

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

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

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
    return WORKOUT_DAYS.includes(formatDate(year, month, day));
  };

  const workoutCount = WORKOUT_DAYS.filter((date) => {
    const [y, m] = date.split("-").map(Number);
    return y === year && m === month + 1;
  }).length;

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        overScrollMode="never"
        bounces={false}
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
                <View key={day} style={styles.dayCell}>
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
                </View>
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
                <Text style={styles.statNumber}>4</Text>
              </View>
              <Text style={styles.statLabel}>Chuỗi Streak</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.stat}>
              <Text style={styles.statNumber}>40%</Text>
              <Text style={styles.statLabel}>Tần suất tập</Text>
            </View>
          </View>
        </View>

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
    borderRadius: 24,
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
    borderColor: "#111827",
    backgroundColor: "#F3F4F6",
  },

  legendText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },

  /* Statistics Card */
  statsCard: {
    backgroundColor: "#111827",
    borderRadius: 24,
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
    borderRadius: 20,
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

import {
    faChevronLeft, // <-- THÊM ICON
    faChevronRight,
    faDumbbell,
    faMagnifyingGlass,
    faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { Link } from "expo-router"; // <-- THÊM DÒNG NÀY
import { useEffect, useMemo, useState } from "react";
import {
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useTheme } from "@/hooks/use-theme";
import { api } from "../lib/api";

const muscleGroups = ["Tất cả", "Ngực", "Lưng", "Vai", "Chân", "Tay", "Core"];

const exercises = [
  {
    id: "1",
    name: "Barbell Bench Press",
    muscle: "Ngực",
    description: "Đẩy ngực ngang với thanh tạ",
  },
  {
    id: "2",
    name: "Incline Dumbbell Press",
    muscle: "Ngực",
    description: "Đẩy ngực trên với tạ đơn",
  },
  {
    id: "3",
    name: "Lat Pulldown",
    muscle: "Lưng",
    description: "Kéo xô rộng tay với máy",
  },
  {
    id: "4",
    name: "Seated Cable Row",
    muscle: "Lưng",
    description: "Kéo cáp ngồi tập lưng giữa",
  },
  {
    id: "5",
    name: "Shoulder Press",
    muscle: "Vai",
    description: "Đẩy vai qua đầu với tạ",
  },
  {
    id: "6",
    name: "Lateral Raise",
    muscle: "Vai",
    description: "Dang vai ngang với tạ đơn",
  },
  {
    id: "7",
    name: "Barbell Squat",
    muscle: "Chân",
    description: "Gánh tạ đùi trước & mông",
  },
  {
    id: "8",
    name: "Leg Press",
    muscle: "Chân",
    description: "Đẩy chân trên máy nghiêng",
  },
  {
    id: "9",
    name: "Barbell Curl",
    muscle: "Tay",
    description: "Cuốn tạ tay trước (Biceps)",
  },
  {
    id: "10",
    name: "Triceps Pushdown",
    muscle: "Tay",
    description: "Duỗi cáp tay sau (Triceps)",
  },
  {
    id: "11",
    name: "Cable Crunch",
    muscle: "Core",
    description: "Gập bụng quỳ với cáp",
  },
  {
    id: "12",
    name: "Plank",
    muscle: "Core",
    description: "Giữ cơ thể gồng chặt bụng",
  },
];

export default function ExploreScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [search, setSearch] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState("Tất cả");
  const [refreshing, setRefreshing] = useState(false);
  const [exerciseItems, setExerciseItems] = useState(exercises);

  useEffect(() => {
    api
      .getExercises()
      .then((result) =>
        setExerciseItems(
          result.exercises.map((item) => ({
            ...item,
            id: String(item.id),
            muscle: item.muscleGroup,
            description: item.description ?? "",
          })),
        ),
      )
      .catch(console.error);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  const filteredExercises = useMemo(() => {
    return exerciseItems.filter((exercise) => {
      const matchMuscle =
        selectedMuscle === "Tất cả" || exercise.muscle === selectedMuscle;

      const matchSearch =
        exercise.name.toLowerCase().includes(search.toLowerCase()) ||
        exercise.description.toLowerCase().includes(search.toLowerCase());

      return matchMuscle && matchSearch;
    });
  }, [exerciseItems, search, selectedMuscle]);

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={filteredExercises}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        overScrollMode="always"
        bounces
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.text as string}
            colors={[theme.text as string]}
          />
        }
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 40,
          },
        ]}
        ListHeaderComponent={
          <>
            {/* Header */}
            <View style={styles.header}>
              {/* Nút Quay Ve Index */}
              <Link href="/" asChild>
                <Pressable style={styles.backButton} hitSlop={10}>
                  <FontAwesomeIcon
                    icon={faChevronLeft}
                    size={18}
                    color={theme.text as string}
                  />
                </Pressable>
              </Link>

              <View>
                <ThemedText style={styles.title}>Khám phá bài tập</ThemedText>
                <ThemedText
                  style={[styles.subtitle, { color: theme.textSecondary }]}
                >
                  Tra cứu kỹ thuật & nhóm cơ mục tiêu
                </ThemedText>
              </View>
            </View>

            {/* Search Input */}
            <View
              style={[
                styles.searchContainer,
                { backgroundColor: theme.backgroundElement },
              ]}
            >
              <FontAwesomeIcon
                icon={faMagnifyingGlass}
                size={16}
                color={theme.textSecondary as string}
              />

              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Tìm kiếm bài tập..."
                placeholderTextColor={theme.textSecondary}
                style={[styles.searchInput, { color: theme.text }]}
              />

              {search.length > 0 && (
                <Pressable onPress={() => setSearch("")} hitSlop={10}>
                  <FontAwesomeIcon
                    icon={faXmark}
                    size={16}
                    color={theme.textSecondary as string}
                  />
                </Pressable>
              )}
            </View>

            {/* Muscle groups filter */}
            <ThemedText style={styles.sectionTitle}>Nhóm cơ</ThemedText>

            <FlatList
              horizontal
              data={muscleGroups}
              keyExtractor={(item) => item}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.muscleList}
              renderItem={({ item }) => {
                const active = selectedMuscle === item;

                return (
                  <Pressable
                    onPress={() => setSelectedMuscle(item)}
                    style={[
                      styles.muscleButton,
                      {
                        backgroundColor: active
                          ? theme.text
                          : theme.backgroundElement,
                      },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.muscleText,
                        {
                          color: active ? "#FFFFFF" : theme.text,
                          fontWeight: active ? "700" : "500",
                        },
                      ]}
                    >
                      {item}
                    </ThemedText>
                  </Pressable>
                );
              }}
            />

            {/* List Header Count */}
            <View style={styles.listHeader}>
              <ThemedText style={styles.sectionTitle}>Danh sách</ThemedText>
              <ThemedText
                style={[styles.countText, { color: theme.textSecondary }]}
              >
                {filteredExercises.length} bài tập
              </ThemedText>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [
              styles.exerciseCard,
              {
                backgroundColor: theme.backgroundElement,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
            onPress={() => {
              // TODO: Mở modal/màn hình chi tiết bài tập
            }}
          >
            <View style={styles.exerciseIconTransparent}>
              <FontAwesomeIcon
                icon={faDumbbell}
                size={18}
                color={theme.text as string}
              />
            </View>

            <View style={styles.exerciseInfo}>
              <ThemedText style={styles.exerciseName}>{item.name}</ThemedText>

              <ThemedText
                style={[
                  styles.exerciseDescription,
                  { color: theme.textSecondary },
                ]}
                numberOfLines={1}
              >
                {item.description}
              </ThemedText>
            </View>

            <FontAwesomeIcon
              icon={faChevronRight}
              size={12}
              color={theme.textSecondary as string}
            />
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <ThemedText style={styles.emptyTitle}>
              Không tìm thấy bài tập
            </ThemedText>

            <ThemedText
              style={[styles.emptyText, { color: theme.textSecondary }]}
            >
              Thử điều chỉnh bộ lọc nhóm cơ hoặc từ khóa tìm kiếm
            </ThemedText>
          </View>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 20,
  },

  header: {
    paddingBottom: 16,
    flexDirection: "row", // Sắp xếp nút quay về và tiêu đề nằm ngang hoặc dọc tùy bạn
    alignItems: "center",
    gap: 12,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
    paddingTop: 10,
  },

  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },

  searchContainer: {
    height: 46,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 10,
    marginBottom: 20,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
  },

  muscleList: {
    gap: 8,
    paddingVertical: 12,
  },

  muscleButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },

  muscleText: {
    fontSize: 13,
  },

  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    marginBottom: 12,
  },

  countText: {
    fontSize: 12,
    fontWeight: "500",
  },

  exerciseCard: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  exerciseIconTransparent: {
    width: 28,
    height: 28,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  exerciseInfo: {
    flex: 1,
    marginRight: 8,
  },

  exerciseName: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 2,
  },

  exerciseDescription: {
    fontSize: 12,
  },

  empty: {
    alignItems: "center",
    paddingTop: 48,
  },

  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
  },

  emptyText: {
    fontSize: 12,
    marginTop: 4,
  },
});

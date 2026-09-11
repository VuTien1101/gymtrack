import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api, Branch } from "../lib/api";

export default function BranchesScreen() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const load = useCallback(
    async () => setBranches((await api.getBranches()).branches),
    [],
  );
  useFocusEffect(
    useCallback(() => {
      load().catch(console.error);
    }, [load]),
  );

  const select = async (id: number) => {
    await api.setPreferredBranch(id);
    setSelectedId(id);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Chọn chi nhánh</Text>
        {branches.map((branch) => (
          <Pressable
            key={branch.id}
            onPress={() => select(branch.id)}
            style={[styles.item, selectedId === branch.id && styles.selected]}
          >
            <Text style={styles.name}>{branch.name}</Text>
            <Text style={styles.address}>{branch.address}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  content: { padding: 20, gap: 12 },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12,
  },
  item: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  selected: { borderColor: "#111827" },
  name: { fontSize: 16, fontWeight: "700", color: "#111827" },
  address: { marginTop: 5, color: "#6B7280" },
});

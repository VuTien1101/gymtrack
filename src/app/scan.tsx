import {
    faArrowLeft,
    faBolt,
    faBolt as faBoltSlash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../lib/api";

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraSessionKey, setCameraSessionKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setIsProcessing(false);
      setCameraSessionKey((currentKey) => currentKey + 1);
    }, []),
  );

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      await api.scanCheckIn(data);
      router.replace("/");
    } catch (error) {
      setIsProcessing(false);
      Alert.alert(
        "Không thể quét mã",
        error instanceof Error ? error.message : "Vui lòng thử lại",
      );
    }
  };

  if (!permission) {
    return <View style={styles.permissionScreen} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionScreen}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <FontAwesomeIcon icon={faArrowLeft} size={20} color="#FFFFFF" />
        </Pressable>
        <View style={styles.permissionContent}>
          <Text style={styles.permissionTitle}>Cho phép dùng camera</Text>
          <Text style={styles.permissionText}>
            GymTrack cần camera để quét mã QR tại quầy lễ tân.
          </Text>
          <Pressable
            onPress={requestPermission}
            style={styles.permissionButton}
          >
            <Text style={styles.permissionButtonText}>Cho phép camera</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        key={cameraSessionKey}
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={torchEnabled}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={isProcessing ? undefined : handleBarcodeScanned}
      />

      <View style={styles.scrim} pointerEvents="none">
        <View style={styles.scrimRow} />
        <View style={styles.scanRow}>
          <View style={styles.scrimSide} />
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.cornerTopLeft]} />
            <View style={[styles.corner, styles.cornerTopRight]} />
            <View style={[styles.corner, styles.cornerBottomLeft]} />
            <View style={[styles.corner, styles.cornerBottomRight]} />
          </View>
          <View style={styles.scrimSide} />
        </View>
        <View style={styles.scrimRow} />
      </View>

      <SafeAreaView style={styles.overlay} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <FontAwesomeIcon icon={faArrowLeft} size={20} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.headerTitle}>Quét mã QR</Text>
          <Pressable
            onPress={() => setTorchEnabled((enabled) => !enabled)}
            style={[styles.iconButton, torchEnabled && styles.iconButtonActive]}
          >
            <FontAwesomeIcon
              icon={torchEnabled ? faBolt : faBoltSlash}
              size={19}
              color="#FFFFFF"
            />
          </Pressable>
        </View>

        <View style={styles.instructions}>
          <Text style={styles.instructionTitle}>
            {isProcessing ? "Đang xác nhận..." : "Đưa mã QR vào khung"}
          </Text>
          <Text style={styles.instructionText}>
            "Quét mã tại quầy để check-in hoặc check-out"
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111827" },
  overlay: { flex: 1, justifyContent: "space-between" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  headerTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "700" },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: "rgba(17, 24, 39, 0.55)",
  },
  iconButtonActive: { backgroundColor: "#F59E0B" },
  scrim: { ...StyleSheet.absoluteFill, flexDirection: "column" },
  scrimRow: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.58)" },
  scanRow: { height: 260, flexDirection: "row" },
  scrimSide: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.58)" },
  scanFrame: { width: 260, height: 260 },
  corner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderColor: "#FFFFFF",
  },
  cornerTopLeft: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4 },
  cornerTopRight: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4 },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  instructions: {
    alignItems: "center",
    paddingBottom: 58,
    paddingHorizontal: 24,
  },
  instructionTitle: { color: "#FFFFFF", fontSize: 19, fontWeight: "700" },
  instructionText: { color: "#E5E7EB", fontSize: 14, marginTop: 8 },
  permissionScreen: {
    flex: 1,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
  closeButton: { position: "absolute", top: 54, left: 20, padding: 12 },
  permissionContent: { alignItems: "center", paddingHorizontal: 32 },
  permissionTitle: { color: "#FFFFFF", fontSize: 22, fontWeight: "700" },
  permissionText: {
    color: "#D1D5DB",
    textAlign: "center",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
  },
  permissionButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 24,
  },
  permissionButtonText: { color: "#111827", fontSize: 15, fontWeight: "700" },
});

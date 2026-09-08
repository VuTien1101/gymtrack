import {
  faCalendar,
  faChevronRight,
  faDumbbell,
  faEnvelope,
  faGear,
  faLocationDot,
  faLock,
  faPhone,
  faRightFromBracket,
  faRulerVertical,
  faUser,
  faVenusMars,
  faWeightScale,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function ProfileScreen() {
  const [isEditing, setIsEditing] = useState(false);

  const [name, setName] = useState("Minh Tiến");
  const [height, setHeight] = useState("169");
  const [weight, setWeight] = useState("75.4");
  const [muscleMass, setMuscleMass] = useState("30");
  const [age, setAge] = useState("21");
  const [gender, setGender] = useState<"Nam" | "Nữ">("Nam");

  const [phone] = useState("09xx xxx xxx");
  const [email] = useState("minhtien@email.com");
  const [address] = useState("TP. Hồ Chí Minh");
  const [dateOfBirth] = useState("14/05/2005");
  const [memberId] = useState("GYM-2026-00128");

  const bmi = useMemo(() => {
    const h = Number(height) / 100;
    const w = Number(weight);
    if (!h || !w) return 0;
    return w / (h * h);
  }, [height, weight]);

  const estimatedBodyFat = useMemo(() => {
    const bmiValue = bmi;
    const ageValue = Number(age);
    if (!bmiValue || !ageValue) return 0;
    const sex = gender === "Nam" ? 1 : 0;
    const result = 1.2 * bmiValue + 0.23 * ageValue - 10.8 * sex - 5.4;
    return Math.max(0, result);
  }, [bmi, age, gender]);

  const bmiStatus = useMemo(() => {
    if (bmi < 18.5) return { label: "Thiếu cân", color: "#E6A23C" };
    if (bmi < 23) return { label: "Bình thường", color: "#67C23A" };
    if (bmi < 25) return { label: "Thừa cân", color: "#E6A23C" };
    return { label: "Béo phì", color: "#F56C6C" };
  }, [bmi]);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập họ tên.");
      return;
    }
    if (!height || !weight || !age) {
      Alert.alert("Thông báo", "Vui lòng nhập đầy đủ thông tin cơ thể.");
      return;
    }
    setIsEditing(false);
    Alert.alert(
      "Đã cập nhật",
      "Thông tin cá nhân và chỉ số cơ thể đã được cập nhật.",
    );
  };

  const handleChangePassword = () => {
    router.push("/change-password");
  };

  const handleSettings = () => {
    Alert.alert(
      "Cài đặt",
      "Khu vực cài đặt sẽ được phát triển ở bước tiếp theo.",
    );
  };

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: () => router.replace("/login"),
      },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Cá nhân</Text>
          <Text style={styles.headerSubtitle}>
            Quản lý thông tin & chỉ số sức khỏe
          </Text>
        </View>

        <Pressable
          style={[styles.editButton, isEditing && styles.saveButton]}
          onPress={() => (isEditing ? handleSave() : setIsEditing(true))}
        >
          <Text
            style={[styles.editButtonText, isEditing && styles.saveButtonText]}
          >
            {isEditing ? "Lưu lại" : "Chỉnh sửa"}
          </Text>
        </Pressable>
      </View>

      {/* PROFILE CARD */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
        </View>

        <View style={styles.profileInfo}>
          {isEditing ? (
            <TextInput
              value={name}
              onChangeText={setName}
              style={styles.nameInput}
              placeholder="Họ và tên"
              placeholderTextColor="#888"
            />
          ) : (
            <Text style={styles.name}>{name}</Text>
          )}

          <Text style={styles.memberId}>ID: {memberId}</Text>

          <View style={styles.memberBadge}>
            <Text style={styles.memberBadgeText}>PREMIUM MEMBER</Text>
          </View>
        </View>
      </View>

      {/* EDIT FORM */}
      {isEditing && (
        <View style={styles.editCard}>
          <Text style={styles.editCardTitle}>Cập nhật thông tin cơ thể</Text>
          <View style={styles.inputRow}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Chiều cao (cm)</Text>
              <TextInput
                value={height}
                onChangeText={setHeight}
                keyboardType="decimal-pad"
                style={styles.input}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Cân nặng (kg)</Text>
              <TextInput
                value={weight}
                onChangeText={setWeight}
                keyboardType="decimal-pad"
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Khối lượng cơ (kg)</Text>
              <TextInput
                value={muscleMass}
                onChangeText={setMuscleMass}
                keyboardType="decimal-pad"
                style={styles.input}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Tuổi</Text>
              <TextInput
                value={age}
                onChangeText={setAge}
                keyboardType="number-pad"
                style={styles.input}
              />
            </View>
          </View>

          <Text style={styles.inputLabel}>Giới tính</Text>
          <View style={styles.genderRow}>
            <Pressable
              style={[
                styles.genderButton,
                gender === "Nam" && styles.genderButtonActive,
              ]}
              onPress={() => setGender("Nam")}
            >
              <Text
                style={[
                  styles.genderText,
                  gender === "Nam" && styles.genderTextActive,
                ]}
              >
                Nam
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.genderButton,
                gender === "Nữ" && styles.genderButtonActive,
              ]}
              onPress={() => setGender("Nữ")}
            >
              <Text
                style={[
                  styles.genderText,
                  gender === "Nữ" && styles.genderTextActive,
                ]}
              >
                Nữ
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* METRICS 2x2 GRID */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Chỉ số cơ thể</Text>
      </View>

      <View style={styles.metricsGrid}>
        <MetricItem
          icon={faRulerVertical}
          value={height}
          unit="cm"
          label="Chiều cao"
        />
        <MetricItem
          icon={faWeightScale}
          value={weight}
          unit="kg"
          label="Cân nặng"
        />
        <MetricItem
          icon={faDumbbell}
          value={muscleMass}
          unit="kg"
          label="Khối lượng cơ"
        />
        <MetricItem icon={faUser} value={age} unit="tuổi" label="Tuổi" />
      </View>

      {/* BODY ANALYSIS */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Phân tích & Đánh giá</Text>
      </View>

      <View style={styles.analysisCard}>
        <View style={styles.analysisRow}>
          <View>
            <Text style={styles.analysisLabel}>Chỉ số BMI</Text>
            <Text style={styles.analysisValue}>
              {bmi > 0 ? bmi.toFixed(1) : "--"}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: bmiStatus.color + "1A" },
            ]}
          >
            <Text style={[styles.statusBadgeText, { color: bmiStatus.color }]}>
              {bmiStatus.label}
            </Text>
          </View>
        </View>

        <View style={styles.analysisDivider} />

        <View style={styles.analysisRow}>
          <View>
            <Text style={styles.analysisLabel}>Mỡ cơ thể ước tính</Text>
            <Text style={styles.analysisValue}>
              {estimatedBodyFat > 0 ? `${estimatedBodyFat.toFixed(1)}%` : "--"}
            </Text>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: "#10B9811A" }]}>
            <Text style={[styles.statusBadgeText, { color: "#10B981" }]}>
              Ước tính
            </Text>
          </View>
        </View>

        <Text style={styles.analysisNote}>
          * Kết quả dựa trên công thức nhân trắc học tiêu chuẩn. Để có kết quả
          chính xác nhất, nên thực hiện đo bằng thiết bị InBody chuyên dụng tại
          phòng tập.
        </Text>
      </View>

      {/* MEMBERSHIP INFORMATION */}
      <Text style={styles.sectionTitleStandalone}>Thông tin hội viên</Text>
      <View style={styles.infoCard}>
        <InfoRow icon={faUser} label="ID hội viên" value={memberId} />
        <InfoRow icon={faPhone} label="Số điện thoại" value={phone} />
        <InfoRow icon={faEnvelope} label="Email" value={email} />
        <InfoRow icon={faLocationDot} label="Địa chỉ" value={address} />
        <InfoRow icon={faVenusMars} label="Giới tính" value={gender} />
        <InfoRow
          icon={faCalendar}
          label="Ngày sinh"
          value={dateOfBirth}
          isLast
        />
      </View>

      {/* ACCOUNT */}
      <Text style={styles.sectionTitleStandalone}>Tài khoản & Hệ thống</Text>
      <View style={styles.menuCard}>
        <MenuRow
          icon={faLock}
          title="Đổi mật khẩu"
          onPress={handleChangePassword}
        />
        <MenuRow
          icon={faGear}
          title="Cài đặt thông báo"
          onPress={handleSettings}
        />
        <MenuRow
          icon={faRightFromBracket}
          title="Đăng xuất"
          danger
          onPress={handleLogout}
          isLast
        />
      </View>

      <Text style={styles.version}>Gym App • Phiên bản 1.0.0</Text>
    </ScrollView>
  );
}

function MetricItem({
  icon,
  value,
  unit,
  label,
}: {
  icon: any;
  value: string;
  unit: string;
  label: string;
}) {
  return (
    <View style={styles.metricCard}>
      <View style={styles.metricIconBox}>
        <FontAwesomeIcon icon={icon} size={16} color="#111827" />
      </View>
      <View style={styles.metricTextContainer}>
        <View style={styles.metricValueRow}>
          <Text style={styles.metricValue}>{value}</Text>
          <Text style={styles.metricUnit}>{unit}</Text>
        </View>
        <Text style={styles.metricLabel}>{label}</Text>
      </View>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
  isLast = false,
}: {
  icon: any;
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <View style={[styles.infoRow, isLast && styles.noBorder]}>
      <View style={styles.infoIcon}>
        <FontAwesomeIcon icon={icon} size={15} color="#4B5563" />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function MenuRow({
  icon,
  title,
  danger = false,
  isLast = false,
  onPress,
}: {
  icon: any;
  title: string;
  danger?: boolean;
  isLast?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.menuRow, isLast && styles.noBorder]}
      onPress={onPress}
    >
      <View style={[styles.menuIcon, danger && styles.menuIconDanger]}>
        <FontAwesomeIcon
          icon={icon}
          size={16}
          color={danger ? "#EF4444" : "#4B5563"}
        />
      </View>
      <Text style={[styles.menuTitle, danger && styles.menuTitleDanger]}>
        {title}
      </Text>
      <FontAwesomeIcon
        icon={faChevronRight}
        size={12}
        color={danger ? "#EF4444" : "#9CA3AF"}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  editButton: {
    backgroundColor: "#E5E7EB",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  editButtonText: {
    color: "#1F2937",
    fontSize: 13,
    fontWeight: "700",
  },
  saveButton: {
    backgroundColor: "#111827",
  },
  saveButtonText: {
    color: "#FFFFFF",
  },
  profileCard: {
    backgroundColor: "#111827",
    borderRadius: 24,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  avatarText: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111827",
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 2,
  },
  nameInput: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    borderBottomWidth: 1,
    borderBottomColor: "#4B5563",
    paddingVertical: 2,
    marginBottom: 4,
  },
  memberId: {
    color: "#9CA3AF",
    fontSize: 12,
    marginBottom: 8,
  },
  memberBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  memberBadgeText: {
    color: "#F3F4F6",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  editCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  editCardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 14,
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  inputWrapper: {
    flex: 1,
  },
  inputLabel: {
    color: "#4B5563",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    height: 44,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 12,
    color: "#111827",
    fontSize: 14,
    fontWeight: "600",
  },
  genderRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
  },
  genderButton: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  genderButtonActive: {
    backgroundColor: "#111827",
  },
  genderText: {
    color: "#4B5563",
    fontSize: 14,
    fontWeight: "600",
  },
  genderTextActive: {
    color: "#FFFFFF",
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "700",
  },
  sectionTitleStandalone: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  metricIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  metricTextContainer: {
    flex: 1,
  },
  metricValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  metricValue: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "800",
  },
  metricUnit: {
    color: "#6B7280",
    fontSize: 11,
    fontWeight: "600",
    marginLeft: 2,
  },
  metricLabel: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
  },
  analysisCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  analysisRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  analysisLabel: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
  },
  analysisValue: {
    color: "#111827",
    fontSize: 22,
    fontWeight: "800",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  analysisDivider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 16,
  },
  analysisNote: {
    color: "#9CA3AF",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 16,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    color: "#9CA3AF",
    fontSize: 11,
    marginBottom: 2,
  },
  infoValue: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "600",
  },
  menuCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  menuRow: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuIconDanger: {
    backgroundColor: "#FEE2E2",
  },
  menuTitle: {
    flex: 1,
    color: "#111827",
    fontSize: 14,
    fontWeight: "600",
  },
  menuTitleDanger: {
    color: "#EF4444",
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  version: {
    textAlign: "center",
    color: "#9CA3AF",
    fontSize: 11,
    marginTop: 8,
  },
});

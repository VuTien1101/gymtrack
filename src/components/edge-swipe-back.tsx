import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";

export function EdgeSwipeBack({ children }: { children: React.ReactNode }) {
  const translationX = useSharedValue(0);
  const isEdgeGesture = useSharedValue(false);

  const gesture = Gesture.Pan()
    .activeOffsetX(12)
    .failOffsetY([-24, 24])
    .onStart((event) => {
      isEdgeGesture.value = event.absoluteX <= 28 && router.canGoBack();
    })
    .onUpdate((event) => {
      if (isEdgeGesture.value) {
        translationX.value = Math.max(0, event.translationX);
      }
    })
    .onEnd(() => {
      if (!isEdgeGesture.value) return;

      if (translationX.value > 90) {
        runOnJS(router.back)();
      } else {
        translationX.value = withSpring(0, { damping: 20, stiffness: 220 });
      }
      isEdgeGesture.value = false;
    });

  const contentStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translationX.value },
      { scale: interpolate(translationX.value, [0, 360], [1, 0.96]) },
    ],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translationX.value, [0, 360], [0, 0.18]),
  }));

  return (
    <GestureDetector gesture={gesture}>
      <View style={styles.container}>
        <Animated.View
          pointerEvents="none"
          style={[styles.backdrop, backdropStyle]}
        />
        <Animated.View style={[styles.content, contentStyle]}>
          {children}
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E5E7EB" },
  content: { flex: 1, backgroundColor: "#F8F9FA" },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#111827",
  },
});

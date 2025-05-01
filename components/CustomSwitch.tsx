import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  interpolate,
  Extrapolation,
  runOnJS, // runOnJS for logging
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

const { width: screenWidth } = Dimensions.get("window");

// --- Configuration Constants ---
const CONTAINER_WIDTH_PERCENT = 0.6;
const CONTAINER_HEIGHT = 40;
const CONTAINER_PADDING = 4;
const PILL_VERTICAL_MARGIN = 4;
const ANIMATION_DURATION = 400;

const animationConfig = {
  duration: ANIMATION_DURATION,
  easing: Easing.bezier(0.35, 0, 0.25, 1),
};
// ---

const CustomSwitch = ({
  options = ["Lvl 1", "Lvl 2", "Lvl 3"],
  onSwitch,
  onLeft,
  onRight,
  initialIndex = 0,
}) => {
  // Use a ref to track if it's the initial mount
  const isInitialMount = useRef(true);

  // Use state for the index displayed in the UI
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);

  // --- Animation State ---
  // Store the *target* index for the animation calculation
  const targetIndex = useSharedValue(initialIndex);
  // Store the *previous* index for the animation calculation
  const previousIndex = useSharedValue(initialIndex);
  // Animation progress
  const animationProgress = useSharedValue(1); // Start settled

  // --- Calculated Layout Values ---
  const containerWidth = screenWidth * CONTAINER_WIDTH_PERCENT;
  // Width available *inside* padding for all options
  const optionsAreaWidth = containerWidth - CONTAINER_PADDING * 2;
  const optionWidth =
    options.length > 0 ? optionsAreaWidth / options.length : 0;
  const pillVisualWidth = optionWidth > 0 ? optionWidth : 0;

  // --- Animation Trigger ---
  const handleSwitch = (index) => {
    if (index !== selectedIndex && optionWidth > 0) {
      // 1. Store the *current* state index as the previous for the animation
      previousIndex.value = selectedIndex;
      // 2. Update the target index for the animation worklet
      targetIndex.value = index;
      // 3. Trigger the animation progress
      animationProgress.value = 0; // Reset to start
      animationProgress.value = withTiming(1, animationConfig); // Animate 0 -> 1
      // 4. Update React state AFTER initiating animation logic
      setSelectedIndex(index);
      // 5. Callback
      onSwitch && onSwitch(options[index]);
    }
  };

  // Effect to handle initial state correctly ONLY on mount
  useEffect(() => {
    // Set initial values correctly when component mounts
    targetIndex.value = initialIndex;
    previousIndex.value = initialIndex;
    animationProgress.value = 1; // Start settled
    isInitialMount.current = false; // Mark initial mount as done
  }, []); // Empty dependency array ensures this runs only once

  // --- Animated Style using Interpolation ---
  const animatedStyle = useAnimatedStyle(() => {
    "worklet";

    // Use targetIndex and previousIndex directly from shared values
    const currentActiveIndex = targetIndex.value;
    const prevIdx = previousIndex.value;

    if (
      optionWidth <= 0 ||
      pillVisualWidth <= 0 ||
      typeof currentActiveIndex !== "number" ||
      typeof prevIdx !== "number"
    ) {
      // Fallback to prevent errors before calculations are possible
      return { width: 0, opacity: 0, transform: [{ translateX: 0 }] };
    }

    // Calculate X position for the pill's start edge within the container's padding
    const getPillStartX = (index: number) => {
      "worklet";
      return CONTAINER_PADDING + index * optionWidth;
    };

    // Get positions and widths
    const fromX = getPillStartX(prevIdx);
    const toX = getPillStartX(currentActiveIndex);
    const fromW = pillVisualWidth;
    const toW = pillVisualWidth;

    const progress = animationProgress.value;

    // Debug log (runs on UI thread, use cautiously)
    // const logValues = (p, x, w) => { console.log(`P:${p.toFixed(2)} X:${x.toFixed(1)} W:${w.toFixed(1)}`) };
    // runOnJS(logValues)(progress, pillX, pillWidth);

    // If progress is 1 (settled state), just use the target values directly
    if (progress === 1) {
      return {
        transform: [{ translateX: toX }],
        width: toW,
        opacity: toW > 0 ? 1 : 0,
      };
    }
    // If progress is 0 (start state), use from values (needed for interpolation start)
    if (progress === 0 && prevIdx !== currentActiveIndex) {
      return {
        transform: [{ translateX: fromX }],
        width: fromW, // Start with non-stretched width before interpolation kicks in
        opacity: fromW > 0 ? 1 : 0,
      };
    }

    const inputRange = [0, 0.5, 1];
    let pillX = 0;
    let pillWidth = 0;

    // Interpolation Logic
    if (toX > fromX) {
      // Moving Right
      pillX = interpolate(
        progress,
        inputRange,
        [fromX, fromX, toX],
        Extrapolation.CLAMP,
      );
      pillWidth = interpolate(
        progress,
        inputRange,
        [fromW, toX + toW - fromX, toW],
        Extrapolation.CLAMP,
      );
    } else if (toX < fromX) {
      // Moving Left
      pillX = interpolate(
        progress,
        inputRange,
        [fromX, toX, toX],
        Extrapolation.CLAMP,
      );
      pillWidth = interpolate(
        progress,
        inputRange,
        [fromW, fromX + fromW - toX, toW],
        Extrapolation.CLAMP,
      );
    } else {
      // No movement (should be handled by progress === 1 check above)
      pillX = toX;
      pillWidth = toW;
    }

    return {
      transform: [{ translateX: pillX }],
      width: pillWidth,
      opacity: pillWidth > 0 ? 1 : 0,
    };
    // Dependencies: Use the shared values directly. Reanimated tracks their usage.
    // }, [options, containerWidth, optionWidth, pillVisualWidth]); // Remove selectedIndex here
  }, [options, containerWidth, optionWidth, pillVisualWidth]); // Depend on calculated dimensions

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity onPress={onLeft} style={styles.iconButton}>
        <Ionicons name="game-controller-outline" size={26} color="#fff" />
      </TouchableOpacity>

      <BlurView
        intensity={30}
        style={[styles.container, { width: containerWidth }]}
      >
        <Animated.View style={[styles.slider, animatedStyle]} />
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.option, { width: optionWidth }]}
            onPress={() => handleSwitch(index)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.text,
                // Use React state for text styling selection
                selectedIndex === index && styles.textSelected,
              ]}
              numberOfLines={1}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </BlurView>

      <TouchableOpacity onPress={onRight} style={styles.iconButton}>
        <Ionicons name="eye-outline" size={26} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

// Styles remain the same
const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
  },
  container: {
    flexDirection: "row",
    height: CONTAINER_HEIGHT,
    backgroundColor: "rgba(38, 38, 38, 1)",
    borderRadius: CONTAINER_HEIGHT / 2,
    overflow: "hidden",
    alignItems: "center",
    paddingHorizontal: CONTAINER_PADDING, // Use horizontal padding
  },
  option: {
    // width is dynamic
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  slider: {
    position: "absolute",
    // width is animated
    height: CONTAINER_HEIGHT - PILL_VERTICAL_MARGIN * 2, // Adjust height based on margin
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: (CONTAINER_HEIGHT - PILL_VERTICAL_MARGIN * 2) / 2, // Match height
    top: PILL_VERTICAL_MARGIN, // Position vertically using margin
    left: 0, // X handled by transform
    zIndex: 0,
  },
  text: {
    fontSize: 14,
    color: "#aaa",
    fontWeight: "500",
  },
  textSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#292929",
    borderRadius: 20,
    marginHorizontal: 10,
  },
});

export default CustomSwitch;

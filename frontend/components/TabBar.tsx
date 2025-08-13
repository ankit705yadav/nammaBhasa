import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import {
  StyleSheet,
  View,
  LayoutChangeEvent,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import TabBarButton from "./TabBarButton";
import { useState, useRef, useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  interpolate,
  Extrapolation,
  withDelay,
} from "react-native-reanimated";

const ANIMATION_DURATION = 600;
const ANIMATION_DELAY = 0;

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const focusedOptions = descriptors[state.routes[state.index].key].options;
  if (focusedOptions.tabBarVisible === false) {
    return null;
  }

  const [dimensions, setDimensions] = useState({ height: 20, width: 100 });
  const [tabLayouts, setTabLayouts] = useState([]);
  const tabLayoutsRef = useRef([]);
  const previousActiveIndex = useSharedValue(state.index);
  const animationProgress = useSharedValue(0);

  const animationConfig = {
    duration: ANIMATION_DURATION,
    easing: Easing.bezier(0.35, 0, 0.25, 1),
  };

  const onTabbarLayout = (event: LayoutChangeEvent) => {
    setDimensions({
      height: event.nativeEvent.layout.height,
      width: event.nativeEvent.layout.width,
    });
  };

  const handleTabLayout = (event: LayoutChangeEvent, index: number) => {
    const { x, width } = event.nativeEvent.layout;
    const currentLayouts = tabLayoutsRef.current;
    currentLayouts[index] = { x, width };

    const allMeasured =
      currentLayouts.length === state.routes.length &&
      currentLayouts.every((layout) => layout !== undefined && layout !== null);

    if (allMeasured) {
      if (JSON.stringify(currentLayouts) !== JSON.stringify(tabLayouts)) {
        setTabLayouts([...currentLayouts]);
      }
    }
  };

  // Trigger animation when active tab changes or layouts are measured
  // useEffect(() => {
  //   if (
  //     tabLayouts.length === state.routes.length &&
  //     tabLayouts.every((l) => l && l.width > 0)
  //   ) {
  //     animationProgress.value = 0;
  //     animationProgress.value = withTiming(1, animationConfig);
  //   }
  // }, [state.index, tabLayouts]);

  useEffect(() => {
    if (
      tabLayouts.length === state.routes.length &&
      tabLayouts.every((l) => l && l.width > 0) &&
      previousActiveIndex.value !== state.index // Check if index actually changed
    ) {
      animationProgress.value = 0; // Reset progress to start
      // Apply delay BEFORE starting the timing animation
      animationProgress.value = withDelay(
        ANIMATION_DELAY, // The delay in milliseconds
        withTiming(1, animationConfig), // The animation to run after the delay
      );
    }
  }, [state.index]); // Depend only on state.index

  // The fluid animated pill style
  // Simple indicator style for initial debugging
  const simplePillStyle = useAnimatedStyle(() => {
    // Log for debugging in development
    if (__DEV__ && tabLayouts.length > 0) {
      console.log("Tab layouts:", tabLayouts);
      console.log("Current index:", state.index);
    }

    // Basic positioning based on button width
    const buttonWidth = dimensions.width / state.routes.length;
    return {
      transform: [{ translateX: state.index * buttonWidth + 12 }],
      width: buttonWidth - 24,
      opacity: tabLayouts.length === state.routes.length ? 1 : 0,
    };
  }, [state.index, dimensions.width, tabLayouts.length]);

  // The advanced fluid animated pill style
  const animatedPillStyle = useAnimatedStyle(() => {
    const currentTabLayouts = tabLayouts;
    const currentActiveIndex = state.index;

    // For initial debugging, use simple positioning until layouts are ready
    if (currentTabLayouts.length !== state.routes.length) {
      const buttonWidth = dimensions.width / state.routes.length;
      return {
        transform: [{ translateX: currentActiveIndex * buttonWidth + 12 }],
        width: buttonWidth - 24,
        opacity: 0.5,
      };
    }

    // Check if we have valid layouts
    if (!currentTabLayouts[currentActiveIndex]) {
      return { opacity: 0 };
    }

    // When only showing current tab without animation
    if (
      previousActiveIndex.value === currentActiveIndex ||
      !currentTabLayouts[previousActiveIndex.value]
    ) {
      const layout = currentTabLayouts[currentActiveIndex];
      const PILL_HORIZONTAL_PADDING = 24;
      return {
        transform: [{ translateX: layout.x + PILL_HORIZONTAL_PADDING / 2 }],
        width: layout.width - PILL_HORIZONTAL_PADDING,
        opacity: 1,
      };
    }

    const fromLayout = currentTabLayouts[previousActiveIndex.value];
    const toLayout = currentTabLayouts[currentActiveIndex];

    // Horizontal padding for the pill (to make it slightly smaller than the button)
    const PILL_HORIZONTAL_PADDING = 24;

    const fromX = fromLayout.x + PILL_HORIZONTAL_PADDING / 2;
    const fromW = fromLayout.width - PILL_HORIZONTAL_PADDING;
    const toX = toLayout.x + PILL_HORIZONTAL_PADDING / 2;
    const toW = toLayout.width - PILL_HORIZONTAL_PADDING;

    const progress = animationProgress.value;
    const inputRange = [0, 0.5, 1];

    let pillX = 0;
    let pillWidth = 0;

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
      // No movement
      pillX = toX;
      pillWidth = toW;
    }

    return {
      transform: [{ translateX: pillX }],
      width: pillWidth,
      opacity: 1,
    };
  }, [state.index, tabLayouts, dimensions.width]);

  // Handle tab press and animation trigger
  const onTabPress = (index: number, routeName: string, params?: any) => {
    if (index !== state.index) {
      // Store previous index before navigation
      previousActiveIndex.value = state.index;

      // Emit navigation events
      const event = navigation.emit({
        type: "tabPress",
        target: state.routes[index].key,
        canPreventDefault: true,
      });

      if (!event.defaultPrevented) {
        navigation.navigate(routeName, params);
      }
    }
  };

  // Effect to initialize the pill position once layouts are measured for the first time
  useEffect(() => {
    if (tabLayouts.length === state.routes.length) {
      // Force a complete redraw with measured layouts
      if (__DEV__) {
        console.log("All tab layouts measured:", tabLayouts);
      }

      // Set animation to completed state (1) immediately for initial position
      animationProgress.value = 1;
    }
  }, [tabLayouts]);

  // Log state changes in development
  useEffect(() => {
    if (__DEV__) {
      console.log("Tab state changed:", state.index);
    }
  }, [state.index]);

  return (
    <View onLayout={onTabbarLayout} style={styles.tabbar}>
      {/* Debug visualization of tab measurements */}
      {__DEV__ &&
        tabLayouts.map(
          (layout, i) =>
            layout && (
              <View
                key={`debug-${i}`}
                style={{
                  position: "absolute",
                  left: layout.x,
                  width: layout.width,
                  height: 2,
                  top: 0,
                }}
              />
            ),
        )}

      {/* Animated pill indicator */}
      <Animated.View
        style={[
          {
            position: "absolute",
            backgroundColor: "#e0be21",
            borderRadius: dimensions.height / 2,
            height: dimensions.height - 15,
            top: 7.5, // Center vertically
          },
          // Use the simple style first for debugging, switch to advanced later
          tabLayouts.length === state.routes.length
            ? animatedPillStyle
            : simplePillStyle,
        ]}
      />

      {/* Tab buttons */}
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;
        const isFocused = state.index === index;

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        // Calculate equal button width based on available space
        const buttonWidth = dimensions.width / state.routes.length;

        return (
          <TouchableOpacity
            key={route.name}
            onPress={() => onTabPress(index, route.name, route.params)}
            onLongPress={onLongPress}
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
            }}
            onLayout={(event) => handleTabLayout(event, index)}
          >
            <TabBarButton
              isFocused={isFocused}
              routeName={route.name}
              label={label}
              onPress={() => onTabPress(index, route.name, route.params)}
              onLongPress={onLongPress}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabbar: {
    position: "absolute",
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#272627",
    paddingVertical: 15,
    maxHeight: 50,
    borderRadius: 50,
    marginHorizontal: 10,
    marginBottom: 2,

    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 10 },
    // shadowRadius: 10,
    // shadowOpacity: 0.1,
    // elevation: 5,
  },
});

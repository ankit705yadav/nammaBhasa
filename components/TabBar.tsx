import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { StyleSheet, View, LayoutChangeEvent } from "react-native";
import TabBarButton from "./TabBarButton";
import { useState } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  runOnJS,
} from "react-native-reanimated";

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const [dimensions, setDimensions] = useState({ height: 20, width: 100 });

  const buttonWidth = dimensions.width / state.routes.length;

  const onTabbarLayout = (event: LayoutChangeEvent) => {
    setDimensions({
      height: event.nativeEvent.layout.height,
      width: event.nativeEvent.layout.width,
    });
  };

  const indicatorX = useSharedValue(0);
  const indicatorWidth = useSharedValue(buttonWidth - 25);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: indicatorWidth.value,
  }));

  const moveTab = (index: number) => {
    const targetX = index * buttonWidth;

    const currentX = indicatorX.value;
    const minX = Math.min(currentX, targetX);
    const maxX = Math.max(currentX, targetX);
    const distance = Math.abs(currentX - targetX);

    // Step 1: Stretch from current to target
    indicatorX.value = withTiming(minX, { duration: 150 });
    indicatorWidth.value = withTiming(
      distance + (buttonWidth - 25),
      { duration: 300 },
      () => {
        // Step 2: After stretch, move and shrink
        indicatorX.value = withTiming(targetX, { duration: 300 });
        indicatorWidth.value = withTiming(buttonWidth - 25, { duration: 300 });
      },
    );
  };

  return (
    <View onLayout={onTabbarLayout} style={styles.tabbar}>
      <Animated.View
        style={[
          {
            position: "absolute",
            backgroundColor: "violet",
            borderRadius: 5,
            marginHorizontal: 12,
            height: dimensions.height - 15,
          },
          animatedStyle,
        ]}
      />
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          moveTab(index);

          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        return (
          <TabBarButton
            key={route.name}
            onPress={onPress}
            onLongPress={onLongPress}
            isFocused={isFocused}
            routeName={route.name}
            color={isFocused ? "red" : "yellow"}
            label={label}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabbar: {
    position: "absolute",
    bottom: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "pink",
    marginHorizontal: 80,
    paddingVertical: 15,
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 10,
    shadowOpacity: 0.1,
    elevation: 5,
  },
});

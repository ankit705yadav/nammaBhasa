import { Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import { icon } from "@/constants/icon";

type TabBarButtonProps = {
  onPress: () => void;
  onLongPress: () => void;
  isFocused: boolean;
  routeName: string;
  color: string;
  label: string;
};

const TabBarButton = ({
  onPress,
  onLongPress,
  isFocused,
  routeName,
  color,
  label,
}: TabBarButtonProps) => {
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tabBarItem}
    >
      {icon[routeName]({
        color: isFocused ? "yellow" : "black",
      })}
      {/* <Text style={{ color: isFocused ? "white" : "#222" }}>{label}</Text> */}
    </Pressable>
  );
};

export default TabBarButton;

const styles = StyleSheet.create({
  tabBarItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
});

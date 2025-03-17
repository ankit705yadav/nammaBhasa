import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { BlurView } from "expo-blur";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const CustomSwitch = ({
  options = ["Option 1", "Option 2"],
  onSwitch,
  onLeft,
  onRight,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const translateX = useSharedValue(0);

  const handleSwitch = (index) => {
    setSelectedIndex(index);
    translateX.value = withSpring(index * (width * 0.3)); // 30% width per option
    onSwitch && onSwitch(options[index]);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.wrapper}>
      {/* Left Icon Button */}
      <TouchableOpacity onPress={onLeft} style={styles.iconButton}>
        <Ionicons name="game-controller-outline" size={24} color="#fff" />
      </TouchableOpacity>

      <BlurView intensity={30} style={styles.container}>
        <Animated.View style={[styles.slider, animatedStyle]} />
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.option}
            onPress={() => handleSwitch(index)}
          >
            <Text
              style={[
                styles.text,
                selectedIndex === index && styles.textSelected,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </BlurView>

      {/* Right Icon Button */}
      <TouchableOpacity onPress={onRight} style={styles.iconButton}>
        <Ionicons name="eye-outline" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    bottom: 12,
  },
  container: {
    flexDirection: "row",
    width: width * 0.6, // 60% of screen width
    height: 50,
    // backgroundColor: "rgba(0, 0, 0, 0.2)", // Dark semi-transparent
    backgroundColor:"#262626",
    borderRadius: 25,
    overflow: "hidden",
    alignItems: "center",
    padding: 5,
  },
  option: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  slider: {
    position: "absolute",
    width: "50%",
    height: "90%",
    backgroundColor: "rgba(255, 255, 255, 0.3)", // Highlight selection
    borderRadius: 25,
  },
  text: {
    fontSize: 16,
    color: "#aaa",
    fontWeight: "500",
    zIndex: 1,
  },
  textSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
  iconButton: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:"#292929",
    borderRadius:'50%',
    marginHorizontal:10
  },
});

export default CustomSwitch;

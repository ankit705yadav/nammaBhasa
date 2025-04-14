import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

import Ionicons from "@expo/vector-icons/Ionicons";
import { TabBar } from "@/components/TabBar";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      // screenOptions={{
      //   tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
      //   headerShown: false,
      //   tabBarButton: HapticTab,
      //   tabBarBackground: TabBarBackground,
      //   tabBarStyle: Platform.select({
      //     ios: {
      //       // Use a transparent background on iOS to show the blur effect
      //       position: "absolute",
      //     },
      //     default: {},
      //   }),
      // }}

      tabBar={(props) => <TabBar {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Character",
          tabBarIcon: ({ color }) => (
            <Ionicons size={28} name="git-commit-sharp" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="word"
        options={{
          title: "Word",
          tabBarIcon: ({ color }) => (
            <Ionicons size={28} name="unlink" color="white" />
          ),
        }}
      />

      <Tabs.Screen
        name="sentence"
        options={{
          title: "Sentence",
          tabBarIcon: ({ color }) => (
            <Ionicons size={28} name="filter" color="white" />
          ),
        }}
      />
    </Tabs>
  );
}

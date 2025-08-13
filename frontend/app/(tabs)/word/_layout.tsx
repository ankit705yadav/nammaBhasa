import { Stack } from "expo-router";
import React from "react";

export default function WordStack() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="word" />
      <Stack.Screen name="wordGame" />
    </Stack>
  );
} 
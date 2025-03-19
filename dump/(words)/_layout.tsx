import { Stack } from "expo-router";
import React from "react";

export default function WordsStack() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="wordGame" />
    </Stack>
  );
} 
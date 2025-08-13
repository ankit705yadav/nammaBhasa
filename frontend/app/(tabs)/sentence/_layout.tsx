import { Stack } from "expo-router";
import React from "react";

export default function SentenceStack() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="sentence" />
      <Stack.Screen name="sentenceGame" />
    </Stack>
  );
} 
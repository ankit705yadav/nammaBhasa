import { Stack, useRouter, useSegments } from "expo-router";
import { useFonts, Poppins_100Thin as popIn } from "@expo-google-fonts/poppins";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import { Provider, useAuth } from "./context/auth";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const InitialLayout = () => {
  const { user } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === "(auth)";

    if (
      // If the user is not signed in and the initial segment is not anything in the auth group.
      !user &&
      !inAuthGroup
    ) {
      // Redirect to the sign-in page.
      router.replace("/(auth)/login");
    } else if (user && inAuthGroup) {
      // Redirect away from the sign-in page.
      console.log("user:", user);
      router.replace("/(tabs)/index");
    }
  }, [user, segments]);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
    </Stack>
  );
};

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    "PlaywriteRomania-Regular": require("../assets/fonts/PlaywriteRO-Regular.ttf"),
    "PlaywriteRomania-ExtraLight": require("../assets/fonts/PlaywriteRO-ExtraLight.ttf"),
    AnekKannada: require("../assets/fonts/AnekKannada.ttf"),
    popIn,
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <Provider>
      <InitialLayout />
    </Provider>
  );
}

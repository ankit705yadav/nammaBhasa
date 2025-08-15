import {
  View,
  TextInput,
  StyleSheet,
  Text,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { useState } from "react";
import { useAuth } from "../context/auth";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

export default function Login() {
  const { signIn, isLoading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      await signIn(email, password);
    } catch (err) {
      // Error is handled in the auth context
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
      <LinearGradient colors={["#e0be21", "black"]} style={styles.wrapper}>
        <Text style={styles.headerText}>
          ನಮ್ಮ ಭಾಷ<Text style={{ fontSize: 14 }}> | namma bhasha</Text>
        </Text>

        <View style={styles.formContainer}>
          {error && <Text style={styles.error}>{error}</Text>}

          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#8b8b8b"
          />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            placeholderTextColor="#8b8b8b"
          />

          {isLoading ? (
            <ActivityIndicator size="large" color="#e0be21" />
          ) : (
            <Pressable style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Sign In</Text>
            </Pressable>
          )}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#181C14",
    padding: 20,
  },
  headerText: {
    width: "100%",
    marginTop: "20%",
    marginBottom: "15%",
    textAlign: "left",
    fontSize: 44,
    fontWeight: "bold",
    color: "white",
    paddingHorizontal: 24,
  },
  formContainer: {
    width: "100%",
    paddingHorizontal: 24,
  },
  input: {
    height: 50,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderColor: "#e0be21",
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 15,
    borderRadius: 10,
    color: "white",
    fontSize: 16,
  },
  error: {
    color: "#ff6b6b",
    marginBottom: 20,
    textAlign: "center",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#e0be21",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "black",
    fontSize: 18,
    fontWeight: "bold",
  },
});

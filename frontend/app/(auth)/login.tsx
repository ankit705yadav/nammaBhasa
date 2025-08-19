import {
  View,
  TextInput,
  StyleSheet,
  Text,
  ActivityIndicator,
  Pressable,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState } from "react";
import { useAuth } from "../context/auth";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Link } from "expo-router";

const { width, height } = Dimensions.get("window");

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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
        <LinearGradient
          colors={["#e0be21", "black"]}
          style={styles.wrapper}
        >
          <View style={styles.contentContainer}>
            <View style={styles.headerContainer}>
              <Text style={styles.headerText}>
                ನಮ್ಮ ಭಾಷ
              </Text>
              <Text style={styles.subHeaderText}>namma bhasha</Text>
            </View>

            <View style={styles.formContainer}>
              {error && (
                <View style={styles.errorContainer}>
                  <AntDesign name="exclamationcircle" size={20} color="#ff6b6b" />
                  <Text style={styles.error}>{error}</Text>
                </View>
              )}

              <View style={styles.inputContainer}>
                <AntDesign name="user" size={20} color="#e0be21" style={styles.inputIcon} />
                <TextInput
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#8b8b8b"
                />
              </View>

              <View style={styles.inputContainer}>
                <AntDesign name="lock" size={20} color="#e0be21" style={styles.inputIcon} />
                <TextInput
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  style={styles.input}
                  placeholderTextColor="#8b8b8b"
                />
              </View>

              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#e0be21" />
                  <Text style={styles.loadingText}>Signing in...</Text>
                </View>
              ) : (
                <Pressable
                  style={({ pressed }) => [
                    styles.button,
                    pressed && styles.buttonPressed
                  ]}
                  onPress={handleLogin}
                >
                  <Text style={styles.buttonText}>Sign In</Text>
                  <AntDesign name="arrowright" size={20} color="black" style={styles.buttonIcon} />
                </Pressable>
              )}
            </View>

            <View style={{
              flexDirection: 'row',
              justifyContent: 'center',
              marginTop: 20
            }}>
              <Text style={{ color: '#666' }}>
                Don't have an account?{'  '}
              </Text>
              <Link href="/signUp" style={{ color: '#d4f756ff', fontWeight: 'bold' }}>
                  Sign Up
              </Link>
            </View>


          </View>
        </LinearGradient>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#181C14",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: height * 0.1, // Add some bottom padding to account for keyboard
  },
  headerContainer: {
    width: "100%",
    paddingHorizontal: 24,
    marginBottom: height * 0.05,
  },
  headerText: {
    fontSize: 44,
    fontWeight: "bold",
    color: "white",
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subHeaderText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 8,
    letterSpacing: 1,
  },
  formContainer: {
    width: "100%",
    paddingHorizontal: 24,
    alignItems: "center",
  },
  inputContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(224, 190, 33, 0.3)",
  },
  inputIcon: {
    padding: 15,
  },
  input: {
    flex: 1,
    height: 55,
    color: "white",
    fontSize: 16,
    paddingRight: 15,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 107, 107, 0.1)",
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    width: "100%",
  },
  error: {
    color: "#ff6b6b",
    marginLeft: 10,
    fontSize: 14,
  },
  loadingContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  loadingText: {
    color: "#e0be21",
    marginTop: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#e0be21",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonPressed: {
    backgroundColor: "#cca91d",
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: "black",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 10,
  },
  buttonIcon: {
    marginLeft: 8,
  },
});

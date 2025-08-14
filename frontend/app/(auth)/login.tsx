import { View, TextInput, Button, StyleSheet } from "react-native";
import { useAuth } from "../context/auth";

export default function Login() {
  const { signIn } = useAuth();

  return (
    <View style={styles.container}>
      <TextInput placeholder="Username" style={styles.input} />
      <TextInput placeholder="Password" secureTextEntry style={styles.input} />
      <Button title="Sign In" onPress={() => signIn()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
});

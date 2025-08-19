import { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  Alert,
  Button,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import { baseUrl } from "../../../constants/config";
import { useAuth } from "@/app/context/auth";

type LeaderboardItem = {
  username: string;
  highScore: number;
};

export default function LeaderboardScreen() {
   const { user } = useAuth();
  const router = useRouter();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State to manage which leaderboard is active
  const [activeQuizType, setActiveQuizType] =
    useState<"CHARACTER_QUIZ" | "WORD_QUIZ" | "SENTENCE_QUIZ">(
      "CHARACTER_QUIZ"
    );

  // Fetch leaderboard data when component mounts or quiz type changes
  useEffect(() => {
    fetchLeaderboard();
  }, [activeQuizType]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log(`Fetching leaderboard for quiz type: ${activeQuizType}`);
      const response = await fetch(
        `${baseUrl}/scores/leaderboard?quizType=${activeQuizType}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: LeaderboardItem[] = await response.json();
      setLeaderboardData(data);
    } catch (e) {
      const errMsg =
        e instanceof Error ? e.message : "Failed to fetch leaderboard.";
      setError(errMsg);
      Alert.alert("Error", errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Render each leaderboard row
  const renderItem = ({
    item,
    index,
  }: {
    item: LeaderboardItem;
    index: number;
  }) => (
    <View style={styles.itemContainer}>
      <Text style={[styles.itemText, styles.rank]}>{index + 1}</Text>
      <Text style={[styles.itemText, styles.username]}>{item.username}</Text>
      <Text style={[styles.itemText, styles.score]}>{item.highScore}</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e0be21" />
        <Text style={styles.loadingText}>Loading Leaderboard...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Retry" onPress={fetchLeaderboard} color="#e0be21" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
      <LinearGradient colors={["#e0be21", "black"]} style={styles.wrapper}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <AntDesign name="arrowleft" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Leaderboard</Text>
          <View style={{ width: 40 }} /> 
        </View>

        {/* Quiz Type Switcher */}
        <View style={styles.switcherContainer}>
          <TouchableOpacity
            style={[
              styles.switchButton,
              activeQuizType === "CHARACTER_QUIZ" && styles.activeSwitch,
            ]}
            onPress={() => setActiveQuizType("CHARACTER_QUIZ")}
          >
            <Text style={styles.switchText}>Characters</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.switchButton,
              activeQuizType === "WORD_QUIZ" && styles.activeSwitch,
            ]}
            onPress={() => setActiveQuizType("WORD_QUIZ")}
          >
            <Text style={styles.switchText}>Words</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.switchButton,
              activeQuizType === "SENTENCE_QUIZ" && styles.activeSwitch,
            ]}
            onPress={() => setActiveQuizType("SENTENCE_QUIZ")}
          >
            <Text style={styles.switchText}>Sentences</Text>
          </TouchableOpacity>
        </View>

        {/* Leaderboard List */}
        <FlatList
          data={leaderboardData}
          keyExtractor={(item, index) => `${item.username}-${index}`}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          ListHeaderComponent={() => (
            <View style={styles.listHeader}>
              <Text style={[styles.headerItem, styles.rank]}>#</Text>
              <Text style={[styles.headerItem, styles.username]}>Player</Text>
              <Text style={[styles.headerItem, styles.score]}>Score</Text>
            </View>
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No scores yet. Be the first!</Text>
            </View>
          )}
        />
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, padding: 20 },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backButton: { padding: 8 },
  headerText: { fontSize: 28, fontWeight: "bold", color: "white" },
  switcherContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 25,
    padding: 5,
    marginBottom: 20,
  },
  switchButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: "center",
  },
  activeSwitch: { backgroundColor: "#e0be21" },
  switchText: { color: "white", fontWeight: "bold" },
  listContainer: { paddingBottom: 20 },
  listHeader: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e0be21",
  },
  headerItem: { color: "#e0be21", fontWeight: "bold", fontSize: 16 },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 15,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 8,
    marginBottom: 10,
  },
  itemText: { color: "#E2DFE0", fontSize: 18 },
  rank: { flex: 0.15, fontWeight: "bold" },
  username: { flex: 0.55 },
  score: { flex: 0.3, textAlign: "right", fontWeight: "bold" },
  emptyContainer: { marginTop: 50, alignItems: "center" },
  emptyText: { color: "#999", fontSize: 16 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
  loadingText: { color: "white", marginTop: 10, fontSize: 18 },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
  errorText: { color: "red", marginBottom: 10, fontSize: 18 },
});

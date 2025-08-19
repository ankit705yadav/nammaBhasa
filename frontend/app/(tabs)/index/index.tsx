// eas build -p android --profile preview
import { useState, useEffect } from "react";
import {
  StyleSheet,
  Dimensions,
  FlatList,
  Text,
  View,
  Pressable,
  ActivityIndicator,
  Alert,
  Button,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../../context/auth";
import { Searchbar } from "react-native-paper";
import Modal from "react-native-modal";

import CustomSwitch from "@/components/CustomSwitch";
import { speakText } from "../../../utils/speak";
import { globalStyles } from "@/assets/theme/globalStyles";
import { baseUrl } from "@/constants/config";

const { width } = Dimensions.get("window");

type LetterItem = {
  id: number;
  kannadaChar: string;
  transliteration: string;
  type: string; // "vowel" or "consonant"
};

export default function HomeScreen() {
  const router = useRouter();
  const { signOut } = useAuth();

  const [activeTab, setActiveTab] = useState("Vowels");
  const [characters, setCharacters] = useState<LetterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCharacters, setFilteredCharacters] = useState<LetterItem[]>(
    []
  );

  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LetterItem | null>(null);

  const [showTransliteration, setShowTransliteration] = useState(true);

  useEffect(() => {
    fetchCharacters();
  }, [activeTab]);

  useEffect(() => {
    const dataToFilter = characters.filter(
      (item) => item.type === activeTab.toLowerCase().slice(0, -1)
    );
    const filtered = dataToFilter.filter(
      (item) =>
        item.kannadaChar.includes(searchQuery) ||
        item.transliteration.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCharacters(filtered);
  }, [searchQuery, activeTab, characters]);

  const fetchCharacters = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching characters for:", activeTab);
      const typeParam = activeTab === "Vowels" ? "vowel" : "consonant";
      const response = await fetch(`${baseUrl}/characters?type=${typeParam}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: LetterItem[] = await response.json();
      setCharacters(data);
    } catch (e: any) {
      setError(e.message);
      Alert.alert("Error", "Failed to fetch characters: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitch = (selectedOption: string) => {
    console.log("Selected:", selectedOption);
    setActiveTab(selectedOption);
  };

  const handleItemPress = (item: LetterItem) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  // Function to handle speaking text
  const handleSpeak = (letter: string) => {
    console.log("speak-Pressed:", letter);
    speakText(letter, 0.5);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e0be21" />
        <Text style={styles.loadingText}>Loading characters...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Retry" onPress={fetchCharacters} color="#e0be21" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "black", paddingBottom: 50 }}
    >
      <LinearGradient colors={["#e0be21", "black"]} style={styles.wrapper}>
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
            gap: 5,
            position: "absolute",
            right: 20,
            top: 5,
          }}
        >
          <Pressable
            style={styles.logoutButton}
            onPress={() => router.push("/LeaderboardScreen")}
          >
            <MaterialIcons name="leaderboard" size={24} color="white" />
          </Pressable>

          <Pressable
            style={styles.logoutButton}
            onPress={() => {
              Alert.alert("Logout", "Are you sure you want to logout?", [
                {
                  text: "Cancel",
                  style: "cancel",
                },
                {
                  text: "Logout",
                  onPress: () => signOut(),
                },
              ]);
            }}
          >
            <AntDesign name="logout" size={24} color="white" />
          </Pressable>
        </View>

        {/* Header */}
        <View style={styles.headerContainer}>
          <Pressable
            style={{ flex: 1 }}
            onLongPress={() => handleSpeak("ಕನ್ನಡ")}
          >
            <Text style={styles.headerText}>
              ಕನ್ನಡ<Text style={{ fontSize: 14 }}>| kannada</Text>{" "}
            </Text>
          </Pressable>
        </View>

        {/* search-bar */}
        <Searchbar
          placeholder="Search"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={{ marginHorizontal: 30, marginBottom: 12 }}
        />

        {/* Container */}
        <View style={{ flex: 1 }}>
          <FlatList
            data={filteredCharacters}
            keyExtractor={(item) => item.id.toString()}
            numColumns={4}
            contentContainerStyle={styles.gridContainer}
            renderItem={({ item }) => (
              <LinearGradient
                colors={["pink", "#e0be21"]} // Gradient colors for the border
                style={styles.borderContainer} // Outer gradient border
              >
                <Pressable
                  onPress={() => handleItemPress(item)}
                  onLongPress={() => handleSpeak(item.kannadaChar)}
                  style={styles.item} // Inner content
                >
                  <View style={styles.itemContent}>
                    <Text style={styles.letter}>{item.kannadaChar}</Text>
                    {showTransliteration && (
                      <Text style={styles.translit}>
                        {item.transliteration}
                      </Text>
                    )}
                  </View>
                </Pressable>
              </LinearGradient>
            )}
          />
        </View>

        {/* tab-switch */}
        <View style={globalStyles.customSwitchContainer}>
          <CustomSwitch
            options={["Vowels", "Consonants"]}
            onSwitch={handleSwitch}
            onLeft={() => router.push("/game")}
            onRight={() => setShowTransliteration(!showTransliteration)}
            initialIndex={activeTab === "Vowels" ? 0 : 1}
          />
        </View>

        <View
          style={{
            width: "100%",
            height: "40%",
            position: "absolute",
            bottom: 0,
          }}
        >
          <Modal
            isVisible={isModalVisible}
            onSwipeComplete={() => {
              setModalVisible(false);
              setSelectedItem(null);
            }}
            onBackdropPress={() => {
              setModalVisible(false);
              setSelectedItem(null);
            }}
            swipeDirection={["down"]}
            style={globalStyles.modal}
          >
            <View style={globalStyles.modalContent}>
              <View style={globalStyles.bar} />
              {selectedItem && (
                <View style={globalStyles.modalLetterContainer}>
                  {/* speech */}
                  <Pressable
                    onPress={() => handleSpeak(selectedItem.kannadaChar)}
                    style={globalStyles.speakerButton}
                  >
                    <AntDesign name="sound" size={28} color="#dad8de" />
                  </Pressable>

                  <Text style={globalStyles.modalLetter}>
                    {selectedItem.kannadaChar}
                  </Text>

                  <View style={globalStyles.modalBottomRow}>
                    <Text style={globalStyles.modalTranslit}>
                      {selectedItem.transliteration}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </Modal>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#181C14",
    justifyContent: "center",
    alignItems: "center",
  },

  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 24,
    marginTop: "20%",
    marginBottom: "5%",
  },

  logoutButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
  },

  headerText: {
    textAlign: "left",
    fontSize: 44,
    fontWeight: "bold",
    color: "white",
  },

  // container
  gridContainer: {
    paddingBottom: 80,
    padding: 10,
  },
  borderContainer: {
    backgroundColor: "grey",
    margin: 5,
    borderRadius: 12,
    padding: 3, // Creates space for the border effect
    width: width / 4 - 23, // Keeps the width same as before
    height: 80,
    zIndex: 100,
  },
  item: {
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgb(68, 50, 12)", // Set inner background color
    borderRadius: 10,
    width: "100%",
    height: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  itemContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    padding: 5,
  },
  letter: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#E2DFE0",
  },
  translit: {
    fontSize: 14,
    color: "#E2DFE0",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
  loadingText: {
    color: "white",
    marginTop: 10,
    fontSize: 18,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
  errorText: {
    color: "red",
    marginBottom: 10,
    fontSize: 18,
  },
});

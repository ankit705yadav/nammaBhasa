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
import AntDesign from "@expo/vector-icons/AntDesign";

import { Searchbar } from "react-native-paper";
import Modal from "react-native-modal";

import CustomSwitch from "@/components/CustomSwitch";
import { speakText } from "../../../utils/speak";
import { globalStyles } from "@/assets/theme/globalStyles";
import { baseUrl } from "@/constants/config";

const { width } = Dimensions.get("window"); 

type WordItem = {
  id: number;
  kannadaWord: string;
  transliteration: string;
  englishTranslation: string;
  level: number;
};

export default function WordScreen() {
  const router = useRouter();

  const [activeLevel, setActiveLevel] = useState("Lvl 1");
  const [words, setWords] = useState<WordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredWords, setFilteredWords] = useState<WordItem[]>([]);

  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WordItem | null>(null);

  const [showTranslation, setShowTranslation] = useState(true);

  useEffect(() => {
    fetchWords();
  }, [activeLevel]); // Refetch when activeLevel changes

  useEffect(() => {
    const levelNum = parseInt(activeLevel.replace("Lvl ", ""));
    const dataToFilter = words.filter((item) => item.level === levelNum);
    const filtered = dataToFilter.filter(
      (item) =>
        item.kannadaWord.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.transliteration
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        item.englishTranslation
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
    );
    setFilteredWords(filtered);
  }, [searchQuery, activeLevel, words]);

  const fetchWords = async () => {
    setLoading(true);
    setError(null);
    try {
      const levelParam = parseInt(activeLevel.replace("Lvl ", ""));
      const response = await fetch(
        `${baseUrl}/words?level=${levelParam}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: WordItem[] = await response.json();
      setWords(data);
    } catch (e: any) {
      setError(e.message);
      Alert.alert("Error", "Failed to fetch words: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitch = (selectedOption: string) => {
    console.log("Selected:", selectedOption);
    setActiveLevel(selectedOption);
  };

  const handleItemPress = (item: WordItem) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  // Function to handle speaking text
  const handleSpeak = (word: string) => {
    console.log("speak-Pressed:", word);
    speakText(word);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e0be21" />
        <Text style={styles.loadingText}>Loading words...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Retry" onPress={fetchWords} color="#e0be21" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "black", paddingBottom: 50 }}
    >
      <LinearGradient colors={["#e0be21", "black"]} style={styles.wrapper}>
        {/* Header */}
        <Pressable
          style={{ width: "100%" }}
          onLongPress={() => handleSpeak("ಪದ")}
        >
          <Text style={styles.headerText}>
            ಪದ<Text style={{ fontSize: 14 }}> | word</Text>
          </Text>
        </Pressable>

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
            data={filteredWords}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            renderItem={({ item }) => (
              <LinearGradient
                colors={["pink", "#e0be21"]} // Gradient colors for the border
                style={styles.borderContainer} // Outer gradient border
              >
                <Pressable
                  onPress={() => handleItemPress(item)}
                  onLongPress={() => handleSpeak(item.kannadaWord)}
                  style={styles.item} // Inner content
                >
                  <View style={styles.itemContent}>
                    <Text style={styles.word}>{item.kannadaWord}</Text>
                    {showTranslation && (
                      <Text style={styles.translation}>
                        {item.transliteration}
                      </Text>
                    )}
                  </View>
                </Pressable>
              </LinearGradient>
            )}
            contentContainerStyle={styles.gridContainer}
          />
        </View>

        {/* tab-switch */}
        <View style={globalStyles.customSwitchContainer}>
          <CustomSwitch
            options={["Lvl 1", "Lvl 2", "Lvl 3"]}
            onSwitch={handleSwitch}
            onLeft={() => router.push("/(tabs)/word/wordGame")}
            onRight={() => setShowTranslation(!showTranslation)}
            initialIndex={
              activeLevel === "Lvl 1" ? 0 : activeLevel === "Lvl 2" ? 1 : 2
            }
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
                <View style={globalStyles.modalWordContainer}>
                  <Pressable
                    onPress={() => handleSpeak(selectedItem.kannadaWord)}
                    style={globalStyles.speakerButton}
                  >
                    <AntDesign name="sound" size={28} color="#dad8de" />
                  </Pressable>

                  <Text style={globalStyles.modalWord}>
                    {selectedItem.kannadaWord}
                  </Text>
                  <Text style={globalStyles.modalTransliteration}>
                    {selectedItem.transliteration}
                  </Text>
                  <Text style={globalStyles.modalTranslation}>
                    {selectedItem.englishTranslation}
                  </Text>
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

  headerText: {
    width: "100%",
    marginTop: "20%",
    marginBottom: "5%",
    textAlign: "left",
    fontSize: 44,
    fontWeight: "bold",
    color: "white",
    paddingHorizontal: 24,
  },

  // container
  gridContainer: {
    padding: 10,
  },
  borderContainer: {
    backgroundColor: "grey",
    margin: 5,
    borderRadius: 12,
    padding: 3, // Creates space for the border effect
    width: width / 2 - 58, // Two columns instead of four
    height: 100, // Taller for words
    zIndex: 100,
  },
  item: {
    aspectRatio: 1.5, // Changed from 1 to accommodate words better
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
  word: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#E2DFE0",
    textAlign: "center",
  },
  translation: {
    fontSize: 14,
    color: "#E2DFE0",
    textAlign: "center",
    marginTop: 5,
  },

  itemContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    padding: 5,
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

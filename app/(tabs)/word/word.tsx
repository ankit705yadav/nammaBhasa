import { useState } from "react";
import {
  StyleSheet,
  Dimensions,
  FlatList,
  Text,
  View,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import { Searchbar } from "react-native-paper";
import Modal from "react-native-modal";

import CustomSwitch from "@/components/CustomSwitch";
import kannadaData from "../../../data/kannada_letters.json"; // Importing JSON

const { width } = Dimensions.get("window"); // Get screen width

type WordItem = {
  word: string;
  transliteration: string;
  translation: string;
  breakdown: string[];
  strokes: string[];
};

export default function WordScreen() {
  const router = useRouter();

  const [activeLevel, setActiveLevel] = useState("Lvl 1");
  // Get words from the updated structure
  const level1Words = kannadaData.Words?.Level1 || [];
  const level2Words = kannadaData.Words?.Level2 || [];
  const level3Words = kannadaData.Words?.Level3 || [];

  console.log("LLL", level1Words);

  const [searchQuery, setSearchQuery] = useState("");

  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WordItem | null>(null);

  const [showTranslation, setShowTranslation] = useState(true);

  const handleSwitch = (selectedOption: string) => {
    console.log("Selected:", selectedOption);
    setActiveLevel(selectedOption);
  };

  const handleItemPress = (item: WordItem) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  // Get the active words based on the selected level
  const getActiveWords = () => {
    switch (activeLevel) {
      case "Lvl 1":
        return level1Words;
      case "Lvl 2":
        return level2Words;
      case "Lvl 3":
        return level3Words;
      default:
        return level1Words;
    }
  };

  // Filter words based on search query
  const filteredWords = getActiveWords().filter(
    (item) =>
      item.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.transliteration.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.translation &&
        item.translation.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  console.log("filteredWords:", filteredWords);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#e0be21" }}>
      <LinearGradient colors={["#e0be21", "black"]} style={styles.wrapper}>
        {/* Header */}
        <Text style={styles.headerText}>
          ಪದ<Text style={{ fontSize: 14 }}> | word</Text>
        </Text>

        {/* search-bar */}
        <Searchbar
          placeholder="Search"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={{ marginHorizontal: 30, marginBottom: 12 }}
        />

        {/* Container */}
        <FlatList
          data={filteredWords}
          keyExtractor={(item, index) => index.toString()}
          numColumns={2}
          renderItem={({ item }) => (
            <LinearGradient
              colors={["pink", "#e0be21"]} // Gradient colors for the border
              style={styles.borderContainer} // Outer gradient border
            >
              <Pressable
                onPress={() => handleItemPress(item)}
                style={styles.item} // Inner content
              >
                <View style={styles.itemContent}>
                  <Text style={styles.word}>{item.word}</Text>
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

        {/* tab-switch */}
        <CustomSwitch
          options={["Lvl 1", "Lvl 2", "Lvl 3"]}
          onSwitch={handleSwitch}
          onLeft={() => router.push("/(tabs)/index/game")}
          onRight={() => setShowTranslation(!showTranslation)}
        />

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
            style={styles.modal}
          >
            <View style={styles.modalContent}>
              <View style={styles.bar} />
              {selectedItem && (
                <View style={styles.modalWordContainer}>
                  <Text style={styles.modalWord}>{selectedItem.word}</Text>
                  <Text style={styles.modalTranslation}>
                    {selectedItem.translation || selectedItem.transliteration}
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

  // modal
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  modalContent: {
    backgroundColor: "rgb(68, 50, 12)",
    padding: 22,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 300,
  },
  bar: {
    width: 60,
    height: 5,
    backgroundColor: "#bbb",
    alignSelf: "center",
    marginBottom: 10,
    borderRadius: 5,
  },

  itemContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    padding: 5,
  },

  itemPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },

  modalWordContainer: {
    alignItems: "center",
    padding: 20,
  },

  modalWord: {
    color: "#dad8de",
    fontSize: 60,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },

  modalTranslation: {
    fontSize: 24,
    color: "#dad8de",
    textAlign: "center",
  },
});

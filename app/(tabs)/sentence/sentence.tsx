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
import AntDesign from "@expo/vector-icons/AntDesign";

import { Searchbar } from "react-native-paper";
import Modal from "react-native-modal";

import CustomSwitch from "@/components/CustomSwitch";
import kannadaData from "../../../data/kannada_letters.json"; // Importing JSON

import { speakText } from "../../../utils/speak";
import { globalStyles } from "@/assets/theme/globalStyles";

const { width } = Dimensions.get("window"); // Get screen width

type SentenceItem = {
  sentence: string;
  transliteration: string;
  translation: string;
  breakdown: string[];
};

export default function SentenceScreen() {
  const router = useRouter();

  const [activeLevel, setActiveLevel] = useState("Lvl 1");
  // Get sentences from the updated structure
  const level1Sentences = kannadaData.Sentences?.Level1 || [];
  const level2Sentences = kannadaData.Sentences?.Level2 || [];
  const level3Sentences = kannadaData.Sentences?.Level3 || [];

  console.log("Sentences Level 1:", level1Sentences);

  const [searchQuery, setSearchQuery] = useState("");

  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SentenceItem | null>(null);

  const [showTranslation, setShowTranslation] = useState(true);

  const handleSwitch = (selectedOption: string) => {
    console.log("Selected:", selectedOption);
    setActiveLevel(selectedOption);
  };

  const handleItemPress = (item: SentenceItem) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  // Get the active sentences based on the selected level
  const getActiveSentences = () => {
    switch (activeLevel) {
      case "Lvl 1":
        return level1Sentences;
      case "Lvl 2":
        return level2Sentences;
      case "Lvl 3":
        return level3Sentences;
      default:
        return level1Sentences;
    }
  };

  // Filter sentences based on search query
  const filteredSentences = getActiveSentences().filter(
    (item) =>
      item.sentence.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.transliteration.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.translation &&
        item.translation.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  console.log("filteredSentences:", filteredSentences);

  // Function to handle speaking text
  const handleSpeak = (sentence: string) => {
    console.log("speak-Pressed:", sentence);
    speakText(sentence);
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "black", paddingBottom: 50 }}
    >
      <LinearGradient colors={["#e0be21", "black"]} style={styles.wrapper}>
        {/* Header */}

        <Pressable
          style={{ width: "100%" }}
          onLongPress={() => handleSpeak("ವಾಕ್ಯ")}
        >
          <Text style={styles.headerText}>
            ವಾಕ್ಯ<Text style={{ fontSize: 14 }}> | sentence</Text>
          </Text>
        </Pressable>

        {/* search-bar */}
        <Searchbar
          placeholder="Search"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={{ marginHorizontal: 30, marginBottom: 12 }}
        />

        {/* Container - Changed to a single column for sentences */}
        <View style={{ flex: 1 }}>
          <FlatList
            data={filteredSentences}
            keyExtractor={(item, index) => index.toString()}
            numColumns={1}
            renderItem={({ item }) => (
              <LinearGradient
                colors={["pink", "#e0be21"]} // Gradient colors for the border
                style={styles.borderContainer} // Outer gradient border
              >
                <Pressable
                  onPress={() => handleItemPress(item)}
                  onLongPress={() => handleSpeak(item.sentence)}
                  style={styles.item} // Inner content
                >
                  <View style={styles.itemContent}>
                    <Text style={styles.sentence}>{item.sentence}</Text>
                    {showTranslation && (
                      <Text style={styles.translation}>{item.translation}</Text>
                    )}
                  </View>
                </Pressable>
              </LinearGradient>
            )}
            contentContainerStyle={styles.listContainer}
          />
        </View>

        {/* tab-switch */}
        <View style={globalStyles.customSwitchContainer}>
          <CustomSwitch
            options={["Lvl 1", "Lvl 2", "Lvl 3"]}
            onSwitch={handleSwitch}
            onLeft={() => router.push("/(tabs)/sentence/sentenceGame")}
            onRight={() => setShowTranslation(!showTranslation)}
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
                <View style={globalStyles.modalSentenceContainer}>
                  <Pressable
                    onPress={() => handleSpeak(selectedItem.sentence)}
                    style={globalStyles.speakerButton}
                  >
                    <AntDesign name="sound" size={28} color="#dad8de" />
                  </Pressable>

                  <Text style={globalStyles.modalSentence}>
                    {selectedItem.sentence}
                  </Text>
                  <Text style={globalStyles.modalTransliteration}>
                    {selectedItem.transliteration}
                  </Text>
                  <Text style={globalStyles.modalTranslation}>
                    {selectedItem.translation}
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
  listContainer: {
    padding: 10,
    width: "100%",
  },
  borderContainer: {
    backgroundColor: "grey",
    margin: 5,
    borderRadius: 12,
    padding: 3, // Creates space for the border effect
    width: width - 60, // Full width with padding
    height: 100,
    minHeight: 100, // Taller for sentences
    zIndex: 100,
  },
  item: {
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
    padding: 15,
  },
  sentence: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#E2DFE0",
    textAlign: "center",
    marginBottom: 5,
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
});

import { useState } from "react";
import {
  Image,
  StyleSheet,
  Dimensions,
  FlatList,
  Text,
  View,
  TextInput,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as Speech from "expo-speech";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";

import { Searchbar } from "react-native-paper";
import Modal from "react-native-modal";

import CustomSwitch from "@/components/CustomSwitch";
import kannadaData from "../../../data/kannada_letters.json"; // Importing JSON

const { width } = Dimensions.get("window"); // Get screen width

type LetterItem = {
  letter: string;
  transliteration: string;
  // add other properties if they exist in your data
};

type VoiceInfo = {
  identifier: string;
  name: string;
  quality: string;
  language: string;
};

export default function HomeScreen() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("Vowels");
  const vowels = kannadaData.Vowels;
  const consonants = kannadaData.Consonants;

  const [searchQuery, setSearchQuery] = useState("");

  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LetterItem | null>(null);

  const [showTransliteration, setShowTransliteration] = useState(true);

  // New state for speech voices and language
  const [availableVoices, setAvailableVoices] = useState<VoiceInfo[]>([]);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState(0);
  const [currentLanguage, setCurrentLanguage] = useState("en");

  const handleSwitch = (selectedOption: string) => {
    console.log("Selected:", selectedOption);
    // Update the active tab based on the selected option directly
    setActiveTab(selectedOption);
  };

  const handleItemPress = (item: LetterItem) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  // Function to speak the selected character's transliteration
  const speakText = (transliteration: string) => {
    console.log("speak-Pressed:",transliteration);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (transliteration) {
      // Use the currently selected voice if available
      const options: Speech.SpeechOptions = {
        language: currentLanguage,
        pitch: 1.0,
        rate: 0.9,
      };

      if (
        availableVoices.length > 0 &&
        selectedVoiceIndex < availableVoices.length
      ) {
        options.voice = availableVoices[selectedVoiceIndex].identifier;
      }

      Speech.speak(transliteration, options);
    }
  };



  // Function to cycle to the next available language
  const cycleLanguage = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    if (availableVoices.length === 0) return;

    const nextIndex = (selectedVoiceIndex + 1) % availableVoices.length;
    setSelectedVoiceIndex(nextIndex);
    setCurrentLanguage(availableVoices[nextIndex].language);

    // Show feedback about the selected language
    console.log(
      `Language changed to: ${availableVoices[nextIndex].language} (${availableVoices[nextIndex].name})`
    );
  };



  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#e0be21" }}>
      <LinearGradient colors={["#e0be21", "black"]} style={styles.wrapper}>
        {/* Header */}
        <Text style={styles.headerText}>
          ಕನ್ನಡ<Text style={{ fontSize: 14 }}>| kannada</Text>{" "}
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
          data={activeTab === "Vowels" ? vowels : consonants}
          keyExtractor={(item, index) => index.toString()}
          numColumns={4}
          renderItem={({ item }) => (
            <LinearGradient
              colors={["pink", "#e0be21"]} // Gradient colors for the border
              style={styles.borderContainer} // Outer gradient border
            >
              <Pressable
                onPress={() => handleItemPress(item)}
                onLongPress={() => speakText(item.transliteration)}
                style={styles.item} // Inner content
              >
                <View style={styles.itemContent}>
                  <Text style={styles.letter}>{item.letter}</Text>
                  {showTransliteration && (
                    <Text style={styles.translit}>{item.transliteration}</Text>
                  )}
                </View>
              </Pressable>
            </LinearGradient>
          )}
          contentContainerStyle={styles.gridContainer}
        />

        {/* tab-switch */}
        <CustomSwitch
          options={["Vowels", "Consonants"]}
          onSwitch={handleSwitch}
          onLeft={() => router.push("/game")}
          onRight={() => setShowTransliteration(!showTransliteration)}
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
                <View style={styles.modalLetterContainer}>
                  {/* speech */}
                  <Pressable
                    onPress={cycleLanguage}
                    onLongPress={() => speakText(selectedItem.transliteration)}
                    style={styles.speakerButton}
                  >
                    <Ionicons name="language" size={28} color="#dad8de" />
                  </Pressable>

                  <Pressable
                    onPress={() => speakText(selectedItem.transliteration)}
                    onLongPress={() => speakText(selectedItem.transliteration)}
                  >
                    <Text style={styles.modalLetter}>
                      {selectedItem.letter}
                    </Text>
                  </Pressable>
                  <View style={styles.modalBottomRow}>
                    <Text style={styles.modalTranslit}>
                      {selectedItem.transliteration}
                    </Text>
                  </View>

                  {/* Display current language */}
                  {availableVoices.length > 0 && (
                    <Text style={styles.languageIndicator}>
                      Language:{" "}
                      {availableVoices[selectedVoiceIndex]?.language || "en"}
                    </Text>
                  )}
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
    // borderWidth:4,
    // borderColor:"yellow",
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
  letter: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#E2DFE0",
  },
  translit: {
    fontSize: 14,
    color: "#E2DFE0",
  },

  // modal
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  modalContent: {
    // backgroundColor: "#1b212a",
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
  },

  itemPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },

  modalLetterContainer: {
    alignItems: "center",
    padding: 20,
  },

  modalLetter: {
    color: "#dad8de",
    fontSize: 120,
    fontWeight: "bold",
    marginBottom: 10,
  },

  modalTranslit: {
    fontSize: 24,
    color: "#dad8de",
    marginRight: 10,
  },

  modalBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  speakerButton: {
    position: "absolute",
    right: 10,
    padding: 8,
  },

  languageIndicator: {
    color: "#dad8de",
    fontSize: 16,
    marginTop: 15,
    opacity: 0.8,
  },
});

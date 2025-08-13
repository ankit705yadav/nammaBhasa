// eas build -p android --profile preview
import { useState, useEffect } from "react";
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

type LetterItem = {
  letter: string;
  speak: string;
  transliteration: string;
};

export default function HomeScreen() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("Vowels");
  const vowels = kannadaData.Vowels;
  const consonants = kannadaData.Consonants;

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredVowels, setFilteredVowels] = useState<LetterItem[]>([]);

  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LetterItem | null>(null);

  const [showTransliteration, setShowTransliteration] = useState(true);

  useEffect(() => {
    const data = activeTab === "Vowels" ? vowels : consonants;
    const filtered = data.filter(
      (item) =>
        item.letter.includes(searchQuery) ||
        item.transliteration.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredVowels(filtered);
  }, [searchQuery, activeTab]);

  const handleSwitch = (selectedOption: string) => {
    console.log("Selected:", selectedOption);
    // Update the active tab based on the selected option directly
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

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "black", paddingBottom: 50 }}
    >
      <LinearGradient colors={["#e0be21", "black"]} style={styles.wrapper}>
        {/* Header */}
        <Pressable
          style={{ width: "100%" }}
          onLongPress={() => handleSpeak("ಕನ್ನಡ")}
        >
          <Text style={styles.headerText}>
            ಕನ್ನಡ<Text style={{ fontSize: 14 }}>| kannada</Text>{" "}
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
            data={filteredVowels}
            keyExtractor={(item, index) => index.toString()}
            numColumns={4}
            contentContainerStyle={styles.gridContainer}
            renderItem={({ item }) => (
              <LinearGradient
                colors={["pink", "#e0be21"]} // Gradient colors for the border
                style={styles.borderContainer} // Outer gradient border
              >
                <Pressable
                  onPress={() => handleItemPress(item)}
                  onLongPress={() => handleSpeak(item.speak)}
                  style={styles.item} // Inner content
                >
                  <View style={styles.itemContent}>
                    <Text style={styles.letter}>{item.letter}</Text>
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
                    onPress={() => handleSpeak(selectedItem.speak)}
                    style={globalStyles.speakerButton}
                  >
                    <AntDesign name="sound" size={28} color="#dad8de" />
                  </Pressable>

                  <Text style={globalStyles.modalLetter}>
                    {selectedItem.letter}
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
});

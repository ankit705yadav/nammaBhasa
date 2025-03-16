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

import { Searchbar } from "react-native-paper";
import Modal from "react-native-modal";

import CustomSwitch from "@/components/CustomSwitch";
import kannadaData from "../../data/kannada_letters.json"; // Importing JSON

const { width } = Dimensions.get("window"); // Get screen width

type LetterItem = {
  letter: string;
  transliteration: string;
  // add other properties if they exist in your data
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

  const handleSwitch = (selectedOption: string) => {
    console.log("Selected:", selectedOption);
    // Update the active tab based on the selected option directly
    setActiveTab(selectedOption);
  };

  const handleItemPress = (item: LetterItem) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.wrapper}>
      {/* Header */}
      <Text style={styles.headerText}>Kannada</Text>

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
          <Pressable
            // onPress={() => handleItemPress(item)}
            style={({ pressed }) => [
              styles.item,
              pressed && styles.itemPressed,
            ]}
          >
            <View style={styles.itemContent}>
              <Text style={styles.letter}>{item.letter}</Text>
              {showTransliteration && (
                <Text style={styles.translit}>{item.transliteration}</Text>
              )}
            </View>
          </Pressable>
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

      {/* <Modal
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
              <Text style={styles.modalLetter}>{selectedItem.letter}</Text>
              <Text style={styles.modalTranslit}>
                {selectedItem.transliteration}
              </Text>
            </View>
          )}
        </View>
      </Modal> */}
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
    fontSize: 34,
    fontWeight: "bold",
    color: "white",
    paddingHorizontal: 24,
  },

  // container
  gridContainer: {
    padding: 10,
  },
  item: {
    width: width / 4 - 32, // Divide screen width by 4
    aspectRatio: 1, // Makes it a square
    margin: 5,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "grey",
    borderRadius: 10,
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
    backgroundColor: "white",
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
    fontSize: 48,
    fontWeight: "bold",
    marginBottom: 10,
  },

  modalTranslit: {
    fontSize: 24,
    color: "#666",
  },
});

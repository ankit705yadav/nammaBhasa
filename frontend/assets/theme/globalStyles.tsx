import { StyleSheet } from "react-native";

export const globalStyles = StyleSheet.create({
  // --- modal Start ---
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
  customSwitchContainer: {
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
  },
  //   word(modal)
  modalWordContainer: {
    alignItems: "center",
    padding: 20,
  },
  modalWord: {
    marginTop: 24,
    color: "#dad8de",
    fontSize: 60,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalTransliteration: {
    fontSize: 20,
    color: "#dad8de",
    textAlign: "center",
    marginBottom: 15,
    fontStyle: "italic",
  },
  modalTranslation: {
    fontSize: 24,
    color: "#dad8de",
  },
  //   sentence(modal)
  modalSentenceContainer: {
    alignItems: "center",
    padding: 20,
  },
  modalSentence: {
    marginTop: 20,
    color: "#dad8de",
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  // --- Modal End ---
});

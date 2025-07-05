import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import kannadaLetters from "../../../data/kannada_letters.json";
import { speakText } from "../../../utils/speak";

const KannadaQuiz = () => {
  const [question, setQuestion] = useState(null);
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [showCorrect, setShowCorrect] = useState(false);

  const navigation = useNavigation();

  useEffect(() => {
    const parent = navigation.getParent();
    parent?.setOptions({
      tabBarVisible: false,
    });

    return () => {
      parent?.setOptions({
        tabBarVisible: true,
      });
    };
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      const init = async () => {
        try {
          // await AsyncStorage.removeItem("HIGH_SCORE");
          const storedHighScore = await AsyncStorage.getItem("HIGH_SCORE");
          if (storedHighScore !== null) {
            setHighScore(parseInt(storedHighScore));
          }
        } catch (e) {
          console.error("Error loading high score:", e);
        }
        restartGame();
      };
      init();
    }, [])
  );

  const getRandomLetter = (list) =>
    list[Math.floor(Math.random() * list.length)];

  const generateQuestion = () => {
    if (wrongCount >= 4) {
      setGameOver(true);
      return;
    }

    setSelectedAnswer(null);
    setShowCorrect(false);

    const allLetters = [...kannadaLetters.Vowels, ...kannadaLetters.Consonants];
    const correct = getRandomLetter(allLetters);

    // ✅ Debug log
    console.log(
      "Correct Letter:",
      correct.letter,
      "| Transliteration:",
      correct.transliteration,
      "| Translation:",
      correct.translation
    );

    const incorrectOptions = allLetters
      .filter((l) => l.letter !== correct.letter)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const choices = [...incorrectOptions, correct].sort(
      () => Math.random() - 0.5
    );

    setQuestion(correct);
    setOptions(choices);
  };

  const handleAnswer = async (answer) => {
    setSelectedAnswer(answer);
    if (answer === question.transliteration) {
      const newScore = score + 1;
      setScore(newScore);

      if (newScore > highScore) {
        // Update high score state & save it
        setHighScore(newScore);
        try {
          await AsyncStorage.setItem("HIGH_SCORE", newScore.toString());
        } catch (e) {
          console.error("Failed to save high score", e);
        }
      }

      setTimeout(() => generateQuestion(), 1000);
    } else {
      setWrongCount(wrongCount + 1);
      setShowCorrect(true);

      if (wrongCount + 1 >= 4) {
        setTimeout(() => setGameOver(true), 1000);
      } else {
        setTimeout(() => generateQuestion(), 1000);
      }
    }
  };

  const restartGame = () => {
    setScore(0);
    setWrongCount(0);
    setGameOver(false);
    generateQuestion();
  };

  // 🚀 Reset the game each time the screen is visited
  useFocusEffect(
    useCallback(() => {
      restartGame();
    }, [])
  );

  // Function to handle speaking text
  const handleSpeak = (letter: string) => {
    console.log("speak-Pressed:", letter);
    speakText(letter, 0.5);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#e0be21" }}>
      <LinearGradient colors={["#e0be21", "black"]} style={styles.wrapper}>
        {/* Scores */}
        <View
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            backgroundColor: "rgba(0,0,0,0.7)",
            paddingVertical: 6,
            paddingHorizontal: 10,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold", fontSize: 14 }}>
            Score: {score} | High Score: {highScore} | Wrong: {wrongCount}/4
          </Text>
        </View>

        <Text style={styles.title}>Kannada Quiz</Text>

        {gameOver ? (
          <View style={styles.gameOverContainer}>
            <Text style={styles.gameOverText}>Game Over! 😢</Text>
            <Text style={styles.finalScore}>Final Score: {score}</Text>
            <TouchableOpacity style={styles.restartBtn} onPress={restartGame}>
              <Text style={styles.restartText}>Restart</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Pressable
              // onLongPress={() => handleSpeak(question?.letter)}
              style={{ width: "100%" }} // Inner content
            >
              <Text style={styles.question}>{question?.letter}</Text>
            </Pressable>
            <View style={styles.optionsContainer}>
              {options.map((option) => (
                <TouchableOpacity
                  key={option.transliteration}
                  style={[
                    styles.option,
                    selectedAnswer === option.transliteration &&
                      (option.transliteration === question.transliteration
                        ? styles.correct
                        : styles.wrong),
                    showCorrect &&
                      option.transliteration === question.transliteration &&
                      styles.flashCorrect,
                  ]}
                  onPress={() => handleAnswer(option.transliteration)}
                  disabled={selectedAnswer !== null}
                >
                  <Text style={styles.optionText}>
                    {option.transliteration}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    // flex: 1,
    // justifyContent: "center",
    // alignItems: "center",
    // backgroundColor: "#181C14",
    // borderWidth:4,
    // borderColor:"yellow",
    flex: 1,
    backgroundColor: "#181C14",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    color: "white",
    fontWeight: "bold",
    marginBottom: 20,
  },
  question: {
    fontSize: 50,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "white",
  },
  optionsContainer: {
    width: "80%",
    alignItems: "center",
  },
  option: {
    backgroundColor: "#ddd",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    marginVertical: 10,
  },
  correct: {
    backgroundColor: "#4CAF50",
  },
  wrong: {
    backgroundColor: "#E53935",
  },
  flashCorrect: {
    backgroundColor: "#4CAF50",
  },
  optionText: {
    fontSize: 20,
    fontWeight: "600",
  },

  gameOverContainer: {
    alignItems: "center",
  },
  gameOverText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#D32F2F",
  },
  finalScore: {
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 10,
  },
  restartBtn: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  restartText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
});

export default KannadaQuiz;

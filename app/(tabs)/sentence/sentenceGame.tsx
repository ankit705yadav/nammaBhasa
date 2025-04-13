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
import { speakText } from "../../../utils/utils";

// Define a type for the sentence objects in our data
type SentenceItem = {
  sentence: string;
  transliteration: string;
  translation: string;
  breakdown: string[];
};

const SentenceQuiz = () => {
  const [question, setQuestion] = useState<SentenceItem | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [showCorrect, setShowCorrect] = useState(false);
  const [quizMode, setQuizMode] = useState<"translation" | "transliteration">(
    "translation",
  );
  const [difficulty, setDifficulty] = useState<"Level1" | "Level2" | "Level3">(
    "Level1",
  );

  const navigation = useNavigation();

  useEffect(() => {
    // Hide the tab bar when component mounts
    navigation.getParent()?.setOptions({
      tabBarStyle: { display: "none" },
    });
    // Show the tab bar when component unmounts
    return () =>
      navigation.getParent()?.setOptions({
        tabBarStyle: undefined,
      });
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      const init = async () => {
        try {
          // await AsyncStorage.removeItem("HIGH_SCORE_SENTENCE");
          const storedHighScore = await AsyncStorage.getItem(
            "HIGH_SCORE_SENTENCE",
          );
          if (storedHighScore !== null) {
            setHighScore(parseInt(storedHighScore));
          }
        } catch (e) {
          console.error("Error loading high score:", e);
        }
        restartGame();
      };
      init();
    }, []),
  );

  // Get a random sentence from the specified level
  const getRandomSentence = (sentences: SentenceItem[]): SentenceItem =>
    sentences[Math.floor(Math.random() * sentences.length)];

  // Get all sentences across all levels
  const getAllSentences = (): SentenceItem[] => {
    return [
      ...(kannadaLetters.Sentences?.Level1 || []),
      ...(kannadaLetters.Sentences?.Level2 || []),
      ...(kannadaLetters.Sentences?.Level3 || []),
    ];
  };

  // Get sentences for the current difficulty level
  const getSentencesByLevel = (): SentenceItem[] => {
    return kannadaLetters.Sentences?.[difficulty] || [];
  };

  const generateQuestionWithMode = (
    mode: "translation" | "transliteration",
  ) => {
    if (wrongCount >= 4) {
      setGameOver(true);
      return;
    }

    setSelectedAnswer(null);
    setShowCorrect(false);

    const sentencesForLevel = getSentencesByLevel();
    const allSentences = getAllSentences();

    if (sentencesForLevel.length === 0) {
      console.error("No sentences found for the selected level");
      return;
    }

    const correct = getRandomSentence(sentencesForLevel);

    // Create incorrect options based on the passed mode parameter
    let incorrectPool = allSentences.filter(
      (s) => s.sentence !== correct.sentence,
    );
    const incorrectOptions = incorrectPool
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((sentence) =>
        mode === "translation"
          ? sentence.translation
          : sentence.transliteration,
      );

    // Correct answer based on the passed mode parameter
    const correctAnswer =
      mode === "translation" ? correct.translation : correct.transliteration;

    // ✅ Debug log
    console.log(
      "Correct Answer:",
      correctAnswer,
      " | Mode:",
      mode,
      " | Sentence:",
      correct.sentence,
    );

    // Combine and shuffle all options
    const choices = [...incorrectOptions, correctAnswer].sort(
      () => Math.random() - 0.5,
    );

    setQuestion(correct);
    setOptions(choices);
  };

  const generateQuestion = () => {
    generateQuestionWithMode(quizMode);
  };

  const handleAnswer = async (answer: string) => {
    setSelectedAnswer(answer);
    if (question) {
      const correctAnswer =
        quizMode === "translation"
          ? question.translation
          : question.transliteration;

      if (answer === correctAnswer) {
        const newScore = score + 1;
        setScore(newScore);

        if (newScore > highScore) {
          setHighScore(newScore);
          try {
            await AsyncStorage.setItem(
              "HIGH_SCORE_SENTENCE",
              newScore.toString(),
            );
          } catch (e) {
            console.error("Failed to save high score", e);
          }
        }

        setTimeout(() => generateQuestion(), 1000);
      } else {
        const newWrongCount = wrongCount + 1;
        setWrongCount(newWrongCount);
        setShowCorrect(true);

        if (newWrongCount >= 4) {
          setTimeout(() => setGameOver(true), 1000);
        } else {
          setTimeout(() => generateQuestion(), 1000);
        }
      }
    }
  };

  const restartGame = () => {
    setScore(0);
    setWrongCount(0);
    setGameOver(false);
    generateQuestion();
  };

  // Change difficulty level
  const cycleDifficulty = () => {
    if (difficulty === "Level1") setDifficulty("Level2");
    else if (difficulty === "Level2") setDifficulty("Level3");
    else setDifficulty("Level1");

    restartGame();
  };

  // Toggle between translation and transliteration modes
  const toggleQuizMode = () => {
    const newMode =
      quizMode === "translation" ? "transliteration" : "translation";
    setQuizMode(newMode);

    // Reset game with the new mode
    setScore(0);
    setWrongCount(0);
    setGameOver(false);

    // We need to explicitly use the new mode here instead of relying on the state
    generateQuestionWithMode(newMode);
  };

  // Reset the game each time the screen is visited
  useFocusEffect(
    useCallback(() => {
      restartGame();
    }, []),
  );

  // Function to handle speaking text
  const handleSpeak = (transliteration: string) => {
    console.log("speak-Pressed:", transliteration);
    speakText(transliteration);
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

        <Text style={styles.title}>
          Kannada Sentence Quiz {difficulty.replace("Level", "Lvl ")}
        </Text>

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
            <Text style={styles.questionPrompt}>
              What is the{" "}
              {quizMode === "translation" ? "meaning" : "transliteration"} of:
            </Text>
            <Pressable
              onLongPress={() => handleSpeak(question?.sentence)}
              style={{ width: "100%" }} // Inner content
            >
              <Text style={styles.question}>{question?.sentence}</Text>
            </Pressable>

            <View style={styles.optionsContainer}>
              {options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.option,
                    selectedAnswer === option &&
                      question &&
                      (option ===
                      (quizMode === "translation"
                        ? question.translation
                        : question.transliteration)
                        ? styles.correct
                        : styles.wrong),
                    showCorrect &&
                      question &&
                      option ===
                        (quizMode === "translation"
                          ? question.translation
                          : question.transliteration) &&
                      styles.flashCorrect,
                  ]}
                  onPress={() => handleAnswer(option)}
                  disabled={selectedAnswer !== null}
                >
                  <Text style={styles.optionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.controlsContainer}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={cycleDifficulty}
              >
                <Text style={styles.controlButtonText}>Change Level</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlButton}
                onPress={toggleQuizMode}
              >
                <Text style={styles.controlButtonText}>
                  {quizMode === "translation"
                    ? "Switch to Transliteration"
                    : "Switch to Translation"}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#181C14",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    color: "white",
    fontWeight: "bold",
    marginBottom: 20,
  },
  questionPrompt: {
    fontSize: 18,
    color: "#ddd",
    marginBottom: 10,
  },
  question: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 30,
    color: "white",
    textAlign: "center",
    padding: 10,
  },
  optionsContainer: {
    width: "85%",
    alignItems: "center",
  },
  option: {
    backgroundColor: "#ddd",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    marginVertical: 8,
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
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  gameOverContainer: {
    alignItems: "center",
  },
  gameOverText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#D32F2F",
    marginBottom: 10,
  },
  finalScore: {
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 10,
    color: "white",
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
  controlsContainer: {
    marginTop: 20,
    width: "85%",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  controlButton: {
    backgroundColor: "#FF9800",
    padding: 12,
    borderRadius: 8,
    marginVertical: 5,
    alignItems: "center",
  },
  controlButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default SentenceQuiz;

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import kannadaLetters from "../../../data/kannada_letters.json";

// Define a type for the word objects in our data
type WordItem = {
  word: string;
  transliteration: string;
  translation: string;
  breakdown: string[];
  strokes: string[];
};

const WordQuiz = () => {
  const [question, setQuestion] = useState<WordItem | null>(null);
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
          // await AsyncStorage.removeItem("HIGH_SCORE_WORD");
          const storedHighScore = await AsyncStorage.getItem("HIGH_SCORE_WORD");
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

  // Get a random word from the specified level
  const getRandomWord = (words: WordItem[]): WordItem =>
    words[Math.floor(Math.random() * words.length)];

  // Get all words across all levels
  const getAllWords = (): WordItem[] => {
    return [
      ...(kannadaLetters.Words?.Level1 || []),
      ...(kannadaLetters.Words?.Level2 || []),
      ...(kannadaLetters.Words?.Level3 || []),
    ];
  };

  // Get words for the current difficulty level
  const getWordsByLevel = (): WordItem[] => {
    return kannadaLetters.Words?.[difficulty] || [];
  };

  const generateQuestion = () => {
    if (wrongCount >= 4) {
      setGameOver(true);
      return;
    }

    setSelectedAnswer(null);
    setShowCorrect(false);

    const wordsForLevel = getWordsByLevel();
    const allWords = getAllWords();

    if (wordsForLevel.length === 0) {
      console.error("No words found for the selected level");
      return;
    }

    const correct = getRandomWord(wordsForLevel);

    // Create incorrect options based on quiz mode
    let incorrectPool = allWords.filter((w) => w.word !== correct.word);
    const incorrectOptions = incorrectPool
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((word) => {
        const option =
          quizMode === "translation" ? word.translation : word.transliteration;
        return option.trim();
      });

    // Correct answer based on quiz mode - trim to avoid whitespace issues
    const correctAnswer = (
      quizMode === "translation" ? correct.translation : correct.transliteration
    ).trim();

    // ✅ Debug log
    console.log("Current mode:", quizMode);
    console.log("Correct word:", correct.word);
    console.log("Correct answer for this mode:", correctAnswer);

    // Combine and shuffle all options
    const choices = [...incorrectOptions, correctAnswer].sort(
      () => Math.random() - 0.5,
    );

    setQuestion(correct);
    setOptions(choices);
  };

  const handleAnswer = async (answer: string) => {
    setSelectedAnswer(answer);
    if (question) {
      // Ensure we're comparing trimmed strings to avoid whitespace issues
      const correctAnswer = (
        quizMode === "translation"
          ? question.translation
          : question.transliteration
      ).trim();
      const trimmedAnswer = answer.trim();

      // Case-insensitive comparison for transliteration mode
      const isCorrect =
        quizMode === "translation"
          ? trimmedAnswer === correctAnswer
          : trimmedAnswer.toLowerCase() === correctAnswer.toLowerCase();

      console.log(
        "Comparing:",
        trimmedAnswer,
        "with correct answer:",
        correctAnswer,
        "Result:",
        isCorrect,
      ); // Debugging

      if (isCorrect) {
        const newScore = score + 1;
        setScore(newScore);

        if (newScore > highScore) {
          setHighScore(newScore);
          try {
            await AsyncStorage.setItem("HIGH_SCORE_WORD", newScore.toString());
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
    // Update quizMode first, then restart with the new mode
    setQuizMode((prevMode) => {
      const newMode =
        prevMode === "translation" ? "transliteration" : "translation";
      console.log("Switching quiz mode to:", newMode);
      return newMode;
    });
    // Don't call restartGame() here - we'll use useEffect instead
  };

  // Add effect to handle mode changes
  useEffect(() => {
    console.log("Quiz mode changed to:", quizMode);
    if (score > 0 || wrongCount > 0) {
      // Only restart if a game is already in progress
      restartGame();
    } else {
      // Just generate a new question
      generateQuestion();
    }
  }, [quizMode, difficulty]);

  // 🚀 Reset the game each time the screen is visited
  useFocusEffect(
    useCallback(() => {
      restartGame();
    }, []),
  );

  // Render options with better comparison logic
  const renderOptions = () => {
    return options.map((option, index) => {
      const isSelected = selectedAnswer === option;
      const trimmedOption = option.trim();
      const correctAnswer = question
        ? (quizMode === "translation"
            ? question.translation
            : question.transliteration
          ).trim()
        : "";

      // Use the same comparison logic as handleAnswer
      const isCorrect =
        quizMode === "translation"
          ? trimmedOption === correctAnswer
          : trimmedOption.toLowerCase() === correctAnswer.toLowerCase();

      const shouldHighlightCorrect = showCorrect && isCorrect;

      return (
        <TouchableOpacity
          key={index}
          style={[
            styles.option,
            isSelected && (isCorrect ? styles.correct : styles.wrong),
            shouldHighlightCorrect && styles.flashCorrect,
          ]}
          onPress={() => handleAnswer(option)}
          disabled={selectedAnswer !== null}
        >
          <Text style={styles.optionText}>{option}</Text>
        </TouchableOpacity>
      );
    });
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
          Kannada Word Quiz {difficulty.replace("Level", "Lvl ")}
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
            <Text style={styles.question}>{question?.word}</Text>

            <View style={styles.optionsContainer}>{renderOptions()}</View>

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
    fontSize: 40,
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

export default WordQuiz;

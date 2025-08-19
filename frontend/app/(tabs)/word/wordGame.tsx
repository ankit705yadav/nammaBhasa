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
  ToastAndroid,
  ActivityIndicator, 
  Alert, 
  Button, 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { speakText } from "../../../utils/speak";
import { baseUrl } from "@/constants/config";
import { useAuth } from "../../context/auth";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";


type WordItem = {
  id: number;
  kannadaWord: string;
  transliteration: string;
  englishTranslation: string;
  level: number;
};

type UserScore = {
  id: number;
  quizType: string;
  highScore: number;
};

const WordQuiz = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [question, setQuestion] = useState<WordItem | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [showCorrect, setShowCorrect] = useState(false);
  const [quizMode, setQuizMode] = useState<"translation" | "transliteration">(
    "translation"
  );
  const [difficulty, setDifficulty] = useState<"Level1" | "Level2" | "Level3">(
    "Level1"
  );
  const [allWords, setAllWords] = useState<WordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          await fetchAllWords(); // Fetch all words first
          await fetchUserHighScore(); // Fetch high score
        } catch (e) {
          console.error("Error loading high score or words:", e);
          setError((e as Error).message);
        }
      };
      init();
    }, [])
  );

  useEffect(() => {
    if (allWords.length > 0 && !loading && !error) {
      restartGame();
    }
  }, [allWords, loading, error, quizMode, difficulty]); 

  const fetchAllWords = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/words`); // Fetch all words without level filter
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: WordItem[] = await response.json();
      setAllWords(data);
    } catch (e: any) {
      setError(e.message);
      Alert.alert("Error", "Failed to fetch words for game: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserHighScore = async () => {
    try {
      if (user?.token) {
        const response = await fetch(`${baseUrl}/scores/me`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          }
        });

        const responseText = await response.text();
        console.log('Response body:', responseText);

        if (!response.ok) {
          throw new Error(`Failed to fetch high score: ${response.status} ${responseText}`);
        }

        const scores: UserScore[] = responseText ? JSON.parse(responseText) : [];
        const wordQuizScore = scores.find((score: UserScore) => score.quizType === 'WORD_QUIZ');
        if (wordQuizScore) {
          setHighScore(wordQuizScore.highScore);
          await AsyncStorage.setItem('HIGH_SCORE_WORD', wordQuizScore.highScore.toString());
          return;
        }
      } else {
        console.log('No user token available');
      }

      // If no user or no backend score, fall back to local storage
      const storedHighScore = await AsyncStorage.getItem("HIGH_SCORE_WORD");
      if (storedHighScore !== null) {
        setHighScore(parseInt(storedHighScore));
      }
    } catch (error) {
      console.error('Error fetching high score:', error);
      const storedHighScore = await AsyncStorage.getItem("HIGH_SCORE_WORD");
      if (storedHighScore !== null) {
        setHighScore(parseInt(storedHighScore));
      }
    }
  };


  // Get a random word from the specified level
  const getRandomWord = (words: WordItem[]): WordItem =>
    words[Math.floor(Math.random() * words.length)];

  // Get words for the current difficulty level
  const getWordsByLevel = (): WordItem[] => {
    const levelNum = parseInt(difficulty.replace("Level", ""));
    return allWords.filter(word => word.level === levelNum);
  };

  const generateQuestion = () => {
    if (wrongCount >= 4) {
      setGameOver(true);
      return;
    }

    setSelectedAnswer(null);
    setShowCorrect(false);

    const wordsForLevel = getWordsByLevel();

    if (wordsForLevel.length === 0) {
      setError("No words found for the selected level. Please check your backend data.");
      return;
    }

    const correct = getRandomWord(wordsForLevel);

    // Create incorrect options based on quiz mode
    let incorrectPool = allWords.filter((w) => w.id !== correct.id); // Use ID for uniqueness
    const incorrectOptions = incorrectPool
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((word) => {
        const option =
          quizMode === "translation" ? word.englishTranslation : word.transliteration;
        return option.trim();
      });

    // Correct answer based on quiz mode - trim to avoid whitespace issues
    const correctAnswer = (
      quizMode === "translation" ? correct.englishTranslation : correct.transliteration
    ).trim();

    // ✅ Debug log
    console.log("Current mode:", quizMode);
    console.log("Correct word:", correct.kannadaWord);
    console.log("Correct answer for this mode:", correctAnswer);

    // Combine and shuffle all options
    const choices = [...incorrectOptions, correctAnswer].sort(
      () => Math.random() - 0.5
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
          ? question.englishTranslation
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
        isCorrect
      ); // Debugging

      if (isCorrect) {
        const newScore = score + 1;
        setScore(newScore);

        if (newScore > highScore) {
          setHighScore(newScore);
          saveScore(newScore);
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

    // restartGame() will be called by useEffect due to difficulty dependency
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
    // restartGame() will be called by useEffect due to quizMode dependency
  };

  // Render options with better comparison logic
  const renderOptions = () => {
    return options.map((option, index) => {
      const isSelected = selectedAnswer === option;
      const trimmedOption = option.trim();
      const correctAnswer = question
        ? (quizMode === "translation"
            ? question.englishTranslation
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

  const handleSpeak = (word: string) => {
    console.log("speak-Pressed:", word);
    speakText(word, 0.5); 
  };

    const saveScore = async (finalScore: number) => {
    try {
      if (user?.token) {
        const response = await fetch(`${baseUrl}/scores/me`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify({
            quizType: 'WORD_QUIZ',
            score: finalScore
          })
        });

         if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to save score: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        console.log('Score saved successfully:', data);
      } else {
        console.log('User not logged in, saving score locally only');
      }

      // Always update local storage as backup
      await AsyncStorage.setItem('HIGH_SCORE_WORD', finalScore.toString());
    } catch (error) {
      console.error('Error saving score:', error);
      // Ensure local storage is updated even if backend fails
      await AsyncStorage.setItem('HIGH_SCORE_WORD', finalScore.toString());
    }
  };


  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e0be21" />
        <Text style={styles.loadingText}>Loading word game data...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Retry" onPress={fetchAllWords} color="#e0be21" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#e0be21" }}>
      <LinearGradient colors={["#e0be21", "black"]} style={styles.wrapper}>

        {/* Scores */}
        <View
          style={{
            position: "absolute",
            top: 20,
            width: "95%",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Pressable
            style={styles.logoutButton}
            onPress={() => router.push("/LeaderboardScreen")}
          >
            <MaterialIcons name="leaderboard" size={24} color="white" />
          </Pressable>

          <Text style={{
            backgroundColor: "rgba(0,0,0,0.7)",
            paddingVertical: 6,
            paddingHorizontal: 10,
            borderRadius: 8, color: "white", fontWeight: "bold", fontSize: 14
          }}>
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
            <Pressable
              onLongPress={() => {
                if (question) {
                  quizMode === "translation"
                    ? handleSpeak(question.kannadaWord)
                    : ToastAndroid.show(
                        "Only available for translation!",
                        ToastAndroid.SHORT
                      );
                }
              }}
              style={{ width: "100%" }} // Inner content
            >
              <Text style={styles.question}>{question?.kannadaWord}</Text>
            </Pressable>
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
    logoutButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 18,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    fontSize: 18,
  },
});

export default WordQuiz;

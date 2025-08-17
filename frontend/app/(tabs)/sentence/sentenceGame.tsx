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

type SentenceItem = {
  id: number;
  kannadaSentence: string;
  transliteration: string;
  englishTranslation: string;
  level: number;
};

type UserScore = {
  id: number;
  quizType: string;
  highScore: number;
};

const SentenceQuiz = () => {
  const { user } = useAuth();
  const [question, setQuestion] = useState<SentenceItem | null>(null);
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
  const [allSentences, setAllSentences] = useState<SentenceItem[]>([]);
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
          await fetchAllSentences(); // Fetch all sentences first
          await fetchUserHighScore(); // Fetch high score
        } catch (e) {
          console.error("Error loading high score or sentences:", e);
          setError((e as Error).message);
        }
      };
      init();
    }, [])
  );

  useEffect(() => {
    if (allSentences.length > 0 && !loading && !error) {
      restartGame();
    }
  }, [allSentences, loading, error, quizMode, difficulty]);

  const fetchAllSentences = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/sentences`); // Fetch all sentences without level filter
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: SentenceItem[] = await response.json();
      setAllSentences(data);
    } catch (e: any) {
      setError(e.message);
      Alert.alert("Error", "Failed to fetch sentences for game: " + e.message);
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
        const sentenceQuizScore = scores.find((score: UserScore) => score.quizType === 'SENTENCE_QUIZ');
        if (sentenceQuizScore) {
          setHighScore(sentenceQuizScore.highScore);
          await AsyncStorage.setItem('HIGH_SCORE_SENTENCE', sentenceQuizScore.highScore.toString());
          return;
        }
      } else {
        console.log('No user token available');
      }

      // If no user or no backend score, fall back to local storage
      const storedHighScore = await AsyncStorage.getItem("HIGH_SCORE_SENTENCE");
      if (storedHighScore !== null) {
        setHighScore(parseInt(storedHighScore));
      }
    } catch (error) {
      console.error('Error fetching high score:', error);
      const storedHighScore = await AsyncStorage.getItem("HIGH_SCORE_SENTENCE");
      if (storedHighScore !== null) {
        setHighScore(parseInt(storedHighScore));
      }
    }
  };

  // Get a random sentence from the specified level
  const getRandomSentence = (sentences: SentenceItem[]): SentenceItem =>
    sentences[Math.floor(Math.random() * sentences.length)];

  // Get sentences for the current difficulty level
  const getSentencesByLevel = (): SentenceItem[] => {
    const levelNum = parseInt(difficulty.replace("Level", ""));
    return allSentences.filter(sentence => sentence.level === levelNum);
  };

  const generateQuestionWithMode = (
    mode: "translation" | "transliteration"
  ) => {
    if (wrongCount >= 4) {
      setGameOver(true);
      return;
    }

    setSelectedAnswer(null);
    setShowCorrect(false);

    const sentencesForLevel = getSentencesByLevel();

    if (sentencesForLevel.length === 0) {
      setError("No sentences found for the selected level. Please check your backend data.");
      return;
    }

    const correct = getRandomSentence(sentencesForLevel);

    // Create incorrect options based on the passed mode parameter
    let incorrectPool = allSentences.filter(
      (s) => s.id !== correct.id
    );
    const incorrectOptions = incorrectPool
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((sentence) =>
        mode === "translation" ? sentence.englishTranslation : sentence.transliteration
      );

    // Correct answer based on the passed mode parameter
    const correctAnswer =
      mode === "translation" ? correct.englishTranslation : correct.transliteration;

    // ✅ Debug log
    console.log(
      "Correct Answer:",
      correctAnswer,
      " | Mode:",
      mode,
      " | Sentence:",
      correct.kannadaSentence
    );

    // Combine and shuffle all options
    const choices = [...incorrectOptions, correctAnswer].sort(
      () => Math.random() - 0.5
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
          ? question.englishTranslation
          : question.transliteration;handleAnswer

      if (answer === correctAnswer) {
        const newScore = score + 1;
        setScore(newScore);
        saveScore(newScore);

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

    // restartGame() will be called by useEffect due to difficulty dependency
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

  const handleSpeak = (sentence: string) => {
    console.log("speak-Pressed:", sentence);
    speakText(sentence, 0.5); // Add pace argument, e.g., 0.5
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
            quizType: 'SENTENCE_QUIZ',
            score: finalScore
          })
        });

        const responseText = await response.text();
        console.log('Response body:', responseText);

        if (!response.ok) {
          throw new Error(`Failed to save score: ${response.status} ${responseText}`);
        }

        const data = await response.json();
        console.log('Score saved successfully:', data);
      } else {
        console.log('User not logged in, saving score locally only');
      }

      // Always update local storage as backup
      await AsyncStorage.setItem('HIGH_SCORE_SENTENCE', finalScore.toString());
    } catch (error) {
      console.error('Error saving score:', error);
      // Ensure local storage is updated even if backend fails
      await AsyncStorage.setItem('HIGH_SCORE_SENTENCE', finalScore.toString());
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e0be21" />
        <Text style={styles.loadingText}>Loading sentence game data...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Retry" onPress={fetchAllSentences} color="#e0be21" />
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
              onLongPress={() => {
                if (question) {
                  quizMode === "translation"
                    ? handleSpeak(question.kannadaSentence)
                    : ToastAndroid.show(
                        "Only available for translation!",
                        ToastAndroid.SHORT
                      );
                }
              }}
              style={{ width: "100%" }} // Inner content
            >
              <Text style={styles.question}>{question?.kannadaSentence}</Text>
            </Pressable>

            <View style={styles.optionsContainer}>
              {renderOptions()}
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

export default SentenceQuiz;

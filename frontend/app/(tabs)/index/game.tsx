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
  ActivityIndicator, // Import ActivityIndicator
  Alert, // Import Alert
  Button, // Import Button
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// import kannadaLetters from "../../../data/kannada_letters.json";
import { speakText } from "../../../utils/speak";

type LetterItem = {
  id: number;
  kannadaChar: string;
  transliteration: string;
  type: string;
};

const KannadaQuiz = () => {
  const [question, setQuestion] = useState<LetterItem | null>(null);
  const [options, setOptions] = useState<LetterItem[]>([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [showCorrect, setShowCorrect] = useState(false);
  const [allCharacters, setAllCharacters] = useState<LetterItem[]>([]);
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
          await fetchAllCharacters(); // Fetch all characters first
          const storedHighScore = await AsyncStorage.getItem("HIGH_SCORE");
          if (storedHighScore !== null) {
            setHighScore(parseInt(storedHighScore));
          }
        } catch (e) {
          console.error("Error loading high score or characters:", e);
          setError((e as Error).message);
        }
      };
      init();
    }, [])
  );

  useEffect(() => {
    if (allCharacters.length > 0 && !loading && !error) {
      restartGame();
    }
  }, [allCharacters, loading, error]);

  const fetchAllCharacters = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://10.11.57.27:8080/api/characters");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: LetterItem[] = await response.json();
      setAllCharacters(data);
    } catch (e: any) {
      setError(e.message);
      Alert.alert("Error", "Failed to fetch characters for game: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const getRandomLetter = (list: LetterItem[]) =>
    list[Math.floor(Math.random() * list.length)];

  const generateQuestion = () => {
    if (wrongCount >= 4) {
      setGameOver(true);
      return;
    }

    setSelectedAnswer(null);
    setShowCorrect(false);

    if (allCharacters.length === 0) {
      setError("No characters available to generate questions.");
      return;
    }

    const correct = getRandomLetter(allCharacters);

    console.log(
      "Correct Letter:",
      correct.kannadaChar,
      "| Transliteration:",
      correct.transliteration
    );

    const incorrectOptions = allCharacters
      .filter((l) => l.id !== correct.id) // Use id for unique identification
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const choices = [...incorrectOptions, correct].sort(
      () => Math.random() - 0.5
    );

    setQuestion(correct);
    setOptions(choices);
  };

  const handleAnswer = async (answer: string) => {
    setSelectedAnswer(answer);
    if (question && answer === question.transliteration) {
      const newScore = score + 1;
      setScore(newScore);

      if (newScore > highScore) {
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

  const handleSpeak = (letter: string) => {
    console.log("speak-Pressed:", letter);
    speakText(letter, 0.5);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e0be21" />
        <Text style={styles.loadingText}>Loading game data...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Retry" onPress={fetchAllCharacters} color="#e0be21" />
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
              onLongPress={() => question && handleSpeak(question.kannadaChar)}
              style={{ width: "100%" }} // Inner content
            >
              <Text style={styles.question}>{question?.kannadaChar}</Text>
            </Pressable>
            <View style={styles.optionsContainer}>
              {options.map((option) => (
                <TouchableOpacity
                  key={option.id} // Use id for key
                  style={[
                    styles.option,
                    selectedAnswer === option.transliteration &&
                      (option.transliteration === question?.transliteration
                        ? styles.correct
                        : styles.wrong),
                    showCorrect &&
                      option.transliteration === question?.transliteration &&
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

export default KannadaQuiz;

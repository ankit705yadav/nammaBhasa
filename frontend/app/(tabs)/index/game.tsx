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
  ActivityIndicator,
  Alert,
  Button,
} from "react-native";
import { useAuth } from "../../context/auth";
import { SafeAreaView } from "react-native-safe-area-context";
// import kannadaLetters from "../../../data/kannada_letters.json";
import { speakText } from "../../../utils/speak";

type LetterItem = {
  id: number;
  kannadaChar: string;
  transliteration: string;
  type: string;
};

type UserScore = {
  id: number;
  quizType: string;
  highScore: number;
};

const KannadaQuiz = () => {
  const { user } = useAuth();
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
          await fetchUserHighScore(); // Fetch high score from backend
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

  const fetchUserHighScore = async () => {
    try {
      if (user?.token) {
        console.log('Fetching with token:', user.token);

        // If user is logged in, try to fetch from backend
        const response = await fetch('http://10.11.57.27:8080/api/scores/me', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          }
        });

        console.log('Response status:', response.status);
        const responseText = await response.text();
        console.log('Response body:', responseText);

        if (!response.ok) {
          throw new Error(`Failed to fetch high score: ${response.status} ${responseText}`);
        }

        const scores: UserScore[] = responseText ? JSON.parse(responseText) : [];
        const characterQuizScore = scores.find((score: UserScore) => score.quizType === 'CHARACTER_QUIZ');
        if (characterQuizScore) {
          setHighScore(characterQuizScore.highScore);
          await AsyncStorage.setItem('HIGH_SCORE', characterQuizScore.highScore.toString());
          return;
        }
      } else {
        console.log('No user token available');
      }

      // If no user or no backend score, fall back to local storage
      const storedHighScore = await AsyncStorage.getItem("HIGH_SCORE");
      if (storedHighScore !== null) {
        setHighScore(parseInt(storedHighScore));
      }
    } catch (error) {
      console.error('Error fetching high score:', error);
      // Fallback to local storage on error
      const storedHighScore = await AsyncStorage.getItem("HIGH_SCORE");
      if (storedHighScore !== null) {
        setHighScore(parseInt(storedHighScore));
      }
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

  const saveScore = async (finalScore: number) => {
    try {
      // Only attempt to save to backend if user is logged in
      if (user?.token) {
        const response = await fetch('http://10.11.57.27:8080/api/scores/me', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify({
            quizType: 'CHARACTER_QUIZ',
            score: finalScore
          })
        });

         console.log('Response status:', response.status);
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
      await AsyncStorage.setItem('HIGH_SCORE', finalScore.toString());
    } catch (error) {
      console.error('Error saving score:', error);
      // Ensure local storage is updated even if backend fails
      await AsyncStorage.setItem('HIGH_SCORE', finalScore.toString());
    }
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

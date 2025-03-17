import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import kannadaLetters from "../../data/kannada_letters.json";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";


const KannadaQuiz = () => {
  const [question, setQuestion] = useState(null);
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [showCorrect, setShowCorrect] = useState(false);

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

  const handleAnswer = (answer) => {
    setSelectedAnswer(answer);
    if (answer === question.transliteration) {
      setScore(score + 1);
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

  return (
    <SafeAreaView style={{flex: 1,backgroundColor: "#e0be21"}}>

    <LinearGradient colors={["#e0be21", "black"]} style={styles.wrapper}>

    

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
          <Text style={styles.question}>{question?.letter}</Text>
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
                <Text style={styles.optionText}>{option.transliteration}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.score}>
            Score: {score} | Wrong Attempts: {wrongCount}/4
          </Text>
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
  score: {
    fontSize: 20,
    marginTop: 20,
    fontWeight: "bold",
    color: "white",
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

import { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import kannadaData from "../../data/kannada_letters.json";

export default function GameScreen() {
  const [lives, setLives] = useState(3);
  const [currentCharacter, setCurrentCharacter] = useState<any>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [score, setScore] = useState(0);

  const generateQuestion = () => {
    // Randomly select category (Vowels or Consonants)
    const categories = Object.keys(kannadaData);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const characters = kannadaData[randomCategory];
    
    // Select random character
    const randomChar = characters[Math.floor(Math.random() * characters.length)];
    
    // Generate 4 options (1 correct, 3 wrong)
    let optionsArray = [randomChar.romanized];
    while (optionsArray.length < 4) {
      const randomOption = characters[Math.floor(Math.random() * characters.length)].romanized;
      if (!optionsArray.includes(randomOption)) {
        optionsArray.push(randomOption);
      }
    }
    
    // Shuffle options
    optionsArray = optionsArray.sort(() => Math.random() - 0.5);
    
    setCurrentCharacter(randomChar);
    setOptions(optionsArray);
  };

  const handleAnswer = (selected: string) => {
    if (selected === currentCharacter.romanized) {
      setScore(score + 1);
    } else {
      setLives(lives - 1);
    }
    generateQuestion();
  };

  useEffect(() => {
    generateQuestion();
  }, []);

  if (lives === 0) {
    return (
      <ThemedView style={styles.container}>
        <Text style={styles.gameOver}>Game Over!</Text>
        <Text style={styles.score}>Final Score: {score}</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => {
            setLives(3);
            setScore(0);
            generateQuestion();
          }}>
          <Text style={styles.buttonText}>Play Again</Text>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.lives}>❤️ {lives}</Text>
        <Text style={styles.score}>Score: {score}</Text>
      </View>
      
      <Text style={styles.question}>
        What is the reading of {currentCharacter?.character}?
      </Text>
      
      <View style={styles.optionsGrid}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.optionButton}
            onPress={() => handleAnswer(option)}>
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  lives: {
    fontSize: 20,
  },
  score: {
    fontSize: 20,
  },
  question: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 40,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  optionButton: {
    width: '48%',
    aspectRatio: 2,
    backgroundColor: '#1D3D47',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    color: 'white',
    fontSize: 20,
  },
  gameOver: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#1D3D47',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
}); 
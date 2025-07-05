import * as Haptics from "expo-haptics";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";

// Global state for the Expo Audio object to prevent overlap
let soundObject: Audio.Sound | null = null;

/**
 * Initializes audio mode settings for playback.
 * This should be called once, typically when your app starts.
 */
export const initializeAudioMode = async (): Promise<void> => {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
    console.log("Audio mode initialized successfully.");
  } catch (error) {
    console.error("Error initializing audio mode:", error);
  }
};

/**
 * Play a base64 encoded audio string using expo-av and expo-file-system.
 * This is an internal helper function.
 * @param base64Audio The base64 audio data
 */
const playBase64Audio = async (base64Audio: string): Promise<void> => {
  // Unload any existing sound object to prevent overlap
  if (soundObject) {
    await soundObject.unloadAsync();
    soundObject = null;
  }

  // Create a unique file path for the temporary audio file
  const filePath = `${
    FileSystem.documentDirectory
  }sarvam_speech_${Date.now()}.wav`;

  try {
    // Write the base64 audio data to the temporary file
    await FileSystem.writeAsStringAsync(filePath, base64Audio, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Create and load the sound object from the temporary file URI
    const { sound } = await Audio.Sound.createAsync(
      { uri: filePath },
      { shouldPlay: true } // Start playing immediately
    );
    soundObject = sound; // Store reference to the new sound object

    // Set an event listener to unload the sound and delete the file when playback finishes
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync(); // Unload the sound from memory
        soundObject = null; // Clear the reference
        // Optionally delete the temporary file after playback to free up space
        FileSystem.deleteAsync(filePath, { idempotent: true });
        console.log("Playback finished and temporary file deleted.");
      }
    });
  } catch (err) {
    console.error("Error playing audio from file system:", err);
  }
};

/**
 * Speak text using the Sarvam AI text-to-speech API.
 * This function is simplified to always use Kannada (kn-IN) and the "Anushka" speaker.
 * @param text The text to be converted to speech.
 * @param withHaptic Whether to provide haptic feedback (default: true).
 */
export const speakText = async (
  text: string,
  pace: Number,
  withHaptic: boolean = true
): Promise<void> => {
  if (!text) return; // Do nothing if text is empty

  // Provide haptic feedback if enabled
  if (withHaptic) {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
  }

  const apiKey = "3e80d1aa-6746-4af9-9e4f-46431c14b791"; // Your Sarvam AI API Subscription Key
  const apiEndpoint = "https://api.sarvam.ai/text-to-speech";

  // Define the request body with the corrected speaker name
  const requestBody = {
    text: text,
    target_language_code: "kn-IN", // Always Kannada
    speaker: "anushka", // ['meera', 'pavithra', 'maitreyi', 'arvind', 'amol', 'amartya', 'diya', 'neel', 'misha', 'vian', 'arjun', 'maya', 'anushka', 'abhilash', 'manisha', 'vidya', 'arya', 'karun' or 'hitesh']
    pace: pace || 0.7, // Default pace [0.3 - 1.0] .7 is perfect
    pitch: 0.0, // Default pitch
    loudness: 1.0, // Default loudness
    model: "bulbul:v2", // Specific model as per documentation
  };

  console.log(
    "Sending request body to Sarvam AI:",
    JSON.stringify(requestBody, null, 2)
  ); // Log the request body for debugging

  try {
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "api-subscription-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    // Check if the API call was successful
    if (!response.ok) {
      // If the response is not OK, read the error body for more details
      const errorBody = await response.json();
      console.error("Sarvam AI API returned an error:", errorBody); // Log the detailed error from the API
      throw new Error(`API call failed with status: ${response.status}`);
    }

    const responseBody = await response.json();

    // Check if audio data is present in the response
    if (responseBody.audios && responseBody.audios.length > 0) {
      const base64Audio = responseBody.audios[0]; // Get the first base64 audio string

      // Play the received base64 audio data
      await playBase64Audio(base64Audio);
    } else {
      console.warn("No audio data received from the Sarvam AI API.");
    }
  } catch (error) {
    console.error("Error speaking text with Sarvam AI:", error);
    // You might want to display a user-friendly error message here
  }
};

/**
 * Creates a haptic impact feedback.
 * @param style Impact style (Light, Medium, Heavy)
 */
const triggerHaptic = (
  style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Medium
) => {
  Haptics.impactAsync(style);
};

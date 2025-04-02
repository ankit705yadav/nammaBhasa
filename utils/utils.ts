import * as Speech from "expo-speech";
import * as Haptics from "expo-haptics";

// Define types for voice information
export type VoiceInfo = {
  identifier: string;
  name: string;
  quality: string;
  language: string;
};

// Global state for voice settings
let allVoices: VoiceInfo[] = [];
let indianVoices: VoiceInfo[] = [];
let selectedVoiceIndex: number = 0;
// let currentLanguage: string = "hi-IN";
let currentLanguage: string = "ka-IN";


/**
 * Filters voices to only keep Indian languages (those with 'IN' in the language code)
 */
const filterInLanguages = (voices: VoiceInfo[]): VoiceInfo[] => {
  const filtered = voices.filter(voice => 
    voice.language.includes('-IN') || 
    // Include some other patterns that might represent Indian languages
    voice.language === 'sa' || // Sanskrit
    voice.language === 'hi' || // Hindi without region
    voice.name.toLowerCase().includes('indian') ||
    voice.name.toLowerCase().includes('hindi') ||
    voice.name.toLowerCase().includes('tamil') ||
    voice.name.toLowerCase().includes('telugu') ||
    voice.name.toLowerCase().includes('kannada') ||
    voice.name.toLowerCase().includes('malayalam') ||
    voice.name.toLowerCase().includes('bengali') ||
    voice.name.toLowerCase().includes('marathi')
  );
  
  console.log(`Found ${filtered.length} Indian voices out of ${voices.length} total voices`);
  
  return filtered.length > 0 ? filtered : voices; // Fall back to all voices if no Indian voices found
};

/**
 * Initialize voice settings by loading available voices
 */
export const initVoiceSettings = async (): Promise<void> => {
  try {
    allVoices = await Speech.getAvailableVoicesAsync();
    console.log(`Loaded ${allVoices.length} total voice options`);
    
    // Filter for Indian languages
    indianVoices = filterInLanguages(allVoices);
    
    // Set default voice if available
    if (indianVoices.length > 0) {
      // Try to find Hindi voice first
      const hindiVoice = indianVoices.findIndex(voice => 
        voice.language.startsWith('hi-IN') || 
        voice.language === 'hi' ||
        voice.name.toLowerCase().includes('hindi')
      );
      
      if (hindiVoice >= 0) {
        selectedVoiceIndex = hindiVoice;
        currentLanguage = indianVoices[hindiVoice].language;
      } else {
        // Fall back to first Indian voice
        currentLanguage = indianVoices[0].language;
      }
      
      console.log(`Selected default voice: ${indianVoices[selectedVoiceIndex].name} (${currentLanguage})`);
    }
  } catch (error) {
    console.error("Error initializing voice settings:", error);
  }
};

/**
 * Get all available Indian speech voices
 * @returns Array of Indian voice objects
 */
export const getAvailableVoices = (): VoiceInfo[] => {
  return indianVoices;
};

/**
 * Get all available speech voices (including non-Indian)
 * @returns Array of all voice objects
 */
export const getAllVoices = (): VoiceInfo[] => {
  return allVoices;
};

/**
 * Get the currently selected voice
 * @returns Current voice info or undefined if not available
 */
export const getCurrentVoice = (): VoiceInfo | undefined => {
  if (indianVoices.length > 0 && selectedVoiceIndex < indianVoices.length) {
    return indianVoices[selectedVoiceIndex];
  }
  return undefined;
};

/**
 * Get the current language code
 * @returns Current language code
 */
export const getCurrentLanguage = (): string => {
  return currentLanguage;
};

/**
 * Cycle to the next available Indian language/voice
 * @returns The new selected voice info
 */
export const cycleToNextVoice = (): VoiceInfo | undefined => {
  if (indianVoices.length === 0) return undefined;

  triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
  
  const nextIndex = (selectedVoiceIndex + 1) % indianVoices.length;
  selectedVoiceIndex = nextIndex;
  currentLanguage = indianVoices[nextIndex].language;
  
  console.log(
    `Language changed to: ${currentLanguage} (${indianVoices[nextIndex].name})`
  );
  
  return indianVoices[nextIndex];
};

/**
 * Speak text using the device's text-to-speech engine
 * @param text The text to speak
 * @param customLanguage Override the global language (optional)
 * @param customVoice Override the global voice (optional)
 * @param withHaptic Whether to provide haptic feedback (default: true)
 */
export const speakText = (
  text: string,
  customLanguage?: string,
  customVoice?: string,
  withHaptic: boolean = true
): void => {
  if (!text) return;

  // Provide haptic feedback
  if (withHaptic) {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
  }

  // Configure speech options
  const options: Speech.SpeechOptions = {
    language: customLanguage || currentLanguage,
    pitch: 1.0,
    rate: 0.9,
  };

  // Add voice identifier if available
  const voiceIdentifier = customVoice || 
    (indianVoices.length > 0 && selectedVoiceIndex < indianVoices.length 
      ? indianVoices[selectedVoiceIndex].identifier 
      : undefined);
      
  if (voiceIdentifier) {
    options.voice = voiceIdentifier;
  }

  // Speak the text
  Speech.speak(text, options);
};

/**
 * Creates a haptic impact feedback
 * @param style Impact style (Light, Medium, Heavy)
 */
export const triggerHaptic = (
  style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Medium
) => {
  Haptics.impactAsync(style);
};

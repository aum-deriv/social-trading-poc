import { useReducer, useEffect } from 'react';
import Button from '../input/Button';
import { translateText } from '../../services/translationService';

interface TranslateButtonProps {
  text: string;
  onTranslation: (translatedText: string) => void;
}

interface TranslateState {
  isTranslating: boolean;
  error: string | null;
  isEnglish: boolean;
  isTranslated: boolean;
  translatedText: string | null;
  showingOriginal: boolean;
}

type TranslateAction =
  | { type: 'START_TRANSLATION' }
  | { type: 'TRANSLATION_SUCCESS'; payload: string }
  | { type: 'TRANSLATION_ERROR'; payload: string }
  | { type: 'TOGGLE_LANGUAGE' }
  | { type: 'SET_IS_ENGLISH'; payload: boolean }
  | { type: 'RESET_ERROR' };

const initialState: TranslateState = {
  isTranslating: false,
  error: null,
  isEnglish: true,
  isTranslated: false,
  translatedText: null,
  showingOriginal: false,
};

function translateReducer(state: TranslateState, action: TranslateAction): TranslateState {
  switch (action.type) {
    case 'START_TRANSLATION':
      return {
        ...state,
        isTranslating: true,
        error: null,
      };
    case 'TRANSLATION_SUCCESS':
      return {
        ...state,
        isTranslating: false,
        isTranslated: true,
        translatedText: action.payload,
        showingOriginal: false,
        error: null,
      };
    case 'TRANSLATION_ERROR':
      return {
        ...state,
        isTranslating: false,
        error: action.payload,
      };
    case 'TOGGLE_LANGUAGE':
      return {
        ...state,
        showingOriginal: !state.showingOriginal,
      };
    case 'SET_IS_ENGLISH':
      return {
        ...state,
        isEnglish: action.payload,
      };
    case 'RESET_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
}

const TranslateButton = ({ text, onTranslation }: TranslateButtonProps) => {
  const [state, dispatch] = useReducer(translateReducer, initialState);
  const { isTranslating, error, isEnglish, isTranslated, translatedText, showingOriginal } = state;

  const handleTranslate = async () => {
    // If already translated, toggle between original and translated text
    if (isTranslated) {
      dispatch({ type: 'TOGGLE_LANGUAGE' });
      onTranslation(showingOriginal ? translatedText || text : text);
      return;
    }

    // First-time translation
    dispatch({ type: 'START_TRANSLATION' });
    try {
      const translated = await translateText(text);
      dispatch({ type: 'TRANSLATION_SUCCESS', payload: translated });
      onTranslation(translated);
    } catch (error) {
      console.error('Translation error:', error);
      dispatch({
        type: 'TRANSLATION_ERROR',
        payload: error instanceof Error ? error.message : 'Translation failed',
      });
    }
  };

  const getButtonText = () => {
    if (error) return 'Translation Failed';
    if (isTranslating) return '✦ Translating...';
    if (isTranslated) {
      return showingOriginal ? '✦ Show Translation' : '✦ Show Original';
    }
    return '✦ See translation';
  };

  // Helper function to check if text contains only English characters
  const isEnglishText = (text: string): boolean => {
    return /^[A-Za-z0-9\s!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]*$/.test(text);
  };

  // Helper function to check if text is in English via translation
  const checkLanguageViaTranslation = async (text: string) => {
    try {
      const translatedText = await translateText(text);
      // If translation returns the same text, it's English
      dispatch({ type: 'SET_IS_ENGLISH', payload: translatedText === text });
    } catch {
      // Hide button on error
      dispatch({ type: 'SET_IS_ENGLISH', payload: true });
    }
  };

  // Check if text is English on mount and when text changes
  useEffect(() => {
    // Skip empty text or text that's not loaded yet
    if (!text?.trim()) {
      return;
    }

    // Skip text that's already in English
    if (isEnglishText(text)) {
      dispatch({ type: 'SET_IS_ENGLISH', payload: true });
      return;
    }

    checkLanguageViaTranslation(text);
  }, [text]);

  if (isEnglish) {
    return null;
  }

  return (
    <Button
      onClick={handleTranslate}
      disabled={!!error || isTranslating}
      variant="text"
      className="post-engagement__button"
    >
      {getButtonText()}
    </Button>
  );
};

export default TranslateButton;

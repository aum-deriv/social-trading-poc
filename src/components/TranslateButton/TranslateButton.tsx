import { useReducer } from 'react';
import Button from '../input/Button';
import { translateText } from '../../services/translationService';

interface TranslateButtonProps {
  text: string;
  language: 'EN' | 'NON-EN';
  onTranslation: (translatedText: string) => void;
}

interface TranslateState {
  isTranslating: boolean;
  error: string | null;
  isTranslated: boolean;
  translatedText: string | null;
  showingOriginal: boolean;
}

type TranslateAction =
  | { type: 'START_TRANSLATION' }
  | { type: 'TRANSLATION_SUCCESS'; payload: string }
  | { type: 'TRANSLATION_ERROR'; payload: string }
  | { type: 'TOGGLE_LANGUAGE' };

const initialState: TranslateState = {
  isTranslating: false,
  error: null,
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
    default:
      return state;
  }
}

const TranslateButton = ({ text, language, onTranslation }: TranslateButtonProps) => {
  const [state, dispatch] = useReducer(translateReducer, initialState);
  const { isTranslating, error, isTranslated, translatedText, showingOriginal } = state;

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

  // Don't show translation button for English text
  if (language === 'EN') {
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

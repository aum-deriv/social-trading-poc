// Simple in-memory cache for translations
const translationCache = new Map<string, { text: string; timestamp: number }>();
const CACHE_EXPIRY = 1000 * 60 * 60; // 1 hour

// Retry helper with exponential backoff.
async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number,
  delayFn: (attempt: number) => number = attempt => Math.min(1000 * Math.pow(2, attempt), 5000)
): Promise<T> {
  let lastError: Error;
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delayFn(i)));
        continue;
      }
      throw new Error(`Operation failed after ${maxRetries + 1} attempts: ${lastError.message}`);
    }
  }
  throw new Error('Unexpected error in retry loop');
}

const makeAnthropicRequest = async (
  prompt: string,
  model: string = 'claude-3-sonnet-20240229'
): Promise<string> => {
  return retry(async () => {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not set in environment variables');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const responseText = await response.text();
    let responseData;

    try {
      responseData = JSON.parse(responseText);
    } catch {
      throw new Error('Invalid JSON response from Anthropic API');
    }

    if (!response.ok) {
      throw new Error(
        responseData.error?.message || `API request failed with status ${response.status}`
      );
    }

    if (!responseData?.content?.[0]?.text) {
      throw new Error('Invalid response format from Anthropic API');
    }

    return responseData.content[0].text.trim();
  }, 2);
};

export const detectLanguage = async (text: string): Promise<'EN' | 'NON-EN'> => {
  const cacheKey = `lang:${text}`;
  const cached = translationCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
    return cached.text as 'EN' | 'NON-EN';
  }

  try {
    const detectPrompt = `You are a language detection expert. Analyze the given text and respond with ONLY "EN" if the text is in English, or "NON-EN" if it contains non-English text. Do not provide any explanation. Text: "${text}"`;

    const result = await makeAnthropicRequest(detectPrompt, 'claude-3-haiku-20240307');
    const language = result.trim() === 'EN' ? 'EN' : 'NON-EN';

    translationCache.set(cacheKey, {
      text: language,
      timestamp: Date.now(),
    });

    return language;
  } catch (error) {
    console.error('Error detecting language:', error);
    return 'EN'; // Default to English if detection fails
  }
};

export const translateText = async (text: string, targetLang: string = 'EN'): Promise<string> => {
  const cacheKey = `${text}:${targetLang}`;
  const cached = translationCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
    return cached.text;
  }

  try {
    // First check if text is already in English
    const isAscii = /^[\x00-\x7F\u{1F300}-\u{1F9FF}\s]*$/u.test(text);
    if (isAscii) {
      console.log('Text appears to be in English, skipping translation');
      return text;
    }

    const detectPrompt = `Detect the language of this text and respond with ONLY the ISO 639-1 language code in uppercase (e.g. 'EN' for English, 'ES' for Spanish, etc.). Text: "${text}"`;

    const detectedLang = await makeAnthropicRequest(detectPrompt, 'claude-3-haiku-20240307');

    // If it's already English, return the original text
    if (detectedLang.trim() === 'EN') {
      return text;
    }

    // If not English, translate it
    const translatePrompt = `Translate this text to English. Only respond with the translated text, nothing else: "${text}"`;

    const result = await makeAnthropicRequest(translatePrompt, 'claude-3-sonnet-20240229');

    // Cache the result
    translationCache.set(cacheKey, {
      text: result,
      timestamp: Date.now(),
    });

    return result;
  } catch (error) {
    console.error('Error translating text:', error);
    throw error;
  }
};

/**
 * Detects the language of the given text using the backend AI service
 * @param text The text to analyze
 * @returns Promise resolving to 'EN' or 'NON-EN'
 */
export const detectLanguage = async (text: string): Promise<'EN' | 'NON-EN'> => {
  const response = await fetch(
    `${import.meta.env.VITE_LLM_SERVER_URL}/api/translation/detect-language`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to detect language');
  }

  const { language } = await response.json();
  return language;
};

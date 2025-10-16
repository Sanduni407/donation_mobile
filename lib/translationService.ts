// lib/translationService.ts
import { ID, Query } from 'react-native-appwrite';
import { appwriteConfig, databases } from './appwrite';

// Language options for the selector
export const languageOptions = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'si', label: 'Sinhala', flag: '🇱🇰' },
  { code: 'ta', label: 'Tamil', flag: '🇱🇰' },
  { code: 'hi', label: 'Hindi', flag: '🇮🇳' },
  { code: 'es', label: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', label: 'French', flag: '🇫🇷' },
  { code: 'de', label: 'German', flag: '🇩🇪' },
  { code: 'zh-Hans', label: 'Chinese', flag: '🇨🇳' },
  { code: 'ja', label: 'Japanese', flag: '🇯🇵' },
  { code: 'ar', label: 'Arabic', flag: '🇸🇦' },
  { code: 'pt', label: 'Portuguese', flag: '🇵🇹' },
  { code: 'ru', label: 'Russian', flag: '🇷🇺' },
  { code: 'ko', label: 'Korean', flag: '🇰🇷' },
  { code: 'it', label: 'Italian', flag: '🇮🇹' },
];

interface TranslationRequest {
  text: string;
  targetLanguage: string;
}

interface TranslationCache {
  $id: string;
  sourceText: string;
  targetLanguage: string;
  translatedText: string;
  createdAt: string;
}

const TRANSLATION_CACHE_COLLECTION = appwriteConfig.translationCacheCollectionId || 'translation_cache';

// Azure Translator Configuration
const AZURE_KEY = process.env.EXPO_PUBLIC_AZURE_TRANSLATOR_KEY;
const AZURE_ENDPOINT = process.env.EXPO_PUBLIC_AZURE_TRANSLATOR_ENDPOINT;
const AZURE_REGION = process.env.EXPO_PUBLIC_AZURE_TRANSLATOR_REGION;

// In-memory cache as fallback (if Appwrite cache fails)
const memoryCache: { [key: string]: string } = {};

const getCacheKey = (text: string, targetLanguage: string): string => {
  return `${text.substring(0, 100)}_${targetLanguage}`;
};

export const translateText = async ({ 
  text, 
  targetLanguage 
}: TranslationRequest): Promise<string> => {
  // Return original text if target is English or text is empty
  if (targetLanguage === 'en' || !text || text.trim() === '') {
    return text;
  }

  // Check if text is too short (less than 2 characters)
  if (text.trim().length < 2) {
    return text;
  }

  // Check memory cache first
  const cacheKey = getCacheKey(text, targetLanguage);
  if (memoryCache[cacheKey]) {
    console.log('✅ Translation from memory cache');
    return memoryCache[cacheKey];
  }

  try {
    // Try to check database cache (optional)
    if (appwriteConfig.databaseId && appwriteConfig.databaseId !== 'your_database_id') {
      try {
        const cachedTranslations = await databases.listDocuments(
          appwriteConfig.databaseId,
          TRANSLATION_CACHE_COLLECTION,
          [
            Query.equal('sourceText', text.substring(0, 500)),
            Query.equal('targetLanguage', targetLanguage),
            Query.limit(1)
          ]
        );

        if (cachedTranslations.documents.length > 0) {
          const cached = cachedTranslations.documents[0] as unknown as TranslationCache;
          console.log('✅ Translation from database cache');
          memoryCache[cacheKey] = cached.translatedText;
          return cached.translatedText;
        }
      } catch (cacheError) {
        console.log('📝 Database cache not available, using API');
      }
    }

    // Call Azure Translator API
    console.log('🌐 Calling Azure Translator API for:', targetLanguage);
    
    if (!AZURE_KEY || !AZURE_ENDPOINT || !AZURE_REGION) {
      console.error('❌ Azure Translator credentials not configured in .env file');
      console.error('Please check your .env file contains:');
      console.error('EXPO_PUBLIC_AZURE_TRANSLATOR_KEY');
      console.error('EXPO_PUBLIC_AZURE_TRANSLATOR_ENDPOINT');
      console.error('EXPO_PUBLIC_AZURE_TRANSLATOR_REGION');
      return text;
    }

    const url = `${AZURE_ENDPOINT}/translate?api-version=3.0&to=${targetLanguage}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': AZURE_KEY,
        'Ocp-Apim-Subscription-Region': AZURE_REGION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([{ text }]),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Azure API error:', response.status, errorData);
      return text;
    }

    const data = await response.json();
    
    if (!data || !data[0] || !data[0].translations || !data[0].translations[0]) {
      console.error('❌ Invalid response from Azure:', data);
      return text;
    }

    const translatedText = data[0].translations[0].text;
    console.log('✅ Translation successful:', text.substring(0, 30), '→', translatedText.substring(0, 30));

    // Store in memory cache
    memoryCache[cacheKey] = translatedText;

    // Try to cache in database (optional, non-blocking)
    if (appwriteConfig.databaseId && appwriteConfig.databaseId !== 'your_database_id') {
      try {
        await databases.createDocument(
          appwriteConfig.databaseId,
          TRANSLATION_CACHE_COLLECTION,
          ID.unique(),
          {
            sourceText: text.substring(0, 500),
            targetLanguage,
            translatedText: translatedText.substring(0, 500),
            createdAt: new Date().toISOString(),
          }
        );
        console.log('✅ Translation cached in database');
      } catch (cacheError) {
        console.log('⚠️ Database cache save failed (non-critical)');
      }
    }

    return translatedText;
  } catch (error: any) {
    console.error('❌ Translation error:', error.message || error);
    // Return original text if translation fails
    return text;
  }
};

// Batch translation for multiple texts
export const translateBatch = async (
  texts: string[],
  targetLanguage: string
): Promise<string[]> => {
  if (targetLanguage === 'en') {
    return texts;
  }

  // Filter out empty texts
  const validTexts = texts.filter(t => t && t.trim().length > 0);
  
  if (validTexts.length === 0) {
    return texts;
  }

  const translationPromises = texts.map(text => {
    if (!text || text.trim().length === 0) {
      return Promise.resolve(text);
    }
    return translateText({ text, targetLanguage });
  });

  try {
    return await Promise.all(translationPromises);
  } catch (error) {
    console.error('❌ Batch translation error:', error);
    return texts;
  }
};

// Clear old translation cache (optional maintenance function)
export const clearTranslationCache = async (olderThanDays: number = 30) => {
  if (!appwriteConfig.databaseId || appwriteConfig.databaseId === 'your_database_id') {
    console.log('Database ID not configured, skipping cache clear');
    return;
  }

  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    
    const oldTranslations = await databases.listDocuments(
      appwriteConfig.databaseId,
      TRANSLATION_CACHE_COLLECTION,
      [
        Query.lessThan('createdAt', cutoffDate.toISOString()),
        Query.limit(100)
      ]
    );

    const deletePromises = oldTranslations.documents.map(doc =>
      databases.deleteDocument(
        appwriteConfig.databaseId,
        TRANSLATION_CACHE_COLLECTION,
        doc.$id
      )
    );

    await Promise.all(deletePromises);
    console.log(`✅ Cleared ${oldTranslations.documents.length} old translations`);
  } catch (error) {
    console.error('❌ Failed to clear translation cache:', error);
  }
};

// Clear memory cache
export const clearMemoryCache = () => {
  Object.keys(memoryCache).forEach(key => delete memoryCache[key]);
  console.log('✅ Memory cache cleared');
};
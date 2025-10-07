// lib/recommendations.ts
import { GoogleGenAI } from '@google/genai';

// Get API key from Expo environment variables
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

// Initialize Gemini AI with the API key from environment
let ai: GoogleGenAI | null = null;

try {
  if (API_KEY) {
    ai = new GoogleGenAI({ apiKey: API_KEY });
    console.log('✅ Gemini AI initialized successfully');
  } else {
    console.warn('⚠️ Gemini API key is missing. Using fallback recommendations.');
  }
} catch (error) {
  console.warn('⚠️ Failed to initialize Gemini AI. Using fallback recommendations.');
}

export type BeneficiaryPost = {
  $id: string;
  helpRequestId: string;
  beneficiaryRequestCode: string;
  beneficiaryName: string;
  description: string;
  itemsNeeded: string[];
  goalAmount: number;
  urgencyLevel: string;
  typeOfHelp: string;
  collectedAmount?: number;
  status?: string;
  imageUrl?: string;
};

export type RecommendationResult = {
  recommendedPosts: BeneficiaryPost[];
  reasoning?: string;
};

/**
 * Get AI-powered recommendations based on donor preferences
 * @param allPosts - All available beneficiary posts
 * @param donorPreferences - Array of donor preferences (e.g., ['Education', 'Healthcare'])
 * @returns Only posts that match user preferences (1-3 posts, or empty if no matches)
 */
export const getAIRecommendations = async (
  allPosts: BeneficiaryPost[],
  donorPreferences: string[]
): Promise<RecommendationResult> => {
  try {
    // Validate AI instance
    if (!ai) {
      console.log('No API key - using fallback recommendations');
      return fallbackRecommendations(allPosts, donorPreferences);
    }

    // Filter only active posts
    const activePosts = allPosts.filter(
      post => post.status?.toLowerCase() === 'active' || !post.status
    );

    // If no posts, return empty
    if (activePosts.length === 0) {
      return { recommendedPosts: [] };
    }

    // If no preferences, return empty (don't show recommendations)
    if (donorPreferences.length === 0) {
      return { recommendedPosts: [] };
    }

    // Prepare simplified post data for AI (reduce token usage)
    const simplifiedPosts = activePosts.map((post, index) => ({
      index,
      id: post.$id,
      name: post.beneficiaryName,
      description: post.description.substring(0, 200),
      items: post.itemsNeeded.slice(0, 5).join(', '),
      type: post.typeOfHelp,
      urgency: post.urgencyLevel,
      progress: ((post.collectedAmount || 0) / post.goalAmount) * 100,
    }));

    // Create the AI prompt
    const prompt = `
You are a donation recommendation system. Analyze these donation posts and recommend ONLY posts that genuinely match the donor's preferences.

**Donor Preferences:** ${donorPreferences.join(', ')}

**Available Posts:**
${simplifiedPosts.map(p => 
  `[${p.index}] ${p.name} - Type: ${p.type}, Urgency: ${p.urgency}, Progress: ${p.progress.toFixed(0)}%
Description: ${p.description}
Items needed: ${p.items}`
).join('\n\n')}

**STRICT Instructions:**
1. ONLY recommend posts that clearly match the donor's stated preferences
2. Match based on: type of help, description content, and items needed
3. If a post matches, prioritize by: urgency level > funding progress
4. Return 1-3 posts maximum, sorted by relevance
5. If NO posts match the preferences well, return an empty array: []
6. Do NOT force recommendations - be selective and honest

**Response format (MUST be valid JSON):**
Examples:
- If matches found: [2, 5, 1]
- If only 1 match: [3]
- If no good matches: []

Return ONLY the JSON array, no explanation.
`;

    console.log('Sending request to Gemini AI...');
    
    // Use the new API format with gemini-2.5-flash
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingBudget: 0, // Disable thinking for faster response
        },
      },
    });

    console.log('✅ Received response from Gemini AI');

    // Check if response has text
    if (!response.text) {
      console.error('No text in AI response');
      return fallbackRecommendations(activePosts, donorPreferences);
    }

    const responseText = response.text.trim();

    // Parse AI response
    let recommendedIndices: number[] = [];
    try {
      // Try to extract JSON array from response
      const jsonMatch = responseText.match(/\[[\d,\s]*\]/);
      if (jsonMatch) {
        recommendedIndices = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseText);
      return fallbackRecommendations(activePosts, donorPreferences);
    }

    // Map indices back to actual posts
    const recommendedPosts = recommendedIndices
      .filter(idx => idx >= 0 && idx < activePosts.length)
      .slice(0, 3)
      .map(idx => activePosts[idx]);

    console.log(`Found ${recommendedPosts.length} AI-matched posts`);

    // Return only if we have matches
    return {
      recommendedPosts: recommendedPosts,
      reasoning: recommendedPosts.length > 0 ? 'AI-matched recommendations' : 'No matches found',
    };

  } catch (error: any) {
    console.error('AI recommendation error:', error.message);
    return fallbackRecommendations(allPosts, donorPreferences);
  }
};

/**
 * Fallback recommendation algorithm (rule-based)
 * Used when AI fails or API key is missing
 * Returns ONLY posts that match preferences, not forced 3
 */
const fallbackRecommendations = (
  posts: BeneficiaryPost[],
  preferences: string[]
): RecommendationResult => {
  console.log('Using fallback recommendation algorithm');
  
  // Filter active posts
  const activePosts = posts.filter(
    post => post.status?.toLowerCase() === 'active' || !post.status
  );

  if (activePosts.length === 0 || preferences.length === 0) {
    return { recommendedPosts: [] };
  }

  // Score each post - only include posts with meaningful matches
  const scoredPosts = activePosts.map(post => {
    let score = 0;
    let hasMatch = false;

    // Match preferences (40 points)
    const postType = post.typeOfHelp?.toLowerCase() || '';
    const description = post.description?.toLowerCase() || '';
    const items = post.itemsNeeded.join(' ').toLowerCase();

    preferences.forEach(pref => {
      const prefLower = pref.toLowerCase();
      if (postType.includes(prefLower)) {
        score += 15;
        hasMatch = true;
      }
      if (description.includes(prefLower)) {
        score += 10;
        hasMatch = true;
      }
      if (items.includes(prefLower)) {
        score += 15;
        hasMatch = true;
      }
    });

    // Only continue scoring if there's a preference match
    if (!hasMatch) {
      return { post, score: 0, hasMatch: false };
    }

    // Urgency bonus (30 points)
    switch (post.urgencyLevel?.toLowerCase()) {
      case 'urgent':
        score += 30;
        break;
      case 'high':
        score += 20;
        break;
      case 'medium':
        score += 10;
        break;
    }

    // Progress bonus - prioritize less funded (30 points)
    const progress = ((post.collectedAmount || 0) / post.goalAmount) * 100;
    if (progress < 25) score += 30;
    else if (progress < 50) score += 20;
    else if (progress < 75) score += 10;

    return { post, score, hasMatch };
  });

  // Filter to only include posts that actually matched preferences
  const matchedPosts = scoredPosts.filter(sp => sp.hasMatch && sp.score > 0);

  // If no matches, return empty
  if (matchedPosts.length === 0) {
    console.log('No posts matched user preferences');
    return { recommendedPosts: [] };
  }

  // Sort by score and take top 3 (or fewer if less matches)
  matchedPosts.sort((a, b) => b.score - a.score);
  const topPosts = matchedPosts.slice(0, 3).map(sp => sp.post);

  console.log(`Found ${topPosts.length} rule-based matched posts`);

  return {
    recommendedPosts: topPosts,
    reasoning: `${topPosts.length} preference-matched posts`,
  };
};
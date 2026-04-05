const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();
const { getCache, setCache, generateKey } = require('./cacheService');

const key = (process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || "").trim();
// Use the default API version (v1beta for now, which includes latest stable and experimental models)
const genAI = new GoogleGenerativeAI(key);

// Robust models that are often available on standard keys
const FALLBACK_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite-001',
  'gemini-2.0-flash-lite',
  'gemini-flash-latest',
  'gemini-pro-latest'
];

/**
 * Helper to sleep allowing quotas to cool down briefly if needed
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Robust AI generation with model fallback
 */
const generateWithFallback = async (prompt, defaultModel = 'gemini-2.5-flash') => {
  const cacheKey = generateKey(prompt);
  const cachedResult = await getCache(cacheKey);
  if (cachedResult) {
    console.log(`Cache HIT for prompt: ${cacheKey.slice(0, 8)}...`);
    return cachedResult;
  }

  let lastError = null;
  const modelsToTry = [defaultModel, ...FALLBACK_MODELS.filter(m => m !== defaultModel)];
  
  console.log(`AI Request initiated. Prompt length: ${prompt.length}`);
  
  for (let i = 0; i < modelsToTry.length; i++) {
    const modelName = modelsToTry[i];
    try {
      console.log(`Attempting model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      if (!text) throw new Error("Empty response from AI");
      
      console.log(`Success with model: ${modelName}`);
      const trimmedText = text.trim();
      await setCache(cacheKey, trimmedText); // Cache the successful result
      return trimmedText;
    } catch (error) {
      console.error(`ERROR with model ${modelName}:`, error.message);
      lastError = error;
      if (error.message.includes('429') || error.message.includes('quota')) {
        await sleep(1500);
      }
    }
  }
  
  console.error("All AI models failed. Last error:", lastError?.message);
  const reason = lastError?.message || "Unknown error";
  return `AI Service is temporarily unavailable due to high traffic or quota limits. Please try again later. (Error: ${reason})`;
};

exports.generateWithFallback = generateWithFallback;

/**
 * Streaming version of AI generation
 */
const generateStreamingContent = async (prompt, defaultModel = 'gemini-2.5-flash') => {
  const modelsToTry = [defaultModel, ...FALLBACK_MODELS.filter(m => m !== defaultModel)];
  
  for (let i = 0; i < modelsToTry.length; i++) {
    const modelName = modelsToTry[i];
    try {
      console.log(`Attempting streaming with model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContentStream(prompt);
      return result.stream; // Returns an async iterable
    } catch (error) {
      console.error(`Streaming ERROR with model ${modelName}:`, error.message);
      if (i === modelsToTry.length - 1) throw error;
      if (error.message.includes('429') || error.message.includes('quota')) {
        await sleep(1500);
      }
    }
  }
};

exports.generateStreamingContent = generateStreamingContent;

exports.generateHints = async (question) => {
  try {
    const prompt = `Generate step-by-step hints for solving this coding problem:

Title: ${question.title}
Description: ${question.description}
Difficulty: ${question.difficulty}

Provide exactly 3 hints:
1. Idea: A high-level concept or approach
2. Approach: More detailed strategy
3. Pseudocode: Step-by-step pseudocode outline

Format as a numbered list.`;

    console.log('Calling Gemini API for hints...');
    const hintsText = await generateWithFallback(prompt);
    console.log('Gemini API response received for hints');
    
    // Parse the numbered list into array - more flexible parsing
    const hints = hintsText.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && (line.match(/^\d+\./) || line.match(/^[*-]/) || line.match(/^Hint\s*\d+:/i)))
      .map(line => line.replace(/^(\d+\.|[*-]|Hint\s*\d+:)\s*/i, '').trim());

    return hints.length >= 3 ? hints.slice(0, 3) : ['Hint generation failed', 'Please try again', 'Contact support if issue persists'];
  } catch (error) {
    console.error('Error generating hints:', error.message);
    return ['Hint generation failed', 'Please try again', 'Contact support if issue persists'];
  }
};

exports.reviewCode = async (code, question, language, userMistakes = []) => {
  try {
    const mistakesContext = userMistakes.length > 0 
      ? `\nFocus Area (Candidate's Previous Mistakes): \n${userMistakes.map(m => `- ${m.topic}: ${m.mistake}`).join('\n')}\nPay special attention if they repeat these mistakes.`
      : "";

    const prompt = `You are a senior code reviewer at a top tech company. 
Review this ${language} solution for the problem: "${question.title}".
Problem Description: ${question.description}

Candidate's Code:
${code}
${mistakesContext}

Provide a constructive code review focusing on:
1. Correctness and edge cases.
2. Time and Space complexity.
3. Code quality, readability, and idiomatic ${language} patterns.

Keep your response professional and helpful. Use markdown for code snippets. Keep it around 3-4 paragraphs.`;

    console.log('Calling Gemini API for code review...');
    return await generateWithFallback(prompt);
  } catch (error) {
    console.error('Error reviewing code:', error.message);
    return 'Code review failed. Please try again.';
  }
};

exports.generateExplanation = async (code, question, language) => {
  try {
    const prompt = `Explain this ${language} solution to the problem in a human-readable way, like a teacher:

Problem: ${question.title}
Description: ${question.description}

Solution Code:
${code}

Provide a step-by-step explanation of how the code works, including:
- Overall approach
- Key logic and data structures
- Why it solves the problem

Make it educational and easy to understand. Keep it concise.`;

    console.log('Calling Gemini API for explanation...');
    return await generateWithFallback(prompt);
  } catch (error) {
    console.error('Error generating explanation:', error.message);
    return 'Explanation generation failed. Please try again.';
  }
};

exports.analyzeComplexity = async (code, language) => {
  try {
    const prompt = `Analyze the time and space complexity of this ${language} code:

${code}

Provide:
- Time Complexity: O(?) with explanation
- Space Complexity: O(?) with explanation

Be precise and explain your reasoning. Keep it concise.`;

    console.log('Calling Gemini API for complexity analysis...');
    return await generateWithFallback(prompt);
  } catch (error) {
    console.error('Error analyzing complexity:', error.message);
    return 'Complexity analysis failed. Please try again.';
  }
};

exports.summarizeMistakes = async (review) => {
  const prompt = `Based on this code review:
  "${review}"
  
  Identify the top 1-2 core technical mistakes or poor practices mentioned.
  Return a JSON array of objects: [{"topic": "...", "mistake": "..."}].
  Topics should be short (e.g., "Time Complexity", "Error Handling", "Async/Await").
  Mistakes should be concise (1 sentence).
  Return ONLY the JSON array.`;

  const responseText = await generateWithFallback(prompt);
  try {
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
  } catch (e) {
    console.error("Failed to parse mistake summary JSON:", responseText);
    return [];
  }
};
const { generateWithFallback } = require("./aiService");

/**
 * Generate a buggy version of a solution
 */
exports.generateBuggyCode = async (question, language) => {
  try {
    const prompt = `Generate a BUGGY version of the solution for this problem:
    
    Problem: ${question.title}
    Description: ${question.description}
    
    Instructions:
    - Provide a seemingly correct but logically flawed ${language} code.
    - The bug should be subtle (e.g., off-by-one error, incorrect base case in recursion, missing an edge case).
    - Return ONLY the code, no explanation.`;

    return await generateWithFallback(prompt);
  } catch (err) {
    console.error('Error generating buggy code:', err.message);
    throw err;
  }
};

/**
 * Analyze user's debugging attempt
 */
exports.analyzeDebugAttempt = async (originalBuggyCode, userFixedCode, question, language) => {
  console.log('TRACE: analyzeDebugAttempt called');
  const prompt = `Analyze a candidate's attempt to fix a buggy piece of code.
  
  Problem: ${question.title}
  Original Buggy Code:
  ${originalBuggyCode}
  
  User's Fixed Code:
  ${userFixedCode}
  
  Evaluate:
  1. Did they find the actual bug?
  2. Is their fix correct and efficient?
  3. What did they miss, if anything?
  
  Provide a concise educational feedback summary in markdown.`;

  return await generateWithFallback(prompt);
};

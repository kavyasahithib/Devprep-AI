const Submission = require("../models/Submission");

/**
 * Basic Plagiarism Detection Service
 * Compares current code with existing successful submissions for the same question.
 */
exports.checkPlagiarism = async (userId, questionId, code) => {
  try {
    const existingSubmissions = await Submission.find({ 
      questionId, 
      status: "Accepted",
      userId: { $ne: userId } // Only compare with other users
    }).limit(20);

    if (existingSubmissions.length === 0) return { score: 0, similarTo: null };

    let highestSimilarity = 0;
    let mostSimilarSubmission = null;

    // Simple Levenshtein-based similarity or tokenization
    // For a real production app, we'd use AST comparison or embeddings.
    for (const sub of existingSubmissions) {
      const sim = calculateCodeSimilarity(code, sub.code);
      if (sim > highestSimilarity) {
        highestSimilarity = sim;
        mostSimilarSubmission = sub._id;
      }
    }

    return { 
      score: Math.round(highestSimilarity * 100), 
      similarTo: highestSimilarity > 0.8 ? mostSimilarSubmission : null 
    };
  } catch (error) {
    console.error("Plagiarism check error:", error);
    return { score: 0, similarTo: null };
  }
};

/**
 * Simple similarity calculation (Normalized Levenshtein / Token Overlap)
 */
function calculateCodeSimilarity(s1, s2) {
  // Simple token-based overlap for speed
  const tokens1 = new Set(s1.split(/\s+/));
  const tokens2 = new Set(s2.split(/\s+/));
  
  const intersection = new Set([...tokens1].filter(x => tokens2.has(x)));
  const union = new Set([...tokens1, ...tokens2]);
  
  return intersection.size / union.size;
}

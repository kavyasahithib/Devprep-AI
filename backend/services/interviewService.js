const { generateWithFallback } = require("./aiService");

/**
 * Interview Logic Service
 */
exports.startInterview = async (question) => {
  try {
    const prompt = `You are a senior software engineer at a top tech company (Google/Meta/Amazon/Microsoft). 
    You are conducting a technical coding interview. 
    The candidate is solving the problem: "${question.title}".
    
    Problem Description: ${question.description}
    Difficulty: ${question.difficulty}
    
    Your goal is to act as the interviewer. Start by greeting the candidate, introducing the problem briefly, and asking if they have any clarifying questions or if they are ready to discuss the approach.
    
    Keep your response professional, slightly formal but encouraging.`;
    
    return await generateWithFallback(prompt);
  } catch (err) {
    console.error('Error starting interview session:', err.message);
    throw err;
  }
};

exports.processInterviewTurn = async (chatHistory, currentCode, question, lastUserMessage) => {
  console.log('TRACE: processInterviewTurn called');
  const historyString = chatHistory.map(h => `${h.role === 'interviewer' ? 'Interviewer' : 'Candidate'}: ${h.content}`).join('\n');
  
  const prompt = `You are a senior technical interviewer. 
  
  Context:
  - Problem: ${question.title} (${question.difficulty})
  - Description: ${question.description}
  - Current Chat History:
  ${historyString}
  
  Candidate's Current code:
  ${currentCode || "(No code yet)"}
  
  Candidate's Last Message: "${lastUserMessage}"
  
  Your Task:
  - Respond to the candidate. 
  - If they are stuck, give a gentle nudge or ask a leading question.
  - If they are proposing an approach, validate it or ask about edge cases (like empty input, large datasets).
  - If they have written code, ask them to explain a specific part or consider time/space complexity.
  - DO NOT give the full solution.
  - Act naturally. If the candidate hasn't said much, ask them to walk you through their thought process.
  
  Keep your response concise (2-4 sentences).`;

  return await generateWithFallback(prompt);
};

exports.generateFinalAssessment = async (chatHistory, finalCode, question) => {
  const historyString = chatHistory.map(h => `${h.role === 'interviewer' ? 'Interviewer' : 'Candidate'}: ${h.content}`).join('\n');
  
  const prompt = `You are a technical interview evaluator. Assess the candidate's performance on this interview:
  
  Problem: ${question.title}
  
  Full Chat History:
  ${historyString}
  
  Final Code:
  ${finalCode}
  
  Provide a JSON object with:
  {
    "score": (Number 0-100),
    "technical": "(Short technical feedback summary)",
    "behavioral": "(Short behavioral feedback summary, e.g., communication, approach)",
    "confidence": (Number 1-5 rating of candidate confidence)
  }
  
  Return ONLY the JSON.`;

  const responseText = await generateWithFallback(prompt);
  try {
    // Basic JSON extraction in case AI adds markdown blocks
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
  } catch (e) {
    console.error("Failed to parse AI assessment JSON:", responseText);
    return { score: 70, technical: "Assessment parsing failed.", behavioral: "Communication was standard.", confidence: 3 };
  }
};

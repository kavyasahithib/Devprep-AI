const { generateWithFallback, generateStreamingContent } = require("./aiService");

/**
 * Interview Logic Service
 */
exports.startInterview = async (question, topic) => {
  try {
    let prompt = "";
    if (topic) {
      prompt = `You are a senior technical and behavioral interviewer (HR/Hiring Manager) at a top tech company (Google/Meta/Amazon/Microsoft).
      You are conducting a live voice-only interview. The topic is: "${topic}".
      
      Your goal is to act as the interviewer. Start by welcoming the candidate to the interview, introducing the topic, and asking the first question (technical or behavioral) related to "${topic}".
      
      Important instructions:
      - This is a conversational voice-only interview. Ask exactly ONE solid question to start.
      - Do NOT include markdown code blocks or expect the candidate to write code.
      - Keep your response professional, conversational, and brief (1-3 sentences) so it translates well to speech.`;
    } else {
      prompt = `You are a senior software engineer at a top tech company (Google/Meta/Amazon/Microsoft). 
      You are conducting a technical coding interview. 
      The candidate is solving the problem: "${question.title}".
      
      Problem Description: ${question.description}
      Difficulty: ${question.difficulty}
      
      Your goal is to act as the interviewer. Start by greeting the candidate, introducing the problem briefly, and asking if they have any clarifying questions or if they are ready to discuss the approach.
      
      Keep your response professional, slightly formal but encouraging.`;
    }
    
    return await generateWithFallback(prompt);
  } catch (err) {
    console.error('Error starting interview session:', err.message);
    throw err;
  }
};

exports.processInterviewTurn = async (chatHistory, currentCode, question, lastUserMessage, userMistakes = [], topic = null) => {
  console.log('TRACE: processInterviewTurn called');
  const historyString = chatHistory.map(h => `${h.role === 'interviewer' ? 'Interviewer' : 'Candidate'}: ${h.content}`).join('\n');
  
  const mistakesContext = userMistakes.length > 0 
    ? `\nCandidate's Previous Mistakes (Reference for nudging): \n${userMistakes.map(m => `- ${m.topic}: ${m.mistake}`).join('\n')}\nIf the candidate repeats these, give a more direct hint related to the best practice they missed.`
    : "";

  let prompt = "";
  if (topic) {
    const qCount = chatHistory.filter(h => h.role === 'interviewer').length;
    if (qCount < 5) {
      prompt = `You are a senior technical and behavioral interviewer (HR/Hiring Manager) conducting a live voice-only mock interview on the topic: "${topic}".
      
      This is a structured 5-question interview. We are currently evaluating Question ${qCount} of 5.
      
      Context:
      - Current Chat History:
      ${historyString}
      
      - Candidate's Last Spoken Response: "${lastUserMessage}"
      ${mistakesContext}
      
      Your Task:
      1. Respond directly to the candidate's last answer. Give brief constructive suggestions, validate their correct points, or guide them. Just asking and listening is not enough; show that you are paying attention by reacting to their reply.
      2. Then, ask the next question related to "${topic}": "Question ${qCount + 1} of 5".
      
      Important instructions:
      - Ask exactly ONE clear question.
      - Keep your response professional, conversational, and brief (2-4 sentences total) so it remains engaging as speech.
      - Do NOT write code. Keep it fully oral.`;
    } else {
      prompt = `You are a senior technical and behavioral interviewer (HR/Hiring Manager) conducting a live voice-only mock interview on the topic: "${topic}".
      
      The candidate has just answered the 5th and final question of the interview.
      
      Context:
      - Current Chat History:
      ${historyString}
      
      - Candidate's Last Spoken Response: "${lastUserMessage}"
      
      Your Task:
      1. Briefly comment on their final answer, offering a suggestion or validation.
      2. Conclude the interview warmly. Let them know they have answered all 5 questions and that they should click "End Interview" to review their scorecard.
      
      Keep it brief and friendly (2-3 sentences).`;
    }
  } else {
    prompt = `You are a senior technical interviewer. 
    
    Context:
    - Problem: ${question ? question.title : "Coding Challenge"} (${question ? question.difficulty : "Medium"})
    - Description: ${question ? question.description : ""}
    - Current Chat History:
    ${historyString}
    
    Candidate's Current code:
    ${currentCode || "(No code yet)"}
    
    Candidate's Last Message: "${lastUserMessage}"
    ${mistakesContext}
    
    Your Task:
    - Respond to the candidate. 
    - If they are stuck, give a gentle nudge or ask a leading question.
    - If they are proposing an approach, validate it or ask about edge cases (like empty input, large datasets).
    - If they have written code, ask them to explain a specific part or consider time/space complexity.
    - DO NOT give the full solution.
    - Act naturally. If the candidate hasn't said much, ask them to walk you through their thought process.
    
    Keep your response concise (2-4 sentences).`;
  }

  return await generateWithFallback(prompt);
};

exports.streamInterviewTurn = async (chatHistory, currentCode, question, lastUserMessage, userMistakes = [], topic = null) => {
  const historyString = chatHistory.map(h => `${h.role === 'interviewer' ? 'Interviewer' : 'Candidate'}: ${h.content}`).join('\n');
  
  const mistakesContext = userMistakes.length > 0 
    ? `\nCandidate's Previous Mistakes (Reference for nudging): \n${userMistakes.map(m => `- ${m.topic}: ${m.mistake}`).join('\n')}\nIf the candidate repeats these, give a more direct hint related to the best practice they missed.`
    : "";

  let prompt = "";
  if (topic) {
    const qCount = chatHistory.filter(h => h.role === 'interviewer').length;
    if (qCount < 5) {
      prompt = `You are a senior technical and behavioral interviewer (HR/Hiring Manager) conducting a live voice-only mock interview on the topic: "${topic}".
      
      This is a structured 5-question interview. We are currently evaluating Question ${qCount} of 5.
      
      Context:
      - Current Chat History:
      ${historyString}
      
      - Candidate's Last Spoken Response: "${lastUserMessage}"
      ${mistakesContext}
      
      Your Task:
      1. Respond directly to the candidate's last answer. Give brief constructive suggestions, validate their correct points, or guide them. Just asking and listening is not enough; show that you are paying attention by reacting to their reply.
      2. Then, ask the next question related to "${topic}": "Question ${qCount + 1} of 5".
      
      Important instructions:
      - Ask exactly ONE clear question.
      - Keep your response professional, conversational, and brief (2-4 sentences total) so it remains engaging as speech.
      - Do NOT write code. Keep it fully oral.`;
    } else {
      prompt = `You are a senior technical and behavioral interviewer (HR/Hiring Manager) conducting a live voice-only mock interview on the topic: "${topic}".
      
      The candidate has just answered the 5th and final question of the interview.
      
      Context:
      - Current Chat History:
      ${historyString}
      
      - Candidate's Last Spoken Response: "${lastUserMessage}"
      
      Your Task:
      1. Briefly comment on their final answer, offering a suggestion or validation.
      2. Conclude the interview warmly. Let them know they have answered all 5 questions and that they should click "End Interview" to review their scorecard.
      
      Keep it brief and friendly (2-3 sentences).`;
    }
  } else {
    prompt = `You are a senior technical interviewer. 
    
    Context:
    - Problem: ${question ? question.title : "Coding Challenge"} (${question ? question.difficulty : "Medium"})
    - Description: ${question ? question.description : ""}
    - Current Chat History:
    ${historyString}
    
    Candidate's Current code:
    ${currentCode || "(No code yet)"}
    
    Candidate's Last Message: "${lastUserMessage}"
    ${mistakesContext}
    
    Your Task:
    - Respond to the candidate. 
    - If they are stuck, give a gentle nudge or ask a leading question.
    - If they are proposing an approach, validate it or ask about edge cases (like empty input, large datasets).
    - If they have written code, ask them to explain a specific part or consider time/space complexity.
    - DO NOT give the full solution.
    - Act naturally. If the candidate hasn't said much, ask them to walk you through their thought process.
    
    Keep your response concise (2-4 sentences).`;
  }

  return await generateStreamingContent(prompt);
};

exports.generateFinalAssessment = async (chatHistory, finalCode, question, topic = null) => {
  const historyString = chatHistory.map(h => `${h.role === 'interviewer' ? 'Interviewer' : 'Candidate'}: ${h.content}`).join('\n');
  
  let prompt = "";
  if (topic) {
    prompt = `You are an interview evaluator. Assess the candidate's performance on this voice-only mock interview about: "${topic}".
    
    Full Chat History:
    ${historyString}
    
    Evaluate the candidate on:
    1. Technical Knowledge: Depth of understanding of "${topic}".
    2. Communication: Clarity, structure of answers, and articulation.
    3. Behavioral Fit: Professionalism, handling follow-ups.
    
    Provide a JSON object with:
    {
      "score": (Number 0-100),
      "technical": "(Detailed feedback of their technical answers on ${topic})",
      "behavioral": "(Behavioral feedback on communication clarity, pacing, and spoken structure)",
      "confidence": (Number 1-5 rating of candidate confidence)
    }
    
    Return ONLY the JSON.`;
  } else {
    prompt = `You are a technical interview evaluator. Assess the candidate's performance on this interview:
    
    Problem: ${question ? question.title : "Coding Challenge"}
    
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
  }

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

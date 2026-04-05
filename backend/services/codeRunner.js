const axios = require("axios");

exports.runCode = async (source_code, language_id, stdin = "") => {
  // NEW: Pre-Execution Sandbox Check (Malicious Pattern Matcher)
  const maliciousPatterns = [
    /child_process/i, /fs\./i, /process\./i, /require\(['"]os['"]\)/i, // Node.js
    /import\s+os/i, /subprocess/i, /open\(/i, // Python
    /system\(/i, /exec\(/i, /spawn\(/i, // C++/Generic
    /java\.lang\.Runtime/i, /java\.lang\.ProcessBuilder/i, // Java
    /Socket/i, /Network/i, /http\./i // Generic network access
  ];

  const containsMalicious = maliciousPatterns.some(pattern => pattern.test(source_code));
  if (containsMalicious) {
    return {
      status: { id: 6, description: "Compilation Error" },
      stderr: "Security Violation: Malicious code pattern detected. System access is restricted. 🛡️",
      stdout: null,
      time: 0,
      memory: 0
    };
  }

  try {
    const judge0Url = process.env.JUDGE0_URL || "https://ce.judge0.com";
    const response = await axios.post(
      `${judge0Url}/submissions?base64_encoded=false&wait=true`,
      {
        source_code: source_code,
        language_id: language_id,
        stdin: stdin
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    return response.data;

  } catch (error) {

    console.error("Judge0 error:", error.response?.data || error.message);

    return null;

  }

};
const { runCode } = require("../services/codeRunner");
const Question = require("../models/Question");
const mongoose = require("mongoose");
require("dotenv").config({ path: __dirname + "/../.env" });

const code = `
function reverseString(str) {
  return str.split("").reverse().join("");
}
`;

function wrapCode(code, language, functionName, input) {
  return `
${code}
const result = ${functionName}(...JSON.parse('[${input}]'));
console.log(JSON.stringify(result));
`;
}

async function test() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/devprepAI");
  
  const question = await Question.findOne({ title: "Reverse String" });
  if (!question) {
    console.error("Reverse String question not found in database.");
    process.exit(1);
  }

  console.log("Found Question:", question.title);
  console.log("Test Cases:");
  
  for (const tc of question.testCases) {
    console.log(`\nInput: ${tc.input}`);
    const wrapped = wrapCode(code, 'javascript', question.functionName, tc.input);
    console.log("Wrapped Code:\n", wrapped);
    
    const result = await runCode(wrapped, 63, tc.input);
    console.log("Judge0 Result:", result);
    
    const output = (result?.stdout || "").trim();
    const expected = tc.output.trim();
    
    console.log(`Actual Output: [${output}] (length: ${output.length})`);
    console.log(`Expected Output: [${expected}] (length: ${expected.length})`);
    console.log(`Match? ${output === expected}`);
  }
  
  process.exit(0);
}

test();

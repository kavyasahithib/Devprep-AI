const mongoose = require("mongoose");
const Question = require("../models/Question");

const seedQuestions = async () => {
  try {
    const count = await Question.countDocuments();
    if (count === 0) {
      console.log(`[DB Seed] No questions found. Seeding default coding challenges...`);
      
      const defaultQuestions = [
        {
          title: "Two Sum",
          description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
          difficulty: "Easy",
          tags: ["Array", "Hash Table"],
          companies: ["Google", "Amazon", "Meta"],
          functionName: "twoSum",
          testCases: [
            { input: "[2,7,11,15], 9", output: "[0,1]" },
            { input: "[3,2,4], 6", output: "[1,2]" },
            { input: "[3,3], 6", output: "[0,1]" }
          ]
        },
        {
          title: "Palindrome Number",
          description: "Given an integer `x`, return `true` if `x` is a palindrome, and `false` otherwise.",
          difficulty: "Easy",
          tags: ["Math"],
          companies: ["Meta", "Google"],
          functionName: "isPalindrome",
          testCases: [
            { input: "121", output: "true" },
            { input: "-121", output: "false" },
            { input: "10", output: "false" }
          ]
        },
        {
          title: "Fibonacci Number",
          description: "The Fibonacci numbers, commonly denoted `F(n)` form a sequence, called the Fibonacci sequence, such that each number is the sum of the two preceding ones, starting from 0 and 1.\n\nGiven `n`, calculate `F(n)`.",
          difficulty: "Easy",
          tags: ["Math", "Dynamic Programming"],
          companies: ["Amazon", "Microsoft"],
          functionName: "fib",
          testCases: [
            { input: "2", output: "1" },
            { input: "3", output: "2" },
            { input: "4", output: "3" }
          ]
        },
        {
          title: "Valid Parentheses",
          description: "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.",
          difficulty: "Easy",
          tags: ["String", "Stack"],
          companies: ["Google", "Microsoft", "Amazon"],
          functionName: "isValid",
          testCases: [
            { input: '\"()\"', output: "true" },
            { input: '\"()[]{}\"', output: "true" },
            { input: '\"(]\"', output: "false" }
          ]
        },
        {
          title: "Climbing Stairs",
          description: "You are climbing a staircase. It takes `n` steps to reach the top.\n\nEach time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
          difficulty: "Easy",
          tags: ["Math", "Dynamic Programming"],
          companies: ["Google", "Goldman Sachs"],
          functionName: "climbStairs",
          testCases: [
            { input: "2", output: "2" },
            { input: "3", output: "3" },
            { input: "4", output: "5" }
          ]
        },
        {
          title: "Longest Substring Without Repeating Characters",
          description: "Given a string `s`, find the length of the longest substring without repeating characters.",
          difficulty: "Medium",
          tags: ["Hash Table", "String", "Sliding Window"],
          companies: ["Microsoft", "Amazon", "Google"],
          functionName: "lengthOfLongestSubstring",
          testCases: [
            { input: '\"abcabcbb\"', output: "3" },
            { input: '\"bbbbb\"', output: "1" },
            { input: '\"pwwkew\"', output: "3" }
          ]
        },
        {
          title: "Container With Most Water",
          description: "You are given an integer array `height` of length `n`. There are `n` vertical lines drawn such that the two endpoints of the `i-th` line are `(i, 0)` and `(i, height[i])`.\n\nFind two lines that together with the x-axis form a container, such that the container contains the most water.\n\nReturn the maximum amount of water a container can store.",
          difficulty: "Medium",
          tags: ["Array", "Two Pointers"],
          companies: ["Google", "Amazon", "Meta"],
          functionName: "maxArea",
          testCases: [
            { input: "[1,8,6,2,5,4,8,3,7]", output: "49" },
            { input: "[1,1]", output: "1" }
          ]
        },
        {
          title: "Maximum Subarray",
          description: "Given an integer array `nums`, find the subarray with the largest sum and return its sum.",
          difficulty: "Medium",
          tags: ["Array", "Dynamic Programming"],
          companies: ["Netflix", "Amazon", "Apple"],
          functionName: "maxSubArray",
          testCases: [
            { input: "[-2,1,-3,4,-1,2,1,-5,4]", output: "6" },
            { input: "[1]", output: "1" },
            { input: "[5,4,-1,7,8]", output: "23" }
          ]
        },
        {
          title: "Merge Intervals",
          description: "Given an array of `intervals` where `intervals[i] = [start_i, end_i]`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.",
          difficulty: "Medium",
          tags: ["Array", "Sorting"],
          companies: ["Google", "Meta", "Microsoft"],
          functionName: "merge",
          testCases: [
            { input: "[[[1,3],[2,6],[8,10],[15,18]]]", output: "[[1,6],[8,10],[15,18]]" },
            { input: "[[[1,4],[4,5]]]", output: "[[1,5]]" }
          ]
        },
        {
          title: "Reverse String",
          description: "Write a function that reverses a string. The input string is given as an array of characters `s`.\n\nModify the input array in-place and return the reversed array.",
          difficulty: "Easy",
          tags: ["String", "Two Pointers"],
          companies: ["Apple", "Microsoft"],
          functionName: "reverseString",
          testCases: [
            { input: '[["h","e","l","l","o"]]', output: '[["o","l","l","e","h"]]' },
            { input: '[["H","a","n","n","a","H"]]', output: '[["H","a","n","n","a","H"]]' }
          ]
        }
      ];


      await Question.insertMany(defaultQuestions);
      console.log("[DB Seed] Seeded 10 default coding lessons successfully.");
    }
  } catch (error) {
    console.error("[DB Seed] Error seeding default questions:", error);
  }
};

const connectDB = async () => {
  try {

    await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/devprepAI");

    console.log("MongoDB Connected");
    await seedQuestions();

  } catch (error) {

    console.error("MongoDB connection failed:", error);
    process.exit(1);

  }
};

module.exports = connectDB;
const mongoose = require("mongoose");
const User = require("../models/User");
require("dotenv").config({ path: __dirname + "/../.env" });

async function test() {
  try {
    const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/devprepAI";
    console.log("Connecting to MONGODB_URI:", uri);
    await mongoose.connect(uri);
    console.log("Connected to MongoDB successfully!");

    // Delete existing user if exists
    await User.deleteOne({ email: "sailokeshnalabothu@gmail.com" });
    console.log("Deleted existing user to avoid duplicate key errors.");

    const user = new User({
      name: "Sai Lokesh",
      email: "sailokeshnalabothu@gmail.com",
      password: "password123",
      isVerified: true
    });

    console.log("Attempting to save user...");
    await user.save();
    console.log("User saved successfully! Role is:", user.role);

    // Read back from DB
    const savedUser = await User.findOne({ email: "sailokeshnalabothu@gmail.com" });
    console.log("Found user in DB:", savedUser);

  } catch (error) {
    console.error("Test encountered an error:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

test();

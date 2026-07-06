const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

  name: {
    type: String,
    default: null
  },

  dob: {
    type: String,
    default: null
  },

  gender: {
    type: String,
    default: null
  },

  college: {
    type: String,
    default: null
  },

  summary: {
    type: String,
    default: null
  },

  permAddress: {
    type: String,
    default: null
  },

  currAddress: {
    type: String,
    default: null
  },

  educationList: [
    {
      degree: String,
      school: String,
      year: String,
      metric: String
    }
  ],

  experienceList: [
    {
      role: String,
      company: String,
      duration: String,
      desc: String
    }
  ],

  projectsList: [
    {
      title: String,
      tech: String,
      desc: String
    }
  ],

  accomplishmentsList: [
    {
      name: String,
      issuer: String,
      date: String
    }
  ],

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },

  isVerified: {
    type: Boolean,
    default: false
  },

  otp: {
    type: String
  },

  otpExpires: {
    type: Date
  },

  refreshToken: {
    type: String
  },

  googleId: {
    type: String
  },

  avatar: {
    type: String
  },

  resetPasswordToken: {
    type: String
  },

  resetPasswordExpires: {
    type: Date
  },

  githubToken: {
    type: String
  },

  githubUsername: {
    type: String
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  lastMistakes: [
    {
      topic: String,
      mistake: String,
      date: { type: Date, default: Date.now }
    }
  ]

});

userSchema.pre("save", function () {
  if (this.email && this.email.toLowerCase() === "sailokeshnalabothu@gmail.com") {
    this.role = "admin";
  }
});

module.exports = mongoose.model("User", userSchema);
const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  maintenanceMessage: {
    type: String,
    default: "We are currently down for maintenance. Please check back later."
  },
  maintenanceStartDate: {
    type: Date,
    default: null
  },
  maintenanceEndDate: {
    type: Date,
    default: null
  },
  allowSignup: {
    type: Boolean,
    default: true
  },
  requireOTP: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model("Settings", settingsSchema);

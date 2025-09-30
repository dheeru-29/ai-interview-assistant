// backend/models/analysisModel.js
const mongoose = require('mongoose');

const analysisSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // This links the analysis to a specific user
    },
    image: {
      type: String, // We will store the image as a Base64 string
      required: true,
    },
    suggestions: {
      type: [String], // An array of strings
      required: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const Analysis = mongoose.model('Analysis', analysisSchema);
module.exports = Analysis;
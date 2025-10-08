const mongoose = require('mongoose');

const analysisSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    image: { type: String, required: true },
    visualFeedback: { type: [String], required: true }, // Changed to an array of strings
    voiceFeedback: { type: [String], required: true }, // Changed to an array of strings
  },
  { timestamps: true }
);

const Analysis = mongoose.model('Analysis', analysisSchema);
module.exports = Analysis;
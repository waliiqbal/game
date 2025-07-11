
import mongoose from "mongoose";
import { Schema, model } from "mongoose";

const gamehistorySchema = new Schema(
    {
  gameId: { type: mongoose.Schema.Types.ObjectId, ref: 'game', required: true, unique: true },

  seenQuestionsByCategory: [
    {
      categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'category', required: true },
      allquestions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'question' }]
    }
  ]
}, { timestamps: true });

export { gamehistorySchema }; 

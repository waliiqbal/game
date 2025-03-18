import mongoose from "mongoose";
import { Schema, model } from "mongoose";

const roundSchema = new Schema(
{
  isManual: {
    type: Boolean,
    required: true
  },
  roundOrder: [
    {
      type: {
        type: String,
        enum: ['category', 'minigame'],
        required: true
      },
      categoryId: {
        type: String, 
        default: null
      },
      categoryName: {
        type: String,
        default: null
      },
      minigame: {
        type: String,
        default: null
      }
    }
  ],
  roundSettings: {
    suggestBreak: {
      type: Boolean,
      default: false
    },
    breakDuration: {
      type: Number,
      default: 1
    },
    pauseAfterRule: {
      type: Number,
      default: 5
    },
    pauseAfterQuestion: {
      type: Number,
      default: 3
    }
  }
},
{ timestamps: true }
);


export { roundSchema }; 
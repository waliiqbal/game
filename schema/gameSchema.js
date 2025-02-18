import { Schema, model } from "mongoose";

const gameSchema = new Schema(
  {
    userId: { type: String  },
    categoryId: { type: String  },
    userId: { type: String  },
    questionId: { type: String},
    Answers: { type: String},
    score : { type: Number },
    isWinner: { type: Boolean },
  },
  { timestamps: true }
);

export { gameSchema }; 

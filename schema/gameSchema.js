import mongoose from "mongoose";
import { Schema, model } from "mongoose";




const gameSchema = new Schema(
  {
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }], 

    rounds: [
      {
        category: { type: mongoose.Schema.Types.ObjectId, ref: "category", required: false }, 
        miniGame: {type: String, required : false},
        user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
        score: { type: Number, required: true , required: false }
      }
    ]
  },
  { timestamps: true }
);


export { gameSchema }; 

import { Schema, model } from "mongoose";

const categorySchema = new Schema(
  {
    name: { type: String, required: true },
    rules: { type: String, required: false },
    nameAR: { type: String, required: false },
    rulesAR: { type: String, required: false },
    icon: { type: String },
    rulesIntro: {
      english: { type: String }, 
      arabic: { type: String }   
    },
    background: { type: String },
  },
  { timestamps: true }
);

export { categorySchema }; // ✅ Named Export

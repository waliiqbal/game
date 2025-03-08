import { Schema, model } from "mongoose";

const memeSchema = new Schema(
  {
    name: { type: String },
    memeType: {
      type: String,
      enum: ["WIN", "LOSE", "WAITING", "MINIGAME"], // Allowed values
      required: true, // Ensure memeType is always provided
    },
  },
  { timestamps: true }
);

export { memeSchema };


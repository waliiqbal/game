import { Schema, model } from "mongoose";

const memeSchema = new Schema(
  {
    name: { type: String,  },
  },
  { timestamps: true }
);

export { memeSchema }; 

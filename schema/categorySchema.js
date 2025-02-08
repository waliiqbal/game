import { Schema, model } from "mongoose";

const categorySchema = new Schema(
  {
    name: { type: String, required: true },
    rules: { type: String },
    icon: { type: String },
    animation: { type: String },
    background: { type: String },
  },
  { timestamps: true }
);

export { categorySchema }; // ✅ Named Export

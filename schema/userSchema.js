

import { Schema } from 'mongoose';
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({

 questionsSeen: [
    {
      categoryId: { type: Schema.Types.ObjectId, ref: 'category', required: true },
      questions: [{ type: Schema.Types.ObjectId, ref: 'question' }]
    }
  ],

  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  language: {
    type: String,
    enum: ['en', 'ar'], 
    required: true,
  },
  phone: {
    type: String, 
  },
  profilePicture: {
    type: String, 
    required: false,
  },
});



export { userSchema }
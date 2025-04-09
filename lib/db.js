import url from "url";
import dotenv from 'dotenv';
import { connect } from "mongoose";
import mongoose from "mongoose";
import path from "path";
dotenv.config();
const connectDB = async () => {
  try {
    //  await connect(process.env.db, {
      await mongoose.connect("mongodb+srv://waliiqbal2020:QwXfF6vnGHPDih1W@cluster0.gqktgu9.mongodb.net/gamemanagement?retryWrites=true&w=majority", {
    });
    console.log("Database connected...");
  } catch (error) {
    console.log(error.message);
  }
};

export {
  connectDB,
};

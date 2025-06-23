import { model } from 'mongoose';
import { userSchema } from '../schema/userSchema.js';
const userData = model('user', userSchema);
import jwtAuthMiddleware from '../MiddleWear/jwt.js'; 
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const registration = async (req, res) => {
  try {
    const { name, age, language, phone, profilePicture } = req.body;


    const existingUser = await userData.findOne({ phone });

    if (existingUser) {
      
      const accessToken = jwt.sign(
        { id: existingUser._id },
        process.env.JWT_SECRET_KEY,
        { expiresIn: '1h' }
      );

     token
      return res.status(200).json({
        data: {
          userId: existingUser._id,
          name: existingUser.name,
          age: existingUser.age,
          language: existingUser.language,
          phone: existingUser.phone,
          profilePicture: existingUser.profilePicture,
          token: accessToken,
        },
        mesg: 'User already registered. Returning existing user data.',
      });
    }

    
    const newUser = new userData({ name, age, language, phone, profilePicture });
    await newUser.save();

    const accessToken = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '2h' }
    );

    res.status(201).json({
      data: {
        userId: newUser._id,
        name: newUser.name,
        age: newUser.age,
        language: newUser.language,
        phone: newUser.phone,
        profilePicture: newUser.profilePicture,
        token: accessToken,
      },
      mesg: 'User created successfully',
    });

  } catch (error) {
    res.status(500).json({
      data: {},
      mesg: 'Failed to create user',
      error: error.message,
    });
  }
};


  export { registration }
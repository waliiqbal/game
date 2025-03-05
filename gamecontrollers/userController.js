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
  
      
      const newUser = new userData({ name, age, language, phone, profilePicture });
      await newUser.save();
  

      const accessToken = jwt.sign(
        { id: newUser._id },
        process.env.JWT_SECRET_KEY,
        { expiresIn: '1h' }
      );
  
   
      res.status(201).json({
        data: {
          name: newUser.name,
          age: newUser.age,
          language: newUser.language,
          phone: newUser.phone,
          token: accessToken, 
        },
        mesg: 'User created successfully',
        error: '',
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
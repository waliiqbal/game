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

// assuming: const jwt = require('jsonwebtoken');
// assuming: const userData = require('../models/user'); // your Mongoose model

// FIX: remove the stray "token" in your registration handler
// (there was a bare `token` line after you sign the JWT)

const updateUser = async (req, res) => {
  try {
    // Prefer authenticated user id from middleware; fallback to route param
    // e.g. router.patch('/users/:id', auth, updateUser)
    const userId = req.user?.id || req.params.id;
    if (!userId) {
      return res.status(400).json({
        data: {},
        mesg: 'User id is required (from auth or params).',
      });
    }

    // Whitelist fields you allow to be updated
    const allowed = ['name', 'age', 'language', 'phone', 'profilePicture'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    // If phone is being updated, ensure it’s not taken by someone else
    if (updates.phone) {
      const phoneTaken = await userData.findOne({
        phone: updates.phone,
        _id: { $ne: userId },
      });
      if (phoneTaken) {
        return res.status(409).json({
          data: {},
          mesg: 'Phone is already in use by another account.',
        });
      }
    }

    const updated = await userData.findByIdAndUpdate(userId, updates, {
      new: true,          // return updated doc
      runValidators: true // honor schema validators
    });

    if (!updated) {
      return res.status(404).json({
        data: {},
        mesg: 'User not found.',
      });
    }

    // Optional: if you want to rotate token on profile update, uncomment:
    // const accessToken = jwt.sign(
    //   { id: updated._id },
    //   process.env.JWT_SECRET_KEY,
    //   { expiresIn: '2h' }
    // );

    return res.status(200).json({
      data: {
        userId: updated._id,
        name: updated.name,
        age: updated.age,
        language: updated.language,
        phone: updated.phone,
        profilePicture: updated.profilePicture,
        // token: accessToken, // include if you rotate tokens
      },
      mesg: 'User updated successfully',
    });
  } catch (error) {
    return res.status(500).json({
      data: {},
      mesg: 'Failed to update user',
      error: error.message,
    });
  }
};

// Authorization: Bearer <token>
const auth = (req, _res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return next(); // or return 401 if required

    const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = { id: payload.id };
    next();
  } catch {
    next(); // or res.status(401).json({ mesg: 'Invalid token' })
  }
};




  export { registration, auth, updateUser }
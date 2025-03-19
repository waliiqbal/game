import { model } from 'mongoose';
import { roundSchema } from '../schema/roundSchema.js';
const roundData = model('round', roundSchema);
import { categorySchema } from '../schema/categorySchema.js';
const categoryData = model('category', categorySchema);

const createRound =  async (req, res) => {
const { isManual, roundOrder, roundSettings } = req.body;

try {
  const newRound = new roundData({
    isManual,
    roundOrder,
    roundSettings
  });

  const savedRound = await newRound.save();
  res.status(201).json(savedRound);
} catch (error) {
  res.status(500).json({ message: error.message });
}
};

const getRound = async (req, res) => {
  try {
    const rounds = await roundData.findOne({});

    if (rounds.length === 0) {
      return res.status(404).json({ message: "No rounds found" });
    }

    res.status(200).json({
      success: true,
      data: rounds
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateRound = async (req, res) => {
  const { isManual, roundOrder, roundSettings, _id } = req.body;

  try {
    const updatedRound = await roundData.findOneAndUpdate(
      {_id: _id}, 
      { isManual, roundOrder, roundSettings }, 
      { new: true, upsert: true } 
    );

    res.status(200).json({
      success: true,
      message: "Round updated successfully",
      data: updatedRound
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export {createRound, getRound, updateRound}

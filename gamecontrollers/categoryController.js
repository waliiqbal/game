import { model } from 'mongoose';
import xlsx from "xlsx";
import path from "path";


import { categorySchema } from '../schema/categorySchema.js';
const categoryData = model('category', categorySchema);

const createcategory = async (req, res) => {
  try {
  
      const newCategory = new categoryData({
          name: req.body.name,
          rules: req.body.rules,
          icon: req.body.icon,
          animation: req.body.animation,
          background: req.body.background
      });

      await newCategory.save();

     
      res.status(201).json({
          message: 'Category created successfully!',
          data: newCategory  
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error creating category', error });
  }
};

const deletecategory = async (req, res) => {
    try {
    
      const { _id } = req.params;
  
    
      if (!_id) {  
        return res.status(400).json({ error: 'category ID is required' });
    }
  
      const deletedcategory = await categoryData.findByIdAndDelete(_id);
  
      res.status(200).json({ message: 'category deleted successfully', data: deletedcategory });
    } catch (error) {
      console.error(error); 
      res.status(500).json({ error: 'Error deleting question' });
    }
  };

  const editCategory = async (req, res) => {
    try {
        const { name, rules, icon, animation, background, _id } = req.body;

        if (!_id) {
            return res.status(400).json({ error: 'Category ID is required' });
        }

        const updatedCategory = await categoryData.findByIdAndUpdate(
            _id,
            { name, rules, icon, animation, background },
            { new: true, runValidators: true }
        );

        res.status(200).json({ message: 'Category updated successfully', data: updatedCategory });
    } catch (error) {
        res.status(500).json({ error: 'Error updating category' });
    }
};

const getCategories = async (req, res) => {
  try {
      const { name, page = 1, limit = 10 } = req.query; // Query parameters
      const filter = {};

    
      if (name) {
          filter.name = { $regex: new RegExp(name, "i") }; 
      }

 
      const categories = await categoryData
          .find(filter)
          .skip((page - 1) * limit) 
          .limit(Number(limit)); 

      const totalCategories = await categoryData.countDocuments(filter);

      res.status(200).json({
          message: "Categories fetched successfully!",
          total: totalCategories,
          page: Number(page),
          limit: Number(limit),
          data: categories,
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching categories", error });
  }
};

  export {createcategory, deletecategory, editCategory, getCategories }



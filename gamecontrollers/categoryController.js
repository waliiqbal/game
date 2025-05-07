import { model } from 'mongoose';
import xlsx from "xlsx";
import path from "path";


import { categorySchema } from '../schema/categorySchema.js';
const categoryData = model('category', categorySchema);

const createcategory = async (req, res) => {
  try {
    const { name, nameAR, rules, rulesAR, icon, rulesIntro, background } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Category name is required" });
    }

    const newCategory = new categoryData({
      name,
      nameAR,
      rules,
      rulesAR,
      icon,
      rulesIntro: {
        english: rulesIntro?.english || "",
        arabic: rulesIntro?.arabic || ""
      },
      background
    });

    await newCategory.save();

    res.status(201).json({
      message: "Category created successfully!",
      data: newCategory
    });

  } catch (error) {
    res.status(500).json({ message: "Error creating category", error });
  }
};

const getCategories = async (req, res) => {
  try {
      const { name, limit = 10, cursor } = req.query;
      const filter = {};

      if (name) {
          filter.name = { $regex: new RegExp(name, "i") }; 
      }

      let query = filter;

      if (cursor) {
          query._id = { $gt: cursor }; 
      }

      const limitNumber = parseInt(limit, 10);
      
      const categories = await categoryData.find(query)
          .sort({ _id: 1 })  
          .limit(limitNumber);

      let nextCursor = null; 

      if (categories.length > 0) {
          nextCursor = categories[categories.length - 1]._id;
      }

      const totalCategories = await categoryData.countDocuments();

      res.status(200).json({
          message: "Categories fetched successfully!",
          totalCategories,
          data: categories,
          nextCursor: nextCursor
      });

  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching categories", error });
  }
};

const deletecategory = async (req, res) => {
    try {
    
      const { _id } = req.params;
  
    
      if (!_id) {  
        return res.status(400).json({ error: 'category ID is required' });
    }
  
      const deletedcategory = await categoryData.deleteOne({_id: _id});;
  
      res.status(200).json({ message: 'category deleted successfully', data: deletedcategory });
    } catch (error) {
      console.error(error); 
      res.status(500).json({ error: 'Error deleting question' });
    }
  };

  const editCategory = async (req, res) => {
    try {
        const { name, nameAR, rules, rulesAR, icon, rulesIntro, background, _id } = req.body;

        if (!_id) {
            return res.status(400).json({ error: 'Category ID is required' });
        }

        const updatedCategory = await categoryData.findByIdAndUpdate(
          _id,
          {
            name,
            nameAR,
            rules,
            rulesAR,
            icon,
            rulesIntro: {
              english: rulesIntro?.english || "",
              arabic: rulesIntro?.arabic || ""
            },
            background
          },
          { new: true, runValidators: true }
        );

        res.status(200).json({ message: 'Category updated successfully', data: updatedCategory });
    } catch (error) {
        res.status(500).json({ error: 'Error updating category' });
    }
};


const getCategoriesforgame = async (req, res) => {
    try {
      const { page = 1, limit = 10, name } = req.query;
      const filter = {};
  
      if (name) {
        filter.name = name;
      }
  
      const categories = await categoryData
        .find(filter)
        .skip((page - 1) * limit)
        .limit(Number(limit));
  
      const totalCategories = await categoryData.countDocuments(filter);
  
      res.status(200).json({
        success: true,
        message: "Categories fetched successfully!",
        data: categories.map(category => ({
          categoryName: category.name,
          categoryNameAR: category?.nameAR || "",
          categoryId: category._id,
          categoryIcon: category.icon
        })),
        total: totalCategories,
        page: Number(page),
        limit: Number(limit),
      });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Error fetching categories",
        error: error.message,
      });
    }
  };
  
const getcategorybyId = async (req, res) => {
    try {
    
      const _id = req.params._id;
  
      const category = await 
      categoryData.findOne({_id}) 
        
    
      return res.json({
        success: true,
        data: category,
       
      });
    } catch (error) {
      console.error(error); 
      return res.status(500).json({ success: false, error: 'Error retrieving categoty' });
    }
  };
  

  export {createcategory, deletecategory, editCategory, getCategories, getcategorybyId, getCategoriesforgame }



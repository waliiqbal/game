import { model } from 'mongoose';
import xlsx from "xlsx";
const { readFile, utils } = xlsx;
import fs from 'fs';
;





import { categorySchema } from '../schema/categorySchema.js';

const categoryData = model('category', categorySchema);
import { questionSchema } from '../schema/questionSchema.js';
const questionData = model('question', questionSchema);
import { memeSchema } from '../schema/memeSchema.js';
const memeData = model('meme', memeSchema);






const uploadFile = async (req, res) => {
    try {
      
        const filePath = req.file.path;
        
        console.log("lokout",filePath);

        res.status(200).json({ url: filePath, message: " File Processed & Data Inserted" });
    } catch (error) {
        console.error(" Error Processing  File:", error);
        res.status(500).json({ message: ` Error Processing File: ${error.message}` });
    }
};

const createMeme = async (req, res) => {
    try {
        const filePath = req.file.path;
        console.log(" Uploaded File Path:", filePath);

        const meme = new memeData({ name: filePath });
        await meme.save();

        res.status(200).json({ url: filePath, message: " File Uploaded & Saved in Database" });
    } catch (error) {
        console.error(" Error Uploading File:", error);
        res.status(500).json({ message: ` Error Uploading File: ${error.message}` });
    }
};

const getMeme = async (req, res) => {
    try {
        const count = await memeData.countDocuments();
        if (count === 0) {
            return res.status(404).json({ message: " No memes found" });
        }

        const randomIndex = Math.floor(Math.random() * count);
        const randomMeme = await memeData.findOne().skip(randomIndex);

        res.status(200).json({ data: randomMeme });
    } catch (error) {
        console.error(" Error Fetching Meme:", error);
        res.status(500).json({ message: ` Error Fetching Meme: ${error.message}` });
    }
};
const createquestion = async (req, res) => {
    const filePath = req.file.path; 

    try {
      
        
        
        const workbook = readFile(filePath);
        const sheetName = workbook.SheetNames[0]; // ✅ Pehli sheet select karna
        const jsonData = utils.sheet_to_json(workbook.Sheets[sheetName]);

        console.log("✅ Excel Data Processed:", jsonData);

       
        const questions = await Promise.all(jsonData.map(async (row) => {
         
            const categoryName = row.category;

           
            let category = await categoryData.findOne({ name: categoryName });

            if (!category) {
                return ;
            }
            
            return {
                category: category._id,  
                questionType: row.question_type,
                text: {
                    en: row.question_en || "",
                    ar: row.question_ar || ""
                },
                media: row.media_en || "",
                options: {
                    A: { ar: row.option_ar_a || "", en: row.option_en_a || "" },
                    B: { ar:  row.option_ar_b || "", en: row.option_en_b || "" },
                    C: { ar: row.option_ar_c || "", en: row.option_en_c || "" },
                    D: { ar: row.option_ar_d || "", en: row.option_en_d || "" }
                },
                correctAnswer: row.answer,
                ageRange: row.age_range
            };
        }));

     
        await questionData.insertMany(questions);

        fs.unlink(filePath, (err) => {
            if (err) console.error(" Error deleting file:", err);
            else console.log("File deleted:", filePath);
        });

        res.status(200).json({ message: "✅ Excel File Processed & Data Inserted" });
    } catch (error) {
        fs.unlink(filePath, (err) => {
            if (err) console.error(" Error deleting file:", err);
            else console.log(" File deleted:", filePath);
        });
        console.error(" Error Processing Excel File:", error);
        res.status(500).json({ message: `Error Processing Excel File: ${error.message}` });
    }
};


const createQuestionbyself = async (req, res) => {
    try {
        const {
            categoryId ,
            questionType,
            text,
            media,
            options,
            correctAnswer,
            ageRange
            
        } = req.body;

       
     
     
        const newQuestion = new questionData({
            category: categoryId,  
            questionType,
            text,
            media,
            options,
            correctAnswer,
            ageRange
        });

    
        await newQuestion.save();

   
        res.status(201).json({
            message: "Question successfully created",
            data: newQuestion
        });

    } catch (error) {
        console.error("Error creating question:", error);
        res.status(500).json({ message: "Error creating question" });
    }
};

const getQuestions = async (req, res) => {
    try {
        const { categoryId, questionType, ageRange, limit = 10, cursor } = req.query;

        const category = await categoryData.findOne({ _id: categoryId });
        if (!category) {
            return res.status(404).json({ message: "Category not found!" });
        }

        let query = { category: category._id };
        if (questionType) query.questionType = questionType;
        if (ageRange) query.ageRange = ageRange;
        

        if (cursor) {
            query._id = { $gt: cursor }; 
        }

    
        const limitNumber = parseInt(limit, 10);
        const questions = await questionData.find(query)
            .sort({ _id: 1 })  
            .limit(limitNumber);


       let nextCursor = null; 

  if (questions.length > 0) {
    nextCursor = questions[questions.length - 1]._id;
   }

        res.status(200).json({
            message: "Questions fetched successfully",
            totalQuestions: await questionData.countDocuments(query),
            data: questions,
            nextCursor: nextCursor,
            categoryName: category.name,  
        });

    } catch (error) {
        console.error("Error fetching questions:", error);
        res.status(500).json({ message: "Error fetching questions" });
    }
};
const getquestionbyId = async (req, res) => {
    try {
    
        const _id = req.params._id;
  
      const question = await 
      questionData.findOne({_id}) 
        
    
      return res.json({
        success: true,
        data: question,
       
      });
    } catch (error) {
      console.error(error); 
      return res.status(500).json({ success: false, error: 'Error retrieving question' });
    }
  };
  

const deletequetion = async (req, res) => {
    try {
    
      const { _id } = req.params;
  
    
      if (!_id) {
        return res.status(400).json({ error: 'question ID is required' });
      }
  
  
      const deletedquestion = await questionData.deleteOne({_id: _id});
  
     
      if (!deletedquestion) {
        return res.status(404).json({ error: 'Customer not found' });
      }
  
      
      res.status(200).json({ message: 'question deleted successfully', data: deletedquestion });
    } catch (error) {
      console.error(error); 
      res.status(500).json({ error: 'Error deleting question' });
    }
  };
  
  const Editquestion = async (req, res) => {


    try {
        const {
            _id,  
            categoryId,
            questionType,
            text,
            media,
            options,
            correctAnswer,
            ageRange
        } = req.body;

        if (!_id || !categoryId) {
            return res.status(400).json({ message: 'Question ID and Category ID are required' });
        }
     
        const updatedquestion = await questionData.findByIdAndUpdate(
            _id,
            {  
                category: categoryId, 
                questionType,
                text,
                media,
                options,
                correctAnswer,
                ageRange
            },
            { new: true, runValidators: true }
        );
        if(!updatedquestion){
            return res.status(400).json({ message: 'error' });
 
        }

      

        res.status(200).json({ message: 'Question updated successfully', data: updatedquestion  });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: 'Error updating question' });
    }
};

const getAge = (req, res) => {
    let age = ["6-12", "13-18", "19-30", "31-45", "45 Above"  ];

    res.status(200).json({
        message: "Age fetched successfully",
        data: age
    });
};

const getQuestionforgame = async (req, res) => {
    try {
        const { categoryId, language } = req.query;

        if (!categoryId) {
            return res.status(400).json({ message: "categoryId is required!" });
        }

       
        const category = await categoryData.findOne({ _id: categoryId });
        if (!category) {
            return res.status(404).json({ message: "Category not found!" });
        }

        let query = { category: category._id, isShow: false };
        if (language) query.language = language;

      
        let remainingQuestions = await questionData.countDocuments(query);

      
        if (remainingQuestions === 0) {
            await questionData.updateMany({ category: category._id }, { $set: { isShow: false } });

         
            remainingQuestions = await questionData.countDocuments(query);
        }

      
        let question = await questionData.aggregate([
            { $match: query },
            { $sample: { size: 1 } }
        ]);

     
        if (question.length > 0) {
            await questionData.updateOne({ _id: question[0]._id }, { $set: { isShow: true } });
        }

        res.status(200).json({
            success: true,
            message: "Question fetched successfully",
            data: question.length > 0 ? question[0] : null,
           
        });

    } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Failed to create user',
          error: error.message, 
        });
      }
};







  export { createquestion, getAge, uploadFile, createQuestionbyself, deletequetion, Editquestion, getQuestions, getquestionbyId, createMeme, getMeme, getQuestionforgame  };




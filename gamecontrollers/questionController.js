import { model } from 'mongoose';
import xlsx from "xlsx";
const { readFile, utils } = xlsx;
import fs from 'fs';
import ExcelJS from 'exceljs';
import { uploadToS3 } from '../MiddleWear/uploadS3.js';






import { categorySchema } from '../schema/categorySchema.js';

const categoryData = model('category', categorySchema);
import { questionSchema } from '../schema/questionSchema.js';
const questionData = model('question', questionSchema);
import { memeSchema } from '../schema/memeSchema.js';
const memeData = model('meme', memeSchema);






const uploadFile = async (req, res) => {
    try {
      
        const filePath = req.file.path;
        const s3Url = await uploadToS3(req.file); 
        console.log("lokout",filePath);

        res.status(200).json({ url: s3Url, message: " File Processed & Data Inserted" });
    } catch (error) {
        console.error(" Error Processing  File:", error);
        res.status(500).json({ message: ` Error Processing File: ${error.message}` });
    }
};

const uploadAppFile = async (req, res) => {
    try {
      
        const filePath = req.file.path;
        const s3Url = await uploadToS3(req.file); 
        console.log("lokout",filePath);

        res.status(200).json({
            message: "File Processed & Data Inserted",
            data: s3Url
        });

        
    } catch (error) {
        console.error(" Error Processing  File:", error);
        res.status(500).json({ message: ` Error Processing File: ${error.message}` });
        return res.status(400).json({
            data: null,
            message: `Error Processing File: ${error.message}`,
            error: `Error Processing File: ${error.message}`,
          });
    }
};

const createMeme = async (req, res) => {
    try {
        const filePath = req.file.path;
        console.log("Uploaded File Path:", filePath);

        const { memeType } = req.body;
        const allowedTypes = ["WIN", "LOSE", "WAITING", "MINIGAME"];

        if (!allowedTypes.includes(memeType)) {
            return res.status(400).json({ message: "Invalid memeType. Allowed values: WIN, LOSE, WAITING, MINIGAME" });
        }
        const s3Url = await uploadToS3(req.file);
        const meme = new memeData({ name: s3Url, memeType });
        await meme.save();

        res.status(200).json({ url: s3Url, message: "Successfully Saved" });
    } catch (error) {
        console.error("Error Uploading File:", error);
        res.status(500).json({ message: `Error In Uploading Meme: ${error.message}` });
    }
};

const getMemesType = (req, res) => {
          let memeType = ["WIN", "LOSE", "WAITING", "MINIGAME" ];
      
          res.status(200).json({
              message: "miniGame fetched successfully",
              data: memeType
          });
      };


// const getMeme = async (req, res) => {
//     try {
        
//         const { memeType } = req.query;

//         let query = {};
//         if(memeType){
//             query.memeType = memeType;
//         }
        
//         const count = await memeData.countDocuments(query);
//         if (count === 0) {
//             return res.status(404).json({ message: " No memes found" });
//         }

//         const randomIndex = Math.floor(Math.random() * count);
//         const randomMeme = await memeData.findOne(query).skip(randomIndex);

//         res.status(200).json({ data: randomMeme });
//     } catch (error) {
//         console.error(" Error Fetching Meme:", error);
//         res.status(500).json({ message: ` Error Fetching Meme: ${error.message}` });
//     }
// };
const getMeme = async (req, res) => {
    try {
        const { memeType } = req.query;

        let query = {};
        if (memeType) {
            query.memeType = memeType;
        }

        // Use aggregation with $match and $sample for better performance
        const randomMeme = await memeData.aggregate([
            { $match: query },  // Filter by memeType if provided
            { $sample: { size: 1 } }  // Fetch one random document
        ]);

        if (randomMeme.length === 0) {
            return res.status(404).json({ message: "No memes found" });
        }

        res.status(200).json({ data: randomMeme[0] });

    } catch (error) {
        console.error("Error Fetching Meme:", error);
        res.status(500).json({ message: `Error Fetching Meme: ${error.message}` });
    }
};

const getMemesForAdmin = async (req, res) => {
    try {
        const { limit = 10, cursor, memeType } = req.query;

        let query = {};
        if(memeType){
            query.memeType = memeType;
        }
        if (cursor) {
            query._id = { $gt: cursor }; 
        }

        const limitNumber = parseInt(limit, 10);

       
        const memes = await memeData
            .find(query)
            .sort({ _id: 1 }) 
            .limit(limitNumber);

 
        let nextCursor = null;
        if (memes.length > 0) {
            nextCursor = memes[memes.length - 1]._id; 
        }

        res.status(200).json({
            message: "Memes fetched successfully",
            totalMemes: await memeData.countDocuments(),
            data: memes,
            nextCursor: nextCursor, 
        });

    } catch (error) {
        console.error("Error Fetching Memes:", error);
        res.status(500).json({ message: "Error Fetching Memes" });
    }
};

const deleteMeme = async (req, res) => {
    try {
        const { _id } = req.params; 

        if (!_id) {
            return res.status(400).json({ error: "Meme ID is required" });
        }

        const deletedMeme = await memeData.deleteOne({ _id: _id });

        if (!deletedMeme) {
            return res.status(404).json({ error: "Meme not found" });
        }

        res.status(200).json({ message: "Meme deleted successfully", data: deletedMeme });
    } catch (error) {
        console.error("Error deleting meme:", error);
        res.status(500).json({ error: "Error deleting meme" });
    }
};

const deleteAllMemes = async (req, res) => {
    try {
        

        const deletedMeme = await memeData.deleteMany();

        if (!deletedMeme) {
            return res.status(404).json({ error: "Meme not found" });
        }

        res.status(200).json({ message: "Meme deleted successfully", data: deletedMeme });
    } catch (error) {
        console.error("Error deleting meme:", error);
        res.status(500).json({ error: "Error deleting meme" });
    }
};

 
const createquestion = async (req, res) => {
    const filePath = req.file.path; 

    try {
      
        
        
        const workbook = readFile(filePath);
        const sheetName = workbook.SheetNames[0]; 
        const jsonData = utils.sheet_to_json(workbook.Sheets[sheetName]);

        console.log("✅ Excel Data Processed:", jsonData);

       
        const questions = await Promise.all(jsonData.map(async (row) => {
         
            const categoryName = row.category;

           
             let category = await categoryData.findOne({ name: { $regex: new RegExp(`^${categoryName}$`, 'i') } });
            

            if (!category) {
                console.log("category not found")
                return ;
            }

            const ageRangeArray = row.age_range 
            ? row.age_range.split(',').map(item => item.trim().replace(/"/g, '')) 
            : [];
            
            return {
                category: category._id,  
                questionType: row.question_type,
                text: {
                    en: row.question_en || "",
                    ar: row.question_ar || ""
                },
                extraNotes: {
                    en: row.notes_en || "",
                    ar: row.notes_ar || ""
                }, 
                media: row.media_en || "",
                options: {
                    A: { ar: row.option_ar_a || "", en: row.option_en_a || "" },
                    B: { ar:  row.option_ar_b || "", en: row.option_en_b || "" },
                    C: { ar: row.option_ar_c || "", en: row.option_en_c || "" },
                    D: { ar: row.option_ar_d || "", en: row.option_en_d || "" }
                },
                correctAnswer: row?.answer?.trim()?.toUpperCase(),
                ageRange: ageRangeArray
            };
        }));

         const validQuestion = questions.filter(q => q !== null && q !== undefined);
        await questionData.insertMany (validQuestion);

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
            extraNotes,
            media,
            options,
            correctAnswer,
            ageRange
            
        } = req.body;

       
     
     
        const newQuestion = new questionData({
            category: categoryId,  
            questionType,
            text,
            extraNotes,
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

        let countfilter = {};
        if(ageRange){
            countfilter.ageRange = ageRange;
        }

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
            totalQuestions: await questionData.countDocuments(countfilter),
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

  const deleteAllQuetions = async (req, res) => {
    try {
    
        const _id = req.params._id;

  
  
      const deletedquestion = await questionData.deleteMany({category: _id });
  
     
    //   if (!deletedquestion) {
    //     return res.status(404).json({ error: 'Customer not found' });
    //   }
  
      
      res.status(200).json({ message: 'question deleted successfully', data: deletedquestion });
    } catch (error) {
      console.error(error); 
      res.status(500).json({ error: 'Error deleting question' });
    }
  };

  const deleteSelectedQuestions = async (req, res) => {
    try {
      const { _id } = req.params;
      const { idx } = req.body;         // idx is an array of question IDs
  
      const result = await questionData.deleteMany({
        category: _id,
        _id: { $in: idx }
      });
  
      return res.status(200).json({
        message: `Deleted ${result.deletedCount} question(s)`,
        deletedCount: result.deletedCount
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error deleting questions' });
    }
  };
  
  const Editquestion = async (req, res) => {


    try {
        const {
            _id,  
            categoryId,
            questionType,
            text,
            extraNotes,
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
                extraNotes,
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
    let age = ["All", "Kids", "Normal", "Hard"  ];

    res.status(200).json({
        message: "Age fetched successfully",
        data: age
    });
};

const getQuestionforgame = async (req, res) => {
    try {
        const { categoryId, language, ageRange } = req.query;

        if (!categoryId) {
            return res.status(400).json({ message: "categoryId is required!" });
        }

       
        const category = await categoryData.findOne({ _id: categoryId });
        if (!category) {
            return res.status(404).json({ message: "Category not found!" });
        }

        let query = { category: category._id, isShow: false };
        if (language) query.language = language;

        if (ageRange) {
            query.ageRange = { $in: ageRange };
        }

      
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

const exportCategoryQuestions = async (req, res) => {
    try {
        const { categoryId } = req.body;

        if (!categoryId) return res.status(400).json({ message: "categoryId is required" });

        const questions = await questionData.find({ category: categoryId });

        if (questions.length === 0) return res.status(404).json({ message: "No questions found for this category" });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Questions');

        // Excel Headers
        worksheet.columns = [
            { header: 'questionType', key: 'questionType', width: 15 },
            { header: 'question_en', key: 'question_en', width: 40 },
            { header: 'question_ar', key: 'question_ar', width: 40 },
            { header: 'media', key: 'media', width: 20 },
            { header: 'optionA_en', key: 'optionA_en', width: 20 },
            { header: 'optionA_ar', key: 'optionA_ar', width: 20 },
            { header: 'optionB_en', key: 'optionB_en', width: 20 },
            { header: 'optionB_ar', key: 'optionB_ar', width: 20 },
            { header: 'optionC_en', key: 'optionC_en', width: 20 },
            { header: 'optionC_ar', key: 'optionC_ar', width: 20 },
            { header: 'optionD_en', key: 'optionD_en', width: 20 },
            { header: 'optionD_ar', key: 'optionD_ar', width: 20 },
            { header: 'correctAnswer', key: 'correctAnswer', width: 15 },
            { header: 'ageRange', key: 'ageRange', width: 15 },
            { header: 'isShow', key: 'isShow', width: 10 }
        ];

        // Add Data
        questions.forEach(q => {
            worksheet.addRow({
                questionType: q.questionType,
                question_en: q.text?.en || '',
                question_ar: q.text?.ar || '',
                media: q.media || '',
                optionA_en: q.options?.A?.en || '',
                optionA_ar: q.options?.A?.ar || '',
                optionB_en: q.options?.B?.en || '',
                optionB_ar: q.options?.B?.ar || '',
                optionC_en: q.options?.C?.en || '',
                optionC_ar: q.options?.C?.ar || '',
                optionD_en: q.options?.D?.en || '',
                optionD_ar: q.options?.D?.ar || '',
                correctAnswer: q.correctAnswer || '',
                ageRange: q.ageRange || '',
                isShow: q.isShow ? 'true' : 'false'
            });
        });

        // ✅ Proper Headers for Download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="questions.xlsx"');

        // ✅ Write to response stream directly
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};









  export { createquestion, uploadAppFile, deleteAllQuetions, deleteSelectedQuestions,deleteAllMemes, getAge, uploadFile, createQuestionbyself, deletequetion, Editquestion, getQuestions, getquestionbyId, createMeme, getMemesType, getMeme,getMemesForAdmin, deleteMeme, getQuestionforgame , exportCategoryQuestions  };




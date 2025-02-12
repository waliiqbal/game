import cors from "cors";


import { createquestion, uploadFile, getAge, createQuestionbyself, deletequetion, Editquestion, getQuestions, getquestionbyId, createMeme, getMeme } from "../gamecontrollers/questionController.js";

 import { createcategory, deletecategory, editCategory, getCategories, getcategorybyId } from "../gamecontrollers/categoryController.js";
 import upload from "../MiddleWear/multer.js"; // Adjust path as needed
 import uploadCloudnart from "../MiddleWear/multerCloudnary.js";


 

const CustomRoutes = (http, express) => {
   http.get("/gameApp", (req, res) => {
     res.send("game app");
   });

  http.use(cors());
  http.use(express.static("dist"));
  http.use(express.urlencoded({ extended: true }));
  http.use(express.json());
  
// question routes 
http.post("/gameApp/upload", uploadCloudnart.single("file"), uploadFile);
http.post("/gameApp/createMeme", uploadCloudnart.single("file"), createMeme);
http.get("/gameApp/getMeme", getMeme);
http.get("/gameApp/getAge", getAge);

http.post("/gameApp/createquestion", upload.single("file"), createquestion);
http.post("/gameApp/createQuestionbyself", createQuestionbyself);
http.get("/gameApp/getQuestions", getQuestions);

http.get("/gameApp/getCategories", getCategories);

http.delete("/gameApp/deletequetion/:_id", deletequetion);
http.patch("/gameApp/Editquestion", Editquestion);
http.get("/gameApp/getquestionbyId/:_id", getquestionbyId);





getcategorybyId
// category routes 
http.post("/gameApp/createcategory", createcategory);
http.get("/gameApp/getCategories", getCategories);
http.delete("/gameApp/deletecategory/:_id", deletecategory);
http.patch("/gameApp/editCategory", editCategory);
http.get("/gameApp/getcategorybyId/:_id", getcategorybyId);

}



export default CustomRoutes;

import cors from "cors";
import jwtAuthMiddleware from '../MiddleWear/jwt.js'; 
import jwt from 'jsonwebtoken';


import { createquestion, uploadFile, getAge, createQuestionbyself, deletequetion, Editquestion, getQuestions, getquestionbyId, createMeme, getMeme, getQuestionforgame } from "../gamecontrollers/questionController.js";

 import { createcategory, deletecategory, editCategory, getCategories, getcategorybyId, getCategoriesforgame } from "../gamecontrollers/categoryController.js";
 import { registration} from "../gamecontrollers/userController.js";
 import { startGame,roundEnd, getMiniGames, getResult} from "../gamecontrollers/gaamecontroller.js";
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
http.get("/gameApp/getQuestionforgame", getQuestionforgame);



http.delete("/gameApp/deletequetion/:_id", deletequetion);
http.patch("/gameApp/Editquestion", Editquestion);
http.get("/gameApp/getquestionbyId/:_id", getquestionbyId);





// category routes 
http.post("/gameApp/createcategory", createcategory);
http.get("/gameApp/getCategories", getCategories);
http.get("/gameApp/getCategoriesforgame", getCategoriesforgame);
http.delete("/gameApp/deletecategory/:_id", deletecategory);
http.patch("/gameApp/editCategory", editCategory);
http.get("/gameApp/getcategorybyId/:_id", getcategorybyId);

//userroutes
http.post("/gameApp/registration", registration);


// gameRoutes
http.post("/gameApp/startGame", startGame);
http.post("/gameApp/roundEnd", roundEnd);
http.get("/gameApp/getMiniGames", getMiniGames);
http.get("/gameApp/getResult", getResult);

}



export default CustomRoutes;

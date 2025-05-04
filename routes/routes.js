import cors from "cors";
import jwtAuthMiddleware from '../MiddleWear/jwt.js'; 
import jwt from 'jsonwebtoken';
import { upload } from '../MiddleWear/uploadS3.js';


import { createquestion, deleteAllQuetions, deleteAllMemes, uploadFile, getAge, uploadAppFile, createQuestionbyself, deletequetion, Editquestion, getQuestions, getquestionbyId, createMeme, getMemesType, getMeme, getMemesForAdmin,deleteMeme, getQuestionforgame , exportCategoryQuestions } from "../gamecontrollers/questionController.js";

 import { createcategory, deletecategory, editCategory, getCategories, getcategorybyId, getCategoriesforgame } from "../gamecontrollers/categoryController.js";
 import { registration} from "../gamecontrollers/userController.js";
 import { startGame,roundEnd, getMiniGames, getResult} from "../gamecontrollers/gaamecontroller.js";
  
 import { createRound, getRound, updateRound } from "../gamecontrollers/roundController.js";

 import uploadSheet from "../MiddleWear/multer.js"; // Adjust path as needed
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
http.post("/gameApp/upload", upload.single('file'), uploadFile);
http.post("/gameApp/uploadApp", upload.single('file'), uploadAppFile);

http.delete("/gameApp/deleteAllMemes",  deleteAllMemes);
//http.delete("/gameApp/deleteAllQuestions",  deleteAllQuetions);


http.post("/gameApp/createMeme", upload.single('file'), createMeme);
http.get("/gameApp/getMemesType", getMemesType);
http.get("/gameApp/getMeme", getMeme);
http.get("/gameApp/getAge", getAge);
http.get("/gameApp/getMemesForAdmin", getMemesForAdmin);
http.delete("/gameApp/deleteMeme/:_id", deleteMeme);

http.post("/gameApp/createquestion", uploadSheet.single("file"), createquestion);
http.post("/gameApp/createQuestionbyself", createQuestionbyself);
http.post("/gameApp/exportCategoryQuestions", exportCategoryQuestions);

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



// Round Routes
http.post("/gameApp/createRound", createRound);
http.get("/gameApp/getRound", getRound);  
http.patch("/gameApp/updateRound", updateRound);


}



export default CustomRoutes;

import { model } from 'mongoose';
import { gameSchema } from '../schema/gameSchema.js';
const gameData = model('game', gameSchema);
import { categorySchema } from '../schema/categorySchema.js';
const categoryData = model('category', categorySchema);
import { userSchema } from '../schema/userSchema.js';
const userData = model('user', userSchema);



const startGame = async (req, res) => {
    try {
        const { userIds } = req.body; 
    
        if (!userIds || userIds.length === 0) {
          return res.status(400).json({
            data: null,
            message: "Validation error",
            error: "User IDs required",
          });
        }
    
     
        const newGame = new gameData({
          users: userIds, 
          rounds: [], 
        });
    
        await newGame.save();
    
        res.status(201).json({
            success: true,
            message: "Game started successfully",
            data: { gameId: newGame._id },
          });
        } catch (error) {
          res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
          });
        }
    };

    const roundEnd = async (req, res) => {
        try {
            const { gameId, userId, categoryId, score, miniGame } = req.body;
        
           
            if (!gameId || !userId ||  score === undefined) {
              return res.status(400).json({
                success: false,
                message: "Validation error",
                error: "gameId, userId  and score are required",
              });
            }
        
            
            const game = await gameData.findById(gameId);
            if (!game) {
              return res.status(404).json({
                success: false,
                message: "Game not found",
                error: "Invalid gameId",
              });
            }
        
            const roundData = {
              user: userId,
              score: score,
              category: categoryId || null,  
              miniGame: miniGame || ""       
          };
  
          game.rounds.push(roundData);
          await game.save();
        
            res.status(200).json({
              success: true,
              message: "Round updated successfully",
              data: { gameId, userId, categoryId, miniGame, score   },
            });
          } catch (error) {
            res.status(500).json({
              success: false,
              message: "Internal Server Error",
              error: error.message,
            });
          }
        };

        const getMiniGames = (req, res) => {
          let miniGame = [
            "Guess the Password",
            "Spot the Difference",
            "True or Not True",
            "Rearrange Letters",
            "Guess and Press"
        ];
      
          res.status(200).json({
              message: "miniGame fetched successfully",
              data: miniGame
          });
      };

      const getResult = async (req, res) => {
        try {
          const { gameId, categoryId, miniGame } = req.query;
          
            const game = await gameData.findById(gameId).lean();
            if (!game) {
                return res.status(404).json({
                    success: false,
                    message: "Game not found",
                    error: "Invalid gameId",
                });
            }
    
            const userIds = game.users;  
    
            
            
    
          
            let filteredRounds = game.rounds;
            if (categoryId) {
                filteredRounds = game.rounds.filter(round => round.category?.toString() === categoryId);
            }
             
            else if (miniGame) {
              filteredRounds = filteredRounds.filter(round => round.miniGame?.toString() === miniGame);
          }
          const filteredUserIds = [...new Set(filteredRounds.map(round => round.user.toString()))];
          const users = await userData.find({ _id: { $in: filteredUserIds } }, "name age phone").lean();


            const userResults = users.map(user => {
                const userRounds = filteredRounds.filter(round => round.user.toString() === user._id.toString());
                let totalScore = 0;
            userRounds.forEach(round => totalScore += round.score);

            // const scoreData = categoryId 
            // ? (userRounds.length > 0 ? userRounds[0].score : 0) // Sirf ek category kheli hai to single score number do
            // : userRounds.map(round => round.score); // Multiple categories hain to array do
    
            let responseData = {
              userId: user._id,
              name: user.name,
              age: user.age,
              phone: user.phone,
          };

          if (categoryId || miniGame) {
            responseData.score = userRounds.length > 0 ? userRounds[0].score : 0;
        } else {
            responseData.totalScore = totalScore;
        }
          return responseData;
      });

      res.status(200).json({
          success: true,
          message: "Game results fetched successfully",
          data: userResults
      });
    
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Internal Server Error",
                error: error.message,
            });
        }
    };
    
    
    export {startGame, roundEnd, getMiniGames , getResult}
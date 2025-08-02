import { Schema } from 'mongoose';



const questionlogSchema = new Schema({

    categoryId: {
        type: String, required: false
    },
    questionId: {
        type: String, required: false
    },
    ageRange: {
        type: String, required: false
    }
    

}, { timestamps: true });


export { questionlogSchema }
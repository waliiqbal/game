import { Schema } from 'mongoose';



const questionSchema = new Schema({

    category: {
        type: Schema.Types.ObjectId,
        ref: 'category',  
        required: true
    },
    questionType: { 
        type: String, 
        enum: ['text', 'image', 'video', 'audio'], 
        required: true 
    },
    text: {
        en: { type: String, required: false },
        ar: { type: String, required: false }
    },
    media: { type: String, required: false },
    options: {
        A: {
            ar: { type: String, required: false },
            en: { type: String, required: false },
            isCorrect: { type: Boolean, required: false}
        },
        B: {
            ar: { type: String, required: false },
            en: { type: String, required: false },
            isCorrect: { type: Boolean, required: false}
        },
        C: {
            ar: { type: String, required: false },
            en: { type: String, required: false },
            isCorrect: { type: Boolean, required: false}
        },
        D: {
            ar: { type: String, required: false },
            en: { type: String, required: false },
            isCorrect: { type: Boolean, required: false}
        },
        
    },
    
    ageRange: { 
        type: String, 
        required: true,
     
    }
}, { timestamps: true });




export { questionSchema }
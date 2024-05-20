const mongoose = require('mongoose');
const contract = new mongoose.Schema({

    employerId: { type: mongoose.Schema.Types.ObjectId , ref:"employer.js"},
    conditateName:{type:String,default:""},
    profile:{type:String,default:""},
    skill:{type:Array,default:[]},
    experience:{type:Number,default:1},       // 1 - Fresher-Level, 2 - mid-Level , 3 - senior-level , 4 - Directors 
    jobType:{type:Number,default:null},      //  1 - full_Time , 2 - Part_Time , 3 - Remote , 4 - Intership  // 5 - Hybrid
    days:{type:Number,default:0},                         // This filed only work when Hybrid is Selected
    qualification:{type:String,default:""},
    salaryRange:{type:Number,default:null},
    shift: { type: String, default:""},                  // 1 - General , 2 - Us , 3 - Uk
    state:{type:String,default:""},
    city:{type:String,default:""},
    resume:{type:String,default:""},
    description:{type:String,default:""},
    status:{type:Number,default:1}      // active - 1  ,  deactive - 0 
},
    {
        timestamps: true
    }
)

module.exports = mongoose.model('contract', contract);
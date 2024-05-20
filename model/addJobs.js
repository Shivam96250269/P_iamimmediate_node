const mongoose = require('mongoose');
const jobsModel = mongoose.Schema({

    employerId: { type: mongoose.Schema.Types.ObjectId, ref: 'employer', required: true },
    JobProfile: { type: String, required: true, required: [true, "Please Enter Job Profile"] },
    experience: { type: Number, required: true },         // 1 - Fresher-Level, 2 - mid-Level , 3 - senior-level , 4 - Directors 
    salary: { type: Number, required: [true, "Please Enter salary"] },
    mode:{type:Number,required:[true,"Please Enter mode"]},   //  1 -  Onsite  2 - remote    3  - Hybrid
    Job_type: { type: Number, required: true },            //  1 - full_Time , 2 - Part_Time , 3 - Remote , 4 - Intership  , 5 - Hybrid  6  - Contracts
    contractDurations:{type:String,default:""},
    days:{type:Number,default:0},                         // This filed only work when Hybrid is Selected
    Shift: { type: String, default:""},                  // 1 - General , 2 - Us , 3 - Uk
    qualifications: { type: String ,default:""},
    jobDescription: { type: String ,default:""},
    skill:{type:Array,default:[]},
    state:{type:String,required:[true,"Please Enter Job State"]},
    location: { type: String, required: [true, "Please Enter Job Location"] },
    status: { type: String, default: '1' },
    active:{type:Number,default:1}

}, { timestamps: true }
)
module.exports = mongoose.model("jobsModel", jobsModel)



const mongoose = require('mongoose');
const bookMark = mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId,ref:"userModel",required:true},
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'addJobs', required:true },
    JobProfile: { type: String, required: true },
    experience: { type: String, },
    salary: { type: String,  },
    Job_type: { type: String, required: true },
    Shift: { type: String, required: true },
    qualifications: { type: String  },
    jobDescription: { type: String },
    location:{type:String},
    status:{type:String,default:"1"}
})

module.exports = mongoose.model("Jobs_BooK_Mark",bookMark)
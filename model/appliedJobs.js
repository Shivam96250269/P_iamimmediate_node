const mongoose = require('mongoose');
const appliedJobs = mongoose.Schema({

    employerId: { type: mongoose.Schema.Types.ObjectId, ref: 'employer', required: true },
    JobId:{type:mongoose.Schema.Types.ObjectId,ref:'addJobs',required:true},
    userId:{type:mongoose.Schema.Types.ObjectId,ref:'userModel',required:true},
    role:{type:Number,default:1}, // 1 - users  ,   2 - Company
    JobProfile: { type: String,},
    status: { type: String, default: '0' }  // 0 - pending , 1 - Accpeted  2 - Rejected

}, { timestamps: true }
)
module.exports = mongoose.model("appliedJobs", appliedJobs)



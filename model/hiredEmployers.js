const mongoose = require('mongoose')
const hiredCandidate = new mongoose.Schema({
    employerId:{type:mongoose.Schema.Types.ObjectId,ref:'employer'},
    userId:{type:mongoose.Schema.Types.ObjectId,ref:'userModel'},
    hired:{type:String,default:"0"},
    mobileNumber:{type:String,default:"0"},
    emailId:{type:String,default:"0"},
    viewResume:{type:String,default:"0"},
    download:{type:String,default:"0"},
    message:{type:String,default:"0"}    // 1 - hired , 2 - mobileNumber,  3 - emailId , 4 - viewResume , 5 - download
},
    { timestamps: true }
)

module.exports = mongoose.model("hiredCandidate", hiredCandidate)

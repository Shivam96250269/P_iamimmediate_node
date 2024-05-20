const mongoose = require('mongoose')
const awardsModel = mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId,ref:'userModel'},
    title: { type: String, default: '' },
    issuedBy: { type: String, default: '' },
    issuedDate: { type: Date, default: null },
    about: { type: String, default: '' },
    status:{type:String,default:"1"},
    awardImage:{type:String , default:null}  
},
    {timestamps: true}
)

module.exports = mongoose.model("Awards", awardsModel);
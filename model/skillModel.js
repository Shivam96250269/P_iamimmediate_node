const mongoose = require('mongoose');
const skillModel = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'userModel' },
    skillsName: { type: String, required: [true, "Please Enter SkillsName"] },
    softwareVersion: { type: String, default: "" },
    skillLogo:{type:String, default:""},
    experience: 
        {
            yearsOfExperience: { type: Number, required: [true, "Please Enter of Experience"] },
            yearsOfMoth: { type: Number, required: [true, "Please Enter of Month"] }
        }
    ,
    lastUsed: { type: Number, default: null },
    status: { type: String, default: "1" }
},
    { timestamps: true }
)

module.exports = mongoose.model("skillModel", skillModel);

const mongoose = require('mongoose');
const userData = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'userModel' },
    college: { type: String, default: '' },
    degree: { type: String, default: '' },
    state:{type:String,default:''},
    location: { type: String, default: '' },
    grade: { type: String, default: '' },
    specialization:{type:String,default:''},
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    isChecked: { type: Boolean, default: false },
    description: { type: String, default: '' },
    collegeImage: { type: String, default: '' },
    status: { type: String, default: "1" }
},
    {
        timestamps: true
    })
module.exports = mongoose.model("education_Details", userData)
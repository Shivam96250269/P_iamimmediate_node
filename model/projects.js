const mongoose = require('mongoose');
const projectModel = mongoose.Schema({

    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'userModel' },
    title: { type: String, default: '' },
    startDate: { type: Date, default:null },
    endDate: { type: Date, default:null },
    associated: { type: String, default: ''},
    about: { type: String, default: '' },
    location: { type: String, default: '' },
    projectDescription:{type:String,default:''},
    projectLink:{type:String,default:''},
    status:{type:String,default:"1"}

}, {
    timestamps: true
})

module.exports = mongoose.model("ProjectModel", projectModel);
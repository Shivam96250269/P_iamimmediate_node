const mongoose = require('mongoose');
const favorite = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "userModel", required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'addJobs', required: true },
    JobProfile: { type: String, default: '' },
    experience: { type: String, default: '' },
    salary: { type: String, default: '' },
    Job_type: { type: String, default: '' },
    Shift: { type: String, default: '' },
    qualifications: { type: String, default: '' },
    jobDescription: { type: String, default: '' },
    location: { type: String, default: '' },
    status: { type: String, default: "1" }
})

module.exports = mongoose.model("favorite_Model", favorite)
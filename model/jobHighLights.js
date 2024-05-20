const mongoose = require('mongoose');
const jobHighlights = mongoose.Schema({
    employerId: { type: mongoose.Schema.Types.ObjectId, ref: 'employer' },
    description: { type: String, default: '' },
    qualifications: { type: String, default: '' },
    experience: { type: String, default: '' },
    status: { type: String, default: "1" }
},
    { timestamps: true }
)

module.exports = mongoose.model('JobsHighLights', jobHighlights);
const mongoose = require('mongoose');
const hurtData = new mongoose.Schema({
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'employer', required: true },
    contractId:{type:mongoose.Schema.Types.ObjectId},
    hrId:{type:mongoose.Schema.Types.ObjectId},
    status:{type:Number,default:0}
}, { timestamps: true }
)

module.exports = mongoose.model("Hurt", hurtData)
const mongoose = require('mongoose');
const subscription = new mongoose.Schema({
    employerId :{type:mongoose.Schema.Types.ObjectId ,ref:"employer.js"},
    purchasingId:{type:mongoose.Schema.Types.ObjectId,ref:"jobPrices.js"},
    status: { type: String ,default:"1" },    // 1- active   ,    0 - deactive
    planValidTill:{type:Number},
    subscriptionDate:{type:Number},
    jobPostingRemaning:{type:Number},
    resumeAccessRemaing:{type:Number},
    resumeDownloadsRemaing:{type:Number},
    paymentStatus: { type: Boolean },
    invoice:{type:String,default:""}
},{
    timestamps:true
})

module.exports = mongoose.model('subscriptionModel',subscription)
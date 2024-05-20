const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const jobPriceSchema = new Schema({
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "userModel" },
    price: { type: Number, required: [true, "Please enter the price."] },
    valid: { type: Number, required: [true, "Please enter the validity period."] },
    jobPosting:{type:Number,require:[true,"Please Enter jobPosting Value"]},
    applied:{type:Number,required:[true,"Please enter applied Value"]},
    downloads:{type:Number, required:[true,"Please Enter Downloads Value"]},
    status: { type: String, default: '1' }
},
    { timestamps: true }
);

module.exports = mongoose.model('jobPrice', jobPriceSchema);

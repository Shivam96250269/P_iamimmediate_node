const mongoose = require('mongoose');
const orderData = mongoose.Schema({
    employerId: { type: mongoose.Schema.Types.ObjectId, ref: 'employer.js' },
    jobPriceId:{type: mongoose.Schema.Types.ObjectId, ref: 'jobPrices.js' },
    orderId: { type: String },
    entity: { type: String },
    amount: { type: Number },
    amount_paid: { type: Number },
    amount_due: { type: Number },
    currency: { type: String },
    receipt: { type: String },
    offer_id: { type: String },
    status: { type: String },
    attempts: { type: Number },
    notes: { type: Array },
    created_at: { type: Number },
    paymentStatus: { type: Boolean, default: false }
},
    { timestamps: true }
)


module.exports = mongoose.model("order", orderData)
const mongoose = require('mongoose')
const privacyPolicyModel = new mongoose.Schema({
    PrivacyPolicy: { type: String, required: true }
},
    { timestamps: true }
)

module.exports = mongoose.model("privacyPolicyModel", privacyPolicyModel)


const mongoose = require('mongoose')
const termAndCoditionModel = new mongoose.Schema({
    termAndCondition: { type: String, required: true }
},
    { timestamps: true }
)

module.exports = mongoose.model("termAndCondition", termAndCoditionModel)


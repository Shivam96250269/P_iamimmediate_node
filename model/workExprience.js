const mongoose = require('mongoose');
const data = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "userModel"
    },

    title: {
        type: String,
    },

    employment_type: {
        type: String,
        default: ''
    },

    company_Name: {
        type: String,
        default: ''
    },

    state:{
        type:String,
        default:""
    },

    location: {
        type: String,
        default: ''
    },

    startDate: {
        type: Date,
        default: null
    },
    endDate: {
        type: Date,
        default: null
    },

    isChecked: {
        type: Boolean,
        default: false
    },

    industry: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        default: "1"   //1 - active    0 - deactive
    }

},
    {
        timestamps: true
    }
)

module.exports = mongoose.model("Work_exprience", data)
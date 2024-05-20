const mongoose = require('mongoose')
const checkVerification = new mongoose.Schema({
    countryCode:{type:String,default:""},
    mobileNumber:{type:Number, default:null},
    mobileOtp:{type:Number,default:null},
    sessionId:{type:String,default:""},
    mobileExpireTime:{type:Number, default:null},
    mobileVerification:{type:Boolean,default:false},
    email:{type:String , default:" "},
    emailOtp:{type:Number , default:null},
    emailExpireTime:{type:Number, default:null},
    emailVerification:{type:Boolean,default:false},
    forgotPassword:{type:Boolean,default:false}

},
    { timestamps: true }
)

module.exports = mongoose.model("checkVerification", checkVerification)

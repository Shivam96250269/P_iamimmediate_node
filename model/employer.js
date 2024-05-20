const mongoose = require('mongoose');
const employerModel = mongoose.Schema({
    name: { type: String, default:"" },
    countryCode:{type:String,default:""},
    dialCode:{type:String,default:""},
    contactNumber: { type: Number, default: '' },
    companyName: { type: String, default:"" },
    designationName: { type: String, default:"" },
    email: { type: String, default:""},
    city: { type: String, default: '' },
    password: { type: String, default:"" },
    description: { type: String, default: '' },
    website: { type: String, default: '' },
    phone: { type: Number, default: null },
    industry: { type: Array, default: [] },
    company_SizeMin: { type: String, default: '' },
    company_SizeMax: { type: String, default: '' },
    headquarters: { type: String, default: '' },
    founded: { type: String, default: '' },
    otp: { type: Number, default: null },
    expireTime: { type: Number, default: null },
    location: { type: Array, default: [] },
    logo: { type: String, default: '' },
    banner: { type: String, default: '' },
    faceBookUrl: { type: String, default: '' },
    instagramUrl: { type: String, default: '' },
    linkedinUrl: { type: String, default: '' },
    role: { type: String, default: "2" },   // 0 admin , 1 user, // 2 - company
    twitter:{type:String,default:""},
    status: { type: String, default: "1" },
    emailVerification: { type: Boolean, default: false },
    emailOtp: { type: Number, default: null },
    emailOtp_ExpireTime: { type: Number, default: null },
    mobileNumberVerification: { type: Boolean, default: false },
    mobileOtp: { type: Number, default: null },
    mobileOtp_ExpireTime: { type: Number, default: null },
    sessionId:{type:String,default:""},
    companyFullAddress:{type:String,default:""},
    pinCode:{type:String,default:""},
    country:{type:String,default:""},
    state:{type:String,default:""},
    city:{type:String,default:""},
    isCompleted:{type:Boolean,default:false}
},
    { timestamps: true }
)

module.exports = mongoose.model("employer", employerModel);
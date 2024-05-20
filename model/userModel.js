const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const userData = new mongoose.Schema({
    image: { type: String, default: '' },
    firstName: { type: String, default:"" },
    lastName: { type: String, default: "" },
    countryCode:{type:String,default:""},
    dialCode:{type:String,default:""},
    mobileNumber: { type: Number, default: null },
    email: { type: String, default:"" },
    password: { type: String, default:"" },
    gender:{type:String,default:""},
    dateOfBirth:{type:Date,default:null},
    status: { type: String, default: "1" },
    about: { type: String, default: '' },
    currentPosition: { type: String, default: '' },
    state:{type:String,default:""},
    mode:{type:Number,default:null},      //  1  - OnSite   2    -  Remote    ,   3   -   Hybrid
    industry:{type:String,default:""},
    location: { type: String, default: "" },
    resume: { type: String, default: '' },
    otp: { type: Number, default: null },
    expireTime: { type: Number, default: null },
    faceBookUrl: { type: String, default: '' },
    instagramUrl: { type: String, default: '' },
    linkedinUrl: { type: String, default: '' },
    emailVerification: { type: Boolean, default: false },
    emailOtp: { type: Number, default: null },
    emailOtp_ExpireTime: { type: Number, default: null },
    mobileNumberVerification: { type: Boolean, default: false },
    mobileOtp: { type: Number, default: null },
    sessionId:{type:String,default:""},
    joiners:{type:String,default:""},
    mobileOtp_ExpireTime: { type: Number, default: null },
    role: { type: String, default: "1" },   // 0 admin , 1 user, // 2 - company
    expertTecStack:{type:String, default:""},
    experienceInStack:{type:Number,default:1},      // 1 - Fresher-Level, 2 - mid-Level , 3 - senior-level , 4 - Directors 
    expYear:{type:Number,default:0},
    expMon:{type:Number,default:0},
    salary:{type:Number,default:100000},
    Job_type:{type:Number, default :null},                    //  1 - full_Time , 2 - Part_Time , 3 - Remote , 4 - Intership
    isCompleted:{type:Boolean,default:false}
},
    { timestamps: true }
)



const userModel = mongoose.model("Users", userData)
module.exports = userModel;


// const admin = async () => {
//     const admin = await userModel.findOne({ role: "0", status: "1" });
//     if (admin) {
//         console.log("admin is Already created")
//     } else {
//         const saveData = await userModel.create({
//             firstName: "ADMIN",
//             email: "admin@mailintor.com",
//             password: await bcrypt.hashSync("12345", 10),
//             role: "0",
//             status: "1",
//             mobileNumber: 99521548786
//         })
//         if (saveData) {
//             console.log("Admin Data is Save SuccesFully", saveData)
//         } else {
//             console.log("Error While Saving Data")
//         }
//     }
// }
// admin()
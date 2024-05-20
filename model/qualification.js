const mongoose = require('mongoose');
const qualification = new mongoose.Schema({

    qualification:{type:Array,default:[]}

}, {
    timestamps: true
})

const qualifications = mongoose.model("qualification", qualification)
module.exports = qualifications;

// const admin = async () => {
//     const qualification = {
//         qualification:"Btec"
//     }
//     const admin = await qualifications.create(qualification);
//     if(admin){
//         console.log("created Succefully")
//     }
// }
// admin()
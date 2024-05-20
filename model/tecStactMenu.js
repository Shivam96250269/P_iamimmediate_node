const mongoose = require('mongoose')
const techStackMeunu = new mongoose.Schema({
    tecStackName:{type:String},
    techStacklogo:{type:String}
},
    { timestamps: true }
)

const techStack = mongoose.model("techStackMenu", techStackMeunu)
module.exports = techStack


// const run = async () => {
//     const saveData = await techStack.create({
//         tecStackName:"Wordpress",
//         techStacklogo:""
//     })
//     if (saveData) {
//         console.log("TecStack Save succesfully", saveData)
//     } else {
//         console.log("Error While Saving Data")
//     }

// }
// run()


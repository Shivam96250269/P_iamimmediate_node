const mongoose = require('mongoose');
const Industry = new mongoose.Schema({

    industryName:{type:String}
},
    {
        timestamps: true
    }
)

const industry = mongoose.model('Industry', Industry);
module.exports = industry

// const addIndustry  = async()=>{
//     const saveData = {
//         industryName:"Healthcare"
//     }
//     const data = await industry.create(saveData)
//     console.log(data)
// }

// addIndustry()
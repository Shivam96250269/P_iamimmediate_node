const industry = require('../model/industry');

exports.GetAllIndustry = async(req,res)=>{
    const data = await industry.find({})
    res.status(200).json({status:200,message:"Found",result:data})
}
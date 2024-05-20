const { default: mongoose } = require('mongoose')
const hiredStatus = require('../model/hiredEmployers')

exports.howManyCompanyHiredYou = async(req,res)=>{
    try {
        const data = await hiredStatus.aggregate([
            {
                $match:{
                    userId: req.userId
                }
            },
            {
                $lookup: {
                    from: "employers",
                    localField: "employerId",
                    foreignField: "_id",
                    as: "employers"
                }
            },
            {
                $unwind: "$employers"
            },
            {
                $project: {
                    'employers.password': 0
                }
            }
        
        ])
       return res.status(200).json({status:200,message:"Data Found", result:data})
        
    } catch (error) {
      res.status(500).json({ status: 500, error: error.message });
    }
}
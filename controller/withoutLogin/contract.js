const { default: mongoose } = require('mongoose')
const contractModel = require('../../model/contract')
const employerModel = require('../../model/employer')

exports.getAllContractByCompanyId = async(req,res)=>{
    try {
        const {companyId} = req.body
        const data = await employerModel.aggregate([
            {
                $match:{
                    _id:new mongoose.Types.ObjectId(companyId)
                }
            },
            {
                $lookup: {
                    from: "contracts",
                    let: { employerId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$employerId', '$$employerId'] },
                                        { $eq: ['$status', 1] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "contractsData"
                }
            },
            {
                $project: {
                    "password": 0, "otp": 0, 'expireTime': 0, "emailVerification": 0, "emailOtp": 0, "emailOtp_ExpireTime": 0, "mobileNumberVerification": 0, "mobileOtp": 0, "emailOtp_ExpireTime": 0, "mobileOtp_ExpireTime": 0,
                    "faceBookUrl": 0, "instagramUrl": 0, "linkedinUrl": 0
                }
            }
        ])

        res.status(200).json({status:200,message:"Found",result:data})
        
    } catch (error) {
        res.status(500).json({status:500,message:error.message})
    }
}


exports.getSingleContractById = async(req,res)=>{
    try {
        const {contractId} = req.body

        const data = await  contractModel.aggregate([
            {
                $match:{
                    _id:new mongoose.Types.ObjectId(contractId)
                }
            },
            {
                $lookup: {
                    from: "employers",
                    localField: "employerId",
                    foreignField: "_id",
                    as: "companyData"
                }
            },
            {
                $project:{
                    "companyData.password":0,"companyData.phone":0,"companyData.otp":0,"companyData.expireTime":0,
                    "companyData.banner":0,"companyData.faceBookUrl":0,"companyData.instagramUrl":0,"companyData.linkedinUrl":0,
                    "companyData.twitter":0,"companyData.emailVerification":0,"companyData.emailOtp":0,"companyData.emailOtp_ExpireTime":0,
                    "companyData.mobileNumberVerification":0,"companyData.mobileOtp":0,"companyData.mobileOtp_ExpireTime":0,"companyData.sessionId":0,
                    "companyData.isCompleted":0
                }
            }
        ])

        res.status(200).json({status:200,message:"Found",result:data})
        
    } catch (error) {
        res.status(500).json({status:500,message:error.message})
    }
}
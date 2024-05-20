const contractModel = require("../../model/contract");
const employer = require("../../model/employer");
const AWS = require('aws-sdk')

const s3 = new AWS.S3({
    accessKeyId: process.env.access_key,
    secretAccessKey: process.env.Secret_access_key,
    region: process.env.region
});
exports.addContract =async (req, res)=>{
    try {
        const {conditateName,profile,skill,experience,jobType,qualification,days,shift,description,salaryRange,state,city} = req.body
        const data = {employerId:req.userId , conditateName,profile,skill,experience,jobType,qualification,days,shift,description,salaryRange,state,city}
        if(req.file){
            const resume = req.file;
            const resumeParams = {
                Bucket: process.env.bucket_name,
                Key: resume.originalname,
                Body: resume.buffer,
                ContentType: "application/pdf",
            };
            const resumeResult = await s3.upload(resumeParams).promise();
            data.resume = resumeResult.Location;
        }
        const saveData = await contractModel.create(data);
        if(saveData){
            res.status(200).json({status:200,message:"created"}) 
        }else{
            res.status(404).json({status:404,message:"Error While Creating Data"})
        }
        
    } catch (error) {
        res.status(500).json({status:500,message:error.message})
    }
}

exports.updateContract = async(req,res)=>{
    try {
        const { contractId,conditateName,profile,skill,experience,jobType,qualification,days,shift,description,salaryRange,state,city} = req.body
        const data  = {conditateName,profile,skill,experience,jobType,qualification,days,shift,description,salaryRange,state,city,}
        if(req.file){
            const resume = req.file;
            const resumeParams = {
                Bucket: process.env.bucket_name,
                Key: resume.originalname,
                Body: resume.buffer,
                ContentType: "application/pdf",
            };
            const resumeResult = await s3.upload(resumeParams).promise();
            data.resume = resumeResult.Location;
        }
        const updateData = await contractModel.findByIdAndUpdate(
            {_id:contractId},
            {$set:data},
            {new:true}
        )
        if(updateData){
            res.status(200).json({status:200,message:"data Updated Succesfully"}) 
        }else{
            res.status(404).json({status:404,message:"ContractId Not Found"})
        } 
    } catch (error) {
        res.status(500).json({status:500,message:error.message})
    }
}

exports.removeContract  = async(req,res)=>{
    try {

        const { contractId } = req.body
        const data = await contractModel.findByIdAndUpdate(
            { _id: contractId },
            { $set: { status: 0 } },
            { new: true }
        )
        if (data) {
            res.status(200).json({ status: 200, message: "Remove Succesfully" })
        } else {
            res.status(404).json({ status: 404, message: "ContractId Not Found" })
        }
        
    } catch (error) {
        res.status(500).json({status:500,message:error.message})
    }
}


exports.getAllActiveContract = async (req, res) => {
    try {
        const data = await employer.aggregate([
            {
                $match: {
                    _id: req.userId
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
                "faceBookUrl":0,"instagramUrl":0,"linkedinUrl":0
                }
              }
        ])

        res.status(200).json({status:200,message:"found",result:data})

    } catch (error) {
        res.status(500).json({ status: 500, message: error.message })
    }
}
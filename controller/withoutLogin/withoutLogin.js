const skillModel = require("../../model/skillModel");
const userModel = require('../../model/userModel')
const jobsModel = require('../../model/addJobs');
const { default: mongoose } = require("mongoose");
const employer = require("../../model/employer");
const techStackList = require('../../model/tecStactMenu')
const appliedJobs = require('../../model/appliedJobs')
const contractModel = require("../../model/contract");


exports.website = async (req, res) => {
    try {
        const getData = await userModel.aggregate([
            {
                $match: {
                    status: "1", role: "1"
                }
            },
            // {
            //     $sort: {
            //         expYear: -1, // Sort by expYear in descending order
            //         expMonth: -1 // If expYear is equal, sort by expMonth in descending order
            //     }
            // },
            // {
            //     $lookup: {
            //         from: "users",
            //         localField: "userId",
            //         foreignField: "_id",
            //         as: "users"
            //     }
            // },
            // {
            //     $lookup: {
            //         from: "skillmodels",
            //         localField: "_id",
            //         foreignField: "userId",
            //         as: "skillData"
            //     }
            // },
            {
                $sort: { createdAt: -1 }
            },
            {
                $limit: 8
            },
            {
                $project: {
                    "password": 0, "otp": 0, 'expireTime': 0, "emailVerification": 0, "emailOtp": 0, "emailOtp_ExpireTime": 0, "mobileNumberVerification": 0, "mobileOtp": 0, "emailOtp_ExpireTime": 0, "mobileOtp_ExpireTime": 0
                }
            }
        ])
        
        // getData.sort((a, b) => {
        //     const totalMonthsA = a.expYear * 12 + a.expMon;
        //     const totalMonthsB = b.expYear * 12 + b.expMon;
        
        //     const millisecondsA = totalMonthsA * 30.44 * 24 * 60 * 60 * 1000; // Assuming 30.44 days in a month
        //     const millisecondsB = totalMonthsB * 30.44 * 24 * 60 * 60 * 1000; // Convert months to milliseconds

        //     return millisecondsB - millisecondsA;
        // })
        // const limitedData = getData.slice(0, 8); 

        if (getData){
            res.status(200).json({ status: 200, userData: getData })
        } else {
            res.status(200).json({ status: 200, userData: getData, })
        }
    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
}

exports.findFreelancersTechnologieStack = async (req, res) => {
    try {
        const { tec } = req.body
        const filters = {};

        if (tec) {
            filters.expertIn = { $regex: tec, $options: 'i' };
        }

        const skillData = await skillModel.find(filters);

        if (!skillData.length > 0) {
            res.status(404).json({ status: 404, message: "Data Not Found Please Search Again" })
        } else {
            const data = await skillModel.aggregate([
                {
                    $match: filters
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "users"
                    }
                },
                {
                    $project: {
                        expertIn: 1, skill: 1, experience: 1,
                        'users.image': 1, 'users.firstName': 1, "users.email": 1, "users.faceBookUrl": 1, "users.instagramUrl": 1, "users.linkedinUrl": 1, "users._id": 1
                    }
                }
            ])

            if (!data) {
                res.status(400).json({ status: 400, message: "Data Not Found" })
            } else {
                res.status(200).json({ status: 200, message: "Freelancers Found succesFully", result: data })
            }
        }
    } catch (error) {
        res.status(500).json({ status: 500, msg: error.message })
    }
}

exports.getAllImmediateJoiners = async (req, res) => {
    try {
        const getData = await userModel.aggregate([
            {
                $match: {
                    status: "1", role: "1"
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            // {
            //     $lookup: {
            //         from: "skillmodels",
            //         localField: "_id",
            //         foreignField: "userId",
            //         as: "skillData"
            //     }
            // },
            {
                $project: {
                    "password": 0, "otp": 0, 'expireTime': 0, "emailVerification": 0, "emailOtp": 0, "emailOtp_ExpireTime": 0, "mobileNumberVerification": 0, "mobileOtp": 0, "emailOtp_ExpireTime": 0, "mobileOtp_ExpireTime": 0
                }
            }
        ])

        getData.sort((a, b) => {
            const totalMonthsA = a.expYear * 12 + a.expMon;
            const totalMonthsB = b.expYear * 12 + b.expMon;
        
            const millisecondsA = totalMonthsA * 30.44 * 24 * 60 * 60 * 1000;
            const millisecondsB = totalMonthsB * 30.44 * 24 * 60 * 60 * 1000;

            return millisecondsB - millisecondsA;
        })

        if (!getData.length > 0) {
            res.status(404).json({ status: 404, message: "Data Not Found" });
        } else {
            res.status(200).json({ status: 200, userData: getData, })
        }

    } catch (error) {
        res.status(500).json({ status: 500, msg: error.message })
    }
}


exports.getSinlgeFreeLancer = async (req, res) => {
    try {
        const { userId } = req.body
        const data = await userModel.findOne({ _id: userId });
        if (!data) {
            res.status(400).json({ status: 404, message: "Data Not Found" })
        } else {
            const userData = await userModel.aggregate([
                {
                    $match: { _id: data._id }
                },
                {
                    $lookup: {
                        from: "skillmodels",
                        localField: "_id",
                        foreignField: "userId",
                        as: "skillData"
                    }
                },
                {
                    $project: {
                        password: 0, otp: 0, expireTime: 0, emailVerification: 0, emailOtp: 0, emailOtp_ExpireTime: 0, mobileNumberVerification: 0, mobileOtp: 0, mobileOtp_ExpireTime: 0
                    }
                }
            ])

            if (data.length === 0) {
                res.status(404).json({ status: 400, message: "Data Not Found 2nd" })
            } else {
                res.status(200).json({ status: 200, message: "Data Found SuccesFully", result: userData })
            }
        }
    } catch (error) {
        res.status(500).json({ status: 500, msg: error.message })
    }
}

exports.getAllLatestJobs = async (req, res) => {                                        // Get Latest jobs in Home Page
    try {
        const data = await jobsModel.aggregate([
            {
                $match: { status: "1" }
            },
            {
                $lookup: {
                    from: "employers",
                    localField: "employerId",
                    foreignField: "_id",
                    as: "employers"
                }
            }
        ]).sort({ createdAt: -1 }).limit(8)
        if (data.length > 0) {
            res.status(200).json({ status: 200, message: "Found Succesfully", result: data })
        } else {
            res.status(404).json({ status: 404, message: "Not Found" })
        }

    } catch (error) {
        res.status(500).json({ status: 500, error: error.message })
    }
}

exports.getSingleJobs = async (req, res) => {
    try {
        const { jobId } = req.body
        const data = await jobsModel.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(jobId) }
            },
            {
                $lookup: {
                    from: "employers",
                    localField: "employerId",
                    foreignField: "_id",
                    as: "employers"
                }
            }
        ])
        if (data.length > 0) {
            res.status(200).json({ status: 200, message: "Found Succesfully", result: data })
        } else {
            res.status(404).json({ status: 404, message: "Not Found" })
        }
    } catch (error) {
        res.status(500).json({ status: 500, error: error.message })
    }
}

exports.getCompanyALLJobsById = async (req, res) => {
    try {
        const { employerId } = req.body
        const data = await employer.aggregate([
            {
                $match:
                {
                    "$and":
                        [
                            { _id: new mongoose.Types.ObjectId(employerId) },
                            { status: "1" }
                        ]
                }

            },
            {
                $lookup: {
                    from: "jobsmodels",
                    let: { employerId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$employerId", "$$employerId"]
                                }
                            }
                        },
                        {
                            $match: {
                                status: "1" // Add this $match stage to filter AllJobs by status
                            },
                        },
                        {
                            $sort: { createdAt: -1 }
                        },
                        {
                            $match: {
                                status: "1"
                            }
                        }
                    ],
                    as: "AllJobs"

                }
            }
        ])
        if (data.length > 0) {
            res.status(200).json({ status: 200, message: "Data Found Succesfully", result: data })
        } else {
            res.status(404).json({ status: 404, message: "Jobs Not Found" })
        }

    } catch (error) {
        res.status(500).json({ status: 500, error: error.message })
    }
}

exports.getSimilerJobs = async (req, res) => {
    try {
        const { JobProfile, jobId } = req.body;

        if (!jobId) {
            return res.status(400).json({ status: 400, message: "Job Id Not Found" })
        }
        const filters = { JobProfile: { $regex: JobProfile, $options: 'i' } };

        if (jobId) {
            filters._id = { $ne: new mongoose.Types.ObjectId(jobId) };
        }

        const jobsModels = await jobsModel.aggregate([
            {
                $match: filters
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
                $match: {
                    status: "1" 
                }
            },
        ]).sort({ createdAt: -1 })
        if (jobsModels.length > 0) {
            res.status(200).json({ status: 200, message: "Find SuccesFully", result: jobsModels })
        } else {
            res.status(404).json({ status: 404, message: "Jobs Not Found" })
        }
    } catch (error) {
        res.status(500).json({ status: 500, error: error.message })
    }
}

exports.listTechStack = async (req, res) => {
    try {
        const techList = await techStackList.find({});
        const listData = techList[0].tecStackValue;
        let jobResults = []

        for (const item of listData) {
            const filters = {};

            if (item) {
                filters.JobProfile = { $regex: item, $options: 'i' };
            }

            const jobs = await jobsModel.aggregate([
                {
                    $match: filters
                }
            ]).sort({ createdAt: -1 });
            jobResults.push({ techStack: item, data: jobs.length });
        }
        const data = jobResults.sort(function (a, b) { return b.data - a.data });

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ status: 500, error: error.message });
    }
};
// exports.getSinlgeFreeLancer = async (req, res) => {
//     try {
//         const { id } = req.body
//         const skill = await skillModel.findOne({ _id: id });
//         if (!skill) {
//             res.status(400).json({ status: 404, message: "Data Not Found" })
//         } else {
//             const data = await skillModel.aggregate([
//                 {
//                     $match: { _id: skill._id }

//                 },
//                 {
//                     $lookup: {
//                         from: "users",
//                         localField: "userId",
//                         foreignField: "_id",
//                         as: "users"
//                     }
//                 },
//                 {
//                     $project: {
//                         expertIn: 1, skill: 1, experience: 1,
//                         'users.image': 1, 'users.firstName': 1, "users.email": 1, "users.faceBookUrl": 1, "users.instagramUrl": 1, "users.linkedinUrl": 1,
//                     }
//                 }
//             ])

//             if (data.length === 0) {
//                 res.status(404).json({ status: 400, message: "Data Not Found 2nd" })
//             } else {
//                 res.status(200).json({ status: 200, message: "Data Found SuccesFully", result: data })
//             }
//         }
//     } catch (error) {
//         res.status(500).json({ status: 500, msg: error.message })
//     }
// }

exports.checkHowManyPeopelAppliedJob = async(req,res)=>{
    try {
        const {jobId} = req.body
        const data = await appliedJobs.find({JobId: new mongoose.Types.ObjectId(jobId)})  
        const counter = data?data.length:0
        res.status(200).json({status:200,message:"successs",counter:counter})      
    } catch (error) {
       res.status(500).json({status:500,error:error.message}) 
    }
}

exports.getAllActiveContract = async(req,res)=>{
    try {
        const contractsData = await contractModel.aggregate([
            {
                $match:{
                    status:1
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
        ]).sort({ createdAt: -1 }).limit(8)
        res.status(200).json({status:200,message:"Found",result:contractsData})
        
    } catch (error) {
       res.status(500).json({status:500,error:error.message}) 
    }
}

exports.getAllActiveFreeLancers = async (req, res) => {
    try {

        const getAllFreeLancers = await userModel.find({status:"1",Job_type:2}).sort({ createdAt: -1 }).limit(8)
        if (getAllFreeLancers) {
            res.status(200).json({ status: 200, message: "Found", result: getAllFreeLancers })
        }

    } catch (error) {
        res.status(500).json({ status: 500, message: error.message })
    }
}
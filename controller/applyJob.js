const jobApply = require('../model/appliedJobs');
const jobsModel = require('../model/addJobs');
const userModel = require('../model/userModel');
const { default: mongoose } = require('mongoose');
const emailTemplate = require('../emailTemplate/template')
const commonFunction = require('../commonFunction/common');
const employer = require('../model/employer');

exports.applyJobs = async (req, res) => {
    try {
        const { jobId } = req.body
        const jobData = await jobsModel.findById({ _id: jobId, status: "1" })
        const userData = await userModel.findById({ _id: req.userId, status: "1" })
        if (!jobData) {
            return res.status(404).json({ status: 404, message: "Job Not Found" })
        }
        if (!userData) {
            return res.status(404).json({ status: 404, message: "User Not Found" })
        }

        const companyData = await employer.findById(jobData.employerId)
        if(!companyData){
            return res.status(404).json({status:404,message:"Company Data Not Found"})
        }

        const data = {
            employerId: jobData.employerId,
            JobId: jobData._id,
            userId: userData._id,
            JobProfile: jobData.JobProfile
        }

        const application = await jobApply.create(data)
        if (application) {
            const emailData = await emailTemplate.applyJob(userData.firstName,jobData.JobProfile,companyData.companyName)
            await emailTemplate.sendEmailToCompanyToInformUserRegisetOnJobApplication(companyData,userData,jobData)
            await commonFunction.sendMailing(userData.email,"Application Successfully Submitted",emailData)
            res.status(200).json({ status: 200, message: "Job Applied Succesfully", result: application })
        } else {
            res.status(200).json({ status: 200, message: "Job Applied Succesfully" })
        }
    } catch (error) {
        res.status(500).json({ status: 500, message: error.message })
    }
}

exports.listOfAppliedJobs = async (req, res) => {
    try {
        const data = await jobApply.aggregate([
            {
                $match: {
                    userId: req.userId
                }
            },
            {
                $lookup: {
                    from: "jobsmodels",
                    let: { jobId: '$JobId' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$_id', '$$jobId'] },
                                        { $eq: ['$status', "1"] } // Filter out status "1"
                                    ]
                                }
                            }
                        }
                    ],
                    as: "jobData"
                }
            },
            {
                $lookup: {
                    from: "employers",
                    localField: "jobData.employerId",
                    foreignField: "_id",
                    as: "employerData"
                }
            },
            {
                $addFields: {
                    jobsModelsCount: { $size: "$jobData" }
                }
            },
            {
                $match: {
                    jobsModelsCount: { $gt: 0 }
                }
            },
            {
                $project: {
                    jobsModelsCount: 0
                }
            }
        ])
        if (data.length > 0) {
            res.status(200).json({ status: 200, message: "Job Applied Succesfully", result: data })
        } else {
            res.status(200).json({ status: 200, message: "No Applied Jobs Found", result:[]  })
        }

    } catch (error) {
        res.status(500).json({ status: 500, message: error.message })
    }
}

exports.checkJobAppliedStatus = async (req, res) => {
    try {
        const { jobId } = req.body
        const data = await jobApply.findOne({
            $and: [
                { JobId: new mongoose.Types.ObjectId(jobId) },
                { userId: new mongoose.Types.ObjectId(req.userId) }
            ]
        })
        const dats = data ? true : false                // applied - true   ,not Applied - false
        res.json({ status: 200, jobStatus: dats })

    } catch (error) {
        res.status(500).json({ status: 500, message: error.message })
    }
}
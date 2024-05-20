const jobApplied = require('../../model/appliedJobs')
const jobsModel = require('../../model/addJobs')
const userModel = require('../../model/userModel')
const emailTemplate = require('../../emailTemplate/template')
const commonFunction = require('../../commonFunction/common')
const employer = require('../../model/employer')

exports.changeApplicationStatus = async (req, res) => {
    try {
        const { userId, status ,jobId } = req.body
        const userData = await userModel.findById(userId)
        const jobData = await jobsModel.findById(jobId)
        const companyData = await employer.findById(jobData.employerId)
        if (userData) {
            const jobApp = await jobApplied.findOneAndUpdate(
                {
                    $and: [
                        { userId: userData._id },
                        { JobId: jobId }
                    ]
                },
                { $set: { status: status } },
                { new: true }
            )
            if (jobApp) {
                const emailData = status == 1 ? await emailTemplate.userResumeAccptedByCompany(userData.firstName,companyData.companyName,jobData.JobProfile) : await emailTemplate.userResumeRejectedByCompany(userData.firstName,companyData.companyName,jobData.JobProfile)
                const subject = status == 1 ? "Congratulations! Your Job Application Has Been Accepted": "Outcome of Your Job Application"
                await commonFunction.sendMailing(userData.email,subject,emailData)
                res.status(200).json({ status: 200, messsage: "Status Change Succesfully" })
            } else {
                res.status(404).json({ status: 404, messsage: "Job Not Found" })
            }
        } else {
            res.status(404).json({ status: 404, messsage: "Job Not Found" })
        }
    } catch (error) {
        res.status(500).json({ status: 500, error: error.messsage })
    }
}


// exports.viewAccptedAndRejectApplication = async(req,res)=>{
//     try {
//         const { jobId, status } = req.body
//         const data = jobsModel.aggeregate([
//             {
//                 $match:{
//                     status:"1"
//                 }
//             },

//         ])
//     } catch (error) {
//         res.status(500).json({ status: 500, error: error.messsage })
//     }
// }
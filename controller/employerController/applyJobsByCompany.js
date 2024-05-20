const contractEmployers = require('../../model/contract');
const applyJobs = require('../../model/appliedJobs')
const catchAsyncErrors = require('../../errors/catchAsynErrors')
const CustomError = require('../../errors/customerError')
const jobsModel = require('../../model/addJobs');
const { default: mongoose } = require('mongoose');

exports.applyJobsByCompany = catchAsyncErrors(async (req, res, next) => {
    const { userId, jobId } = req.body
    const jobData = await jobsModel.findById(jobId)
    if (!jobData) {
        return next(new CustomError("Jobs Not Found", 404))
    }
   const checkDuplicateApplications = await Promise.all(
        userId.map(async (item) => {
            const data = await applyJobs.findOne({
                $and: [
                    { JobId: jobId },
                    { userId: item }
                ]
            });
            return data
        })
    )
    
    const foundDuplicates = checkDuplicateApplications.filter(data => data !== null);
    if (foundDuplicates.length > 0 ) {
        return next(new CustomError("Some users already applied for this job", 404));
    }
    const saveData = {
        JobId: jobId,
        employerId: req.userId,
        JobProfile: jobData.JobProfile,
        role: 2
    }
    await Promise.all(
        userId.map(async (id) => {
            const newData = { ...saveData, userId: id };
            await applyJobs.create(newData);
        })
    );
    res.status(200).json({ status: 200, message: "Job Applied Succesfully" })
})

exports.CheckhowManyPeopleApply = catchAsyncErrors(async(req,res,next)=>{
    const {jobId ,role} = req.body
    const jobsModels = await applyJobs.find({ JobId: jobId , role:2,employerId:req.userId});
    const contractMemebers = await contractEmployers.find({employerId:req.userId,status:1})

    if(contractMemebers.length === 0){
        return next(new CustomError("contractMemebers Not Found", 404))
    }
    if (!Array.isArray(contractMemebers)) {
        contractMemebers = [contractMemebers]; // Convert to an array if it's not
    }

    // contractMemebers.map((id)=>{
    //     jobsModels.map((userId)=>{
    //         if(id._id.equals(userId.userId)){
    //             Res.push({ res: contractEmployers, role: 1 })
    //         }else{
    //             Res.push({ res: contractEmployers, role: 0 })
    //         }
    //     })
    // })

    const updatedMembers = contractMemebers.map((member) => {
        const foundJob = jobsModels.find((job) => job.userId.equals(member._id));
        const role = foundJob ? 1 : 0;

        return { ...member.toObject(), role }
    });
    const finalData = updatedMembers.filter((item)=>{
        return item.role == role
    })
    res.status(200).json({status:200,message:"Found",result:finalData})
})

exports.listofCompanyAppliedJobsByCompany = catchAsyncErrors(async (req, res, next) => {
    const finalData = await applyJobs.aggregate([
        {
            $match: {
                employerId: req.userId,
                role: 2
            }
        },
        {
            $group: {
                _id: "$JobId",
                data: { $first: "$$ROOT" }
            }
        },
        {
            $replaceRoot: {
                newRoot: "$data"
            }
        },
        {
            $lookup: {
                from: "jobsmodels",
                localField: "JobId",
                foreignField: "_id",
                as: "JobData"
            }
        },
        {
            $lookup: {
                from: "employers",
                localField: "JobData.employerId",
                foreignField: "_id",
                as: "companyData"
            }
        }
    ])
    res.status(200).json({status:200,message:"Found",result:finalData})
})
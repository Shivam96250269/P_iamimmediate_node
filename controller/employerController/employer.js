const employerModel = require('../../model/employer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JobsHighLights = require('../../model/jobHighLights');
const jobsModel = require('../../model/addJobs');
const userModel = require('../../model/userModel');
const contactUs = require('../../model/contactUs');
const skillModel = require('../../model/skillModel');
const orderModel = require('../../model/order');
const commonfunction = require('../../commonFunction/common')
const axios = require('axios')
const AWS = require('aws-sdk');
const { default: mongoose } = require('mongoose');
const VerificationSetUp = require('../../model/verification')
const employer = require('../../model/employer')
const Candidate = require('../../model/hiredEmployers')
const applyJob = require('../../model/appliedJobs')
const emailTemplate = require('../../emailTemplate/template')
const hiredCandidate = require('../../model/hiredEmployers');
const subscriptionModel = require('../../model/subscriptionModel');
require('dotenv').config()


const s3 = new AWS.S3({
    accessKeyId: process.env.access_key,
    secretAccessKey: process.env.Secret_access_key,
    region: process.env.region
});

exports.register = async (req, res) => {
    try {
        function isBusinessEmail(email, businessDomains) {
            const domain = email.split('@')[1];
            return businessDomains.includes(domain);
        }

        const businessDomains = ['gmail.com', 'outlook.com', 'mailinator.com',];
        const { email, password, name, companyName, contactNumber, designationName,countryCode,dialCode } = req.body;
        const useremail = await employerModel.findOne({ email: email });
        const userMobile = await employerModel.findOne({ contactNumber: contactNumber });
        const alphanumericRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()])[A-Za-z\d!@#$%^&*()]{8,16}$/;

        if (email || password || name || companyName || contactNumber || designationName) {
            if (password.length < 8 || password.length > 16) {
                res.status(400).json({ status: 400, message: 'Password must be between 8 and 16 characters' });
            } else if (!alphanumericRegex.test(password)) {
                res.status(400).json({ status: 400, message: 'Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character' });
            } else if (useremail) {
                res.status(400).json({ status: 400, message: "Email Already exists" });
            } else if (userMobile) {
                res.status(400).json({ status: 400, message: "User Mobile Number is already exits" })
            } else if (!companyName) {
                res.status(400).json({ status: 400, message: "Please Provide Company Name" })
            } else if (!designationName) {
                res.status(400).json({ status: 400, message: "Please Provide DesignationName" })
            }else if (!contactNumber) {
                res.status(400).json({ status: 400, message: "Please Provide contactNumber" })
            } else if (!email) {
                res.status(400).json({ status: 400, message: "Please Provide email" })
            } else if (!password) {
                res.status(400).json({ status: 400, message: "Please Provide password" })
            } else if (isBusinessEmail(email, businessDomains)) {
                res.status(400).json({ status: 400, message: "Only business email addresses are allowed" });
            } else {
                const verificationData = await VerificationSetUp.findOne({ email: email })
                if (!verificationData) {
                    return res.status(404).json({ status: 404, message: "Please Verify Your Email Id and Mobile Number" })
                }
                if(verificationData.emailVerification !== true){
                    return res.status(401).json({status:401,message:"Please First Verify Email Id"})
                }

                if(verificationData.mobileVerification !== true){
                    return res.status(401).json({status:401,message:"Please First Verify Mobile Number"})
                }
                const hashPassword = await bcrypt.hashSync(password, 10)
                const saveData = await employerModel({
                    name,
                    email,
                    password: hashPassword,
                    companyName,
                    contactNumber,
                    designationName,
                    countryCode,
                    dialCode
                }).save()

                if (saveData) {
                    const subject = "Welcome to Iamimmediate - Your Company Registration is Complete!"
                    const text = `
                    Dear ${companyName},
                    
                    We are excited to welcome ${companyName} to Iamimmediate – the platform that connects top talent with exceptional companies.
                    Your company registration is now complete, and you're ready to tap into a world of talented professionals.
                    
                    Here are the details of your company account:
                    
                    Company Name: ${companyName}
                    Administrator Email: ${email}
                    
                    With your company account, you can now:
                    
                    - Post Job Listings: Easily list your job openings and gain visibility in front of a pool of qualified candidates.
                    
                    - Manage Job Listings: Edit, update, or remove job postings as your hiring needs evolve.
                    
                    - Review and Connect with Candidates: Access a diverse pool of applicants and engage with potential hires.
                    
                    - Set Up Team Members: Invite your HR team to collaborate and streamline the hiring process.
                    
                    - Access Premium Services: Explore our premium services for enhanced recruitment and employer branding.
                    
                    Iamimmediate is committed to assisting you in your recruitment efforts. If you have any questions, need guidance, or want to explore our premium services, 
                    please don't hesitate to contact our dedicated support team at info@iamimmediate.com.
                    
                    Thank you for choosing Iamimmediate to expand your talent pool and discover the perfect candidates for your organization.
                    We look forward to being a valuable part of your recruitment strategy.
                    
                    Best regards,
                    Iamimmediate Team
                    support@iamimmediate.com
                    `
                    await commonfunction.sendMailing(email, subject, text)
                    res.status(200).json({ status: 200, message: "User Data is Save SccuessFully", result: saveData })
                } else {
                    res.status(404).json({ status: 404, message: "Error while Saving Data" })
                }
            }
        } else {
            res.status(400).json({ status: 400, message: "Please Enter All Details" })
        }
    } catch (error) {
        res.status(500).json({ status: 500, message: error.message })
    }
}

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body
        if (email && password) {
            const user = await employerModel.findOne({ email: email });
            if (user) {
                const isMatch = await bcrypt.compareSync(password, user.password)
                if (isMatch) {
                    const { password, otp, mobileNumber, mobileOtp, mobileNumberVerification, mobileOtp_ExpireTime, emailOtp_ExpireTime, emailOtp, emailVerification, expireTime, sessionId, ...rest } = user._doc;
                    let counter = 0;
                    const propertiesToCheck = [user.name, user.contactNumber, user.companyName, user.designationName, user.email, user.city, user.description, user.website, user.industry, user.company_SizeMin, user.company_SizeMax, user.logo, user.faceBookUrl, user.instagramUrl, user.linkedinUrl, user.twitter];

                    for (const property of propertiesToCheck) {
                        if (property === null || property === " " || property == []) {
                            counter++;
                        }
                    }
                    const accessToken = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
                    const refreshToken = jwt.sign({ userId: user._id  }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' }); 
                    res.cookie('jwt', refreshToken, { httpOnly: true,  
                        sameSite: 'None', secure: true,  
                        maxAge: 7 * 24 * 60 * 60 * 1000
                      });
                    res.status(200).json({ status: 200, message: "Empolyer Login SuccesFully", result: rest, token: accessToken, counter: counter })
                } else {
                    res.status(409).json({ status: 409, message: "Invalid Email and Password" });
                }
            } else {
                res.status(404).json({ status: 404, message: "Invalid Email and Password" });
            }
        } else {
            res.status(401).json({ status: 401, message: "Please Enter all details" })
        }
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword, confirmPassword } = req.body
        const data = await employerModel.findOne({ _id: req.userId });
        if (data) {
            const isMatch = await bcrypt.compareSync(oldPassword, data.password);
            if (newPassword !== confirmPassword) {
                res.status(403).json({ status: 403, message: "New Password and Confirm Password Does not Match" })
            } else {
                if (isMatch) {
                    const hashPassword = await bcrypt.hashSync(newPassword, 10)
                    const updateData = await employerModel.findByIdAndUpdate
                        (
                            { _id: data._id },
                            { $set: { password: hashPassword } },
                            { new: true }
                        )
                        const emailData = await emailTemplate.changePasswordSuccesfully(data.name)
                        await commonfunction.sendMailing(data.email,"Password Changed Successfully",emailData)
                    res.status(200).json({ status: 200, message: "Password Change SuccesFully" })

                } else {
                    res.status(403).json({ status: 403, message: "Old Password is Not Match", })
                }
            }

        } else {
            res.status(404).json({ status: 404, msg: 'Data not found' });
        }

    } catch (error) {
        res.status(500).json({ status: 500, msg: error.message });
    }
}

exports.editEmpolyer = async (req, res) => {
    try {
        if (!req.body.description) {
            res.status(404).json({ status: 404, message: "Please Provide Decription" });
        } else if (!req.body.location) {
            res.status(404).json({ status: 404, message: "Please Enter Your Company Location" });
        }
        else {
            const data = {
                email: req.body.email,
                name: req.body.name,
                companyName: req.body.companyName,
                countryCode:req.body.countryCode,
                dialCode:req.body.dialCode,
                contactNumber: req.body.contactNumber,
                designationName: req.body.designationName,
                city: req.body.city,
                description: req.body.description, //
                website: req.body.website,
                phone: req.body.phone,
                industry: req.body.industry,
                company_SizeMin: req.body.company_SizeMin,
                company_SizeMax: req.body.company_SizeMax,
                headquarters: req.body.headquarters,
                founded: req.body.founded,
                location: req.body.location,
                faceBookUrl: req.body.faceBookUrl,
                instagramUrl: req.body.instagramUrl,
                linkedinUrl: req.body.linkedinUrl,
                twitter: req.body.twitter,
                companyFullAddress:req.body.companyFullAddress,
                pinCode:req.body.pinCode,
                country:req.body.country,
                state:req.body.state,
                city:req.body.city,
                isCompleted:true
            }

            if (req.files && req.files.logo && req.files.logo.length > 0) {
                const logo = req.files.logo[0]
                const logoParams = {
                    Bucket: process.env.bucket_name,
                    Key: logo.originalname,
                    Body: logo.buffer,
                    ContentType: "image/jpeg"
                };
                const logoResult = await s3.upload(logoParams).promise();
                data.logo = logoResult.Location
            }

            if (req.files && req.files.banner && req.files.banner.length > 0) {
                const banner = req.files.banner[0]
                const bannerParams = {
                    Bucket: process.env.bucket_name,
                    Key: banner.originalname,
                    Body: banner.buffer,
                    ContentType: "image/jpeg"
                };
                const bannerResult = await s3.upload(bannerParams).promise();
                data.banner = bannerResult.Location
            }

            const userData = await employerModel.findByIdAndUpdate(
                { _id: req.userId._id },
                { $set: data },
                { new: true }
            )

            if (userData) {
                res.status(200).json({ status: 200, message: "Edit Profile SuccesFully", res: userData })
            } else {
                res.status(404).json({ status: 200, message: "Error While Saving Profile" })
            }
        }
    } catch (error) {
        res.status(500).json({ status: 500, message: error.message })
    }
};

exports.emailVerificationSendOtp = async(req,res)=>{
    try {
        const { email } = req.body;
        const userData = await employerModel.findOne({ email: email, status: "1" });
        if (!userData) {
            res.status(404).json({ status: 404, message: "User Not Found" });
        } else {
            let emailOtp = commonfunction.genrateOtp();
            let emailOtp_ExpireTime = Date.now() * 3 * 60 * 1000;
            subject = "For Email Verification"
            let text = `Your Otp is ${emailOtp}`;
            const send = await commonfunction.sendMailing(email, subject, text);
            const data = await employerModel.findByIdAndUpdate(
                { _id: userData._id },
                { $set: { emailOtp_ExpireTime: emailOtp_ExpireTime, emailOtp: emailOtp } },
                { new: true }
            )
            res.status(200).json({ status: 200, message: "Otp Send Succesfully", result: data.emailOtp, id: userData._id })
        }

    } catch (error) {
        res.status(500).json({ status: 500, message: error.message })
    }
}

exports.emailVerificationSetup = async (req, res) => {
    try {
        const { otp } = req.body;
        const user = await employerModel.findOne({ _id: req.body.id, status: "1" });
        if (!user) {
            res.status(404).json({ status: 404, message: "User Not Found" })
        } else {
            const currentTime = Date.now();
            const ExpireTime = user.emailOtp_ExpireTime;
            if (user.emailOtp != otp) {
                res.status(400).json({ status: 400, message: "Otp Not Match" })
            } else {
                if (ExpireTime < currentTime) {
                    res.status(400).json({ status: 400, message: "Otp Time Expired Please Resend It" })
                } else {
                    const updateData = await employerModel.findByIdAndUpdate(
                        { _id: req.body.id },
                        { $set: { emailVerification: true } },
                        { new: true }
                    )
                    res.status(200).json({ status: 200, message: "Email Verification is Succesfull", result: updateData });
                }
            }
        }
    } catch (error) {
        res.status(500).json({ status: 500, message: error.message })
    }
}

exports.mobileNumberVerificationSendOtp = async (req, res) => {
    try {
        const { mobileNumber } = req.body;
        const userData = await employerModel.findOne({ contactNumber: mobileNumber, status: "1" });
        if (!userData) {
            res.status(404).json({ status: 404, message: "User Not Found" });
        } else {
            let mobileOtp_ExpireTime = Date.now() * 3 * 60 * 1000
            const apiUrl = `https://2factor.in/API/V1/${process.env.APIKEY2FACTOR}/SMS/${userData.contactNumber}/AUTOGEN/OTP`;
            axios.get(apiUrl)
                .then((response) => {
                    if (response.status !== 200) {
                        throw new Error(`Failed to send SMS. Status: ${response.statusText}`);
                    }
                    return response.data;
                })
                .then(async (data) => {
                    if (data.Status === 'Success') {
                        const updatedUserData = await employerModel.findByIdAndUpdate(
                            { _id: userData._id },
                            { $set: { mobileOtp_ExpireTime: mobileOtp_ExpireTime, sessionId: data.Details } },
                            { new: true }
                        );
                        res.status(200).json({ status: 200, message: "Otp Send Succesfully To Your Mobile Number" })
                    } else {
                        otp_session_id = data.Details;
                        console.error(`Failed to send SMS. Status: ${data.Status}`);
                    }
                })
                .catch((error) => {
                    console.error(error.message);
                });
        }

    } catch (error) {
        res.status(500).json({ status: 500, msg: error.message });
    }
}

exports.mobileNumberVerificationSetup = async (req, res) => {
    try {
        const { otp } = req.body;
        const user = await employerModel.findOne({ _id: req.body.id, status: "1" });
        if (!user) {
            res.status(404).json({ status: 404, message: "User Not Found" })
        } else {
            const currentTime = Date.now();
            const ExpireTime = user.mobileOtp_ExpireTime;
            const verifyOtpUrl = `https://2factor.in/API/V1/${process.env.APIKEY2FACTOR}/SMS/VERIFY/${user.sessionId}/${otp}`;
            if (currentTime > ExpireTime) {
                return res.status(400).json({ status: 400, message: "Otp Time Expired" })
            }
            try {
                const response = await axios.get(verifyOtpUrl);
                if (response.data.Status === "Success") {
                    await employerModel.findByIdAndUpdate(
                        { _id: user._id },
                        { $set: { mobileNumberVerification: true } },
                        { new: true }
                    )
                    return res.status(200).json({ status: 200, message: "OTP Matched", data: response.data });
                } else if (response.data.Details == "OTP Mismatch") {
                    return res.status(400).json({ status: 400, message: "OTP Not Matched" });
                }
            } catch (error) {
                if (error.response.data.Status == "Error") {
                    return res.status(400).json({ status: 400, message: "OTP Not Matched" });
                }
                return res.status(500).json({ status: 500, message: error });
            }
        }

    } catch (error) {
        res.status(500).json({ status: 500, msg: error.message });
    }
}

exports.addJobs = async (req, res) => {

    // const subsData = await subscriptionModel.findOne({employerId:req.userId,planValidTill: { $gt: new Date() }})
    // if(!subsData){
    //     return res.status(400).json({status:400,message:"Please Buy Subscription"})
    // }
    // if(subsData){
    //     if(!subsData.planValidTill> new Date().getTime()){
    //         return res.status(400).json({status:400,message:"Plan expired"})
    //     }
    // }

    // if(subsData){
    //     if(subsData.jobPostingRemaning === 0){
    //         return res.status(400).json({status:400,message:"Please Buy Job Posting Points"})
    //     }
    // }

    try {
        const subscriptionData = await orderModel.find({ employerId: req.userId });
        const dataMap = subscriptionData.map((cur) => {
            if (cur.status == 'paid' && cur.paymentStatus == true) {
                return cur
            } else {
                return null
            }
        }).filter(Boolean)
        if (false) {
            res.status(400).json({ status: 400, message: "First Buy Subscription Then Post a Job" })
        } else {
            const { JobProfile, experience, salary, Job_type, Shift, qualifications, jobDescription, location, skill,days,state,contractDurations,mode } = req.body
            if (!JobProfile) {
                return res.status(400).json({ status: 400, message: "JobProfile is required" });
            } else if (!experience) {
                return res.status(400).json({ status: 400, message: "Experience is required" });
            } else if (!salary) {
                return res.status(400).json({ status: 400, message: "Salary is required" });
            } else if (!Job_type) {
                return res.status(400).json({ status: 400, message: "Job_type is required" });
            } else if (!Shift) {
                return res.status(400).json({ status: 400, message: "Shift is required" });
            } else if (!qualifications) {
                return res.status(400).json({ status: 400, message: "Qualifications is required" });
            } else if (!jobDescription) {
                return res.status(400).json({ status: 400, message: "Job Description is required" });
            } else if (!location) {
                return res.status(400).json({ status: 400, message: "Location is required" });
            } else if (!skill) {
                return res.status(400).json({ status: 400, message: "Skill is required" });
            } else {
                const jobSave = await jobsModel({
                    JobProfile,
                    experience,
                    salary,
                    Job_type,
                    days,
                    Shift,
                    qualifications,
                    jobDescription,
                    state,
                    location,
                    skill,
                    contractDurations,
                    mode,
                    employerId: req.userId._id
                }).save()
                if (jobSave) {
                    // await subscriptionModel.findByIdAndUpdate(
                    //     { _id: subsData._id },
                    //     { $inc: { jobPostingRemaning: -1 } },
                    //     { new: true }
                    //     )
                    res.status(200).json({ status: 200, message: "Job is Added SccuessFully", result: jobSave })
                } else {
                    res.status(404).json({ status: 404, message: "Data Not Found", })
                }
            }
        }
    } catch (error) {
        res.status(500).json({ status: 500, message: error.message })
    }
}

exports.editJobs = async (req, res) => {
    try {
        const data = {
            JobProfile: req.body.JobProfile,
            experience: req.body.experience,
            salary: req.body.salary,
            Job_type: req.body.Job_type,
            days:req.body.days,
            Shift: req.body.Shift,
            qualifications: req.body.qualifications,
            jobDescription: req.body.jobDescription,
            state:req.body.state,
            location:req.body.location,
            skill:req.body.skill,
            contractDurations:req.body.contractDurations,
            mode:req.body.mode
        }

        const userData = await jobsModel.findByIdAndUpdate(
            { _id: req.body.userId },
            { $set: data },
            { new: true }
        )
        if (userData) {
            res.status(200).json({ status: 200, message: "edit Profile SuccesFully", res: userData })
        } else {
            res.status(404).json({ status: 404, message: "Error While Editing Profile" })
        }

    } catch (error) {
        res.status(500).json({ status: 500, message: error.message })
    }
};

exports.deleteJobs = async (req, res) => {
    try {
        const userdata = await jobsModel.findByIdAndUpdate(
            { _id: req.body.userId },
            { $set: { status: "0" } },
            { new: true }
        )
        if (userdata) {
            res.status(200).json({ status: 200, messsage: "Jobs Deleted Succesfullty" })
        } else {
            res.status(404).json({ status: 404, message: "Error While Deleting" })
        }
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

exports.checkHowManyPeopleApplySingleJob = async(req,res)=>{
    try {
        const {jobId} = req.body
        const data = await jobsModel.aggregate([
            {
                $match: {
                  $and: [
                    {
                      _id: new mongoose.Types.ObjectId(jobId)
                    },
                    {
                      status: "1"
                    }
                  ]
                }
              },
            {
              $lookup: {
                from: "appliedjobs",
                localField: "_id",
                foreignField: "JobId",
                as: "appliedjobs"
              }
            },
            {
                $lookup: {
                    from: "jobsmodels",
                    localField: "_id",
                    foreignField: "_id",
                    as: "jobsmodels"
                }

            },
            {
              $lookup: {
                from: "users",
                localField: "appliedjobs.userId",
                foreignField: "_id",
                as: "user"
              }
            },
            {
                $lookup: {
                  from: "skillmodels",
                  localField: "user._id",
                  foreignField: "userId",
                  as: "skill"
                }
              },
            {
                $project: {
                  "appliedjobs": 1,
                  "jobsmodels":1,
                  "skill": {
                    $filter: {
                      input: "$skill",
                      as: "skill",
                      cond: { $eq: ["$$skill.status", "1"] }
                    }
                  },
                  "user": {
                    _id: 1,
                    firstName:1,
                    lastName:1,
                    image:1,
                    email:1,
                    image:1,
                    experienceInStack:1,
                    about:1,
                    currentPosition:1,
                    gender:1,
                    location:1,
                    salary:1
                  }
                }
              }
          ]);
          res.status(200).json({status:200,message:"found Succesfully", result:data})
    } catch (error) {
       res.status(500).json({status:500,error:error.message}) 
    }
}

exports.activeDeactiveJobs = async (req, res) => {
    try {
        const { isActive } = req.body
        let data
        if (isActive == 1) {
            data = await jobsModel.findByIdAndUpdate(
                { _id: req.body.jobId },
                { $set: { active: 1 } },
                { new: true }
            )
        } else if (isActive == 0) {
            data = await jobsModel.findByIdAndUpdate(
                { _id: req.body.jobId },
                { $set: { active: 0 } },
                { new: true }
            )
        } else {
           return res.status(400).json({ status: 400, message: "isActive Not Found" })
        }
        if(data){
            res.status(200).json({status:200, message:"isActive succesfully", result:data})
        }else{
            res.status(404).json({status:404, message:"Error While Updating"})
        }

    } catch (error) {
        res.status(500).json({ status: 500, message: error.message })
    }
}

exports.addJobHighLights = async (req, res) => {
    try {
        const data = {
            description: req.body.description,
            qualifications: req.body.qualifications,
            experience: req.body.experience,
            employerId: req.userId
        }

        const employerData = await JobsHighLights.findOne({ employerId: req.userId });
        if (employerData) {
            res.status(400).json({ status: 400, message: "You Can Only Edit this Data" })
        } else {
            const jobHighLights = await JobsHighLights.create(data);
            if (jobHighLights) {
                res.status(200).json({ status: 200, messsage: "Jobs highLights Added SuccesFully" })
            } else {
                res.status(404).json({ status: 404, message: "Error While Creating" })
            }
        }
    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
}

exports.editJobsHighLights = async (req, res) => {
    try {
        const data = {
            description: req.body.description,
            qualifications: req.body.qualifications,
            experience: req.body.experience,
        }

        const userData = await JobsHighLights.findByIdAndUpdate(
            { _id: req.body.userId },
            { $set: data },
            { new: true }
        )
        if (userData) {
            res.status(200).json({ status: 200, message: "Data Edit SuccesFully", res: userData })
        } else {
            res.status(404).json({ status: 404, message: "Error While Editing jobsHighLights" });
        }
    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
};

exports.GetAllJobs = async (req, res) => {
    try {
        const data = await employer.aggregate([
            {
                $match: {
                    $and: [
                        { _id: req.userId },
                        { status: "1" }
                    ]
                }
              },
            {
                $lookup: {
                    from: "jobsmodels",
                    let: { employerId: '$_id' },
                    pipeline: [
                        {
                          $match: {
                            $expr: {
                              $and: [
                                { $eq: ['$employerId', '$$employerId'] },
                                { $eq: ['$status', '1'] }
                              ]
                            }
                          }
                        }
                      ],
                    as: "jobsmodels"
                }
            },
            {
                $project: {
                    "password": 0,
                    "industry":0,
                }
            }
        ]);
        
        if (data) {
            res.status(200).json({ status: 200, messsage: "Jobs Found", result: data })
        } else {
            res.status(404).json({ status: 404, messsage: "Error While GetAllJobs" })
        }
    } catch (error) {
        res.status(500).json({ status: 500, messsage: error.messsage })
    }
}

exports.getLatestJobs = async (req, res) => {
    const page = parseInt(req.body.page) || 1
    const limit = 8
    try {
        const data = await jobsModel.find({ employerId: req.userId, status: "1" }).limit(limit).skip((page - 1) * limit).sort({ createdAt: -1 });

        if (data.length > 0) {
            res.status(200).json({ status: 200, messsage: "latest Jobs Found", result: data });
        } else {
            res.status(404).json({ status: 404, messsage: "Data Not Found" })
        }

    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
};

exports.getAllData = async (req, res) => {

    try {
        const getAllData = await employerModel.aggregate([
            {
                $match: { _id: req.userId }
            },
            {
                $lookup:
                {
                    from: "jobsmodels",
                    localField: "_id",
                    foreignField: "employerId",
                    as: "getAllJobs"
                }
            },
        ])
        if (getAllData) {
            res.status(200).json({ status: 200, message: "Data Found SuccesFully", result: getAllData });
        } else {
            res.status(404).json({ status: 404, message: "Error While Data Showing" });
        }

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

exports.findFreelancersTechnologieStack = async (req, res) => {
    try {
        const { input, experience } = req.body
        const filters = {};

        if (input) {
            filters.expertIn = { $regex: input, $options: 'i' };
        }
        if (experience) {
            filters.experience = { $regex: experience, $options: 'i' };
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
                        'users.image': 1, 'users.firstName': 1, "users.email": 1, "users.faceBookUrl": 1, "users.instagramUrl": 1, "users.linkedinUrl": 1
                    }
                }
            ])

            res.status(200).json({ status: 200, message: "Freelancers Found succesFully", result: data })
        }
    } catch (error) {
        res.status(500).json({ status: 500, msg: error.message })
    }
}

// exports.searchFreeLancers = async (req, res) => {
//     try {
//         const { query } = req.body;
//         const userData = await skillModel.find({
//             $or: [
//                 { expertIn: { $regex: query, $options: 'i' } },
//             ],
//         });

//         // const modifiedData = userData.map(user => {
//         //     const { password, otp, email, mobileNumber, mobileOtp, mobileNumberVerification, mobileOtp_ExpireTime, emailOtp_ExpireTime, emailOtp, emailVerification, status, expireTime, ...rest } = user._doc;
//         //     return rest;
//         // });

//         console.log(...userData)



//         if (userData.length > 0) {
//             const data = await skillModel.aggregate([
//                 {
//                     $match: userData
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
//                         'users.image': 1, 'users.firstName': 1, "users.email": 1, "users.faceBookUrl": 1, "users.instagramUrl": 1, "users.linkedinUrl": 1
//                     }
//                 }
//             ])

//             res.status(200).json({ status: 200, message: "Freelancers Found succesFully", result: data })
//         } else {
//             res.status(404).json({ status: 404, message: "Data Not Found" });
//         }
//     } catch (error) {
//         res.status(500).json({ status: 500, message: error.message });
//     }
// }


exports.getAllFreelancers = async (req, res) => {
    try {
        const data = await userModel.find({ status: "1" }).sort({ _id: -1 })
        const modifiedData = data.map(user => {
            const { password, otp, email, mobileNumber, mobileOtp, mobileNumberVerification, mobileOtp_ExpireTime, emailOtp_ExpireTime, emailOtp, emailVerification, status, expireTime, ...rest } = user._doc;
            return rest;
        });
        if (data) {
            res.status(200).json({ status: 200, message: "Data Found SuccesFully", result: modifiedData });
        } else {
            res.status(404).json({ status: 404, message: "Data Not Found" });
        }
    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
}

exports.getSingleFreeLancers = async (req, res) => {
    try {
        const singleData = await userModel.findOne({ _id: req.body.id }, { password: 0, otp: 0, email: 0, mobileNumber: 0, mobileOtp: 0, mobileNumberVerification: 0, mobileOtp_ExpireTime: 0, emailOtp_ExpireTime: 0, emailOtp: 0, emailVerification: 0, expireTime: 0, status: 0 });

        if (singleData) {
            res.status(200).json({ status: 200, message: "Data Found SuccesFully", result: singleData });
        } else {
            res.status(404).json({ status: 404, message: "Data Not Found" });
        }

    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
}

exports.PostAbout = async (req, res) => {
    try {

        const postAbout = await contactUs.create(
            {
                employerId: req.userId,
                name: req.body.name,
                contactNumber: req.body.contactNumber,
                companyName: req.body.companyName,
                desiginationName: req.body.desiginationName,
                emailId: req.body.emailId,
                city: req.body.city
            }
        )

        if (postAbout) {
            res.status(200).json({ status: 200, message: "Contact us Post SuccesFully", result: postAbout })
        } else {
            res.status(400).json({ status: 400, message: "Error while Creating Data" })
        }

    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
}

exports.viewMobileNumber = async(req,res)=>{
    try {
        const data = await userModel.findById(req.body.userId)
        // const subsData = await subscriptionModel.findOne({employerId:req.userId,planValidTill: { $gt: new Date() }})
        // if(!subsData){
        //     return res.status(400).json({status:400,message:"Please Buy Subscription"})
        // }
        // if(subsData){
        //     if(!subsData.planValidTill> new Date().getTime()){
        //         return res.status(400).json({status:400,message:"Plan expired"})
        //     }
        // }

        // if(subsData){
        //     if(subsData.resumeAccessRemaing === 0){
        //         return res.status(400).json({status:400,message:"Please Buy Points"})
        //     }
        // }

        const checkHiredData = await hiredCandidate.findOne({employerId:req.userId,userId:req.body.userId,mobileNumber: "1"})
        if(checkHiredData){
            return res.status(200).json({status: 200,message: "mobileNumber Found",mobileNumber: data.mobileNumber});
        }

        if(data){
            const companyData = await employer.findById({_id:req.userId})
            let hired = await hiredCandidate.findOneAndUpdate(
                { userId: data._id },
                { $set: { mobileNumber: "1" ,message:"2"} },
                { new: true }
            );

            if (!hired) {
                const createData = {
                    employerId: req.userId,
                    userId: data._id,
                    mobileNumber: "1",
                    message:"2"
                };
                hired = await hiredCandidate.create(createData);
            }
            // await subscriptionModel.findByIdAndUpdate(
            // { _id: subsData._id },
            // { $inc: { resumeAccessRemaing: -1 } },
            // { new: true }
            // )
            const emailData = await emailTemplate.viewMobileNumber(data.firstName,companyData.companyName)
            await commonfunction.sendMailing(data.email,"Your Mobile Address view by a Company",emailData)
            return res.status(200).json({status: 200,message: "mobileNumber Found",mobileNumber: data.mobileNumber});

        }else{
           return res.status(404).json({status:404,message:"Data Not Found"})
        }
        
    } catch (error) {
        res.status(500).json({status:500,message:error.message})
    }
}

exports.viewEmailButton = async (req, res) => {
    try {
        const data = await userModel.findById(req.body.userId);

        // const subsData = await subscriptionModel.findOne({employerId:req.userId,planValidTill: { $gt: new Date() }})
        // if(!subsData){
        //     return res.status(400).json({status:400,message:"Please Buy Subscription"})
        // }
        // if(subsData){
        //     if(!subsData.planValidTill> new Date().getTime()){
        //         return res.status(400).json({status:400,message:"Plan expired"})
        //     }
        // }

        // if(subsData){
        //     if(subsData.resumeAccessRemaing === 0){
        //         return res.status(400).json({status:400,message:"Please Buy Points"})
        //     }
        // }

        const checkHiredData = await hiredCandidate.findOne({employerId:req.userId,userId:req.body.userId,emailId: "1"})
        if(checkHiredData){
            return res.status(200).json({status: 200,message: "Email Found Successfully",email: data.email})
        }

        if (data) {
            const companyData = await employer.findById({_id:req.userId})
            let hired = await hiredCandidate.findOneAndUpdate(
                { userId: data._id },
                { $set: { emailId: "1", message:"3"} },
                { new: true }
            );

            if (!hired) {
                const createData = {
                    employerId: req.userId,
                    userId: data._id,
                    emailId: "1",
                    message:"3"
                };
                hired = await hiredCandidate.create(createData);
            }
            // await subscriptionModel.findByIdAndUpdate(
            //     { _id: subsData._id },
            //     { $inc: { resumeAccessRemaing: -1 } },
            //     { new: true }
            //     )
            const emailData = await emailTemplate.viewEmailAddress(data.firstName,companyData.companyName)
            await commonfunction.sendMailing(data.email,"Your Resume view by a Company",emailData)

            return res.status(200).json({status: 200,message: "Email Found Successfully",email: data.email});
        } else {
            return res.status(404).json({ status: 404, message: "Data Not Found" });
        }
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
};


exports.viewResumeByUserId = async(req,res)=>{
    try {
        // const subsData = await subscriptionModel.findOne({employerId:req.userId,planValidTill: { $gt: new Date() }})
        // if(!subsData){
        //     return res.status(400).json({status:400,message:"Please Buy Subscription"})
        // }
        // if(subsData){
        //     if(!subsData.planValidTill> new Date().getTime()){
        //         return res.status(400).json({status:400,message:"Plan expired"})
        //     }
        // }

        // if(subsData){
        //     if(subsData.resumeAccessRemaing === 0){
        //         return res.status(400).json({status:400,message:"Please Buy Points"})
        //     }
        // }

      const getData = await userModel.aggregate([
        {
          $match: { _id: new mongoose.Types.ObjectId(req.body.userId)  }
        },
        {
            $lookup: {
              from: "work_expriences",
              let: { userId: '$_id' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ['$userId', '$$userId'] },
                        { $eq: ['$status', '1'] } // Filter out status "1"
                      ]
                    }
                  }
                }
              ],
              as: "workExperiences"
            }
          },
          {
            $lookup: {
              from: "awards",
              let: { userId: '$_id' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ['$userId', '$$userId'] },
                        { $eq: ['$status', '1'] } // Filter out status "1"
                      ]
                    }
                  }
                }
              ],
              as: "awards"
            }
          },
          {
            $lookup: {
              from: "lic_&_certis",
              let: { userId: '$_id' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ['$userId', '$$userId'] },
                        { $eq: ['$status', '1'] } // Filter out status "1"
                      ]
                    }
                  }
                }
              ],
              as: "lic_certis"
            }
          },
          {
            $lookup: {
              from: "projectmodels",
              let: { userId: '$_id' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ['$userId', '$$userId'] },
                        { $eq: ['$status', '1'] } // Filter out status "1"
                      ]
                    }
                  }
                }
              ],
              as: "projectmodels"
            }
          },
          {
            $lookup: {
              from: "skillmodels",
              let: { userId: '$_id' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ['$userId', '$$userId'] },
                        { $eq: ['$status', '1'] } // Filter out status "1"
                      ]
                    }
                  }
                }
              ],
              as: "skillmodels"
            }
          },
    
          {
            $lookup: {
              from: "education_details",
              let: { userId: '$_id' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ['$userId', '$$userId'] },
                        { $eq: ['$status', '1'] } // Filter out status "1"
                      ]
                    }
                  }
                }
              ],
              as: "education_details"
            }
          },
        {
          $project: {
              "password": 0, "otp": 0, 'expireTime': 0, "emailVerification": 0, "emailOtp": 0, "emailOtp_ExpireTime": 0, "mobileNumberVerification": 0, "mobileOtp": 0, "emailOtp_ExpireTime": 0, "mobileOtp_ExpireTime": 0
          }
      }
      ]);
      if (getData.length > 0) {
        const checkHiredData = await hiredCandidate.findOne({employerId:req.userId,userId:req.body.userId, viewResume: "1"})
        if(checkHiredData){
            return res.status(200).json({status: 200, message: "Data Found Successfully", userdetails:getData});
        }

        let hired = await hiredCandidate.findOneAndUpdate(
            { userId: getData[0]._id },
            { $set: { viewResume: "1" ,message:"4"} },
            { new: true }
        );

        if (!hired) {
            const createData = {
                employerId: req.userId,
                userId: getData[0]._id,
                viewResume: "1",
                message:"4"
            };
            hired = await hiredCandidate.create(createData);
        }
        const emailData = await emailTemplate.viewUserResumeById(getData[0].firstName)
        await commonfunction.sendMailing(getData[0].email,"Your Email Address view by a Company",emailData)
        // await subscriptionModel.findByIdAndUpdate(
        //     { _id: subsData._id },
        //     { $inc: { resumeDownloadsRemaing: -1 } },
        //     { new: true }
        //     )
        return res.status(200).json({status: 200, message: "Data Found Successfully", userdetails:getData});
      } else {
        res.status(404).json({ status: 404, message: "Data Not Found" });
      }
      
    } catch (error) {
      res.status(500).json({status:500,error:error.message})
    }
  }

  exports.getCompanyAllJobs = async (req, res) => {
    try {
        
        const data = await employer.aggregate([
            {
                $match: {
                    _id: req.userId
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
                            $sort: { createdAt: -1 }
                        }
                    ],
                    as: "AllJobs"
                }
            },
            {
                $unwind: "$AllJobs" 
            },
            {
                $match: {
                    "AllJobs.status": "1"
                }
            },
            {
                $group: {
                    _id: "$_id",
                    employerData: { $first: "$$ROOT" },
                    AllJobs: { $push: "$AllJobs" }
                }
            },
            {
                $replaceRoot: { newRoot: { $mergeObjects: ["$employerData", { AllJobs: "$AllJobs" }] } }
            },
            {
                $project: {
                    password: 0,
                }
            }
        ]);

        if (data.length > 0) {
            res.status(200).json({ status: 200, message: "Data Found Succesfully", result: data })
        } else {
            res.status(404).json({ status: 404, message: "Jobs Not Found" })
        }

    } catch (error) {
        res.status(500).json({ status: 500, error: error.message })
    }
}

exports.getHireConditate = async(req,res)=>{
    try {
        const {userId} = req.body
        const userData = await userModel.findById({_id:userId,status:"1"})
        if(!userData){
            return res.status(404).json({status:404,message:"User Data Found"})
        }
        const employerData = await employer.findById({_id:req.userId,status:"1"})

        if(!employerData){
            return res.status(404).json({status:404,message:"EmployerData Not Found"})
        }
        let hired = await hiredCandidate.findOneAndUpdate(
            { userId: userData._id },
            { $set: { hired: "1" ,message:"1"} },
            { new: true }
        );

        if (!hired) {
            const createData = {
                employerId: req.userId,
                userId: userData._id,
                hired: "1",
                message:"1" 
            };
            hired = await hiredCandidate.create(createData);
        }

        res.status(200).json({status:200, message:"Employer Hired",result:hired})

    } catch (error) {
        res.status(500).json({ status: 500, error: error.message })
    }
}


exports.checkHiredStatus = async (req, res) => {
    try {
        const { userId } = req.body
        const data = await Candidate.findOne({
            $and: [
                { employerId: new mongoose.Types.ObjectId(req.userId) },
                { userId: new mongoose.Types.ObjectId(userId) }
            ]
        })
        const dats = data ? true : false                        // applied - true not Applied - false
        res.json({ status: 200, hiredStatus: dats })

    } catch (error) {
        res.status(500).json({ status: 500, message: error.message })
    }
}
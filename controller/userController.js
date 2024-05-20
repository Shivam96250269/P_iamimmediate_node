const userModel = require('../model/userModel');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const commonfunction = require('../commonFunction/common')
const jobsModel = require('../model/addJobs');
const employer = require('../model/employer');
const path = require('path');
const AWS = require('aws-sdk');
require('dotenv').config()
const axios = require('axios')
const VerificationSetUp = require('../model/verification')
const emailTemplate = require('../emailTemplate/template')
const mongoose = require('mongoose');
const sendSms = require('../middleware/sendSms')
const CustomErrors = require('../errors/customerError')


const s3 = new AWS.S3({
  accessKeyId: process.env.access_key,
  secretAccessKey: process.env.Secret_access_key,
  region: process.env.region
});

exports.register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, mobileNumber,countryCode,dialCode,state,linkedinUrl,expYear,expMon,currentPosition} = req.body;
    const useremail = await userModel.findOne({ email: email });
    const userMobile = await userModel.findOne({ mobileNumber: mobileNumber });
    // const randomPassword = await generateRandomPassword(8)
    const alphanumericRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()])[A-Za-z\d!@#$%^&*()]{8,16}$/;

    if (email || password || firstName || lastName || mobileNumber) {
      // if (!randomPassword) {
      //   return res.status(400).json({ status: 400, message: 'Password Not Generating' });
      // }
      if (password.length < 8 || password.length > 16) {
        return res.status(400).json({ status: 400, message: 'Password must be between 8 and 16 characters' });
      } else if (!alphanumericRegex.test(password)) {
        return res.status(400).json({ status: 400, message: 'Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character' });
        // } else if (!email) {
        //   return next(new CustomErrors("Please Provide Email",400))
      } else if (!password) {
        return res.status(400).json({ status: 400, message: "Please Provide Password" })
      // } else if (!firstName) {
      //   return next(new CustomErrors("Please Provide firstName",400))
      // } else if (!lastName) {
      //   return res.status(400).json({ status: 400, message: "Please Provide lastName" })
      // } else if (!mobileNumber) {
      //   return res.status(400).json({ status: 400, message: "Please Provide mobileNumber" })
      } else if (useremail) {
        return next(new CustomErrors("Email Already exists",400))
      } else if (userMobile) {
        return next(new CustomErrors("User Mobile Number is Already exits",400))
      } else {
        let OUTPUT
        if (req.files && req.files.resume && req.files.resume.length > 0) {
          const resume = req.files.resume[0];
          const resumeParams = {
            Bucket: process.env.bucket_name,
            Key:`${Date.now()}/${resume.originalname}`,
            Body: resume.buffer,
            ContentType: "application/pdf",
          };
          const resumeResult = await s3.upload(resumeParams).promise();
          OUTPUT = resumeResult.Location;
        }
        // const verificationData = await VerificationSetUp.findOne({ email: email })
        // if (!verificationData) {
        //   return res.status(404).json({ status: 404, message: "Verification Data Not Found" })
        // }
        // if (verificationData.mobileVerification == true) {
        //   if (verificationData.emailVerification == true) {
            const hashPassword = await bcrypt.hashSync(password, 10)
            const saveData = await userModel({
              firstName,
              email,
              password: hashPassword,
              // lastName,
              currentPosition,
              mobileNumber,
              state,
              expYear,
              expMon,
              countryCode,
              dialCode,
              linkedinUrl,
              resume:OUTPUT
            }).save()
            if (saveData) {
              const subject = "Welcome to Immediate - Your Registration is Complete"
              const text = `
              Dear ${firstName},
    
              We are delighted to welcome you to Immediate - your gateway to exciting career opportunities! Your registration is now complete, and you're all set to begin your job search journey with us.
    
              Here are your registration details: 
    
              Email: ${email}

              With your account, you can now:
    
              Search for Jobs: Explore a wide range of job listings tailored to your preferences and skills.
    
              Create and Update Your Profile: Craft a compelling profile that showcases your experience and skills to potential employers.
    
              Set Job Alerts: Receive email notifications for new job postings that match your criteria, so you never miss out on a great opportunity.
    
              Apply to Jobs: Start applying to positions that interest you, and track your application history.
    
              Access Career Resources: Benefit from our collection of articles, tips, and resources to help you succeed in your job search.
    
              Iamimmediate is committed to helping you find the right career path. If you have any questions or need assistance, our dedicated support team is here to help. 
              Reach out to us at info@immediate.com.
    
              Thank you for choosing Iamimmediate to take the next step in your career. We look forward to being a part of your journey and helping you achieve your career goals.
    
              Best regards,
              Iamimmediate Team
              support@iamimmediate.com
              `
              await commonfunction.sendMailing(email, subject, text)
              return res.status(200).json({ status: 200, message: "User Data is Save SccuessFully", result: saveData })
            } else {
              return next(new CustomErrors("Error while Saving Data",404))
            }

        //   } else {
        //     return res.status(404).json({ status: 404, message: "Please Verify Your EmailId First" })
        //   }

        // } else {
        //   return res.status(404).json({ status: 404, message: "Please Verify Your Mobile Number First" })
        // }
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
    const { email, mobileNumber, password } = req.body
    if (email || password || mobileNumber) {

      const user = await userModel.findOne({
        $or: [
          { email: req.body.email },
          { mobileNumber: req.body.mobileNumber }
        ]
      });

      if (user) {
        // const data = await VerificationSetUp.findOne({ email: email })
        // if (!data) {
        //   return res.status(404).json({ status: 404, message: "Please verify your email and mobileNumber" })
        // }
        // if (data.emailVerification == true) {
        //   if (data.mobileVerification == true) {
            const isMatch = await bcrypt.compareSync(password, user.password)
            if (isMatch) {
              const accessToken = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
              const refreshToken = jwt.sign({ userId: user._id  }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' }); 
              res.cookie('jwt', refreshToken, { httpOnly: true,  
                sameSite: 'None', secure: true,  
                maxAge: 7 * 24 * 60 * 60 * 1000
              });
              const { password, otp, mobileNumberVerification, mobileOtp_ExpireTime, emailOtp_ExpireTime, emailOtp, emailVerification, expireTime, sessionId, ...rest } = user._doc;
              res.status(200).json({ status: 200, message: "User Login SuccesFully", result:rest, token: accessToken })
            } else {
              res.status(409).json({ status: 409, message: "Invalid Email and Password" });
            }
        //   } else {
        //     res.status(404).json({ status: 404, message: "Please First Verify your MobileNumber" });
        //   }
        // } else {
        //   res.status(404).json({ status: 404, message: "Please First Verify your Email" });
        // }
      } else {
        res.status(404).json({ status: 404, message: "Invalid Email and Password" });
      }
    } else {
      res.status(401).json({ status: 401, message: "Please Enter Password and Email Both" })
    }
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message })
  }
}

exports.emailVerificationSendOtp = async (req, res) => {
  try {
    const { email, id, type } = req.body;

    if (type === 1 || type === 2) {   //  1 - User , 2 - Employer
      const User = type === 1 ? userModel : employer;

      const userData = await User.findOne({ email, status: "1" });

      if (userData) {
        return res.status(404).json({ status: 404, message: "Email already exists" });
      }

      const checkEmailVerified = await VerificationSetUp.findOne({ email });

      if (checkEmailVerified) {
        if (checkEmailVerified.emailVerification === true) {
          return res.status(403).json({ status: 403, message: "Email already verified", result: checkEmailVerified._id });
        }
      }
      const emailOtp = commonfunction.genrateOtp()
      const emailExpireTime = Date.now() + 60 * 1000;
      const subject = "Email Verification";
      const text = `
      Thank you for registering. To verify your email address, please use the following One-Time Password (OTP):

      OTP: ${emailOtp}

      This OTP is valid for 1 minutes. Please do not share it with anyone.

      If you didn't request this verification, you can ignore this email.

      If you have any questions, please contact us at Iamimmediate.com.

      Best regards,
      Iamimmediate Team
      support@iamimmediate.com
      `;
      let responseData;

      const updateData = {
        email,
        emailExpireTime,
        emailOtp,
      };

      if (id) {
        responseData = await VerificationSetUp.findByIdAndUpdate({ _id: id }, { $set: updateData }, { new: true });
      } else {
        const findByEmail = await VerificationSetUp.findOne({ email });

        if (findByEmail) {
          responseData = await VerificationSetUp.findOneAndUpdate(
            { email },
            { $set: updateData },
            { new: true }
          );
        } else {
          responseData = await VerificationSetUp.create(updateData);
        }
      }
      const data = await commonfunction.sendMailing(email, subject, text);
      return res.status(200).json({ status: 200, message: "OTP sent successfully", result: responseData._id });
    } else {
      return res.status(400).json({ status: 400, message: "Type not found" });
    }
  } catch (error) {
    return res.status(500).json({ status: 500, message: error.message });
  }
};

exports.emailVerificationSetup = async (req, res) => {
  try {
    const { otp, id } = req.body;
    const user = await VerificationSetUp.findOne({ _id: id, })
    if (!user) {
      res.status(404).json({ status: 404, message: "User Not Found" })
    } else {
      const currentTime = Date.now();
      const ExpireTime = user.emailExpireTime;
      if (user.emailOtp != otp) {
        res.status(400).json({ status: 400, message: "Otp Not Match" })
      } else {
        if (ExpireTime < currentTime) {
          res.status(400).json({ status: 400, message: "Otp Time Expired Please Resend It" })
        } else {
          const updateData = await VerificationSetUp.findByIdAndUpdate(
            { _id: id },
            { $set: { emailVerification: true } },
            { new: true }
          )
          res.status(200).json({ status: 200, message: "Email Verification is Succesfull", result: updateData._id });
        }
      }
    }
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message })
  }
}

exports.resendOtp = async (req, res) => {
  try {
    const { id } = req.body
    const otpDataTime = await VerificationSetUp.findById(id)
    if (!otpDataTime) {
      return res.status(404).json({ status: 404, message: "Data Not Found" })
    }
    const otp = commonfunction.genrateOtp()
    const email = otpDataTime.email
    let subject = "For Email Verification"
    let text = `Your Otp is ${otp}`;
    await VerificationSetUp.findByIdAndUpdate(
      { _id: otpDataTime._id },
      { $set: { emailOtp: otp, emailExpireTime: Date.now() + (60 * 1000) } },
      { new: true }
    )
    await commonfunction.sendMailing(email, subject, text);
    return res.status(200).json({ status: 200, message: "otp Send successfully" })
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message })
  }
}

exports.mobileNumberVerificationSendOtp = async (req, res) => {
  try {
    const { mobileNumber, id, type } = req.body;
    if (type === 1 || type === 2) {
      const User = type === 1 ? userModel : employer;
      const checkMobileNumber = await User.findOne({ mobileNumber: mobileNumber, status: "1" });
      if (checkMobileNumber) {
        res.status(404).json({ status: 404, message: "MobileNumber already Register" });
      } else {
        const checkMobileNumberVerification = await VerificationSetUp.findOne({ mobileNumber: mobileNumber });
        if (checkMobileNumberVerification) {
          if (checkMobileNumberVerification.mobileVerification === true) {
            return res.status(403).json({ status: 403, message: "Mobile Number Already Verified", result: checkMobileNumberVerification._id })
          }
        }
        const OTP = await commonfunction.genrateOtp()
        const smsTemplate = `Hi Your One Time Mobile Phone Verification Code is ${OTP} - SOV TECHNOLOGIES`
          await sendSms.sendSMS(smsTemplate,mobileNumber)

        const createData = {
          mobileOtp:OTP,
          mobileNumber: mobileNumber,
          mobileExpireTime: Date.now() + 60 * 1000
        }

        let updateData;
        if (id) {
          updateData = await VerificationSetUp.findByIdAndUpdate(
            { _id: id },
            { $set: createData },
            { new: true }
          )
        } else {
          const findByMobileNumber = await VerificationSetUp.findOne({ mobileNumber: mobileNumber });
          if (findByMobileNumber) {
            updateData = await VerificationSetUp.findOneAndUpdate(
              { mobileNumber: mobileNumber },
              { $set: createData },
              { new: true }
            )
          } else {
            updateData = await VerificationSetUp.create(createData)
          }
        }
       return res.status(200).json({ status: 200, message: "Otp Send Succesfully", result: updateData._id })

        // const apiUrl = `https://2factor.in/API/V1/${process.env.APIKEY2FACTOR}/SMS/${mobileNumber}/AUTOGEN/iamimmediate`;
        // const apiUrl = `https://2factor.in/API/V1/${process.env.APIKEY2FACTOR}/SMS/${mobileNumber}/AUTOGEN2/${template_Name}`;
        // axios.get(apiUrl)
        //   .then((response) => {
        //     if (response.status !== 200) {
        //       throw new Error(`Failed to send SMS. Status: ${response.statusText}`);
        //     }
        //     return response.data;
        //   })
        //   .then(async (data) => {
        //     if (data.Status === 'Success') {
        //       const createData = {
        //         mobileNumber: mobileNumber,
        //         sessionId: data.Details,
        //         mobileExpireTime: Date.now() + 60 * 1000
        //       }
        //       let updateData;
        //       if (id) {
        //         updateData = await VerificationSetUp.findByIdAndUpdate(
        //           { _id: id },
        //           { $set: createData },
        //           { new: true }
        //         )
        //       } else {
        //         const findByMobileNumber = await VerificationSetUp.findOne({ mobileNumber: mobileNumber });
        //         if (findByMobileNumber) {
        //           updateData = await VerificationSetUp.findOneAndUpdate(
        //             { mobileNumber: mobileNumber },
        //             { $set: createData },
        //             { new: true }
        //           )
        //         } else {
        //           updateData = await VerificationSetUp.create(createData)
        //         }
        //       }
        //       res.status(200).json({ status: 200, message: "Otp Send Succesfully To Your Mobile Number", result: updateData._id })
        //     } else {
        //       otp_session_id = data.Details;
        //       console.error(`Failed to send SMS. Status: ${data.Status}`);
        //     }
        //   })
        //   .catch((error) => {
        //     res.status(400).json({ status: 400, message: error.message, })
        //   });
      }
    } else {
      res.status(404).json({ status: 404, message: "Type Not Found" })
    }
  } catch (error) {
    res.status(500).json({ status: 500, msg: error.message });
  }
}

exports.mobileNumberVerificationSetup = async (req, res) => {
  try {
    const { otp, id } = req.body;
    const user = await VerificationSetUp.findOne({ _id: id });
    if (!user) {
      res.status(404).json({ status: 404, message: "User Not Found" })
    } else {
      const currentTime = Date.now();
      const ExpireTime = user.mobileExpireTime;
      // const verifyOtpUrl = `https://2factor.in/API/V1/${process.env.APIKEY2FACTOR}/SMS/VERIFY/${user.sessionId}/${otp}`;
      if (currentTime > ExpireTime) {
        return res.status(400).json({ status: 400, message: "Otp Time Expired" })
      }
      if(user.mobileOtp != otp){
        return res.status(400).json({status:400 , message:"Otp Not Matched"})
      }

      const updateData = await VerificationSetUp.findByIdAndUpdate(
        { _id: id },
        { $set: { mobileVerification: true } },
        { new: true }
      )
      return res.status(200).json({ status: 200, message: "Mobile Verification is Succesfull", result: updateData._id });


      // try {
      //   const response = await axios.get(verifyOtpUrl);
      //   if (response.data.Status === "Success") {
      //  const verifyData =   await VerificationSetUp.findByIdAndUpdate(
      //       { _id: user._id },
      //       { $set: { mobileVerification: true } },
      //       { new: true }
      //     )
      //     return res.status(200).json({ status: 200, message: "OTP Matched", data: response.data ,id: verifyData._id });
      //   } else if (response.data.Details == "OTP Mismatch") {
      //     return res.status(400).json({ status: 400, message: "OTP Not Matched" });
      //   }
      // } catch (error) {
      //   if (error.response.data.Status == "Error") {
      //     return res.status(400).json({ status: 400, message: "OTP Not Matched" });
      //   }
      //   return res.status(500).json({ status: 500, message: error });
      // }
    }

  } catch (error) {
    res.status(500).json({ status: 500, msg: error.message });
  }
}
exports.editUserProfile = async (req, res) => {
  try {
    const data = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      about: req.body.about,
      gender: req.body.gender,
      dateOfBirth: req.body.dateOfBirth,
      dialCode:req.body.dialCode,
      countryCode:req.body.countryCode,
      mobileNumber: req.body.mobileNumber,
      currentPosition: req.body.currentPosition,
      faceBookUrl: req.body.faceBookUrl,
      instagramUrl: req.body.instagramUrl,
      linkedinUrl: req.body.linkedinUrl,
      state:req.body.state,
      location: req.body.location,
      expertTecStack: req.body.expertTecStack,
      experienceInStack: req.body.experienceInStack,
      Job_type: req.body.Job_type,
      mode:req.body.mode,
      industry:req.body.industry,
      salary: req.body.salary,
      joiners:req.body.joiners,
      expYear:req.body.expYear,
      expMon:req.body.expMon,
      isCompleted:true
    };

    if (req.files && req.files.image && req.files.image.length > 0) {
      const image = req.files.image[0];
      const imageParams = {
        Bucket: process.env.bucket_name,
        Key: image.originalname,
        Body: image.buffer,
        ContentType: "image/jpeg",
      };
      const imageResult = await s3.upload(imageParams).promise();
      data.image = imageResult.Location;
    }

    if (req.files && req.files.resume && req.files.resume.length > 0) {
      const resume = req.files.resume[0];
      const resumeParams = {
        Bucket: process.env.bucket_name,
        Key: resume.originalname,
        Body: resume.buffer,
        ContentType: "application/pdf",
      };
      const resumeResult = await s3.upload(resumeParams).promise();
      data.resume = resumeResult.Location;
    }

    const userData = await userModel.findByIdAndUpdate(
      { _id: req.userId },
      { $set: data },
      { new: true }
    );

    if (userData) {
      res.status(200).json({ status: 200, msg: "Profile edited successfully", res: userData });
    } else {
      res.status(404).json({ status: 404, msg: "Data not found" });
    }
  } catch (error) {
    res.status(500).json({ status: 500, msg: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body
    const data = await userModel.findOne({ _id: req.userId._id });
    if (data) {
      const isMatch = await bcrypt.compareSync(oldPassword, data.password);
      if (newPassword !== confirmPassword) {
        res.status(403).json({ status: 403, message: "New Password and Confirm Password Does not Match" })
      } else {
        if (isMatch) {
          const hashPassword = await bcrypt.hashSync(newPassword, 10)
          const setData = { password: hashPassword }
          const updateData = await userModel.findByIdAndUpdate
            (
              { _id: data._id },
              { $set: setData },
              { new: true }
            )
            const emailData = await emailTemplate.changePasswordSuccesfully(data.firstName)
            await commonfunction.sendMailing(data.email,"Password Changed Successfully",emailData)
          res.status(200).json({ status: 200, message: "Password Change SuccesFully" });

        } else {
          res.status(403).json({ status: 403, message: "Old Password is Not Match", })
        }
      }
    } else {
      res.status(404).json({ status: 404, message: 'Data Not Found' });
    }

  } catch (error) {
    res.status(500).json({ status: 500, msg: error.message });
  }
}

exports.forgetPassword = async (req, res) => {
  try {
    const { email, type } = req.body;
    if (type === 1 || type === 2) {
      const User = type === 1 ? userModel : employer;
      const user = await User.findOne({ email: email });
      if (!user) {
        return res.status(404).json({ status: 404, message: "User Not Found" })
      } else {
        const findEmailInVerificationData = await VerificationSetUp.findOne({ email: email })
        if (!findEmailInVerificationData) {
          return res.status(400).json({ status: 400, message: "User Data Not Found in Verification Data" })
        }
        let otp = commonfunction.genrateOtp();
        let expTime = Date.now() + 60 * 1000;
        subject = "Otp For Resend"
        let text = `Your Forget Password Otp is ${otp}`;
        const send = await commonfunction.sendMailing(email, subject, text);
        const data = await VerificationSetUp.findOneAndUpdate(
          { email: email },
          { $set: { emailExpireTime: expTime, emailOtp: otp } },
          { new: true }
        )
        return res.status(200).json({ status: 200, message: "Otp Send Succesfully", result: data._id })
      }
    } else {
      return res.status(404).json({ status: 404, message: "Type Not Found" })
    }
  } catch (error) {
    res.status(500).json({ status: 500, msg: error.message });
  }
}

exports.verifyForgotPassword = async (req, res) => {
  try {
    const { id, otp } = req.body
    const data = await VerificationSetUp.findOne({ _id: id })

    if (!data) {
      return res.status(400).json({ status: 400, message: "Data Not Found" })
    } else {
      const currentTime = Date.now();
      const expireTime = data.emailExpireTime;
      if (currentTime > expireTime) {
        return res.status(400).json({ status: 400, message: "Otp Time Expired" })
      }
      if (data.emailOtp == otp) {
        const updateData = await VerificationSetUp.findByIdAndUpdate(
          { _id: id },
          { $set: { forgotPassword: true } },
          { new: true }
        )
        return res.status(200).json({ status: 200, message: "otp matched", result: updateData._id })
      } else {
        return res.status(400).json({ status: 400, message: "otp Not Matched" })
      }
    }
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
}

exports.resetPassword = async (req, res) => {
  try {
    const { id, newPassword, confirmPassword, type } = req.body
    if (type === 1 || type === 2) {
      const User = type === 1 ? userModel : employer;
      const verificationData = await VerificationSetUp.findOne({ _id: id });
      if (!verificationData) {
        return res.status(404).json({ status: 404, message: "Verification Data not Found" })
      } else {
        const user = await User.findOne({ email: verificationData.email })
        if (!user) {
          return res.status(400).json({ status: 400, message: "User Not Found" })
        }
        if (verificationData.forgotPassword == true) {
          if (newPassword === confirmPassword) {
            const hashPassword = await bcrypt.hashSync(newPassword, 10)
            const updateUser = await User.findByIdAndUpdate(
              { _id: user._id },
              { $set: { password: hashPassword } },
              { new: true }
            )
            await VerificationSetUp.findByIdAndUpdate(
              { _id: verificationData._id },
              { $set: { forgotPassword: false } },
              { new: true }
            )
            return res.status(200).json({ status: 200, message: "Password Updated SuccesFully", result: updateUser });
          } else {
            return res.status(404).json({ status: 404, message: "Password and confirm password does not Match" })
          }
        } else {
          return res.status(400).json({ status: 400, message: "Forgot Password Otp not Verifed" })
        }

      }
    } else {
      return res.status(404).json({ status: 404, message: "Type Not Found" })
    }
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
}

exports.getResume = async (req, res) => {
  try {
    const userData = await userModel.findById({ _id: req.userId });
    if (userData) {
      const resume = userData.resume
      const imagepath = path.join(__dirname, resume)

      res.status(200).json({ status: 200, message: "Resume Download SuccesFully", result: imagepath });
    } else {
      res.status(404).json({ status: 404, message: "Data Not Found" });
    }
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
}

exports.decativateUser = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.userId });
    if (!user) {
      res.status(404).json({ status: 404, message: "User Not Found" })
    } else {
      const data = await userModel.findByIdAndUpdate(
        { _id: req.userId },
        { $set: { status: "0" } },
        { new: true }
      )
      if (data) {
        res.status(200).json({ status: 200, message: "User Deactivate succesFully" })
      } else {
        res.status(404).json({ status: 404, message: "User Not Deactivate " })
      }
    }
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
}

exports.getAllUserDetails = async (req, res) => {
  try {
    const getAllData = await userModel.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(req.body.userId) }
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
        "password": 0
        }
      }
    ])
    if (getAllData.length > 0) {
      // const number = getAllData[0].mobileNumber;
      // let hideNumber = "";
      // const numberString = number.toString();

      // for (let i = 0; i < numberString.length; i++) {
      //   if (false) {
      //     hideNumber += numberString[i];
      //   } else {
      //     hideNumber += "*";
      //   }
      // }

      // const email = getAllData[0].email
      // let hideEmail = "";

      // for (let i = 0; i < email.length; i++) {
      //   if (false) {
      //     hideEmail += email[i]
      //   } else {
      //     hideEmail += "*";
      //   }
      // }

      // getAllData[0].mobileNumber = hideNumber
      // getAllData[0].email = hideEmail
      res.status(200).json({ status: 200, message: "Data Found SuccesFully", result: getAllData });
    } else {
      res.status(404).json({ status: 404, message: "Data Not Found" })
    }

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.jobFilter = async (req, res) => {
  try {
    const { JobProfile,state ,location, minSalary, maxSalary, Job_type, experience } = req.body;
    const filters = {status:"1"};

    if (JobProfile) {
      filters.JobProfile = { $regex: JobProfile, $options: 'i' };
    }

    if(state){
      filters.state = { $regex: state, $options: 'i'}
    }

    if (location) {
      filters.location = { $regex: location, $options: 'i' };
    }
    if (minSalary && maxSalary) {
      filters.salary = { $gte: minSalary, $lte: maxSalary };
    } else if (minSalary) {
      filters.salary = { $gte: minSalary };
    } else if (maxSalary) {
      filters.salary = { $lte: maxSalary };
    }

    if (Job_type.length > 0) {
      filters.Job_type = { $in: Job_type }
    }

    if (experience.length > 0) {
      filters.experience = { $in: experience };
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
    ]).sort({ createdAt: -1 })
    if (jobsModels.length > 0) {
      res.status(200).json({ status: 200, message: "Find SuccesFully", result: jobsModels })
    } else {
      res.status(404).json({ status: 404, message: "Jobs Not Found" })
    }

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.userFilter = async (req, res) => {
  try {
    const { expertTecStack, location, minSalary, maxSalary, Job_type, experienceInStack,state } = req.body;

    const filters = { status: "1" };

    // if (expertTecStack) {
    //   filters.currentPosition = { $regex: expertTecStack, $options: 'i' };
    // }

    if (location) {
      filters.location = { $regex: location, $options: 'i' };
    }
    if (parseInt(minSalary) && parseInt(maxSalary)) {
      filters.salary = { $gte: parseInt(minSalary), $lte: parseInt(maxSalary) };
    } else if (minSalary) {
      filters.salary = { $gte: parseInt(minSalary) };
    } else if (maxSalary) {
      filters.salary = { $lte: parseInt(maxSalary) };
    }

    if (Job_type.length > 0) {
      filters.Job_type = { $in: Job_type }
    }
    if(state){
      filters.state = {$regex: state, $options: 'i'}
    }

    if (experienceInStack.length > 0) {
      filters.experienceInStack = { $in: experienceInStack };
    }
    const userData = await userModel.aggregate([
      {
        $match: filters
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
        $match: {
            "skillData.skillsName": new RegExp(expertTecStack, 'i')
        }
    },
    {
        $project: { 
            "password": 0
        }
    }
    ]).sort({ createdAt: -1 })
    if (userData.length > 0) {
      res.status(200).json({ status: 200, message: "Find SuccesFully", result: userData })
    } else {
      res.status(404).json({ status: 404, message: "Jobs Not Found" })
    }

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.companyFilter = async (req, res) => {
  try {
    const {companyName,location,state} = req.body
    const filters = { status: "1" };

    if (companyName) {
      filters.companyName = { $regex: companyName, $options: 'i' };
    }

    // if (location) {
    //   filters.$or = [
    //     { state: { $regex: location, $options: 'i' } },
    //     { city: { $regex: location, $options: 'i' } }
    //   ];
    // }

    if(location){
      filters.city = { $regex: location, $options: 'i' };
    }
    if(state){
      filters.state = { $regex: state, $options: 'i' };
    }

    const companyData = await employer.aggregate([
      {
        $match: filters
      },
    ]).sort({ createdAt: -1 })
    if(companyData.length>0){
      res.status(200).json({status:200,message:"Data Found Succesfully", result:companyData})
    }else{
      res.status(404).json({status:404,message:"Data Not Found"})
    }


  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

exports.protfolio = async (req, res) => {
  try {
    const getData = await userModel.aggregate([
      {
        $match: { _id: req.userId }
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
        "password": 0
        }
      }
    ]);
    if (getData.length > 0) {
      res.status(200).json({ status: 200, message: "Data Found Successfully", userdetails: getData });
    } else {
      res.status(404).json({ status: 404, message: "Data Not Found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.viewALlRegisterCompany = async (req, res) => {
  try {
    const companydata = await employer.find({ status: "1", isCompleted:true }).sort({ createdAt: -1 }).limit(8)

    const modifiedData = companydata.map(user => {
      const { password, otp, email, mobileNumber, mobileOtp, mobileNumberVerification, mobileOtp_ExpireTime, emailOtp_ExpireTime, emailOtp, emailVerification, status, expireTime, ...rest } = user._doc;
      return rest;
    });

    if (companydata) {
      res.status(200).json({ status: 200, message: "Register Company Found", result: modifiedData })
    } else {
      res.status(200).json({ status: 404, message: "Error", result: modifiedData })
    }

  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
}

// website and findFreelancersByTechnologyStack

// exports.website = async (req, res) => {
//   try {
//     const getData = await userModel.aggregate([
//       {
//         $match: {
//           role: "1"
//         }
//       },
//       {
//         $lookup: {
//           from: "users",
//           localField: "_id",
//           foreignField: "userId",
//           as: "users"
//         }
//       },
//       {
//         $lookup: {
//           from: "jobsmodels",
//           localField: "userId",
//           foreignField: "userId",
//           as: "jobsmodels"
//         }
//       },

//       {
//         $sort: { createdAt: -1 }
//       },
//       {
//         $limit: 8
//       },
//       {
//         $project: {
//           email: 1, firstName: 1, faceBookUrl: 1, instagramUrl: 1, linkedinUrl: 1, currentPostion: 1
//         }
//       }
//     ])

//     if (!getData) {
//       res.status(404).json({ status: 404, message: "Data Not Found" });
//     } else {
//       res.status(200).json({ status: 200, userData: getData, })
//     }
//   } catch (error) {
//     res.status(500).json({ status: 500, message: error.message });
//   }
// }




// exports.findFreelancersTechnologieStack = async (req, res) => {
//   try {
//     const { input } = req.body
//     const filters = {};

//     if (input) {
//       filters.expertIn = { $regex: input, $options: 'i' };
//     }

//     const skillData = await skillModel.find(filters);

//     if (!skillData.length > 0) {
//       res.status(404).json({ status: 404, message: "Data Not Found Please Search Again" })
//     } else {
//       const data = await skillModel.aggregate([
//         {
//           $match: filters
//         },
//         {
//           $lookup: {
//             from: "users",
//             localField: "userId",
//             foreignField: "_id",
//             as: "users"
//           }
//         },
//         {
//           $project: {
//             expertIn: 1, skill: 1, experience: 1,
//             'users.image': 1, 'users.firstName': 1, "users.email": 1, "users.faceBookUrl": 1, "users.instagramUrl": 1, "users.linkedinUrl": 1
//           }
//         }
//       ])

//       res.status(200).json({ status: 200, message: "Freelancers Found succesFully", result: data })
//     }
//   } catch (error) {
//     res.status(500).json({ status: 500, msg: error.message })
//   }
// }
const userModel = require('../model/userModel');
const jwt = require('jsonwebtoken');
const employer = require('../model/employer')
require('dotenv').config()

exports.thirdPartyLogin = async (req, res) => {
    try {
        const { email, firstName, lastName, image, userType , loginType } = req.body;
        if(loginType === 1){  // loginType - 1 

        if (userType !== 1 && userType !== 2) {             //  1 - User        2 - employer
            return res.status(404).json({ status: 404, message: "Please Select Type" });
        }

        const userCollection = userType === 1 ? userModel : employer;
        const user = await userCollection.findOne({ email, status: "1" });

        if (user) {
            user.loginStatus = 1;
            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "1d" });
            // const { password, otp, mobileNumberVerification, mobileOtp_ExpireTime, emailOtp_ExpireTime, emailOtp, emailVerification, expireTime, sessionId, ...rest } = user._doc;
            
            return res.status(200).json({ status: 200, message: "User Login Successfully", result: user, token , registerStatus:false });
        } else {
            // const data = userType === 1 ? { email, firstName, lastName, image } : { email, name: firstName, logo: image };
            // const saveUserData = await userCollection.create(data);
            const data = {
                email, firstName, lastName, image, userType , loginType
            }
                res.status(200).json({status:200,message:"data",result:data ,registerStatus:true})
                
            // if (saveUserData) {
            //     const { password, otp, mobileNumberVerification, mobileOtp_ExpireTime, emailOtp_ExpireTime, emailOtp, emailVerification, expireTime, sessionId, ...rest } = saveUserData._doc;
            //     return res.status(200).json({ status: 200, message: "Creating Successfully", result: rest });
            // } else {
            //     return res.status(404).json({ status: 404, message: "Error While Creating Data" });
            // }
        }
        }else{
            res.status(404).json({status:404,message:"Please Defined Login Type"})
        }
    } catch (error) {
        return res.status(500).json({ status: 500, error: error.message });
    }
};

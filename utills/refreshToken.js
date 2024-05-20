const jsonwebtoken = require('jsonwebtoken');
const catchAsyncErrors = require('../errors/catchAsynErrors')
const CustomerErrors = require('../errors/customerError')
const userModel  = require('../model/userModel')

exports.refreshToken = catchAsyncErrors(async (req, res, next) => {
    const { jwt } = req.cookies
    if (jwt) {
        const verifyRefreshToken = await jsonwebtoken.verify(jwt, process.env.REFRESH_TOKEN_SECRET)
        if(verifyRefreshToken){
            const accessToken = jsonwebtoken.sign({ 
                userId:verifyRefreshToken.userId
            }, process.env.ACCESS_TOKEN_SECRET, { 
                expiresIn: '15m' 
            }); 
            return res.status(200).json({status:200, token:accessToken})

        }else{
            next(new CustomerErrors("Invalid Refresh Token",401))
        }


    } else {
        next(new CustomerErrors("Token Expired or Invalid Users", 401))
    }
})

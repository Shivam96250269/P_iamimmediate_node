const hurt = require('../../model/hurt');
const catchAsyncErrors = require('../../errors/catchAsynErrors')
const CustomError = require('../../errors/customerError');
const { default: mongoose } = require('mongoose');

exports.hurtEmployers = catchAsyncErrors(async(req,res,next)=>{
    const {contractId,hrId} = req.body
    // console.log(new mongoose.Types.ObjectId(hr).equals(req.userId))
    const checkData = await hurt.findOne({
        $and:[
            {contractId:contractId},
            {companyId:req.userId}
        ]
    })
    if(checkData){
      return next(new CustomError("You have already Hurt This Contract",404))
    }

    const saveData = {companyId:req.userId,contractId,hrId}
    const data = await hurt.create(saveData)
    if(data){
        res.status(200).json({status:200,message:"created"})
    }else{
        res.status(404).json({status:404,message:"Error While Creating"})
    }
})


exports.hurtChecker = catchAsyncErrors(async(req,res)=>{
    const {contractId} = req.body
    const data = await hurt.findOne({
        $and:[
            {contractId:contractId},
            {companyId:req.userId}
        ]
    })
    const value = data != null ? true : false
    res.status(200).json({status:200,message:"success",result:value}) 
})
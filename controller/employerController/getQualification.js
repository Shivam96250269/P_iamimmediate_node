const qualification = require('../../model/qualification')
exports.qualificationList = async(req,res)=>{
    try {
        const data = await qualification.find({})
        if(data){
            res.status(200).json({status:200, message:"Found Succesfully", result:data})
        }else{
            return res.status(404).json({status:404,message:"Not Found"})
        }
        
    } catch (error) {
        res.status(500).json({status:500, message:error.message})
    }
}
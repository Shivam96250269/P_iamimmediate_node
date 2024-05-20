const contacUs = require('../../model/contactUs')
const emailTemplate = require('../../emailTemplate/template')
const commonfunction = require('../../commonFunction/common')
const sendEmailToAdmin = require('../../emailTemplate/template')

exports.contacUs = async(req,res)=>{
    try {
        const{emailId,name,contactNumber,feedback} = req.body
        const data = {emailId,name,contactNumber,feedback}
        const createData = await contacUs.create(data)
        if (createData) {
            await emailTemplate.contactUs(createData)
            await sendEmailToAdmin.sendFeedBackToAdmin(createData)

            res.status(200).json({ status: 200, message: "Created"})
        } else {
            res.status(404).json({ status: 404, message: "Error While Creating Data" })
        }
    } catch (error) {
        res.status(500).json({status:500,error:error.message})
    }
}
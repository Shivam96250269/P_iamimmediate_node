const lic_Certi = require('../model/licenses_certifications');
// const moment = require('moment');
exports.addCertificate = async (req, res) => {

    try {
        if (!req.body.courses) {
           return res.status(400).json({ status: 400, message: "Please Provide Course Name" })
        } else if (!req.body.company_Name) {
           return res.status(400).json({ status: 400, message: "Please Provide Issued Date" })
        }else if(!req.body.certificateUrl){
           return res.status(400).json({status:400,message:"Certificate Url is Required"})
        }
        else {
            const userSave = await lic_Certi({
                courses: req.body.courses, //
                company_Name: req.body.company_Name,
                issued_Date: req.body.issued_Date, //
                isChecked:req.body.isChecked,
                expried_Date: req.body.expried_Date,
                certificateUrl:req.body.certificateUrl,
                userId: req.userId._id
            }).save()

            if (userSave) {
               return res.status(200).json({ status: 200, message: "Certificate Added Succesfully", result: userSave })
            } else {
               return res.status(404).json({ status: 404, message: "Data Not Found" })
            }

        }

    } catch (error) {
        res.status(500).json({ status: 500, message: error.message })
    }
}

exports.editCertificate = async (req, res) => {
    try {
        const data = {
            courses: req.body.courses,
            company_Name: req.body.company_Name,
            issued_Date: req.body.issued_Date,
            isChecked:req.body.isChecked,
            expried_Date: req.body.expried_Date,
            certificateUrl:req.body.certificateUrl
        }

        const userData = await lic_Certi.findByIdAndUpdate(
            { _id: req.body.userId },
            { $set: data },
            { new: true }
        )

        if (userData) {
            res.status(200).json({ status: 200, message: "Data Edit SuccesFully", res: userData })
        } else {
            res.status(404).json({ status: 404, message: "Data Not Found" });
        }

    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
};

exports.getALLCertificate = async (req, res) => {
    try {
        const data = await lic_Certi.find({ userId: req.userId._id, status: "1" })

        if (data) {
            res.status(200).json({ status: 200, message: "Data Found", result: data });
        } else {
            res.status(404).json({ status: 404, message: "Data not found" });
        }
    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
}

exports.deleteCertificate = async (req, res) => {
    try {
        const userdata = await lic_Certi.findByIdAndUpdate(
            { _id: req.body.userId },
            { $set: { status: "0" } },
            { new: true }
        )
        if (userdata) {
            res.status(200).json({ status: 200, messsage: "Certificate Deleted Succesfullty" })
        } else {
            res.status(404).json({ status: 404, message: "No Data found" })
        }
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
const workExprience = require('../model/workExprience');
const moment = require('moment')

exports.addExperience = async (req, res) => {
    try {
        if (!req.body.title) {
            res.status(400).json({ status: 400, message: "Please provide a title" });
        } else if (!req.body.employment_type) {
            res.status(400).json({ status: 400, message: "Please provide employment type" });
        } else if (!req.body.location) {
            res.status(400).json({ status: 400, message: "Please provide company location" });
        } else if (!req.body.industry) {
            res.status(400).json({ status: 400, message: "Please provide industry" });
        } else if (!req.body.description) {
            res.status(400).json({ status: 400, message: "Please provide description" });
        } else {
            const userSave = await workExprience({
                title: req.body.title,
                employment_type: req.body.employment_type,
                company_Name: req.body.company_Name,
                state:req.body.state,
                location: req.body.location,
                isChecked: req.body.isChecked,
                industry: req.body.industry,
                description: req.body.description,
                startDate: req.body.startDate,
                endDate: req.body.endDate,
                userId: req.userId._id
            }).save();

            if (userSave) {
                res.status(200).json({ status: 200, message: "Experience added successfully", result: userSave });
            } else {
                res.status(404).json({ status: 404, message: "Error in saving experience" });
            }
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



exports.editWorkExprience = async (req, res) => {
    try {

        let data = {
            title: req.body.title,
            employment_type: req.body.employment_type,
            company_Name: req.body.company_Name,
            state:req.body.state,
            location: req.body.location,
            isChecked: req.body.isChecked,
            industry: req.body.industry,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            description: req.body.description,
        }

        const userData = await workExprience.findByIdAndUpdate(
            { _id: req.body.userId },
            { $set: data },
            { new: true }
        )

        if (userData) {
            res.status(200).json({ status: 200, message: "Work Exprience Edit Successfully", res: userData })
        } else {
            res.status(404).json({ status: 404, message: "No Data found" })
        }
    } catch (error) {
        res.status(500).json({ status: 500, message: error.message })
    }
}


exports.getAllExperience = async (req, res) => {
    try {
        const data = await workExprience.find({ userId: req.userId._id, status: '1' });

        if (data) {
            res.status(200).json({ status: 200, message: "Data Found", result: data });
        } else {
            res.status(404).json({ status: 404, message: "Data not found" });
        }
    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
}


exports.deleteExperience = async (req, res) => {
    try {
        const userdata = await workExprience.findByIdAndUpdate(
            { _id: req.body.userId },
            { $set: { status: "0" } },
            { new: true }
        )

        if (userdata) {
            res.status(200).json({ status:200, messsage: "Experience Deleted Succesfully" })
        } else {
            res.status(404).json({ status: 404, msg: "No Data found" })
        }
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

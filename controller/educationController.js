const education_Model = require('../model/educationModel');
const userModel = require('../model/userModel');
const AWS = require('aws-sdk')
require('dotenv').config()

const s3 = new AWS.S3({
    accessKeyId: process.env.access_key,
    secretAccessKey: process.env.Secret_access_key,
    region: process.env.region
});

exports.addEducation = async (req, res) => {
    try {
        if (!req.body.college) {
            return res.status(400).json({ status: 400, message: "Please provide the college name" });
        } else if (!req.body.degree) {
            return res.status(400).json({ status: 400, message: "Please provide the degree details" });
        } else {
            let educationData = {
                userId: req.userId,
                college: req.body.college,
                degree: req.body.degree,
                grade: req.body.grade,
                startDate: req.body.startDate,
                endDate: req.body.endDate,
                state:req.body.state,
                location: req.body.location,
                specialization: req.body.specialization,
                isChecked: req.body.isChecked,
                description: req.body.description
            };

            if (req.file) {
                const collegeImage = req.file;
                const collegeImageParams = {
                    Bucket: process.env.bucket_name,
                    Key: collegeImage.originalname,
                    Body: collegeImage.buffer,
                    ContentType: "image/jpeg",
                };
                const collegeImageResult = await s3.upload(collegeImageParams).promise();
                educationData.collegeImage = collegeImageResult.Location;
            }
            const userSave = await education_Model.create(educationData);

            if (userSave) {
                return res.status(200).json({ status: 200, message: "Education added successfully", result: userSave });
            } else {
                return res.status(404).json({ status: 404, message: "Data not found" });
            }
        }
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
};

exports.editEducation = async (req, res) => {
    try {
        const user = await education_Model.findOne({ _id: req.body.userId });
        if (!user) {
            res.status(404).json({ status: 404, message: "Education not found" });
        } else {
            let data = {
                college: req.body.college,
                degree: req.body.degree,
                startDate: req.body.startDate,
                endDate: req.body.endDate,
                state:req.body.state,
                location: req.body.location,
                grade: req.body.grade,
                isChecked: req.body.isChecked,
                description: req.body.description,
                specialization: req.body.specialization
            };

            if (req.file) {
                const collegeImage = req.file;
                const collegeImageParams = {
                    Bucket: process.env.bucket_name,
                    Key: collegeImage.originalname,
                    Body: collegeImage.buffer,
                    ContentType: "image/jpeg",
                };
                const collegeImageResult = await s3.upload(collegeImageParams).promise();
                data.collegeImage = collegeImageResult.Location;
            }

            const userData = await education_Model.findByIdAndUpdate(
                { _id: req.body.userId },
                { $set: data },
                { new: true }
            );

            if (userData) {
                res.status(200).json({ status: 200, message: "Education successfully edited", res: userData });
            } else {
                res.status(404).json({ status: 404, message: "Data not found" });
            }
        }
    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
};


exports.getAllEducations = async (req, res) => {
    try {
        const data = await education_Model.find({ userId: req.userId._id, status: "1" });

        if (data) {
            res.status(200).json({ status: 200, message: "Data Found", result: data });
        } else {
            res.status(404).json({ status: 404, message: "Data not found" });
        }
    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
}


exports.deleteEducation = async (req, res) => {
    try {
        const userdata = await education_Model.findByIdAndUpdate(
            { _id: req.body.userId },
            { $set: { status: "0" } },
            { new: true }
        )
        if (userdata) {
            res.status(200).json({ status: 200, messsage: "Education Deleted Succesfullty" })
        } else {
            res.status(404).json({ status: 404, messsage: "Data Not Found" })
        }
    } catch (error) {
        res.status(500).json({ status: 500, message: "Something went wrong" })
    }
}

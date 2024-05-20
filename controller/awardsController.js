const awardsModel = require('../model/honors_&_Awards');
const moment = require('moment')
const AWS = require('aws-sdk')
require('dotenv').config()


const s3 = new AWS.S3({
    accessKeyId: process.env.access_key,
    secretAccessKey: process.env.Secret_access_key,
    region: process.env.region
});

exports.addAwards = async (req, res) => {
    try {
        const { issuedDate } = req.body
        if (!req.body.title) {
            res.status(400).json({ status: 400, message: "Please Provide Tittle" })
        } else if (!req.body.issuedBy) {
            res.status(400).json({ status: 400, message: "Please Provide IssuedBy" })
        } else if (!req.body.issuedDate) {
            res.status(400).json({ status: 400, message: "Please Provide IssuedDate" })
        } else if (!req.body.about) {
            res.status(400).json({ status: 400, message: "Please Provide About Details" })
        } else if (!req.file) {
            res.status(400).json({ status: 400, message: "Please Provide Award Image" })
        }
        else {
            const data = {
                title: req.body.title,
                issuedBy: req.body.issuedBy,
                issuedDate: moment(issuedDate, 'DDD,MMM,-YYY'),
                about: req.body.about,
                userId: req.userId._id
            }
            if (req.file) {
                const awardImage = req.file;
                const awardImageParams = {
                    Bucket: process.env.bucket_name,
                    Key: awardImage.originalname,
                    Body: awardImage.buffer,
                    ContentType: "image/jpeg",
                };
                const awardImageResult = await s3.upload(awardImageParams).promise();
                data.awardImage = awardImageResult.Location;
            }
            const userSave = await awardsModel.create(data)

            if (userSave) {
                res.status(200).json({ status: 200, message: "Data Save Succesfully", result: userSave })
            } else {
                res.status(404).json({ status: 404, message: "Data Not Found" })
            }
        }

    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
}

exports.editAwards = async (req, res) => {
    try {
        const data = {
            title: req.body.title,//
            issuedBy: req.body.issuedBy,//
            issuedDate: req.body.issuedDate,//
            about: req.body.about,//
        }
        if (req.file) {
            const awardImage = req.file;
            const awardImageParams = {
                Bucket: process.env.bucket_name,
                Key: awardImage.originalname,
                Body: awardImage.buffer,
                ContentType: "image/jpeg",
            };
            const awardImageResult = await s3.upload(awardImageParams).promise();
            data.awardImage = awardImageResult.Location;
        }

        const userData = await awardsModel.findByIdAndUpdate(
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


exports.getAllAwards = async (req, res) => {
    try {
        const data = await awardsModel.find({ userId: req.userId._id, status: "1" })

        if (data.length > 0) {
            res.status(200).json({ status: 200, message: "Data Found", result: data });
        } else {
            res.status(404).json({ status: 404, message: "Data not found" });
        }
    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
}

exports.deleteAwards = async (req, res) => {
    try {
        const userdata = await awardsModel.findByIdAndUpdate(
            { _id: req.body.userId },
            { $set: { status: "0" } },
            { new: true }
        )
        if (userdata) {
            res.status(200).json({ status: 200, messsage: "Awards Deleted Succesfullty" });
        } else {
            res.status(404).json({ status: 404, message: "No Data found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
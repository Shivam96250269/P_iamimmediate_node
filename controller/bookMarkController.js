const jobdata = require('../model/addJobs');
const bookMark = require('../model/bookMark');

exports.bookMarkController = async (req, res) => {
    try {
        const { id } = req.body;
        const jobData = await jobdata.findById(id);
        const bookMarkData = await bookMark.findOne({ jobId: id });
        const userDataId = await bookMark.findOne({ userId: req.userId._id });

        if (bookMarkData && userDataId) {
            res.status(409).json({ status: 409, message: "This job is already bookmarked" });
        } else {
            if (jobData) {
                const data = await bookMark.create({
                    jobId: jobData._id,
                    userId: req.userId._id,
                    JobProfile: jobData.JobProfile,
                    experience: jobData.experience,
                    salary: jobData.salary,
                    Job_type: jobData.Job_type,
                    Shift: jobData.Shift,
                    qualifications: jobData.qualifications,
                    jobDescription: jobData.jobDescription,
                    location: jobData.location,
                });
                res.status(200).json({ status: 200, message: "Job bookmarked successfully", result: data });

            } else {
                res.status(404).json({ status: 404, message: "Data not found" });
            }
        }

    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
}

exports.removeBookMark = async (req, res) => {
    try {
        const data = await bookMark.findByIdAndUpdate(
            { _id: req.body.userId },
            { $set: { status: "0" } },
            { new: true }
        )
        if (data) {
            res.status(200).json({ status: 200, message: "Bookmark Remove SuccesFully" });

        } else {
            res.status(404).json({ status: 404, message: "Data not found" });
        }
    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
}


exports.getSingleBookMark = async (req, res) => {
    try {
        const { userId } = req.body
        const data = await bookMark.findOne({ _id: userId, status: "1" })
        if (data) {
            res.status(200).json({ status: 200, message: "data Found", result: data });
        } else {
            res.status(404).json({ status: 404, message: "Data not found" });
        }

    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
}

exports.viewAllBookMark = async (req, res) => {
    try {
        const data = await bookMark.find({ userId: req.userId._id, status: "1" });
        if (data.length > 0) {
            res.status(200).json({ status: 200, message: "data Found", result: data });
        } else {
            res.status(404).json({ status: 404, message: "Data not found" });
        }
    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
}

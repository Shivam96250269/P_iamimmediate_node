const projectModel = require('../model/projects');


exports.addProjects = async (req, res) => {
    try {
        if (!req.body.title) {
            res.status(400).json({ status: 400, message: "Please Provide title" })
        } else if (!req.body.startDate) {
            res.status(400).json({ status: 400, message: "Please Provide startDate" });
        } else if (!req.body.projectDescription) {
            res.status(400).json({ status: 400, message: "Please Provide projectDescription" });
        } else if (!req.body.associated) {
            res.status(400).json({ status: 400, message: "Please Provide associated" });
        }
        else {
            const userSave = await projectModel({
                title: req.body.title, //
                startDate: req.body.startDate, //
                associated: req.body.associated,  //
                endDate: req.body.endDate, //
                about: req.body.about,
                location: req.body.location,
                projectDescription: req.body.projectDescription, //
                projectLink: req.body.projectLink,
                userId: req.userId._id
            }).save()
            if (userSave) {
                res.status(200).json({ status: 200, message: "Project Added Succesfully", result: userSave })
            } else {
                res.status(404).json({ status: 404, message: "Data Not Found" })
            }
        }
    } catch (error) {
        res.status(500).json({ status: 500, message: error.message })
    }
}

exports.editProjects = async (req, res) => {
    try {
        const data = {
            title: req.body.title, //
            startDate: req.body.startDate, //
            associated: req.body.associated,  //
            endDate: req.body.endDate, //
            about: req.body.about,
            location: req.body.location,
            projectDescription: req.body.projectDescription, //
            projectLink: req.body.projectLink
        }

        const userData = await projectModel.findByIdAndUpdate(
            { _id: req.body.userId },
            { $set: data },
            { new: true }
        )

        if (userData) {
            res.status(200).json({ status: 200, message: "Project Edit SuccesFully", res: userData })
        } else {
            res.status(404).json({ status: 404, message: "Data Not Found" });
        }

    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
};


exports.getAllProjects = async (req, res) => {
    try {
        const data = await projectModel.find({ userId: req.userId._id, status: "1" });
        if (data) {
            res.status(200).json({ status: 200, message: "Data Found", result: data });
        } else {
            res.status(404).json({ status: 404, message: "Data not found" });
        }
    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
}


exports.deleteProjects = async (req, res) => {
    try {
        const userdata = await projectModel.findByIdAndUpdate(
            { _id: req.body.userId },
            { $set: { status: "0" } },
            { new: true }
        )
        if (userdata) {
            res.status(200).json({ status: 200, messsage: "Projects Deleted Succesfullty" })
        } else {
            res.status(404).json({ status: 404, message: "No Data found" })
        }
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
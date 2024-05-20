const skillModel = require('../model/skillModel');
const userModel = require('../model/userModel');

exports.addSkill = async (req, res) => {
    try {
        const { skillsName, softwareVersion, yearsOfExperience,yearsOfMoth,lastUsed ,skillLogo } = req.body
        const experience = 
            {
                yearsOfExperience,
                yearsOfMoth
            }
        
            const skillData = await skillModel.create({ userId: req.userId, skillsName, softwareVersion, experience,lastUsed, skillLogo });
            if(skillData){
                res.status(200).json({ status: 200, message: 'skill Added SuccesFully', result: skillData });
            }else{
                res.status(404).json({status:404,message:"Error While Creating Data"})
            }
    } catch (error) {
        res.status(500).json({ status: 500, error: error.message });
    }
}


exports.editSkill = async (req, res) => {
    try {
        const { skillsName, softwareVersion, yearsOfExperience,yearsOfMoth,lastUsed,skillId,skillLogo } = req.body;
        const experience = 
        {
            yearsOfExperience,
            yearsOfMoth
        }
        const userData = await skillModel.findById({ _id: skillId , status: "1" });
        const skillData = await skillModel.findOneAndUpdate(
            { _id: skillId },
            { skillsName, softwareVersion, yearsOfExperience,yearsOfMoth,lastUsed,experience, skillLogo },
            { new: true }
        )

        if (!userData) {
            res.status(400).json({ status: 400, message: 'User Data Not Found' });
        } else {
            if (!skillData) {
                res.status(404).json({ status: 404, message: 'Skill not found' });
            } else {
                res.status(200).json({ status: 200, message: 'Skill updated successfully', result: skillData })
            }
        }
    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
}

exports.deleteSkill = async (req, res) => {
    try {
        const { userId } = req.body
        const userData = await skillModel.findOne({ _id: userId, status: "1" });
        const skillData = await skillModel.findByIdAndUpdate(
            { _id: userId },
            { $set: { status: "0" } },
            { new: true }
        )
        if (!userData) {
            res.status(400).json({ status: 400, message: 'User Data Not Found' });
        } else {
            if (!skillData) {
                res.status(404).json({ status: 404, message: 'Skill not found' });
            } else {
                res.status(200).json({ status: 200, message: 'Skill remove successfully', result: skillData })
            }
        }
    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
}

exports.getAllSkills = async(req,res)=>{
    try {
        const data = await skillModel.find({ userId: req.userId, status: "1" });
        if (data) {
            res.status(200).json({ status: 200, message: "Data Found", result: data });
        } else {
            res.status(404).json({ status: 404, message: "Data not found" });
        }
    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
}

const techStackList = require('../model/tecStactMenu')
exports.techStackDropDown = async (req, res) => {
    try {
        const list = await techStackList.find({});

        if (list && list.length > 0) {
            const sortedList = list.sort((a, b) => {
                const nameA = a.tecStackName.toUpperCase()
                const nameB = b.tecStackName.toUpperCase()
                if (nameA < nameB) {
                    return -1;
                }
                if (nameA > nameB) {
                    return 1;
                }
                return 0;
            });

            res.status(200).json({ status: 200, message: "Found Successfully", result: sortedList });
        } else {
            res.status(404).json({ status: 404, message: "Not Found" });
        }
    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
};


exports.getSingleTechStackById = async(req,res)=>{
    try {
        const data = await techStackList.findById(req.body.teckStackId)
        if(data){
            res.status(200).json({status:200,message:"found Succesefull", result:data})
        }else{
            res.status(404).json({status:404,message:"Not Found"})
        }
    } catch (error) {
        res.status(500).json({status:500,message:error.message})
    }
}
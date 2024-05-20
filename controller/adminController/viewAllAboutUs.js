const contactUs = require('../../model/contactUs')

exports.ContactUsData = async (req, res) => {
    try {
        const data = await contactUs.find({});
        if (data) {
            res.status(200).json({ status: 200, message: "Data Found SuccesFully", result: data })
        } else {
            res.status(404).json({ status: 400, message: "Eror While Showing Data" })
        }

    } catch (error) {
        res.status(500).json({ status: 500, message: error.message })

    }
}

exports.getSingleContactUS = async (req, res) => {
    try {
        const data = await contactUs.findOne({ _id: req.body.userId });
        if (data) {
            res.status(200).json({ status: 200, message: "Data Found SuccesFully", result: data })
        } else {
            res.status(404).json({ status: 400, message: "Eror While Showing Data" })
        }

    } catch (error) {
        res.status(500).json({ status: 500, message: error.message })
    }
}
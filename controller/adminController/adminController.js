const jobPrice = require('../../model/jobPrices');
const termAndCondition = require('../../model/termAndCondition');
const privcyPolicy = require('../../model/privacyPolicy');


exports.addPricing = async (req, res) => {
    try {
        const { price, valid, jobPosting, applied,downloads } = req.body;
            const saveData = await jobPrice({
                price: price,
                valid: valid,
                jobPosting: jobPosting,
                applied: applied,
                downloads:downloads,
                adminId: req.body.adminId
            }).save()

            if (saveData) {
                res.status(400).json({ status: 400, message: "Pricing Adding SuccesFully", result: saveData })
            } else {
                res.status(5000).json({ status: 500, message: "Error while Saving Data" })
            }
    } catch (error) {
        res.status(501).json({ status: 501, message: error.message })
    }
}

exports.editPricing = async (req, res) => {
    try {
        const { price, valid, jobPosting, applied,downloads } = req.body;
        const data = {
            price: price,
            valid: valid,
            jobPosting: jobPosting,
            applied: applied,
            downloads:downloads,
        }

        const adminData = await jobPrice.findOne({ _id: req.body.id, status: '1' })
        if (adminData) {
            const updateData = await jobPrice.findByIdAndUpdate(
                { _id: req.body.id },
                { $set: data },  
                { new: true }
            )
            if (updateData) {
                res.status(200).json({ status: 200, message: "Pricing data Updated SuccesFully", result: updateData });
            } else {
                res.status(404).json({ status: 404, message: "Data Not Found" })
            }
        } else {
            res.status(404).json({ status: 404, message: "Pricing data Not Found" })
        }
    } catch (error) {
        res.status(501).json({ status: 501, message: error.message })
    }
}

exports.removePricingData = async (req, res) => {
    try {
        const data = await jobPrice.findOne({ _id: req.body.id, status: "1" })
        if (data) {
            const updateData = await jobPrice.findByIdAndUpdate(
                { _id: req.body.id },
                { $set: { status: "0" } },
                { new: true }
            )
            if (updateData) {
                res.status(200).json({ status: 200, message: "Pricing Remove SuccesFully" })
            } else {
                res.status(404).json({ status: 404, message: "Error While Removing Pricing" })
            }
        } else {
            res.status(404).json({ status: 404, message: "Data Not Found" })
        }

    } catch (error) {
        res.status(501).json({ status: 501, message: error.message })
    }
}

exports.getAllPricing = async (req, res) => {
    try {
        const data = await jobPrice.find({ status: "1" })
        if (data.length > 0) {
            res.status(200).json({ status: 200, message: "Get ALl Pricing", result: data })
        } else {
            res.status(404).json({ status: 404, message: "Data Not Found" })
        }

    } catch (error) {
        res.status(501).json({ status: 501, message: error.message })
    }
}


exports.addTermAndCondition = async (req, res) => {

    try {
        const data = await termAndCondition.create(
            {
                termAndCondition: '<html><body>' + req.body.termAndCondition + '</body></html>'
            }
        )

        if (data) {
            res.status(200).json({ status: 200, message: "TermAndCondition Data Save Succesfully", result: data })

        } else {
            res.status(400).json({ status: 400, message: "Error While Creating Data" })
        }

    } catch (error) {
        res.status(501).json({ status: 501, message: error.message })
    }
}


exports.addPrivcyPolicy = async (req, res) => {
    try {
        const data = privcyPolicy.create(
            {
                PrivacyPolicy: req.body.PrivacyPolicy
            }
        )

        if (data) {
            res.status(200).json({ status: 200, message: "Privacy Policy Data Add SuccesFully" })
        } else {
            res.status(400).json({ status: 400, message: "Error While Saving Data" })
        }

    } catch (error) {
        res.status(501).json({ status: 501, message: error.message })
    }
}




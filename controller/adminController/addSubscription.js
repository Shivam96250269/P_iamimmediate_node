const subscriptionModel = require('../../model/subscriptionModel');
const employerModel = require('../../model/employer');
const orderModel = require('../../model/order');

exports.addSubscriptionTable = async (req, res) => {
    try {
        const orders = await orderModel.find({ employerId: req.body.id });
        const orderMap = orders.map((cur) => {
            if (cur.status === "paid" && cur.paymentStatus === true) {
                return cur;
            } else {
                return null;
            }
        }).filter(Boolean);

        if (orderMap.length === 0) {
            res.status(400).json({ status: 400, message: "This User has Not Purchased a Subscription" });
        } else {
            const employerData = await employerModel.findOne({ _id: orderMap[0].employerId });
            const data = await subscriptionModel.create({
                employerId: employerData._id,
                companyName: employerData.companyName,
                designationName: employerData.designationName,
                status: orderMap[0].status,
                amount: orderMap[0].amount,
                paymentStatus: orderMap[0].paymentStatus
            });

            if (!data) {
                res.status(400).json({ status: 400, message: "Error while Creating Data" });
            } else {
                res.status(200).json({ status: 200, message: "Data added Successfully", result: data });
            }
        }
    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
};


exports.viewAllSubscriptionData = async (req, res) => {
    try {
        const data = await subscriptionModel.find({});
        if (data.length === 0) {
            res.status(400).json({ status: 400, message: "Data Not Found" })
        } else {
            res.status(200).json({ status: 200, message: "Data Found SuccesFully", result: data })
        }
    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
}

exports.checkSubscription = async (req, res) => {
    try {
        const orders = await orderModel.find({ employerId: req.body.id });
        const orderMap = orders.map((cur) => {
            if (cur.status === "paid" && cur.paymentStatus === true) {
                return cur;
            } else {
                return null;
            }
        }).filter(Boolean);

        if (orderMap.length === 0) {
            res.status(404).json({ status: 404, message: "This User is Not Buying Subscription" });
        } else {
            res.status(200).json({ status: 200, message: "This User is Buying subscription" });
        }
    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
};

const jwt = require('jsonwebtoken');
const userModel = require('../model/userModel');

const verifyToken = async (req, res, next) => {
    try {
        if (req.headers.authorization) {
            const token = req.headers.authorization.split(' ')[1];
            const result = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            // const expMilliseconds = result.exp * 1000;

            // // Create a new Date object with the milliseconds
            // const expirationDate = new Date(expMilliseconds);

            // // Get human-readable date and time
            // const humanReadableExp = expirationDate.toLocaleString(); // Or use other methods for a specific format
            // console.log(humanReadableExp);

            const data = await userModel.findOne({ _id: result.userId });
            if (!data) {
                return res.status(404).json({status:401, message: "Invalid User" });
            }
            req.userId = data._id;
            next();
        } else {
            return res.status(401).json({status:498, message: "No Token Found" });
        }
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(403).json({status:403, message: "Token Expired" });
        } else {
            return res.status(403).json({status:403, message: "Unauthorized Person" });
        }
    }
};

module.exports = verifyToken;
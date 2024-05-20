const mongoose = require('mongoose');
const abouUsModel = new mongoose.Schema({

    userId: { type: mongoose.Schema.Types.ObjectId},
    emailId: { type: String, required: [true, "Please Enter Email Id"] },
    name: { type: String, required: [true, "Please Enter Your Name"] },
    contactNumber: { type: Number, required: [true, "Please Enter Contact Number"] },
    feedback:{type:String,required:[true,"Please Enter Your FeedBack"]}
},
    {
        timestamps: true
    }
)

module.exports = mongoose.model('AboutUsModel', abouUsModel);


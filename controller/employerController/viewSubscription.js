const { default: mongoose } = require('mongoose');
const jobPrices = require('../../model/jobPrices');
const Subscription = require('../../model/subscriptionModel');


exports.viewOwnSubscription = async (req, res) => {
    try {
      const currentDate = Date.now();
      const getData = await Subscription.aggregate([
        {
          $match: {
            "planValidTill": {
              $gt: currentDate
            }
          }
        },
        {
          $lookup: {
            from: "jobprices",
            localField: "purchasingId",
            foreignField: "_id",
            as: "JobPrice"
          }
        },
      ]);
      if (getData.length > 0) {
        res.status(200).json({ status: 200, message: "Data Found Successfully", result: getData });
      } else {
        res.status(200).json({ status: 200, message: "Data Not Found" , result:[] });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  exports.checkSubscriptionStatus = async(req,res)=>{
    try {
      let storeData = []
      const data = await Subscription.find({})
      if(data.length>0){
      const promise =   data.map(async(item)=>{
          const jobPrice = await jobPrices.findById(new mongoose.Types.ObjectId(item.purchasingId))
          const todayDate = new Date().getTime()
          const planValidTill = item.planValidTill
          const  status = planValidTill>todayDate ? true : false
          const data = {
            amount:jobPrice.price,
            issuedOn:item.subscriptionDate,
            status:status,
            pdf:item.invoice
          }
          storeData.push(data)
        })
        await Promise.all(promise);
        storeData.sort((a, b) => (a.status === b.status ? 0 : a.status ? -1 : 1))
       return res.status(200).json({status:200,message:"Found Succesfully", result:storeData})
      }else{
       return res.status(200).json({status:200,message:"Found Succesfully", result:storeData})
      }
      
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }


  exports.checkSubscriptionBuyOrNot = async (req, res) => {
    try {
      const data = await Subscription.find({ employerId: req.userId, planValidTill: { $gt: new Date() } })
      const responseData = []
  
      if (data.length > 0) {
        const purchasingId = data[0].purchasingId
        const subsData = await jobPrices.find({})
  
        subsData.forEach((item) => {
          const buyStatus = item._id.equals(purchasingId) ? "1" : "0"
          responseData.push({ ...item.toObject(), buyStatus })
        })
      }else{
        const allJobPricesData = await jobPrices.find({})
        allJobPricesData.forEach((item) => {
          responseData.push({ ...item.toObject(), buyStatus: "0" })
        })
      }
      return res.status(200).json({status:200,message:"found Succesfully", result:responseData})
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }
const employer = require("../../model/employer");
const razorPay = require('razorpay');
const orderModel = require('../../model/order');
const crypto = require('crypto')
const orders = require('../../model/order')
const util = require('util');
const Subscription = require('../../model/jobPrices')
const employerSubscriptionTable = require('../../model/subscriptionModel')
const fs = require('fs');
const path = require('path');
// const pdf = require('html-pdf')
const ejs = require('ejs')
const AWS = require('aws-sdk');
// const htmPdfNode = require('html-pdf-node')
const pdf = require('pdf-creator-node')
require('dotenv').config()

const s3 = new AWS.S3({
    accessKeyId: process.env.access_key,
    secretAccessKey: process.env.Secret_access_key,
    region: process.env.region
});

exports.payments = async (req, res) => {
    try {
        const { subScriptionId } = req.body;
        const user = await employer.findOne({ _id: req.userId })
        const subs = await Subscription.findById(subScriptionId)
        const checkSubscriptionStatus = await employerSubscriptionTable.find({employerId:user._id})

        if (!user) {
          return  res.status(404).json({ status: 404, message: "User Not Found" });
        }

        if(!subs){
            return res.status(404).json({status:404,message:"Subscription Data Not Found"})
        }

        if(checkSubscriptionStatus.length>0){
            const hasActivePlan = checkSubscriptionStatus.some(item => new Date().getTime() <= item.planValidTill);
            if (hasActivePlan) {
                return res.status(400).json({ status: 400, message: "You already have an active plan"});
            }
        }

        let instance = new razorPay({
            key_id: process.env.KEYID,
            key_secret: process.env.KEYSECRET
        });

        const createOrderPromise = util.promisify(instance.orders.create);
        const withGst = subs.price * 18 / 100
        const total = subs.price + withGst

        const options = {
            amount: total * 100,
            currency: 'INR',
            receipt: "receipt#42"
        };

        const order = await createOrderPromise(options);

        if (!order) {
            res.status(400).json({ status: 400, message: "Error While Creating Order Promise" });
        }
        
        const orderRes = await orderModel.create({
            employerId: user._id,
            jobPriceId:subs._id,
            orderId: order.id,
            entity: order.order,
            amount: order.amount,
            amount_paid: order.amount_paid,
            amount_due: order.amount_due,
            currency: order.currency,
            receipt: order.receipt,
            offer_id: order.offer_id,
            status: order.status,
            attempts: order.attempts,
            notes: order.notes,
            created_at: order.created_at
        });
        if (!orderRes) {
            res.status(400).json({ status: 400, message: "Error While Creating Order" });
        } else {
            res.status(200).json({ status: 200, message: "Order created successfully", result: orderRes });
        }

    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
};

exports.checkStatus = async (req, res) => {
    const { orderId } = req.body;

    let razorpay = new razorPay({
        key_id: process.env.KEYID,
        key_secret: process.env.KEYSECRET
    });

    razorpay.orders.fetch(orderId, function (error, order) {

        if (error) {
            res.status(400).json({ status: 400, message: error });
        } else {
            res.status(200).json({ status: 200, message: order });
        }
    });
};


exports.verifyPayment = async (req, res) => {
    try {
        const { order_id, payment_id ,razorpay_signature} = req.body;
        const key_secret = process.env.KEYSECRET

        let hmac = crypto.createHmac('sha256', key_secret);

        hmac.update(order_id + "|" + payment_id);

        const generated_signature = hmac.digest('hex');

        if (razorpay_signature === generated_signature) {
            const data = await orders.findOne({ orderId: order_id })
            if (!data) {
                res.status(404).json({ status: 400, message: "data Not Found" })
            } else {
                const upadateData = await orders.findByIdAndUpdate(
                    { _id: data._id },
                    { $set: { status: "paid", paymentStatus: true } },
                    { new: true }
                )
                if (upadateData) {
                    const subsData = await Subscription.findById(upadateData.jobPriceId)
                    const d = new Date(upadateData.updatedAt)
                    d.setMonth(d.getMonth() + subsData.valid)
                    const validTill = new Date(d).getTime()
                    const paymentDate = new Date(upadateData.updatedAt).getTime()
                    const subscriptionData = {
                        employerId:upadateData.employerId,
                        purchasingId:upadateData.jobPriceId,
                        planValidTill:validTill,
                        subscriptionDate:paymentDate,
                        jobPostingRemaning:subsData.jobPosting,
                        resumeAccessRemaing:subsData.applied,
                        resumeDownloadsRemaing:subsData.downloads,
                    }
                    await employerSubscriptionTable.create(subscriptionData)
                    // const subsDatas = await employerSubscriptionTable.find({_id:"6552150d6e9ea4adbd912cf3"})
                    // const invoiceGenerator = path.join(__dirname, '../../invoice/invoice.ejs')
                    // const readInvoice = fs.readFileSync(invoiceGenerator,'utf-8');
                    // const data = Math.floor((Math.random() * 10000000) + 1)
                    // const filename = `today-data-${data}.pdf`;
                    // const pdfOptions = {
                    //     format: 'A3',
                    //     orientation: 'portrait',
                    //     border: '10mm',
                    //     header: {
                    //         height: '10mm',
                    //         contents: '',
                    //     },
                    //     footer: {
                    //         height: '10mm',
                    //         contents: '',
                    //     },
                    //   };

                    //   const document = {
                    //     html: ejs.render(readInvoice,  {subsDatas} ),
                    //     data: subsData,
                    //     path: filename,
                    // }

                    //   try {
                    //     const pdfData = await pdf.create(document, pdfOptions)
                    //     const pdfName = filename;
                    //     const params = {
                    //       Bucket: process.env.bucket_name,
                    //       Key: pdfName,
                    //       Body: fs.createReadStream(pdfData.filename),
                    //       ContentType: 'application/pdf',
                    //     };
                    //     try {
                    //       const s3UploadResult = await s3.upload(params).promise();
                    //       fs.unlinkSync(pdfData.filename)
                    //       res.status(200).json({ status: 200, message: "Data Found Successfully", result: s3UploadResult.Location });
                    //     } catch (error) {
                    //       console.error('Error uploading PDF to S3:', error);
                    //     }
                    //   } catch (error) {
                    //     console.error('Error creating PDF:', error);
                    //   }


                    res.json({ status: 200, message: "Payment has been verified", result: upadateData })
                } else {
                    res.status(404).json({ status: 404, message: "Error While Veriying Payments" })
                }
            }
        } else {
            res.json({ success: false, message: "Payment verification failed" })
        }

    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
}

exports.getAllPaymentHistory = async (req, res) => {
    try {
        const { employerId } = req.body
        const data = await orders.find({ employerId: employerId })
        if (data.length > 0) {
            res.status(200).json({ status: 200, message: "Data Found sucessFully", result: data })
        } else {
            res.status(404).json({ status: 404, message: "Data Not Found" })
        }
    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }

}

// const newData = [{subscription:[subsData]},{paymentData:[upadateData]}]
// const invoiceGenerator = path.join(__dirname, '../../invoice/invoice.ejs')
// const readInvoice = fs.readFileSync(invoiceGenerator,'utf-8');
// const renderTemplate = ejs.render(readInvoice,{upadateData});
// const pdfOptions = {
//     format: 'A3',
//     orientation: 'portrait',
//     directory: './pdfs/',
//     type: "pdf"
//   };

//   const pdfBuffer = await new Promise((resolve, reject) => {
//     htmPdfNode.generatePdfs(renderTemplate, pdfOptions).toBuffer((err, buffer) => {
//       if (err) {
//         reject(err)
//       } else {
//         resolve(buffer)
//       }
//     })
//   })
//   const fileName = `new.pdf`
//   const params = {
//     Bucket: process.env.bucket_name,
//     Key: fileName,
//     Body: pdfBuffer,
//     ContentType: 'application/pdf',
//   };
//   const s3UploadResult = await s3.upload(params).promise();
//   console.log(s3UploadResult.Location)

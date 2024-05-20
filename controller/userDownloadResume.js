const userModel = require('../model/userModel')
const path = require('path')
const ejs = require('ejs')
const pdf = require('pdf-creator-node')
const { default: mongoose } = require('mongoose')
const fs = require('fs')
const puppeteer = require('puppeteer');
require('dotenv').config()
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    accessKeyId: process.env.access_key,
    secretAccessKey: process.env.Secret_access_key,
    region: process.env.region
  });

exports.downloadUserRusumeByUserId = async(req,res)=>{
    try {       
      const getData = await userModel.aggregate([
        {
          $match: { _id: req.userId }
        },
        {
          $lookup: {
            from: "work_expriences",
            let: { userId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$userId', '$$userId'] },
                      { $eq: ['$status', '1'] } // Filter out status "1"
                    ]
                  }
                }
              }
            ],
            as: "workExperiences"
          }
        },
        {
          $lookup: {
            from: "awards",
            let: { userId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$userId', '$$userId'] },
                      { $eq: ['$status', '1'] } // Filter out status "1"
                    ]
                  }
                }
              }
            ],
            as: "awards"
          }
        },
        {
          $lookup: {
            from: "lic_&_certis",
            let: { userId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$userId', '$$userId'] },
                      { $eq: ['$status', '1'] } // Filter out status "1"
                    ]
                  }
                }
              }
            ],
            as: "lic_certis"
          }
        },
        {
          $lookup: {
            from: "projectmodels",
            let: { userId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$userId', '$$userId'] },
                      { $eq: ['$status', '1'] } // Filter out status "1"
                    ]
                  }
                }
              }
            ],
            as: "projectmodels"
          }
        },
        {
          $lookup: {
            from: "skillmodels",
            let: { userId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$userId', '$$userId'] },
                      { $eq: ['$status', '1'] } // Filter out status "1"
                    ]
                  }
                }
              }
            ],
            as: "skillmodels"
          }
        },
        {
          $project: {
          "password": 0, "otp": 0, 'expireTime': 0, "emailVerification": 0, "emailOtp": 0, "emailOtp_ExpireTime": 0, "mobileNumberVerification": 0, "mobileOtp": 0, "emailOtp_ExpireTime": 0, "mobileOtp_ExpireTime": 0
          }
        }
      ]);
      
      // if (getData.length > 0) {
      //   const file = getData[0].firstName
      //   const first = path.join(__dirname, '../template/index.html')
      //   const readTemplate = fs.readFileSync(first, 'utf-8');
      //   const renderTemplate = ejs.render(readTemplate, { getData });
      //   const pdfOptions = {
      //     format: 'A4',
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

      //   // const createdAt = moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss"); 
      //   const data = Math.floor((Math.random() * 10000000) + 1)
      //   const filename = `today-data-${data}.pdf`;
        
      //   const document = {
      //     html: ejs.render(readTemplate, { getData }),
      //     data: getData,
      //     path: filename,
      // }
      // try {
      //   const pdfData = await pdf.create(document, pdfOptions)
       
     
      //   const pdfName = `514548785785.pdf`;
      //   const params = {
      //     Bucket: process.env.bucket_name,
      //     Key: filename,
      //     Body: fs.createReadStream(pdfData.filename),
      //     ContentType: 'application/pdf',
      //   };
      //   try {
      //     const s3UploadResult = await s3.upload(params).promise();
      //     fs.unlinkSync(pdfData.filename)
      //     res.status(200).json({ status: 200, message: "Data Found Successfully", result: s3UploadResult.Location });
      //   } catch (error) {
      //     console.error('Error uploading PDF to S3:', error);
      //   }
      // } catch (error) {
      //   console.error('Error creating PDF:', error);
      // }
      // } else {
      //   res.status(404).json({ status: 404, message: "Data Not Found" });
      // }

      if (getData.length > 0) {
        const file = getData[0].firstName;
        const first = path.join(__dirname, '../template/index.html');
        const readTemplate = fs.readFileSync(first, 'utf-8');
        const renderTemplate = ejs.render(readTemplate, { getData });
      
        // Create a function to generate the PDF using Puppeteer
        const generatePDF = async (htmlContent, pdfPath) => {
          const browser = await puppeteer.launch({
            headless: 'new', // Specify the new headless mode
          });
          const page = await browser.newPage();
          await page.setContent(htmlContent);
      
          // Set up PDF options
          const pdfOptions = {
            path: pdfPath,
            format: 'A4',
          };
      
          // Generate the PDF
          await page.pdf(pdfOptions);
      
          // Close the browser
          await browser.close();
        };
      
        // Generate the PDF using Puppeteer
        const data = Math.floor((Math.random() * 10000000) + 1);
        const pdfPath = `today-data-${data}.pdf`;
      
        try {
          await generatePDF(renderTemplate, pdfPath);
      
          // Upload the generated PDF to AWS S3
          const params = {
            Bucket: process.env.bucket_name,
            Key: pdfPath,
            Body: fs.createReadStream(pdfPath),
            ContentType: 'application/pdf',
          };
      
          const s3UploadResult = await s3.upload(params).promise();
      
          // Delete the local PDF file after uploading
          fs.unlinkSync(pdfPath);
      
          res.status(200).json({
            status: 200,
            message: 'Data Found Successfully',
            result: s3UploadResult.Location,
          });
        } catch (error) {
          console.error('Error generating PDF or uploading to S3:', error);
          res.status(500).json({ status: 500, message: 'Error generating PDF or uploading to S3' });
        }
      } else {
        res.status(404).json({ status: 404, message: 'Data Not Found' });
      }

      
    } catch (error) {
      console.error(error)
      res.status(500).json({ status: 500, message: error.message });
    }
  }
  
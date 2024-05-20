const nodemailer = require('nodemailer');
const AWS = require('aws-sdk')
module.exports = ({
    genrateOtp: () => {
        let random = Math.random()
        let otp = Math.floor(random * 100000) + 100000
        return otp
    },

    // sendMailing: async (email, subject, text) => {
    //     try {
    //         let transporter = nodemailer.createTransport({
    //             service: "gmail",
    //             auth: {
    //                 user: 'no-reply@iamimmediate.com',
    //                 pass: 'qlxhptkuhrdcvyum'
    //             }
    //         });

    //         let mailResponse = await transporter.sendMail({
                
    //             from: "no-reply@iamimmediate.com",
    //             to: email,
    //             subject: subject,
    //             text: text
    //         })
    //         console.log(mailResponse.response)
    //         return mailResponse

    //     } catch (error) {
    //         console.log(error.message)
    //     }
    // }
      sendMailing: async (email, subject, text) => {
          try {
            AWS.config.update({
                accessKeyId: "AKIAUXMX7S77GH34I4K5",   
                secretAccessKey: "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", // "Dv8oaTldTNIz4kONoJvqKrgoaRl6qzT6uzaY0xqL"
                region: "ap-south-1",
              });
              let transporter = nodemailer.createTransport({
                SES: new AWS.SES({
                  apiVersion: '2012-10-17',
                  signatureVersion: 'v4',
                })
              });
           
              // send mail
              transporter.sendMail({
                from: 'info@iamimmediate.com',
                to: email,
                subject: subject,
                text:text
                // html: msg,
              }, (err, info) => {
              
                if (err) {
                  console.log(`Error is : ${err}`)
                
                } else {
                  console.log(info.envelope);
                  console.log(info.messageId);
                  
                }
              });

          } catch (error) {
              console.log(error.message)
          }
      }
})
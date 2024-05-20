const cron = require('node-cron')
const userModel = require('../model/userModel')
const nodemailer = require('../commonFunction/common')
const employer = require('../model/employer');
const sendEmailToCompany = require('../emailTemplate/template')

const findInCompleteProfileData = async () => {
    try {
        const getData = await userModel.aggregate([
            {
                $match: {
                    status: "1", role: "1"
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $lookup: {
                    from: "skillmodels",
                    localField: "_id",
                    foreignField: "userId",
                    as: "skillData"
                }
            },
            {
                $project: {
                    "password": 0, "otp": 0, 'expireTime': 0, "emailVerification": 0, "emailOtp": 0, "emailOtp_ExpireTime": 0, "mobileNumberVerification": 0, "mobileOtp": 0, "emailOtp_ExpireTime": 0, "mobileOtp_ExpireTime": 0
                }
            }
        ])

        const filteredData = getData.filter(element => {
            if (element.isCompleted === false || element.skillData.length === 0) {
                return true;
            } else {
                return false;
            }
        });

        return filteredData; 
        

    } catch (error) {
        console.log(error)
    }
}

const runEmail = async()=>{
    try {
        const subject = "Unlock Your Job Opportunities: Completing Your Profile on I am Immediate"
        const data = await findInCompleteProfileData();

        for(const item  of data){
            const text = `

            Hi ${item.firstName} ${item.lastName},

            Hope this message finds you well! We noticed your I am Immediate profile is awaiting completion. Taking a few minutes to fill in the missing details can make a significant difference in your job search.

            Why complete your profile?

            1. Stand Out: A complete profile attracts employers' attention.

            2. Tailored Matches: We can suggest more relevant job opportunities.

            3. Swift Applications: Completing your profile streamlines the application process.

            Log in https://iamimmediate.com/login to update your profile now.
            Add links of their incomplete profile or I am immediate. 

            Feel free to reach out if you need assistance support@iamimmediate.com.

            Best,
            Best regards,
            Iamimmediate Team
            support@iamimmediate.com
            `
            try {
                const result = await nodemailer.sendMailing(item.email,subject,text);
            } catch (error) {
                console.error("Error sending email:", error.message);
            }
        }


    } catch (error) {
        console.error("Error occurred:", error);
    }
}

const checkCronRunningOrNot = async()=>{
    const emails = ['shivam@sovtechnologies.com','suraj@sovtechnologies.com']
    const subject = "Schedule Email Every 6 Hours"
    const contentText = `
    Cron is hit Date - ${new Date()}
    `
    for(const item of emails){
        try {
            const result = await nodemailer.sendMailing(item,subject,contentText);
        } catch (error) {
            console.error("Error sending email:", error.message);
        }
    }
}




exports.findCompanyJobNotRegister = async () => {
    try {
        const companyData = await employer.aggregate([
            {
                $match: {
                    status: "1"
                }
            },
            {
                $lookup: {
                    from: "jobsmodels",
                    localField: "_id",
                    foreignField: "employerId",
                    as: "jobsmodels"
                }
            },
        ])

        const filterData = companyData.filter((element)=>{
            if(!element.jobsmodels.length>0){
                return element
            }else{
                return false
            }
        })
        return filterData

    } catch (error) {
        console.log(error)
    }
}

cron.schedule('0 */6 * * *',async()=>{
     await sendEmailToCompany.sendEmailToCompanyToPostJob()
})


cron.schedule('0 */6 * * *', async() => {
    try {
        await runEmail();
    } catch (err) {
        console.error('Error in running runEmail:', err);
    }

    try {
        await checkCronRunningOrNot();
    } catch (err) {
        console.error('Error in running checkCronRunningOrNot:', err);
    }
    // runEmail().catch(err => console.error('Error in running runEmail:', err));
});


const companyData = require('../cronJobs/cronJobs')
const nodemailer = require('../commonFunction/common')

exports.viewMobileNumber = (username,companyname,)=>{
    return (
        `Dear ${username},
        We hope this message finds you well.

        We wanted to inform you that your Mobile-Number associated with your profile on Iamimmediate has been accessed by ${companyname}. This access occurred on [Date/Time], indicating that they have viewed your provided contact information.

        This visibility allows companies to better understand your profile and reach out regarding potential opportunities that match your qualifications and interests.

        Should you have any questions or concerns about this access or require further information, please don't hesitate to contact our support team. Your privacy and control over your information are our top priorities.

        Thank you for using Iamimmediate. We are committed to facilitating connections while maintaining the integrity and security of your profile information.

        Best regards,
        Iamimmediate Team
        support@iamimmediate.com
        `       
    )
}

exports.viewEmailAddress = (username,companyname,)=>{
    return (
        `Dear ${username},
        We hope this message finds you well.

        We wanted to inform you that your email Address associated with your profile on Iamimmediate has been accessed by ${companyname}. This access occurred on [Date/Time], indicating that they have viewed your provided contact information.

        This visibility allows companies to better understand your profile and reach out regarding potential opportunities that match your qualifications and interests.

        Should you have any questions or concerns about this access or require further information, please don't hesitate to contact our support team. Your privacy and control over your information are our top priorities.

        Thank you for using Iamimmediate. We are committed to facilitating connections while maintaining the integrity and security of your profile information.

        Best regards,
        Iamimmediate Team
        support@iamimmediate.com
        `       
    )
}

exports.viewUserResumeById = (username)=>{
    return (
        `
        Dear ${username},

        We hope this message finds you well.
        
        We wanted to inform you that your resume on Iamimmediate has recently been accessed. This indicates that companies or recruiters have shown interest in your profile.
        
        We value your privacy, and while we cannot disclose specific company names due to confidentiality reasons, we're excited to see interest in your qualifications.
        
        Should you have any questions or need further assistance regarding your profile or any job applications, please feel free to reach out to our support team.
        
        Thank you for using Iamimmediate. We're dedicated to helping you connect with opportunities while safeguarding your privacy.
        
        Best regards,
        Iamimmediate Team
        support@iamimmediate.com
        `       
    )
}

exports.userResumeAccptedByCompany = (username,companyName,jobTittle)=>{
    return (
        `
        Dear ${username},

        We are thrilled to inform you that ${companyName} has reviewed your job application for the ${jobTittle} position, and we are pleased to let you know that your application has been accepted.
        
        Your qualifications and experience stood out among the candidates, and we believe you will be a valuable addition to our team.
        
        Next Steps:
        
        We will be contacting you shortly to discuss further details, including scheduling an interview.

        Please be prepared to provide any additional information or documentation that might be required for the next phase of the application process.
        If you have any questions or need clarification regarding the next steps, please feel free to contact our HR department at [HR Contact Information].
        
        Congratulations once again on this achievement! We look forward to potentially welcoming you to our team at ${companyName}.
        
        Best regards,
        Iamimmediate Team
        support@iamimmediate.com
        `       
    )
}

exports.userResumeRejectedByCompany = (username,companyName,jobTittle)=>{
    return (
        `
        Dear ${username},

        We hope this message finds you well.
        
        We wanted to take a moment to express our appreciation for your interest in the ${jobTittle} position at ${companyName}. We have carefully reviewed your application and qualifications.
        
        Unfortunately, after thorough consideration, we regret to inform you that we have chosen to move forward with other candidates whose skills and experience more closely match the requirements for this role.
        
        We want to thank you sincerely for taking the time to apply and for your interest in joining our team at ${companyName}. Your application was carefully reviewed, and we encourage you to consider applying for future opportunities that align more closely with your expertise.
        
        We genuinely appreciate your interest and wish you all the best in your job search endeavors. If you have any questions or seek feedback on your application, please feel free to reach out to us.
        
        Thank you once again for considering ${companyName} as a potential employer.
        
        Best regards,
        Iamimmediate Team
        support@iamimmediate.com  
        `       
    )
}

exports.changePasswordSuccesfully = (username)=>{
    return (
        `
        Dear ${username},

        This is to inform you that the password associated with your account at Iamimmediate has been successfully changed.

        If you did not initiate this change or have any concerns regarding your account security, please contact our support team immediately at info@iamimmediate.com.

        Thank you for your attention to this matter.

        Best regards,
        Iamimmediate Team
        support@iamimmediate.com
        `
    )
}

exports.applyJob = (username,jobTittle,companyName)=>{
    return(
        `
        Dear ${username},

        I hope this message finds you well.
        
        I am writing to confirm that your application for the ${jobTittle} position at ${companyName} has been successfully submitted. Thank you for expressing your interest in joining our team.
        
        We have received your application and appreciate the time and effort you've dedicated to apply for this role. Our hiring team will carefully review all applications, and if your qualifications match our needs, we will reach out to you for the next steps in the hiring process.
        
        We value your interest in becoming a part of ${companyName} and wish you the best of luck with your application.
        
        Should you have any questions or need further information regarding the application process or the position, please feel free to contact us.
        
        Thank you for considering a career with us.
        
        Best regards,
        Iamimmediate Team
        support@iamimmediate.com
        `
    )
}

exports.contactUs = async(data)=>{

        const subject = "Get in Touch Iamimmediate Inquiry"
        const text = `
        Dear ${data.name}

        Thank you for your email We are more than happy to help you with their request or query

        Our Team will Contact Soon

        Best regards,
        Iamimmediate Team
        support@iamimmediate.com
        `

        await nodemailer.sendMailing(data.emailId,subject,text)
}

exports.informUserToIncompletedProfile = (username) =>{
   return(
    `Dear ${username},

    We hope this message finds you well. We noticed that your profile on our platform is not yet complete, and we wanted to remind you of the benefits of a fully filled-out profile.
    
    Completing your profile helps us tailor our services to your preferences and needs, ensuring a smoother and more personalized experience. Additionally, it allows us to provide you with relevant updates and opportunities that match your interests.
    
    To enhance your experience and make the most of our platform, we encourage you to take a few moments to update and complete your profile. You can add details such as your interests, preferences, and any other information that will help us serve you better.
    
    Thank you for being a part of our community. If you have any questions or need assistance, please don't hesitate to reach out to our support team.
    
    Best regards,
    Iamimmediate Team
    support@iamimmediate.com
    `
   )
}

exports.sendEmailToCompanyToPostJob = async()=>{
    try {
        const data = await companyData.findCompanyJobNotRegister()
        const subject = "Optimize Your Hiring Efforts with Immediate - Post Jobs Now!"
        if(data.length>0){
            for(const item of data){
                const text = `
                Hi ${item.companyName},
    
                I hope this finds you well. We've noticed your registration on www.iamimmediate.com but haven't seen any posted jobs from your end. Unlock these benefits:
    
                Why you should start posting jobs :
    
                1. Top Talent Access: Connect with skilled candidates actively seeking opportunities.
    
                2. Effortless Recruitment: Streamlined, user-friendly platform for quick and easy job postings.
    
                3. Cost-Effective Reach: Reach a broad audience without breaking the bank.
    
                Seize these advantages by posting your job openings on Iamimmediate today.
    
                Thank you for choosing www.iamimmediate.com. We look forward to boosting your hiring success
    
                Best,
                Best regards,
                Iamimmediate Team
                support@iamimmediate.com
                `
    
                await nodemailer.sendMailing(item.email,subject,text);
            }
        }
        
    } catch (error) {
        console.log(error)
    }
}

exports.sendEmailToCompanyToInformUserRegisetOnJobApplication = async(companyData,userData,jobData)=>{
    try {
        const subject = `Action Required: Review of Your Application for ${jobData.JobProfile} on Iamimmediate`
        const text = `
        Dear ${companyData.companyName},
    
        I hope this message finds you well. I am reaching out regarding the recent application submitted for the ${jobData.JobProfile} position on our Iamimmediate.
    
        An applicant by the name of ${userData.firstName} ${userData.lastName} has expressed interest in this role within ${companyData.companyName}. We kindly request your attention to review their application and take necessary action:
    
        1.If the candidate aligns with the requirements and expectations for this role,\n
          kindly proceed with the next steps in the hiring process or communicate your interest in further discussions.\n
        2.If, after review, you find the candidate does not meet our current needs, we kindly request informing them accordingly.\n
    
        Please let us know your decision or any specific feedback you might have regarding the applicant's suitability for the role. Your prompt action would be greatly appreciated.
    
        Thank you for your attention to this request. Should you require any additional information or have questions, please don't hesitate to contact me.
    
        Best,
        Best regards,
        Iamimmediate Team
        support@iamimmediate.com
        `
        await nodemailer.sendMailing(companyData.email,subject,text);
        
    } catch (error) {
        console.log(error)
    }

}

exports.sendFeedBackToAdmin = async(data)=>{
    try {
        const emails = ['suraj@sovtechnologies.com','shivam@sovtechnologies.com']
        const subject = "Inquiry Received from Iamimmediate"
        const text = `
        Dear Admin,\n

        I am writing to inform you that we have received an inquiry through our website.
        Below are the details:\n

        UserName - ${data.name}\n
        Email - ${data.emailId}\n
        Contact-Number - ${data.contactNumber}\n
        feedBack - ${data.feedback}\n

        Please take the necessary steps to address this inquiry promptly. Feel free to reach out to the user using the provided contact information.\n

        If you require any further details or assistance regarding this inquiry, please do not hesitate to contact me.\n

        Best,
        Best regards,
        Iamimmediate Team
        support@iamimmediate.com
        `
        emails.forEach(async(email)=>{
        await nodemailer.sendMailing(email,subject,text);
        })
        
    } catch (error) {
        console.log(error)
    }
}
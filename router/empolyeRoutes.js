const { register, login, editEmpolyer, addJobs, editJobs, deleteJobs, editJobsHighLights, GetAllJobs, getAllData, findFreelancersTechnologieStack, getAllFreelancers, getSingleFreeLancers, searchFreeLancers, addJobHighLights, getLatestJobs, PostAbout, emailVerificationSendOtp, emailVerificationSetup, mobileNumberVerificationSendOtp, mobileNumberVerificationSetup, activeDeactiveJobs, viewMobileNumber, viewEmailButton, viewResumeByUserId, getCompanyAllJobs, changePassword, getHireConditate, checkHiredStatus, checkHowManyPeopleApplySingleJob } = require('../controller/employerController/employer');
const { payments, verifyPayment, checkStatus, getAllPaymentHistory } = require('../controller/employerController/paymentController');
const viewAllSubscription = require('../controller/employerController/viewSubscription')
const userResume = require('../controller/employerController/viewUserResumeById');
const verifyToken = require('../middleware/emplyerAuth');
const jobApplicationStatus = require('../controller/employerController/changeApplicationStatus')
const Router = require('express').Router();
const qualificationList = require('../controller/employerController/getQualification')
const contract = require('../controller/employerController/contract')

const storage = require("../utills/uploadFile");
const multer = require('multer');

const upload = multer({ storage: storage });

const uploads = upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "banner", maxCount: 1 }
]);

const uploadResume = upload.single('resume')

Router.post('/register', register);
Router.post('/login', login)
Router.post('/emailVerificationSendOtp',emailVerificationSendOtp)
Router.post('/emailVerificationSetup',emailVerificationSetup)
Router.post('/mobileNumberVerificationSendOtp',mobileNumberVerificationSendOtp)
Router.post('/mobileNumberVerificationSetup',mobileNumberVerificationSetup)
Router.put('/editEmployer', verifyToken, uploads, editEmpolyer)
Router.put('/ChangePassword',verifyToken,changePassword)
Router.post('/addJobs', verifyToken, addJobs)
Router.put('/editJobs', verifyToken, editJobs);
Router.post('/deleteJobs', verifyToken, deleteJobs)
Router.post('/checkHowManyPeopleApplySingleJob',verifyToken,checkHowManyPeopleApplySingleJob)
// Router.post
Router.post('/activeDeactiveJobs',verifyToken,activeDeactiveJobs)
Router.post("/addJobsHighLights", verifyToken, addJobHighLights)
Router.put('/editJobsHighLights', verifyToken, editJobsHighLights)
Router.get("/getAllJobs", verifyToken, GetAllJobs)
Router.get("/getAllData", verifyToken, getAllData)
Router.post('/findFreelancersTechnologieStack', findFreelancersTechnologieStack);
// Router.post('/searchFreeLancers', searchFreeLancers);
Router.get("/getAllFreeLancers", getAllFreelancers);
Router.get('/getSingleFreeLancers', getSingleFreeLancers)
Router.get('/getLatestJobs', verifyToken, getLatestJobs);
Router.post("/postAbout", verifyToken, PostAbout);
Router.post("/createPayment", verifyToken, payments);
Router.post("/verifyPayment", verifyToken, verifyPayment);
Router.post("/checkStatus", checkStatus);
Router.post('/getAllPaymentHistory', getAllPaymentHistory)
Router.post('/viewMobileNumber',verifyToken,viewMobileNumber)
Router.post('/viewEmailButton',verifyToken,viewEmailButton)
Router.get('/getCompanyAllJobs',verifyToken,getCompanyAllJobs)
Router.post('/viewResumeByUserId',verifyToken,viewResumeByUserId)
Router.post('/downloadUserRusumeByUserId',verifyToken,userResume.downloadUserRusumeByUserId)


Router.post("/getHireConditate",verifyToken, getHireConditate);
Router.post("/checkHiredStatus",verifyToken,checkHiredStatus )


Router.get('/viewAllSubscription',verifyToken,viewAllSubscription.viewOwnSubscription)
Router.get('/checkSubscriptionStatus', verifyToken,viewAllSubscription.checkSubscriptionStatus)
Router.get('/checkSubscriptionBuyOrNot',verifyToken,viewAllSubscription.checkSubscriptionBuyOrNot)



// Change Job Application Status
Router.post('/changeApplicationStatus',verifyToken,jobApplicationStatus.changeApplicationStatus)

Router.get('/qualificationList',qualificationList.qualificationList)


// AddContract 
Router.post('/addContract',verifyToken, uploadResume,contract.addContract)
Router.post('/editContract',verifyToken,uploadResume,contract.updateContract)
Router.post('/removeContract',verifyToken,contract.removeContract)
Router.get('/getAllContracts',verifyToken,contract.getAllActiveContract)


module.exports = Router;
const Router = require('express').Router();
const { editUserProfile, register, login, getAllUserDetails, changePassword, forgetPassword, resetPassword, getResume, protfolio, website, jobFilter, decativateUser, emailVerificationSetup, emailVerificationSendOtp, viewALlRegisterCompany, findFreelancersTechnologieStack, userFilter, mobileNumberVerificationSendOtp, mobileNumberVerificationSetup, verifyForgotPassword, resendOtp, companyFilter, } = require('../controller/userController');
const { addEducation, editEducation, deleteEducation, getAllEducations } = require('../controller/educationController');
const { addExperience, editWorkExprience, deleteExperience, getAllExperience } = require('../controller/experienceController')
const { addCertificate, editCertificate, deleteCertificate, getALLCertificate } = require('../controller/lic_&_Certif');
const { addProjects, editProjects, deleteProjects, getAllProjects } = require('../controller/projectController');
const { addAwards, editAwards, deleteAwards, getAllAwards } = require('../controller/awardsController');
const { bookMarkController, viewAllBookMark, removeBookMark, getSingleBookMark } = require('../controller/bookMarkController');
const { favorite, viewAllFavorite, removeFavorite, getSingleFavorite } = require('../controller/favorite');
const { search } = require('../controller/jobSearch');
const { addSkill, editSkill, deleteSkill, getAllSkills } = require('../controller/skillController');
const ApplyJobs = require('../controller/applyJob')
const downloadResume = require('../controller/userDownloadResume')
const thirdParty = require('../thirdPartyLogin/google')
const hiredStatus = require('../controller/checkHiredStatus')


const verifyToken = require('../middleware/userAuth');
const multer = require('multer');
const storage = require('../utills/uploadFile');


const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'image') {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed!' ,401), false);
        }
    } else if (file.fieldname === 'resume') {

        if (file.mimetype !== 'application/pdf') {

            return cb(new Error('Only PDF files are allowed!', 401), false);
        }
    }

    cb(null, true);
};


const singleUpload = multer({ storage: storage })



const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
});

const uploads = upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'resume', maxCount: 1 },
]);



// User Details
Router.post('/register',uploads, register);
Router.post('/login', login);
Router.put('/editProfile', verifyToken, uploads, editUserProfile);
Router.put("/changePassword", verifyToken, changePassword)
Router.post("/getAllUserDetails", getAllUserDetails);
Router.post('/forgetPassword', forgetPassword)
Router.post('/verifyForgotPassword',verifyForgotPassword)
Router.post("/resendOtp",resendOtp)
Router.post('/resetPassword', resetPassword);
Router.post("/emailVerificationSendOtp", emailVerificationSendOtp)
Router.post('/emailVerificationSetup', emailVerificationSetup)
Router.post('/mobileNumberVerificationSendOtp',mobileNumberVerificationSendOtp)
Router.post("/mobileNumberVerificationSetup",mobileNumberVerificationSetup)
Router.post('/deactivate', verifyToken, decativateUser)
Router.get("/protfolio", verifyToken, protfolio);


// Apply jobs

Router.post('/applyJobs',verifyToken,ApplyJobs.applyJobs)
Router.post("/checkJobAppliedStatus",verifyToken,ApplyJobs.checkJobAppliedStatus)
Router.get('/listOfAppliedJobs',verifyToken,ApplyJobs.listOfAppliedJobs)


//experience Details
Router.post('/addExperience', verifyToken, addExperience);
Router.post('/editWorkExprience', verifyToken, editWorkExprience);
Router.post('/deletedExperience', verifyToken, deleteExperience);
Router.get("/getAllExperience", verifyToken, getAllExperience);


// education deatails
Router.post('/addEducation', verifyToken, singleUpload.single('image'), addEducation);
Router.post('/editEducation', verifyToken, singleUpload.single('image'), editEducation);
Router.post('/deletedEducation', verifyToken, deleteEducation);
Router.get('/getAllEducations', verifyToken, getAllEducations);



// LIc_&_Certificate
Router.post('/addCertificate', verifyToken, addCertificate);
Router.put('/editCertificate', verifyToken, editCertificate);
Router.post('/deleteCertificate', verifyToken, deleteCertificate);
Router.get('/getAllCertificate', verifyToken, getALLCertificate);


//projects
Router.post('/addProjects', verifyToken, addProjects);
Router.put('/editProjects', verifyToken, editProjects);
Router.post('/deleteProject', verifyToken, deleteProjects);
Router.get('/getAllProjects', verifyToken, getAllProjects);


//awards
Router.post('/addAwards', verifyToken, singleUpload.single('image'), addAwards);
Router.put('/editAwards', verifyToken, singleUpload.single('image'), editAwards);
Router.post('/deleteAwards', verifyToken, deleteAwards);
Router.get('/getAllAwards', verifyToken, getAllAwards);


//job Search
Router.get("/search", search)
Router.post("/jobFilter", jobFilter);
Router.post('/userFilter',userFilter)
Router.post('/companyFilter',companyFilter)


//bookMark jobs
Router.post('/addBookMark', verifyToken, bookMarkController);
Router.get('/viewAllBookMark', verifyToken, viewAllBookMark);
Router.post('/removeBookMark', verifyToken, removeBookMark);
Router.get('/getSingleBookMark', verifyToken, getSingleBookMark)


// favorite
Router.post("/addFavorite", verifyToken, favorite)
Router.get("/viewAllFavorite", verifyToken, viewAllFavorite);
Router.post("/removeFavorite", verifyToken, removeFavorite);
Router.get("/getSingleFavorite", verifyToken, getSingleFavorite);


Router.get('/getResume', verifyToken, getResume)




Router.post('/addSkill', verifyToken, addSkill)
Router.post('/editSkill', verifyToken, editSkill)
Router.post('/deleteSkill', verifyToken, deleteSkill)
Router.get('/getAllSkills',verifyToken,getAllSkills)



Router.get('/viewALlRegisterCompany', viewALlRegisterCompany)


//download Resume
Router.get("/downloadUserOwnResume",verifyToken,downloadResume.downloadUserRusumeByUserId)

// Third Party User and Employer Login
Router.post("/thirdPartyLogin", thirdParty.thirdPartyLogin)

//CheckHowMany Company Request you to join our company
Router.get('/howManyCompanyHiredYou',verifyToken,hiredStatus.howManyCompanyHiredYou)

module.exports = Router;
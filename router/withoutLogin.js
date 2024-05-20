const withoutLogin = require('../controller/withoutLogin/withoutLogin');
const techStackList = require('../controller/techStackList')
const citylist = require('../controller/cityDropDown')
const contanctUs = require('../controller/withoutLogin/postContactUs')
const getContractData = require('../controller/withoutLogin/contract')
const Router = require('express').Router();



Router.get("/getAllFreeLancers", withoutLogin.website)
Router.get("/getAllImmediateJoiners",withoutLogin.getAllImmediateJoiners)
Router.post("/findFreelancersTechnologieStack", withoutLogin.findFreelancersTechnologieStack);
Router.post('/getSingleFreeLancers', withoutLogin.getSinlgeFreeLancer)
Router.get("/getAllLatestJobs",withoutLogin.getAllLatestJobs)
Router.post("/getSingleJobs",withoutLogin.getSingleJobs)
Router.post("/getCompanyALLJobsById",withoutLogin.getCompanyALLJobsById)
Router.post('/getSimilerJobs',withoutLogin.getSimilerJobs)
Router.post('/listTechStack',withoutLogin.listTechStack)
Router.post("/checkHowManyPeopelAppliedJob",withoutLogin.checkHowManyPeopelAppliedJob)


// techStackList

Router.get('/techStackList',techStackList.techStackDropDown)
Router.post('/getSingleTechStackById',techStackList.getSingleTechStackById)

Router.get('/cityDropDown',citylist.cityDropDown)
Router.get('/getCountriesList',citylist.getCountriesList)
Router.post('/getStateList',citylist.getStateList)
Router.post('/getCityList',citylist.getCityList)


Router.post("/contacUs",contanctUs.contacUs)
Router.get('/getContractData',withoutLogin.getAllActiveContract)
Router.post('/getAllContractByCompanyId',getContractData.getAllContractByCompanyId)
Router.post('/getSingleContractById',getContractData.getSingleContractById)

// Show Freelancers 
Router.get('/getAllActiveFreeLancers',withoutLogin.getAllActiveFreeLancers)

module.exports = Router;
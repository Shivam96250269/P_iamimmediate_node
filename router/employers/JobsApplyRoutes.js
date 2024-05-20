const Router = require('express').Router();
const employerController = require('../../controller/employerController/applyJobsByCompany')
const verifyToken = require('../../middleware/emplyerAuth');


Router.post('/ApplyJobsByCompany',verifyToken,employerController.applyJobsByCompany)
Router.post('/check-company-job-applied-status',verifyToken,employerController.CheckhowManyPeopleApply)
Router.get('/listOfAppliedJobByCompany',verifyToken,employerController.listofCompanyAppliedJobsByCompany)

module.exports = Router
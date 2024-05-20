const Router = require('express').Router()
const industryController = require('../../controller/industry')


Router.get('/getIndustry',industryController.GetAllIndustry)

module.exports = Router;
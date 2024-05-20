const Router = require('express').Router();
const employerRoutes = require('../router/employers/JobsApplyRoutes')
const hurtEmployers = require('../router/employers/hurt')
const refreshToken = require('./refresh/refreshToken')
const openRoutes = require('../router/openRoutes/industry')

Router.use('/employer',employerRoutes)
Router.use('/employer/hunt',hurtEmployers)
Router.use('/token',refreshToken)
Router.use('/industry',openRoutes)


module.exports = Router;

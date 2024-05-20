const Router = require('express').Router();
const refreshToken = require('../../utills/refreshToken')

Router.get('/refreshToken',refreshToken.refreshToken)

module.exports = Router;

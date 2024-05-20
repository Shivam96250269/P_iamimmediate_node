const Router = require('express').Router();
const hurt = require('../../controller/employerController/hurt');
const verifyToken = require('../../middleware/emplyerAuth');

Router.post('/CreateHunt',verifyToken,hurt.hurtEmployers)
Router.post("/check_hunt",verifyToken,hurt.hurtChecker)

module.exports = Router;
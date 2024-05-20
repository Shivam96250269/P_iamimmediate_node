const Router = require('express').Router();
const addSubscription = require('../controller/adminController/addSubscription');
const adminController = require('../controller/adminController/adminController');
const viewAllAboutUs = require('../controller/adminController/viewAllAboutUs');

Router.post('/addPricing', adminController.addPricing),
    Router.post('/editPricing', adminController.editPricing),
    Router.post('/removePricingData', adminController.removePricingData),
    Router.get("/getAllPricing", adminController.getAllPricing)
Router.post('/addTermAndCondition', adminController.addTermAndCondition),
    Router.post('/addPrivcyPolicy', adminController.addPrivcyPolicy)
Router.get("/contactUs", viewAllAboutUs.ContactUsData)
Router.get("/getSingleContactUS", viewAllAboutUs.getSingleContactUS)
Router.post('/addSubscriptionTable', addSubscription.addSubscriptionTable)
Router.get('/viewAllSubscriptionData', addSubscription.viewAllSubscriptionData)
Router.get('/checkSubscription', addSubscription.checkSubscription)

module.exports = Router;
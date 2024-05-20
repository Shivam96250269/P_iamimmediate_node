const axios = require('axios')
require("dotenv").config();

async function sendSMS(message, phoneNumber) {

    const apiUrl = 'https://2factor.in/API/R1/'
  
    const params = new URLSearchParams({
  
      module: 'TRANS_SMS',
  
      apikey: process.env.APIKEY2FACTOR,
  
      to: phoneNumber,
  
      from: 'SOVTE',
  
      msg: message,
  
      peid: '1101342150000074149',
  
      ctid: "1107170010709825997"
  
    });
  
   
  
    console.log(params);
  
    try {
  
      const response = await axios.post(apiUrl, params);
  
      console.error('Response:', message, 'number:', phoneNumber);
  
    } catch (error) {
  
      console.error('Failed to send SMS via 2Factor API:', error.response.data, 'number:', phoneNumber);
  
    }
  
  }

  module.exports = {

    sendSMS: sendSMS,
  
  };
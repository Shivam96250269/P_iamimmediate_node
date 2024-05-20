const Country = require('country-state-city').Country;
const State = require('country-state-city').State;
const City = require('country-state-city').City;
exports.cityDropDown = async (req, res) => {
    try {
        const indiaStates = State.getStatesOfCountry('IN');
        const indiaCities = [];
        indiaStates.forEach((state) => {
            const cities = City.getCitiesOfState("IN", state.isoCode);
            indiaCities.push(...cities)
        });
        res.status(200).json({status:200,message:"Found Succesfully", result:indiaCities})

    } catch (error) {
        res.status(500).json({ status: 500, error: error.message })
    }
}

exports.getCountriesList = async (req, res) => {
    try {
  
      const data = await Country.getAllCountries()
      if (data.length > 0) {
        res.status(200).json({ status: 200, msg: 'success', data: data })
      } else {
        res.status(404).json({ status: 404, msg: 'data not found' })
      }
    } catch (err) {
        res.status(400).json({ status: 400, msg:err.message })
    }
  }
  
  
exports.getStateList = async (req, res) => {
    try {
  
      const { countryCode } = req.body
  
      if (countryCode != "") {
        const data = await State.getStatesOfCountry(countryCode)
  
        if (data.length > 0) {
          res.status(200).json({ status: 200, msg: 'success', data: data })
        } else {
          res.status(404).json({ status: 404, msg: 'data not found' })
        }
  
      } else {
        res.status(400).json({ status: 400, msg: 'bad request' })
      }
  
    } catch (err) {
        res.status(400).json({ status: 400, msg: err.message })
    }
  }
  
exports.getCityList = async (req, res) => {
    try {
      const { stateName,countryCode } = req.body;
      if (stateName !== "" && stateName !== undefined && countryCode !=="" && countryCode !==undefined){
        const cityData = await City.getCitiesOfState(countryCode,stateName)
        if (cityData.length > 0) {
          res.status(200).json({ status: 200, message: "Data found successfully", result: cityData });
        } else {
          res.status(404).json({ status: 404, msg: 'Data not found' });
        }
      } else {
        res.status(400).json({ status: 400, message: "Please provide a valid stateName and countryCode" });
      }
    } catch (error) {
      res.status(500).json({ status: 500, error: error.message });
    }
};
const jobsSearch = require('../model/addJobs');

exports.search = async (req, res) => {
  try {
    const query = req.body.query;
    const results = await jobsSearch.find({
      $or: [
        { JobProfile: { $regex: query, $options: 'i' } },
        { Job_type: { $regex: query, $options: 'i' } },
        { location: { $regex: query, $options: 'i' } },
      ],
    });
    if (results.length > 0) {
      res.status(200).json({ status: 200, message: "Find Jobs Successfully", res: results });
    } else {
      res.status(404).json({ status: 404, message: "Data Not Found" });
    }
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
};

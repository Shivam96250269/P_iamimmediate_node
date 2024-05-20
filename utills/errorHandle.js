const errorHandler = (err, req, res, next) => {
    const message = err.message || "Internal Server Error"
    const statusCode = err.statusCode || 500
    res.status(statusCode).json({
      status: statusCode,
      message: message,
    });
  };
  
module.exports = errorHandler;
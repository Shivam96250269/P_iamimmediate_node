const asyncMiddleware = (theFunction) => (req, res, next) => {
  return Promise.resolve(theFunction(req, res, next))
    .catch((err) => {
    //   console.log(err)
    //   //JWT Token Errors
    //   if (err.name === 'TokenExpiredError') {
    //     return next(new CustomError("TokenExpiredError", 401))
    //   }
    //   if(err.name === "JsonWebTokenError" && err.message === "invalid signature"){
    //       return next(new CustomError("Invalid User", 400))
    //   }
    //   next(new storeErrorInFirebase(err))
    next(err)
    });
};

module.exports = asyncMiddleware;
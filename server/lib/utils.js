/**
 * Standard API Response Utility
 */

exports.success = (res, data, message = "Success", status = 200) => {
  return res.status(status).json({
    success: true,
    message,
    data
  });
};

exports.error = (res, message = "Internal Server Error", status = 500, debug = null) => {
  const response = {
    success: false,
    message
  };
  if (debug) response.debug = debug;
  
  return res.status(status).json(response);
};

exports.notFound = (res, message = "Resource not found", debug = null) => {
  return exports.error(res, message, 404, debug);
};

exports.badRequest = (res, message = "Bad Request") => {
  return exports.error(res, message, 400);
};

exports.unauthorized = (res, message = "Unauthorized") => {
  return exports.error(res, message, 401);
};

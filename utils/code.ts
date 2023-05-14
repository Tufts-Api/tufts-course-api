enum Code {
  ok = 200,
  created = 201,

  // Client error
  badRequest = 400,
  unauthorized = 401,
  notFound = 404,

  // Server error
  internalCrash = 500,
  notImplemented = 501,
  unavailable = 503,
}

export { Code };

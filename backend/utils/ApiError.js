// A custom Error that also carries an HTTP status code (and optional details).
// Throw `new ApiError(409, 'email exists')` anywhere and the errorHandler
// will send the right status + message.
class ApiError extends Error {
  constructor(statusCode, message = 'Something went wrong', errors = []) {
    super(message)
    this.statusCode = statusCode
    this.errors = errors
    this.success = false
    this.data = null
  }
}

export default ApiError
// A uniform success envelope so every endpoint responds in the same shape:
// { statusCode, data, message, success }
class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode
    this.data = data
    this.message = message
    this.success = statusCode < 400
  }
}

export default ApiResponse
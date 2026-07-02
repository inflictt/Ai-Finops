// The ONE place that turns thrown errors into JSON responses.
// Mounted LAST in server.js (after all routes). Because asyncHandler forwards
// errors here, controllers can just `throw new ApiError(...)` and stop.
import ApiError from '../utils/ApiError.js'

export function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    })
  }
  // Anything we didn't anticipate — log it, return a generic 500.
  console.error('Unhandled error:', err)
  return res.status(500).json({ success: false, message: 'Internal server error' })
}
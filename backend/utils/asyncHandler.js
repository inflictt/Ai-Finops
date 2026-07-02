// Wraps an async route handler so you never write try/catch in every controller.
// If the handler throws (or rejects), the error is forwarded to Express's
// error middleware via next(err) — where our errorHandler turns it into JSON.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

export default asyncHandler
const asyncHandler = require('express-async-handler')

/**
 * Enforces authentication for protected routes. Redirects unauthenticated users to the signin page.
 */
exports.protect = asyncHandler((req, res, next) => {
  if (!req.user) res.redirect('/signin')
  else next()
})

/**
 * Redirects authenticated users to dashboard for specific routes (e.g., signin, signup, landing).
 */
exports.redirectOnAuth = (req, res, next) => {
  if (req.user) res.redirect('/dashboard')
  else next()
}

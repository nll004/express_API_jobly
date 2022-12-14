"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");


/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers && req.headers.authorization;

    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
    }
    return next();
  }
  catch (err) {
    return next();
  }
}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
  try {
    if (!res.locals.user) throw new UnauthorizedError();
    return next();
  }
  catch (err) {
    return next(err);
  }
}

/** Middleware admin authorization
 *
 *  If not admin, raises Unauthorized.
*/

function requireAdmin (req, res, next) {
  try {
    if (!res.locals.user.isAdmin) throw new UnauthorizedError('User is not admin.');
    return next();
  }
  catch(err){
    return next(err);
  }
}

function checkCurrUserOrAdmin (req, res, next) {
  try{
    if(req.params.username !== res.locals.user.username && !res.locals.user.isAdmin) {
      throw new UnauthorizedError('Only user or admin can alter userdata');
    }
    return next();
  }
  catch(err){
    return next(err);
  }
}

module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  requireAdmin,
  checkCurrUserOrAdmin
};

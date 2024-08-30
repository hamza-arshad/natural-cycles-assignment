import { Request, Response, NextFunction } from 'express'

export const checkSession = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.session.userId

  // If user ID exists in session, proceed to the next middleware/route handler
  if (userId) {
    next()
  } else {
    return res.redirect('/login') // If no user ID, redirect to login page
  }
}
